import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify the user has actually completed the journey (all 28 sessions)
    const { data: sessions } = await supabase
      .from('user_sessions')
      .select('status')
      .eq('user_id', user.id)

    const completedCount = (sessions || []).filter(s => s.status === 'completed').length
    if (completedCount < 28) {
      return NextResponse.json(
        { error: 'Journey not yet complete. Finish all 28 sessions first.' },
        { status: 400 }
      )
    }

    // Reset all user_sessions to locked, except soma session 1 which is available
    // Keep the old data (exit_insights, conversation_ids) for cross-reference
    const mirrors = ['soma', 'seren', 'luma', 'echo']

    for (const mirror of mirrors) {
      for (let i = 1; i <= 7; i++) {
        await supabase
          .from('user_sessions')
          .update({
            status: mirror === 'soma' && i === 1 ? 'available' : 'locked',
            started_at: null,
            completed_at: null,
            conversation_id: null,
            exit_insight: null,
          })
          .eq('user_id', user.id)
          .eq('mirror_slug', mirror)
          .eq('session_number', i)
      }
    }

    return NextResponse.json({ ok: true, message: 'Journey reset. Begin again with new eyes.' })
  } catch (error) {
    console.error('Journey restart error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
