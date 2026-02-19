import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { markMilestoneSeen } from '@/lib/journey/milestones'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userMilestoneId } = await req.json()
    if (!userMilestoneId) {
      return NextResponse.json({ error: 'Missing userMilestoneId' }, { status: 400 })
    }

    await markMilestoneSeen(userMilestoneId)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Milestones API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
