import { createClient } from '@/lib/supabase/server'
import type { Language, MirrorSlug } from '@/types/database'

export async function checkSessionMilestones(
  userId: string,
  mirrorSlug: MirrorSlug,
  sessionNumber: number
) {
  // Check session-specific milestone
  const sessionTrigger = `${mirrorSlug}_${sessionNumber}`
  await tryUnlockMilestone(userId, 'session_complete', sessionTrigger)

  // Check phase complete milestone (session 7)
  if (sessionNumber === 7) {
    await tryUnlockMilestone(userId, 'phase_complete', mirrorSlug)
  }
}

export async function checkStreakMilestones(userId: string, streakCount: number) {
  const streakTriggers = ['7', '30']
  for (const trigger of streakTriggers) {
    if (streakCount >= parseInt(trigger)) {
      await tryUnlockMilestone(userId, 'streak', trigger)
    }
  }
}

async function tryUnlockMilestone(userId: string, triggerType: string, triggerValue: string) {
  const supabase = await createClient()

  const { data: milestone } = await supabase
    .from('milestones')
    .select('id')
    .eq('trigger_type', triggerType)
    .eq('trigger_value', triggerValue)
    .single()

  if (!milestone) return

  await supabase
    .from('user_milestones')
    .upsert({
      user_id: userId,
      milestone_id: milestone.id,
    }, { onConflict: 'user_id,milestone_id' })
}

export async function getUnseenMilestones(userId: string, lang: Language) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('user_milestones')
    .select('*, milestones(*)')
    .eq('user_id', userId)
    .eq('seen', false)
    .order('unlocked_at', { ascending: false })

  if (!data || data.length === 0) return []

  return data.map(um => {
    const m = um.milestones as Record<string, unknown>
    return {
      id: um.id,
      milestone_id: um.milestone_id,
      title: (m?.[`title_${lang}`] as string) || (m?.title_en as string) || '',
      description: (m?.[`description_${lang}`] as string) || (m?.description_en as string) || '',
      mirror_slug: m?.mirror_slug as MirrorSlug | null,
      unlocked_at: um.unlocked_at
    }
  })
}

export async function markMilestoneSeen(userMilestoneId: string) {
  const supabase = await createClient()

  await supabase
    .from('user_milestones')
    .update({ seen: true })
    .eq('id', userMilestoneId)
}
