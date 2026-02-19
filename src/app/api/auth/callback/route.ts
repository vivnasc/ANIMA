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
    if (error) console.error('[Auth Callback] PKCE exchange failed:', error.message)
    authError = error
  }
  // Handle magic link / email OTP flow (token_hash)
  else if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type })
    if (error) console.error('[Auth Callback] OTP verification failed:', error.message)
    authError = error
  }
  // No auth params provided
  else {
    console.error('[Auth Callback] No code or token_hash provided')
    return NextResponse.redirect(`${origin}/login?error=missing_params`)
  }

  if (authError) {
    return NextResponse.redirect(`${origin}/login?error=auth_failed`)
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    console.error('[Auth Callback] No user found after successful auth')
    return NextResponse.redirect(`${origin}/login?error=no_user`)
  }

  // Ensure user record exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('id', user.id)
    .single()

  if (!existingUser) {
    const { error: insertError } = await supabase.from('users').insert({
      id: user.id,
      email: user.email || '',
      subscription_tier: 'free',
      subscription_status: 'inactive',
      language_preference: 'pt',
      monthly_message_count: 0,
      onboarding_completed: false,
      preferred_start_mirror: 'soma'
    })
    if (insertError) console.error('[Auth Callback] User insert error:', insertError.message)
  }

  // Ensure user journey exists
  const { data: journey } = await supabase
    .from('user_journey')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!journey) {
    const { error: journeyError } = await supabase.from('user_journey').insert({
      user_id: user.id,
      current_phase: 'foundation',
      foundation_started_at: new Date().toISOString()
    })
    if (journeyError) console.error('[Auth Callback] Journey insert error:', journeyError.message)
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
