import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Check if user journey exists, if not create it
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
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
  }

  return NextResponse.redirect(`${origin}/login?error=Could not authenticate`)
}
