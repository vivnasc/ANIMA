import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST: Accept a duo invite
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { inviteCode } = await req.json()
    if (!inviteCode) {
      return NextResponse.json({ error: 'Missing invite code' }, { status: 400 })
    }

    // Find the invite
    const { data: invite } = await supabase
      .from('duo_invites')
      .select('*')
      .eq('invite_code', inviteCode)
      .is('accepted_by', null)
      .single()

    if (!invite) {
      return NextResponse.json({ error: 'Invalid or expired invite' }, { status: 404 })
    }

    // Check not expired
    if (new Date(invite.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Invite expired' }, { status: 410 })
    }

    // Cannot accept own invite
    if (invite.inviter_id === user.id) {
      return NextResponse.json({ error: 'Cannot accept your own invite' }, { status: 400 })
    }

    // Accept the invite
    await supabase
      .from('duo_invites')
      .update({
        accepted_by: user.id,
        accepted_at: new Date().toISOString(),
      })
      .eq('id', invite.id)

    // Link both users as duo partners
    await supabase
      .from('users')
      .update({ duo_partner_id: user.id })
      .eq('id', invite.inviter_id)

    await supabase
      .from('users')
      .update({
        duo_partner_id: invite.inviter_id,
        // Grant the partner the same tier access (duo mirrors)
        subscription_tier: 'duo',
        subscription_status: 'active',
      })
      .eq('id', user.id)

    return NextResponse.json({ success: true, partnerId: invite.inviter_id })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
