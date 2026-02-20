import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MIRRORS } from '@/lib/ai/mirrors'
import { ChatWithSessions } from '@/components/journey/chat-with-sessions'
import { getUserSessions, getMirrorSessionDefinitions } from '@/lib/journey/sessions'
import { getStreak } from '@/lib/journey/streaks'
import { getUnseenMilestones } from '@/lib/journey/milestones'
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

  const isOwner = user.email === 'viv.saraiva@gmail.com'
  const { canAccessMirror } = await import('@/lib/journey/constants')
  const tier = (userData?.subscription_tier || 'free') as import('@/types/database').SubscriptionTier
  if (!canAccessMirror(tier, mirror.slug) && !isOwner) {
    redirect('/mirrors?upgrade=true')
  }

  const language = (userData?.language_preference || 'pt') as Language

  // Get session definitions and user progress
  const [sessionDefs, userSessions, streak, unseenMilestones] = await Promise.all([
    getMirrorSessionDefinitions(slug),
    getUserSessions(user.id, slug),
    getStreak(user.id),
    getUnseenMilestones(user.id, language)
  ])

  // Get journey info
  const { data: journey } = await supabase
    .from('user_journey')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Build session info combining definitions and user progress
  const sessions = sessionDefs.map(def => {
    const userSession = userSessions.find(
      us => us.session_number === def.session_number
    )
    const titleKey = `title_${language}` as keyof typeof def
    const subtitleKey = `subtitle_${language}` as keyof typeof def

    return {
      session_number: def.session_number,
      status: (userSession?.status || 'locked') as 'locked' | 'available' | 'in_progress' | 'completed',
      title: (def[titleKey] as string) || def.title_en,
      subtitle: (def[subtitleKey] as string) || def.subtitle_en,
      estimated_minutes: def.estimated_minutes,
      conversation_id: userSession?.conversation_id || null,
    }
  })

  return (
    <ChatWithSessions
      mirror={mirror}
      sessions={sessions}
      userId={user.id}
      language={language}
      journeyPhase={(journey?.current_phase || 'foundation') as JourneyPhase}
      streakCount={streak.current_streak}
      initialMilestones={unseenMilestones}
    />
  )
}
