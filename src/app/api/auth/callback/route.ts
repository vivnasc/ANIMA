import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { EmailOtpType } from '@supabase/supabase-js'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/dashboard'

  const supabase = await createClient()
  let authError = null

  // Handle PKCE flow (code exchange)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    authError = error
  }
  // Handle magic link / email OTP flow (token_hash)
  else if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type })
    authError = error
  }

  if (!authError && (code || token_hash)) {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      // Ensure user record exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single()

      if (!existingUser) {
        await supabase.from('users').insert({
          id: user.id,
          email: user.email || '',
          subscription_tier: 'free',
          subscription_status: 'inactive',
          language_preference: 'pt',
          monthly_message_count: 0,
          onboarding_completed: false,
          preferred_start_mirror: 'soma'
        })
      }

      // Ensure user journey exists
      const { data: journey } = await supabase
        .from('user_journey')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!journey) {
        await supabase.from('user_journey').insert({
          user_id: user.id,
          current_phase: 'foundation',
          foundation_started_at: new Date().toISOString()
        })
      }
    }

    const forwardedHost = request.headers.get('x-forwarded-host')
    const isLocalEnv = process.env.NODE_ENV === 'development'

    if (isLocalEnv) {
      return NextResponse.redirect(`${origin}${next}`)
    } else if (forwardedHost) {
      return NextResponse.redirect(`https://${forwardedHost}${next}`)
    } else {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=Could not authenticate`)
}
