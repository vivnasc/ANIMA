import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { completeSession, startSession } from '@/lib/journey/sessions'
import { updateStreak } from '@/lib/journey/streaks'
import { checkSessionMilestones, checkStreakMilestones, getUnseenMilestones } from '@/lib/journey/milestones'
import { detectPatternsWithAI } from '@/lib/ai/pattern-detection'
import type { MirrorSlug, Language } from '@/types/database'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { action, mirrorSlug, sessionNumber, conversationId, exitInsight, language } = body as {
      action: 'start' | 'complete'
      mirrorSlug: MirrorSlug
      sessionNumber: number
      conversationId?: string
      exitInsight?: string
      language?: Language
    }

    if (action === 'start') {
      await startSession(user.id, mirrorSlug, sessionNumber)
      return NextResponse.json({ ok: true })
    }

    if (action === 'complete') {
      const result = await completeSession(user.id, mirrorSlug, sessionNumber, conversationId, exitInsight)

      // Update streak
      const streak = await updateStreak(user.id)

      // Check milestones
      await checkSessionMilestones(user.id, mirrorSlug, sessionNumber)
      await checkStreakMilestones(user.id, streak.current_streak)

      // Run AI pattern detection on the full conversation (async, non-blocking)
      if (conversationId) {
        const { data: messages } = await supabase
          .from('messages')
          .select('role, content')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true })

        if (messages && messages.length > 0) {
          detectPatternsWithAI(user.id, messages, mirrorSlug, conversationId).catch(() => {})
        }
      }

      // Get unseen milestones to show
      const unseenMilestones = await getUnseenMilestones(user.id, language || 'pt')

      return NextResponse.json({
        ok: true,
        nextSession: result.nextSession,
        streak: streak.current_streak,
        milestones: unseenMilestones
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Sessions API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
