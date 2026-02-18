import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { buildCrossMirrorContext } from '@/lib/ai/cross-mirror-context'
import { detectAndSavePatterns } from '@/lib/ai/pattern-detection'
import { MIRROR_PROMPTS } from '@/lib/ai/prompts'
import { FREE_TIER_MONTHLY_LIMIT, FREE_TIER_MIRRORS } from '@/lib/journey/constants'
import type { MirrorSlug } from '@/types/database'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { message, conversationId, mirrorSlug } = await req.json() as {
      message: string
      conversationId: string | null
      mirrorSlug: MirrorSlug
    }

    if (!message || !mirrorSlug) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get user data for tier checking
    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    // Check free tier limits
    if (userData?.subscription_tier === 'free') {
      // Check mirror access
      if (!FREE_TIER_MIRRORS.includes(mirrorSlug)) {
        return NextResponse.json(
          { error: 'This mirror requires a premium subscription' },
          { status: 403 }
        )
      }

      // Check monthly limit - reset if new month
      const now = new Date()
      const lastReset = userData.last_reset_date ? new Date(userData.last_reset_date) : null
      let messageCount = userData.monthly_message_count || 0

      if (!lastReset || lastReset.getMonth() !== now.getMonth() || lastReset.getFullYear() !== now.getFullYear()) {
        messageCount = 0
        await supabase
          .from('users')
          .update({ monthly_message_count: 0, last_reset_date: now.toISOString().split('T')[0] })
          .eq('id', user.id)
      }

      if (messageCount >= FREE_TIER_MONTHLY_LIMIT) {
        return NextResponse.json(
          { error: 'Monthly message limit reached. Upgrade to premium for unlimited conversations.' },
          { status: 429 }
        )
      }
    }

    // Get or create conversation
    let activeConversationId = conversationId

    if (!activeConversationId) {
      // Get mirror ID from slug
      const { data: mirror } = await supabase
        .from('mirrors')
        .select('id')
        .eq('slug', mirrorSlug)
        .single()

      if (!mirror) {
        return NextResponse.json({ error: 'Mirror not found' }, { status: 404 })
      }

      // Get user journey for phase info
      const { data: journey } = await supabase
        .from('user_journey')
        .select('current_phase')
        .eq('user_id', user.id)
        .single()

      // Create new conversation
      const { data: newConversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          user_id: user.id,
          mirror_id: mirror.id,
          language: userData?.language_preference || 'pt',
          journey_phase_at_creation: journey?.current_phase || 'foundation'
        } as Record<string, unknown>)
        .select('id')
        .single()

      if (convError || !newConversation) {
        return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 })
      }

      activeConversationId = newConversation.id
    }

    // Save user message
    const { data: userMessage } = await supabase
      .from('messages')
      .insert({
        conversation_id: activeConversationId,
        role: 'user' as const,
        content: message
      })
      .select('id')
      .single()

    // Build system prompt with cross-mirror context
    const crossContext = await buildCrossMirrorContext(user.id, mirrorSlug)
    const basePrompt = MIRROR_PROMPTS[mirrorSlug]
    const fullPrompt = crossContext + basePrompt

    // Get conversation history
    const { data: historyMessages } = await supabase
      .from('messages')
      .select('role, content')
      .eq('conversation_id', activeConversationId)
      .order('created_at', { ascending: true })
      .limit(50)

    const anthropicMessages = (historyMessages || []).map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content
    }))

    // Call Claude API with streaming
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!
    })

    const stream = await anthropic.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: fullPrompt,
      messages: anthropicMessages
    })

    // Create a ReadableStream for streaming response
    const encoder = new TextEncoder()
    let fullResponse = ''

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              const text = event.delta.text
              fullResponse += text
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text, conversationId: activeConversationId })}\n\n`))
            }
          }

          // Save assistant message after stream completes
          await supabase
            .from('messages')
            .insert({
              conversation_id: activeConversationId,
              role: 'assistant' as const,
              content: fullResponse,
              model: 'claude-sonnet-4-20250514'
            })

          // Update conversation message count and title
          const { data: conv } = await supabase
            .from('conversations')
            .select('message_count, title')
            .eq('id', activeConversationId)
            .single()

          const updates: Record<string, unknown> = {
            message_count: (conv?.message_count || 0) + 2,
            updated_at: new Date().toISOString()
          }

          // Auto-generate title from first user message
          if (!conv?.title && message) {
            updates.title = message.substring(0, 80) + (message.length > 80 ? '...' : '')
          }

          await supabase
            .from('conversations')
            .update(updates)
            .eq('id', activeConversationId)

          // Detect patterns in the response
          await detectAndSavePatterns(
            user.id,
            fullResponse,
            mirrorSlug,
            activeConversationId || undefined,
            userMessage?.id || undefined
          )

          // Update journey counters
          await updateJourneyCounters(supabase, user.id, mirrorSlug)

          // Update monthly message count for free tier
          if (userData?.subscription_tier === 'free') {
            await supabase
              .from('users')
              .update({
                monthly_message_count: (userData.monthly_message_count || 0) + 1
              })
              .eq('id', user.id)
          }

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, conversationId: activeConversationId })}\n\n`))
          controller.close()
        } catch (error) {
          console.error('Streaming error:', error)
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Stream error' })}\n\n`))
          controller.close()
        }
      }
    })

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function updateJourneyCounters(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  mirrorSlug: MirrorSlug
) {
  const { data: journey } = await supabase
    .from('user_journey')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (!journey) return

  const counterField = `${mirrorSlug}_conversations` as keyof typeof journey
  const currentCount = (journey[counterField] as number) || 0

  const updates: Record<string, unknown> = {
    [counterField]: currentCount + 1,
    total_conversations: journey.total_conversations + 1,
    updated_at: new Date().toISOString()
  }

  // Check for phase transitions
  const phaseThresholds: Record<string, { field: string; min: number; nextPhase: string; startField: string }> = {
    soma: { field: 'foundation_completed', min: 8, nextPhase: 'regulation', startField: 'regulation_started_at' },
    seren: { field: 'regulation_completed', min: 10, nextPhase: 'expansion', startField: 'expansion_started_at' },
    luma: { field: 'expansion_completed', min: 12, nextPhase: 'integration', startField: 'integration_started_at' },
    echo: { field: 'integration_completed', min: 15, nextPhase: 'complete', startField: 'journey_completed_at' }
  }

  const threshold = phaseThresholds[mirrorSlug]
  if (threshold && currentCount + 1 >= threshold.min) {
    updates[threshold.field] = true

    // Auto-advance phase if current phase matches
    const phaseMapping: Record<string, string> = {
      soma: 'foundation',
      seren: 'regulation',
      luma: 'expansion',
      echo: 'integration'
    }

    if (journey.current_phase === phaseMapping[mirrorSlug]) {
      updates.current_phase = threshold.nextPhase
      if (!journey[threshold.startField as keyof typeof journey]) {
        updates[threshold.startField] = new Date().toISOString()
      }
    }
  }

  // Check milestones
  const newMilestones = [...(journey.milestones_unlocked || [])]
  const totalAfter = journey.total_conversations + 1

  if (totalAfter === 1 && !newMilestones.includes('first_conversation')) {
    newMilestones.push('first_conversation')
  }
  if (currentCount + 1 >= 5 && mirrorSlug === 'soma' && !newMilestones.includes('soma_engaged')) {
    newMilestones.push('soma_engaged')
  }
  if (totalAfter >= 50 && !newMilestones.includes('deep_explorer')) {
    newMilestones.push('deep_explorer')
  }

  if (newMilestones.length > (journey.milestones_unlocked?.length || 0)) {
    updates.milestones_unlocked = newMilestones
  }

  await supabase
    .from('user_journey')
    .update(updates)
    .eq('user_id', userId)
}
