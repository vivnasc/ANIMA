// Supabase Edge Function: engagement-nudge
// Deploy: supabase functions deploy engagement-nudge
// Schedule via cron: runs daily at 10:00 UTC
//
// Sends gentle nudge emails when users go inactive:
// - 48h without session: "A tua jornada espera por ti"
// - 7 days: "O [MIRROR] lembra-se de ti" (with last insight)
// - 14 days: "Quando quiseres, estamos aqui" (final)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

interface NudgeUser {
  user_id: string
  email: string
  last_session_date: string
  current_streak: number
  language_preference: string
}

const NUDGE_TEMPLATES: Record<string, Record<string, { subject: string; body: string }>> = {
  '48h': {
    pt: {
      subject: 'A tua jornada espera por ti',
      body: 'Olá,\n\nA tua travessia no ANIMA está à tua espera. Cada sessão é um passo — e o próximo está pronto para ti.\n\nQuando estiveres pronto/a, a jornada continua.\n\nANIMA'
    },
    en: {
      subject: 'Your journey awaits',
      body: 'Hello,\n\nYour ANIMA journey is waiting for you. Each session is a step — and the next one is ready.\n\nWhen you\'re ready, the journey continues.\n\nANIMA'
    }
  },
  '7d': {
    pt: {
      subject: 'O espelho lembra-se de ti',
      body: 'Olá,\n\nJá passaram uns dias desde a tua última sessão. Os insights que capturaste continuam aqui — e há mais por descobrir.\n\nUm passo de cada vez.\n\nANIMA'
    },
    en: {
      subject: 'The mirror remembers you',
      body: 'Hello,\n\nIt\'s been a few days since your last session. The insights you captured are still here — and there\'s more to discover.\n\nOne step at a time.\n\nANIMA'
    }
  },
  '14d': {
    pt: {
      subject: 'Quando quiseres, estamos aqui',
      body: 'Olá,\n\nNão há pressa. A jornada de autoconhecimento não tem prazo. Quando sentires que é altura, o ANIMA estará aqui.\n\nCuida-te.\n\nANIMA'
    },
    en: {
      subject: 'Whenever you\'re ready, we\'re here',
      body: 'Hello,\n\nThere\'s no rush. The self-knowledge journey has no deadline. When the time feels right, ANIMA will be here.\n\nTake care.\n\nANIMA'
    }
  }
}

async function sendEmail(to: string, subject: string, body: string) {
  if (!RESEND_API_KEY) {
    console.log(`[DRY RUN] Would send email to ${to}: ${subject}`)
    return
  }

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'ANIMA <noreply@anima-app.com>',
      to: [to],
      subject,
      text: body,
    }),
  })
}

function daysSince(dateStr: string): number {
  const then = new Date(dateStr)
  const now = new Date()
  return Math.floor((now.getTime() - then.getTime()) / (1000 * 60 * 60 * 24))
}

Deno.serve(async () => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Get all users with streaks (have at least started)
    const { data: streaks } = await supabase
      .from('user_streaks')
      .select('user_id, last_session_date, current_streak')

    if (!streaks || streaks.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }), { headers: { 'Content-Type': 'application/json' } })
    }

    let sent = 0

    for (const streak of streaks) {
      if (!streak.last_session_date) continue

      const days = daysSince(streak.last_session_date)

      // Determine which nudge to send
      let nudgeType: string | null = null
      if (days === 2) nudgeType = '48h'
      else if (days === 7) nudgeType = '7d'
      else if (days === 14) nudgeType = '14d'

      if (!nudgeType) continue

      // Get user email and language
      const { data: userData } = await supabase
        .from('users')
        .select('email, language_preference')
        .eq('id', streak.user_id)
        .single()

      if (!userData?.email) continue

      const lang = (userData.language_preference === 'pt' || userData.language_preference === 'en')
        ? userData.language_preference
        : 'en'

      const template = NUDGE_TEMPLATES[nudgeType]?.[lang] || NUDGE_TEMPLATES[nudgeType]?.['en']
      if (!template) continue

      await sendEmail(userData.email, template.subject, template.body)
      sent++
    }

    return new Response(JSON.stringify({ sent }), { headers: { 'Content-Type': 'application/json' } })
  } catch (error) {
    console.error('Engagement nudge error:', error)
    return new Response(JSON.stringify({ error: 'Failed' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
})
