import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import type { MirrorSlug } from '@/types/database'

// Fallback keyword detection for when AI analysis is not needed
const PATTERN_KEYWORDS: Record<string, string[]> = {
  eating_when_anxious: ['como quando', 'eating when', 'stress eating', 'como por ansiedade', 'manger quand', 'comer cuando'],
  body_disconnection: ['disconnected from body', 'não sinto', 'numb', 'desconectado do corpo', 'déconnecté du corps'],
  body_rejection: ['odeio meu corpo', 'hate my body', 'não gosto do meu corpo', 'je déteste mon corps', 'odio mi cuerpo'],
  food_as_comfort: ['comida conforta', 'food comforts', 'como para me sentir melhor', 'comfort food', 'nourriture réconfort'],
  catastrophic_thinking: ['worst case', 'vai correr mal', 'catástrofe', 'tudo vai dar errado', 'le pire'],
  people_pleasing: ['não consigo dizer não', "can't say no", 'people pleaser', 'agradar os outros'],
  avoidance: ['evito', 'avoid', 'procrastinate', 'adiar', 'fuja', 'éviter'],
  identity_attachment: ['eu sou assim', "that's who I am", 'sempre fui', 'je suis comme ça'],
  control_seeking: ['preciso controlar', 'need to control', 'perco o controlo', 'besoin de contrôler'],
  generational_pattern: ['minha mãe também', 'my mother too', 'família toda', 'herdei', 'igual ao meu pai'],
  relationship_pattern: ['sempre escolho', 'always choose', 'mesmo tipo de pessoa', 'repito nos relacionamentos'],
  anxious_attachment: ['medo de abandono', 'fear of abandonment', 'preciso de reassurance', 'need reassurance', 'peur d\'abandon'],
  avoidant_attachment: ['preciso de espaço', 'need space', 'sufocado', 'suffocated', 'independente demais', 'too independent'],
  conflict_avoidance: ['evito conflito', 'avoid conflict', 'não digo o que penso', 'guardo para mim', 'je garde pour moi'],
  codependency: ['sem ele não sou nada', 'without them I\'m nothing', 'preciso do outro', 'não sei estar sozinha', 'ne sais pas être seule'],
  people_pleasing_relational: ['anulo-me', 'I lose myself', 'faço tudo pelo outro', 'sacrifico-me', 'je me sacrifie']
}

/**
 * Claude-powered pattern detection — called after each session completes.
 * Analyses the full conversation and returns structured patterns.
 */
export async function detectPatternsWithAI(
  userId: string,
  conversationMessages: Array<{ role: string; content: string }>,
  mirrorSlug: MirrorSlug,
  conversationId?: string
): Promise<void> {
  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

    const conversationText = conversationMessages
      .map(m => `${m.role === 'user' ? 'Pessoa' : 'Mirror'}: ${m.content}`)
      .join('\n')

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 600,
      system: `Analisa esta conversa terapêutica e identifica padrões comportamentais ou emocionais recorrentes.
Responde APENAS em JSON válido com este formato exacto:
{
  "patterns": [
    {
      "type": "nome_do_padrao_em_snake_case",
      "label_pt": "Nome legível em português",
      "label_en": "Readable name in English",
      "description": "Breve descrição do padrão observado (1-2 frases)",
      "confidence": 0.8
    }
  ],
  "insight": "Uma frase-chave que resume a descoberta mais importante desta conversa (ou null se nenhuma)"
}
Regras:
- Apenas inclui padrões com confidence > 0.6
- Máximo 3 padrões por conversa
- Se não detectares padrões claros: {"patterns": [], "insight": null}
- O "type" deve ser descritivo em snake_case (ex: emotional_eating, fear_of_abandonment)
- A "description" deve ser específica ao que a pessoa disse, não genérica`,
      messages: [
        {
          role: 'user',
          content: `Mirror: ${mirrorSlug.toUpperCase()}\n\nConversa para analisar:\n${conversationText}`
        }
      ]
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const result = JSON.parse(text)

    const supabase = await createClient()

    // Save detected patterns
    for (const pattern of result.patterns || []) {
      if (pattern.confidence < 0.6) continue

      const { data: existing } = await supabase
        .from('user_patterns')
        .select('id, integration_level')
        .eq('user_id', userId)
        .eq('pattern_type', pattern.type)
        .maybeSingle()

      if (existing) {
        await supabase
          .from('user_patterns')
          .update({
            integration_level: Math.min(existing.integration_level + 1, 5),
            pattern_description: pattern.description
          })
          .eq('id', existing.id)
      } else {
        await supabase
          .from('user_patterns')
          .insert({
            user_id: userId,
            pattern_type: pattern.type,
            pattern_description: pattern.description,
            discovered_in_mirror: mirrorSlug,
            conversation_id: conversationId || null,
            is_active: true,
            integration_level: 1
          })
      }
    }

    // Save AI-detected insight
    if (result.insight) {
      await supabase
        .from('user_insights')
        .insert({
          user_id: userId,
          insight_text: result.insight,
          insight_type: 'awareness',
          mirror_slug: mirrorSlug,
        })
    }
  } catch (error) {
    console.error('AI pattern detection error:', error)
    // Silently fail — pattern detection is non-critical
  }
}

/**
 * Fast keyword-based pattern detection — called after each message (real-time).
 * Lightweight, no API calls. Used during streaming.
 */
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
      const { data: existing } = await supabase
        .from('user_patterns')
        .select('id, integration_level')
        .eq('user_id', userId)
        .eq('pattern_type', patternType)
        .maybeSingle()

      if (existing) {
        const newLevel = Math.min(existing.integration_level + 1, 5)
        await supabase
          .from('user_patterns')
          .update({ integration_level: newLevel })
          .eq('id', existing.id)
      } else {
        await supabase
          .from('user_patterns')
          .insert({
            user_id: userId,
            pattern_type: patternType,
            pattern_description: extractPatternContext(text),
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

function extractPatternContext(text: string): string {
  const maxLength = 200
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
