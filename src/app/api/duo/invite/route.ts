import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { randomBytes } from 'crypto'

// POST: Create a duo invite link
export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has duo tier
    const { data: userData } = await supabase
      .from('users')
      .select('subscription_tier, duo_partner_id')
      .eq('id', user.id)
      .single()

    if (!userData || !['duo', 'profundo'].includes(userData.subscription_tier)) {
      return NextResponse.json({ error: 'Duo tier required' }, { status: 403 })
    }

    if (userData.duo_partner_id) {
      return NextResponse.json({ error: 'Already has a partner' }, { status: 400 })
    }

    // Generate invite code
    const inviteCode = randomBytes(16).toString('hex')

    // Create invite
    const { data: invite, error } = await supabase
      .from('duo_invites')
      .insert({
        inviter_id: user.id,
        invite_code: inviteCode,
      })
      .select('invite_code, expires_at')
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to create invite' }, { status: 500 })
    }

    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/duo/accept?code=${invite.invite_code}`

    return NextResponse.json({ inviteUrl, expiresAt: invite.expires_at })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
