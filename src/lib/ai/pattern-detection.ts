import { createClient } from '@/lib/supabase/server'
import type { MirrorSlug } from '@/types/database'

const PATTERN_KEYWORDS: Record<string, string[]> = {
  eating_when_anxious: [
    'como quando', 'eating when', 'stress eating', 'como por ansiedade',
    'como quando estou', 'manger quand', 'comer cuando'
  ],
  body_disconnection: [
    'disconnected from body', 'não sinto', 'numb', 'desconectado do corpo',
    'don\'t feel my body', 'déconnecté du corps', 'desconectado del cuerpo'
  ],
  body_rejection: [
    'odeio meu corpo', 'hate my body', 'não gosto do meu corpo',
    'je déteste mon corps', 'odio mi cuerpo', 'corpo feio'
  ],
  disconnection_from_hunger: [
    'não sinto fome', 'don\'t feel hunger', 'esqueço de comer',
    'forget to eat', 'skip meals', 'pulo refeições'
  ],
  food_as_comfort: [
    'comida conforta', 'food comforts', 'como para me sentir melhor',
    'eating to feel better', 'comfort food', 'nourriture réconfort'
  ],
  catastrophic_thinking: [
    'worst case', 'vai correr mal', 'disaster', 'catástrofe',
    'tudo vai dar errado', 'everything will go wrong', 'le pire'
  ],
  people_pleasing: [
    'não consigo dizer não', 'can\'t say no', 'people pleaser',
    'everyone else first', 'agradar os outros', 'complacer'
  ],
  avoidance: [
    'evito', 'avoid', 'procrastinate', 'adiar', 'fuja',
    'run away', 'éviter', 'evitar confronto'
  ],
  anxiety_as_protection: [
    'ansiedade protege', 'anxiety protects', 'medo de',
    'afraid of', 'peur de', 'miedo de'
  ],
  identity_attachment: [
    'eu sou assim', 'that\'s who I am', 'always been this way',
    'sempre fui', 'je suis comme ça', 'siempre he sido'
  ],
  control_seeking: [
    'preciso controlar', 'need to control', 'perco o controlo',
    'lose control', 'besoin de contrôler', 'necesito controlar'
  ],
  generational_pattern: [
    'minha mãe também', 'my mother too', 'família toda',
    'whole family', 'herdei', 'inherited', 'igual ao meu pai'
  ],
  relationship_pattern: [
    'sempre escolho', 'always choose', 'mesmo tipo de pessoa',
    'same type of person', 'repito nos relacionamentos',
    'repeat in relationships'
  ]
}

export async function detectAndSavePatterns(
  userId: string,
  text: string,
  mirrorSlug: MirrorSlug,
  conversationId?: string,
  messageId?: string
): Promise<string[]> {
  const detected: string[] = []
  const lowerText = text.toLowerCase()

  for (const [patternType, keywords] of Object.entries(PATTERN_KEYWORDS)) {
    const matches = keywords.some(kw => lowerText.includes(kw.toLowerCase()))

    if (matches) {
      detected.push(patternType)
    }
  }

  if (detected.length > 0) {
    const supabase = await createClient()

    for (const patternType of detected) {
      // Check if pattern already exists for this user
      const { data: existing } = await supabase
        .from('user_patterns')
        .select('id, integration_level')
        .eq('user_id', userId)
        .eq('pattern_type', patternType)
        .single()

      if (existing) {
        // Increase integration level (max 5)
        const newLevel = Math.min(existing.integration_level + 1, 5)
        await supabase
          .from('user_patterns')
          .update({ integration_level: newLevel })
          .eq('id', existing.id)
      } else {
        // Create new pattern
        await supabase
          .from('user_patterns')
          .insert({
            user_id: userId,
            pattern_type: patternType,
            pattern_description: extractPatternContext(text, patternType),
            discovered_in_mirror: mirrorSlug,
            conversation_id: conversationId || null,
            message_id: messageId || null,
            is_active: true,
            integration_level: 1
          })
      }
    }
  }

  return detected
}

function extractPatternContext(text: string, _patternType: string): string {
  // Extract a short context snippet around the pattern
  const maxLength = 200
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
