import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MIRRORS } from '@/lib/ai/mirrors'
import { ChatInterface } from '@/components/chat/chat-interface'
import type { MirrorSlug, Language, JourneyPhase } from '@/types/database'

interface ChatPageProps {
  params: Promise<{ mirrorSlug: string }>
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { mirrorSlug } = await params

  // Validate mirror slug
  if (!Object.keys(MIRRORS).includes(mirrorSlug)) {
    redirect('/mirrors')
  }

  const slug = mirrorSlug as MirrorSlug
  const mirror = MIRRORS[slug]
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Check premium access
  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (mirror.isPremium && userData?.subscription_tier !== 'premium') {
    redirect('/mirrors?upgrade=true')
  }

  // Get user's recent conversations with this mirror
  const { data: mirrorData } = await supabase
    .from('mirrors')
    .select('*')
    .eq('slug', slug)
    .single()

  const { data: conversations } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', user.id)
    .eq('mirror_id', mirrorData?.id || '')
    .eq('is_archived', false)
    .order('updated_at', { ascending: false })
    .limit(20)

  // Get journey info
  const { data: journey } = await supabase
    .from('user_journey')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const convList = (conversations || []).map(c => ({
    id: String(c.id),
    title: c.title ? String(c.title) : null,
    updated_at: String(c.updated_at),
    message_count: Number(c.message_count) || 0
  }))

  return (
    <ChatInterface
      mirror={mirror}
      conversations={convList}
      userId={user.id}
      language={(userData?.language_preference || 'pt') as Language}
      journeyPhase={(journey?.current_phase || 'foundation') as JourneyPhase}
    />
  )
}
