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

  let context = '\n\n=== CROSS-MIRROR CONTEXT ===\n'
  context += 'The user has previously explored with other mirrors. Here are key patterns and insights:\n\n'

  if (patterns?.length) {
    context += 'PATTERNS IDENTIFIED:\n'
    patterns.forEach(p => {
      context += `- [${p.discovered_in_mirror.toUpperCase()}] ${p.pattern_type}: ${p.pattern_description || 'No description'}\n`
    })
    context += '\n'
  }

  if (insights?.length) {
    context += 'KEY INSIGHTS:\n'
    insights.forEach(i => {
      context += `- [${(i.mirror_slug || 'unknown').toUpperCase()}] ${i.insight_text}\n`
    })
  }

  context += '\nReference these naturally when relevant, but don\'t force connections.\n'
  context += '=== END CROSS-MIRROR CONTEXT ===\n\n'

  return context
}
