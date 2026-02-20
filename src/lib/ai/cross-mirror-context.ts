import { createClient } from '@/lib/supabase/server'
import type { MirrorSlug } from '@/types/database'

const MIRROR_ORDER: MirrorSlug[] = ['soma', 'seren', 'luma', 'echo', 'nexus']

export async function buildCrossMirrorContext(
  userId: string,
  currentMirror: MirrorSlug
): Promise<string> {
  const supabase = await createClient()

  // Get patterns from other mirrors
  const { data: patterns } = await supabase
    .from('user_patterns')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .neq('discovered_in_mirror', currentMirror)
    .order('integration_level', { ascending: false })
    .limit(3)

  // Get key insights from other mirrors
  const { data: insights } = await supabase
    .from('user_insights')
    .select('*')
    .eq('user_id', userId)
    .neq('mirror_slug', currentMirror)
    .order('created_at', { ascending: false })
    .limit(5)

  // Get exit insights from previous mirror sessions
  const currentIndex = MIRROR_ORDER.indexOf(currentMirror)
  const previousMirrors = MIRROR_ORDER.slice(0, currentIndex)

  let exitInsights: Array<{ mirror_slug: string; session_number: number; exit_insight: string }> = []
  if (previousMirrors.length > 0) {
    const { data: sessionInsights } = await supabase
      .from('user_sessions')
      .select('mirror_slug, session_number, exit_insight')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .in('mirror_slug', previousMirrors)
      .not('exit_insight', 'is', null)
      .order('completed_at', { ascending: true })

    exitInsights = (sessionInsights || []).filter(s => s.exit_insight) as typeof exitInsights
  }

  if (!patterns?.length && !insights?.length && !exitInsights.length) {
    return '' // No cross-mirror context yet
  }

  let context = '\n\n=== CONTEXTO CROSS-MIRROR ===\n'
  context += 'A pessoa já percorreu fases anteriores. Usa estes insights NATURALMENTE quando relevante.\n\n'

  if (patterns?.length) {
    context += 'PADRÕES IDENTIFICADOS:\n'
    patterns.forEach(p => {
      context += `- [${p.discovered_in_mirror.toUpperCase()}] ${p.pattern_type}: ${p.pattern_description || 'Sem descrição'}\n`
    })
    context += '\n'
  }

  if (exitInsights.length > 0) {
    context += 'INSIGHTS DAS SESSÕES ANTERIORES (capturados pela pessoa no ritual de saída):\n'
    exitInsights.forEach(s => {
      context += `- [${s.mirror_slug.toUpperCase()}, sessão ${s.session_number}]: "${s.exit_insight}"\n`
    })
    context += '\n'
  }

  if (insights?.length) {
    context += 'INSIGHTS CHAVE:\n'
    insights.forEach(i => {
      context += `- [${(i.mirror_slug || 'desconhecido').toUpperCase()}] ${i.insight_text}\n`
    })
  }

  context += '\nNão forces conexões. Quando fizer sentido, mostra como o que está a descobrir agora se conecta com o que já descobriu antes.\n'
  context += '=== FIM DO CONTEXTO CROSS-MIRROR ===\n\n'

  return context
}
