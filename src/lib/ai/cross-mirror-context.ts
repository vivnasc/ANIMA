import { createClient } from '@/lib/supabase/server'
import type { MirrorSlug } from '@/types/database'

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

  if (!patterns?.length && !insights?.length) {
    return '' // No cross-mirror context yet
  }

  let context = '\n\n=== CONTEXTO CROSS-MIRROR ===\n'
  context += 'O utilizador já explorou com outros espelhos. Aqui estão os padrões e insights chave:\n\n'

  if (patterns?.length) {
    context += 'PADRÕES IDENTIFICADOS:\n'
    patterns.forEach(p => {
      context += `- [${p.discovered_in_mirror.toUpperCase()}] ${p.pattern_type}: ${p.pattern_description || 'Sem descrição'}\n`
    })
    context += '\n'
  }

  if (insights?.length) {
    context += 'INSIGHTS CHAVE:\n'
    insights.forEach(i => {
      context += `- [${(i.mirror_slug || 'desconhecido').toUpperCase()}] ${i.insight_text}\n`
    })
  }

  context += '\nReferencia estes padrões naturalmente quando relevante, mas não forces conexões.\n'
  context += '=== FIM DO CONTEXTO CROSS-MIRROR ===\n\n'

  return context
}
