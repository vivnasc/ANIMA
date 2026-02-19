import { createClient } from '@/lib/supabase/server'

export async function updateStreak(userId: string) {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data: streak } = await supabase
    .from('user_streaks')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (!streak) {
    await supabase.from('user_streaks').insert({
      user_id: userId,
      current_streak: 1,
      longest_streak: 1,
      last_session_date: today
    })
    return { current_streak: 1, longest_streak: 1 }
  }

  if (streak.last_session_date === today) {
    return { current_streak: streak.current_streak, longest_streak: streak.longest_streak }
  }

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  const isConsecutive = streak.last_session_date === yesterdayStr
  const newStreak = isConsecutive ? streak.current_streak + 1 : 1
  const newLongest = Math.max(newStreak, streak.longest_streak)

  await supabase
    .from('user_streaks')
    .update({
      current_streak: newStreak,
      longest_streak: newLongest,
      last_session_date: today,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)

  return { current_streak: newStreak, longest_streak: newLongest }
}

export async function getStreak(userId: string) {
  const supabase = await createClient()

  const { data: streak } = await supabase
    .from('user_streaks')
    .select('*')
    .eq('user_id', userId)
    .single()

  return streak || { current_streak: 0, longest_streak: 0, last_session_date: null }
}
