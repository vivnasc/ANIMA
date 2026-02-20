import { createClient } from '@/lib/supabase/server'
import type { MirrorSlug, Language } from '@/types/database'

const MIRROR_ORDER: MirrorSlug[] = ['soma', 'seren', 'luma', 'echo', 'nexus']

export async function initUserSessions(userId: string) {
  const supabase = await createClient()
  const sessions: Array<{
    user_id: string
    mirror_slug: MirrorSlug
    session_number: number
    status: string
  }> = []

  for (const mirror of MIRROR_ORDER) {
    for (let i = 1; i <= 7; i++) {
      sessions.push({
        user_id: userId,
        mirror_slug: mirror,
        session_number: i,
        status: mirror === 'soma' && i === 1 ? 'available' : 'locked'
      })
    }
  }

  const { error } = await supabase.from('user_sessions').upsert(sessions, {
    onConflict: 'user_id,mirror_slug,session_number'
  })
  if (error) {
    console.error('[Sessions] Failed to init user sessions:', error.message)
  }
}

export async function getUserSessions(userId: string, mirrorSlug: MirrorSlug) {
  const supabase = await createClient()

  const { data: sessions } = await supabase
    .from('user_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('mirror_slug', mirrorSlug)
    .order('session_number', { ascending: true })

  if (!sessions || sessions.length === 0) {
    await initUserSessions(userId)
    const { data: freshSessions } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('mirror_slug', mirrorSlug)
      .order('session_number', { ascending: true })

    // If DB init failed, return fallback with session 1 available
    if (!freshSessions || freshSessions.length === 0) {
      console.error('[Sessions] DB init failed for user:', userId, 'mirror:', mirrorSlug)
      return Array.from({ length: 7 }, (_, i) => ({
        id: `fallback-${mirrorSlug}-${i + 1}`,
        user_id: userId,
        mirror_slug: mirrorSlug,
        session_number: i + 1,
        status: i === 0 ? 'available' as const : 'locked' as const,
        started_at: null,
        completed_at: null,
        conversation_id: null,
        exit_insight: null,
        created_at: new Date().toISOString(),
      }))
    }

    return freshSessions
  }

  return sessions
}

export async function getMirrorSessionDefinitions(mirrorSlug: MirrorSlug) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('mirror_sessions')
    .select('*')
    .eq('mirror_slug', mirrorSlug)
    .order('session_number', { ascending: true })

  return data || []
}

export async function getSessionPrompt(mirrorSlug: MirrorSlug, sessionNumber: number): Promise<string> {
  const supabase = await createClient()

  const { data: session } = await supabase
    .from('mirror_sessions')
    .select('session_prompt, title_pt, subtitle_pt')
    .eq('mirror_slug', mirrorSlug)
    .eq('session_number', sessionNumber)
    .single()

  if (!session) return ''

  return `

--- SESSÃO ACTUAL: "${session.title_pt}" (Sessão ${sessionNumber} de 7) ---

${session.session_prompt}

## INSTRUÇÕES DE GUIÃO PARA ESTA SESSÃO

Esta sessão tem um tema específico e um fluxo guiado. NÃO faças perguntas soltas ou aleatórias.

### ABERTURA (1ª mensagem):
- Cumprimenta com calor e presença
- Apresenta brevemente o tema desta sessão: "${session.title_pt} — ${session.subtitle_pt}"
- Faz UMA pergunta de abertura directamente ligada ao tema da sessão
- Exemplo de abertura: "Olá! Hoje vamos explorar [tema]. Antes de começar, [pergunta de abertura ligada ao tema]."

### FLUXO GUIADO (mensagens seguintes):
- Segue uma progressão natural de aprofundamento, sempre dentro do tema da sessão
- Cada pergunta deve partir da resposta anterior — NUNCA mudes de assunto abruptamente
- Usa no máximo 2-3 frases antes de fazer a próxima pergunta
- Mantém um fio condutor claro ao longo de toda a conversa

### ESTRUTURA DA SESSÃO:
1. **Abertura** (msg 1): Apresentar tema + pergunta inicial
2. **Exploração** (msg 2-4): Aprofundar a partir das respostas, sempre ligado ao tema
3. **Reflexão** (msg 5-6): Ajudar a pessoa a ver padrões ou fazer conexões
4. **Fecho suave** (msg 7+): Resumir o que emergiu, oferecer uma reflexão para levar consigo

### REGRAS IMPORTANTES:
- NÃO faças mais de UMA pergunta por mensagem
- NÃO dês monólogos longos — sê breve e pergunta
- CADA pergunta deve estar ligada à resposta anterior
- Se a pessoa mudar de assunto, acolhe e gentilmente reconduze ao tema da sessão
- Respostas curtas (3-5 frases máximo por mensagem)
`
}

export async function startSession(userId: string, mirrorSlug: MirrorSlug, sessionNumber: number) {
  const supabase = await createClient()

  await supabase
    .from('user_sessions')
    .update({
      status: 'in_progress',
      started_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .eq('mirror_slug', mirrorSlug)
    .eq('session_number', sessionNumber)
}

export async function completeSession(
  userId: string,
  mirrorSlug: MirrorSlug,
  sessionNumber: number,
  conversationId?: string,
  exitInsight?: string
) {
  const supabase = await createClient()
  const now = new Date().toISOString()

  // Mark current session as complete
  await supabase
    .from('user_sessions')
    .update({
      status: 'completed',
      completed_at: now,
      conversation_id: conversationId || null,
      exit_insight: exitInsight || null
    })
    .eq('user_id', userId)
    .eq('mirror_slug', mirrorSlug)
    .eq('session_number', sessionNumber)

  // Unlock next session within same mirror
  const nextSession = sessionNumber + 1
  if (nextSession <= 7) {
    await supabase
      .from('user_sessions')
      .update({ status: 'available' })
      .eq('user_id', userId)
      .eq('mirror_slug', mirrorSlug)
      .eq('session_number', nextSession)
  }

  // If completed session 7, unlock first session of next mirror
  if (sessionNumber === 7) {
    const currentIndex = MIRROR_ORDER.indexOf(mirrorSlug)
    if (currentIndex < MIRROR_ORDER.length - 1) {
      const nextMirror = MIRROR_ORDER[currentIndex + 1]
      await supabase
        .from('user_sessions')
        .update({ status: 'available' })
        .eq('user_id', userId)
        .eq('mirror_slug', nextMirror)
        .eq('session_number', 1)
    }
  }

  // Save exit insight to user_insights table as well
  if (exitInsight?.trim()) {
    await supabase
      .from('user_insights')
      .insert({
        user_id: userId,
        insight_text: exitInsight,
        mirror_slug: mirrorSlug,
        insight_type: 'awareness' as const,
      })
  }

  return { sessionNumber, nextSession: nextSession <= 7 ? nextSession : null }
}

export async function getNextAvailableSession(userId: string) {
  const supabase = await createClient()

  const { data: sessions } = await supabase
    .from('user_sessions')
    .select('*')
    .eq('user_id', userId)
    .in('status', ['available', 'in_progress'])
    .order('created_at', { ascending: true })

  if (!sessions || sessions.length === 0) return null

  // Sort by mirror order then session number
  const sorted = sessions.sort((a, b) => {
    const aOrder = MIRROR_ORDER.indexOf(a.mirror_slug as MirrorSlug)
    const bOrder = MIRROR_ORDER.indexOf(b.mirror_slug as MirrorSlug)
    if (aOrder !== bOrder) return aOrder - bOrder
    return a.session_number - b.session_number
  })

  return sorted[0]
}

export async function getSessionProgress(userId: string) {
  const supabase = await createClient()

  const { data: sessions } = await supabase
    .from('user_sessions')
    .select('mirror_slug, session_number, status')
    .eq('user_id', userId)

  if (!sessions || sessions.length === 0) return { completed: 0, total: 28, percentage: 0 }

  const completed = sessions.filter(s => s.status === 'completed').length
  const total = sessions.length || 28
  const percentage = Math.round((completed / total) * 100)

  return { completed, total, percentage }
}

export function getSessionTitle(session: { title_pt: string; title_en: string; title_es: string; title_fr: string }, lang: Language): string {
  const key = `title_${lang}` as keyof typeof session
  return session[key] || session.title_en
}

export function getSessionSubtitle(session: { subtitle_pt: string; subtitle_en: string; subtitle_es: string; subtitle_fr: string }, lang: Language): string {
  const key = `subtitle_${lang}` as keyof typeof session
  return session[key] || session.subtitle_en
}

