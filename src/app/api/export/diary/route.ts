import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Language } from '@/types/database'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const lang = (req.nextUrl.searchParams.get('lang') || 'pt') as Language

    // Get all user data for diary export
    const [insightsResult, sessionsResult, patternsResult, streakResult] = await Promise.all([
      supabase
        .from('user_insights')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true }),
      supabase
        .from('user_sessions')
        .select('mirror_slug, session_number, status, exit_insight, completed_at')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: true }),
      supabase
        .from('user_patterns')
        .select('pattern_type, pattern_description, discovered_in_mirror, integration_level')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('integration_level', { ascending: false }),
      supabase
        .from('user_streaks')
        .select('current_streak, longest_streak')
        .eq('user_id', user.id)
        .single()
    ])

    const insights = insightsResult.data || []
    const sessions = sessionsResult.data || []
    const patterns = patternsResult.data || []
    const streak = streakResult.data

    const titles: Record<Language, Record<string, string>> = {
      pt: {
        title: 'ANIMA — O Meu Diário de Travessia',
        sessionsTitle: 'Sessões Completas',
        insightsTitle: 'Insights Capturados',
        patternsTitle: 'Padrões Identificados',
        statsTitle: 'Estatísticas',
        sessionLabel: 'Sessão',
        insightLabel: 'Insight',
        streakLabel: 'Maior streak',
        daysLabel: 'dias',
        completedLabel: 'sessões completas',
        footer: 'Exportado de ANIMA — a jornada continua.'
      },
      en: {
        title: 'ANIMA — My Journey Diary',
        sessionsTitle: 'Completed Sessions',
        insightsTitle: 'Captured Insights',
        patternsTitle: 'Identified Patterns',
        statsTitle: 'Statistics',
        sessionLabel: 'Session',
        insightLabel: 'Insight',
        streakLabel: 'Longest streak',
        daysLabel: 'days',
        completedLabel: 'sessions completed',
        footer: 'Exported from ANIMA — the journey continues.'
      },
      es: {
        title: 'ANIMA — Mi Diario de Travesía',
        sessionsTitle: 'Sesiones Completas',
        insightsTitle: 'Insights Capturados',
        patternsTitle: 'Patrones Identificados',
        statsTitle: 'Estadísticas',
        sessionLabel: 'Sesión',
        insightLabel: 'Insight',
        streakLabel: 'Mayor racha',
        daysLabel: 'días',
        completedLabel: 'sesiones completas',
        footer: 'Exportado de ANIMA — el viaje continúa.'
      },
      fr: {
        title: 'ANIMA — Mon Journal de Traversée',
        sessionsTitle: 'Sessions Complètes',
        insightsTitle: 'Insights Capturés',
        patternsTitle: 'Schémas Identifiés',
        statsTitle: 'Statistiques',
        sessionLabel: 'Session',
        insightLabel: 'Insight',
        streakLabel: 'Plus longue série',
        daysLabel: 'jours',
        completedLabel: 'sessions complètes',
        footer: 'Exporté de ANIMA — le voyage continue.'
      }
    }

    const t = titles[lang]
    const date = new Date().toLocaleDateString(lang === 'pt' ? 'pt-PT' : lang === 'fr' ? 'fr-FR' : lang === 'es' ? 'es-ES' : 'en-GB')

    let markdown = `# ${t.title}\n`
    markdown += `*${date}*\n\n`
    markdown += `---\n\n`

    // Stats
    markdown += `## ${t.statsTitle}\n\n`
    markdown += `- **${sessions.length}** ${t.completedLabel}\n`
    if (streak) {
      markdown += `- **${t.streakLabel}:** ${streak.longest_streak} ${t.daysLabel}\n`
    }
    markdown += `- **${patterns.length}** ${t.patternsTitle.toLowerCase()}\n`
    markdown += `- **${insights.length}** insights\n\n`

    // Sessions with exit insights
    const sessionsByMirror: Record<string, typeof sessions> = {}
    for (const s of sessions) {
      if (!sessionsByMirror[s.mirror_slug]) sessionsByMirror[s.mirror_slug] = []
      sessionsByMirror[s.mirror_slug].push(s)
    }

    const mirrorNames: Record<string, string> = {
      soma: 'SOMA — Corpo',
      seren: 'SEREN — Mente',
      luma: 'LUMA — Consciência',
      echo: 'ECHO — Integração'
    }

    markdown += `## ${t.sessionsTitle}\n\n`
    for (const [mirror, mirrorSessions] of Object.entries(sessionsByMirror)) {
      markdown += `### ${mirrorNames[mirror] || mirror.toUpperCase()}\n\n`
      for (const s of mirrorSessions) {
        const completedDate = s.completed_at ? new Date(s.completed_at).toLocaleDateString() : ''
        markdown += `**${t.sessionLabel} ${s.session_number}** — ${completedDate}\n`
        if (s.exit_insight) {
          markdown += `> "${s.exit_insight}"\n`
        }
        markdown += `\n`
      }
    }

    // Patterns
    if (patterns.length > 0) {
      markdown += `## ${t.patternsTitle}\n\n`
      for (const p of patterns) {
        const name = p.pattern_type.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
        const dots = '●'.repeat(p.integration_level) + '○'.repeat(5 - p.integration_level)
        markdown += `- **${name}** [${dots}] — ${p.discovered_in_mirror.toUpperCase()}\n`
        if (p.pattern_description) {
          markdown += `  ${p.pattern_description}\n`
        }
        markdown += `\n`
      }
    }

    // Insights
    if (insights.length > 0) {
      markdown += `## ${t.insightsTitle}\n\n`
      for (const i of insights) {
        const insightDate = new Date(i.created_at).toLocaleDateString()
        markdown += `> "${i.insight_text}"\n`
        markdown += `> — ${(i.mirror_slug || '').toUpperCase()}, ${insightDate}\n\n`
      }
    }

    markdown += `---\n\n*${t.footer}*\n`

    return new NextResponse(markdown, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': `attachment; filename="anima-diary-${date}.md"`,
      },
    })
  } catch (error) {
    console.error('Export diary error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
