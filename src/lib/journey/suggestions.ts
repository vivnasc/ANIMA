import type { UserJourney } from '@/types/database'

export interface Suggestion {
  type: 'continue_current' | 'phase_transition' | 'journey_complete' | 'explore'
  mirror?: string
  currentMirror?: string
  suggestedMirror?: string
  message: string
  urgency: 'low' | 'medium' | 'high' | 'completion'
}

export function getNextSuggestion(userJourney: UserJourney): Suggestion {
  const {
    current_phase,
    soma_conversations,
    seren_conversations,
    luma_conversations,
    echo_conversations
  } = userJourney

  // Foundation phase
  if (current_phase === 'foundation') {
    if (soma_conversations < 8) {
      return {
        type: 'continue_current',
        mirror: 'soma',
        message: 'Continue exploring with SOMA to establish your foundation',
        urgency: 'low'
      }
    } else {
      return {
        type: 'phase_transition',
        currentMirror: 'soma',
        suggestedMirror: 'seren',
        message: "You've built strong foundations with SOMA. Ready to explore emotional patterns with SEREN?",
        urgency: 'medium'
      }
    }
  }

  // Regulation phase
  if (current_phase === 'regulation') {
    if (seren_conversations < 10) {
      return {
        type: 'continue_current',
        mirror: 'seren',
        message: 'Keep working with SEREN to deepen emotional regulation',
        urgency: 'low'
      }
    } else {
      return {
        type: 'phase_transition',
        currentMirror: 'seren',
        suggestedMirror: 'luma',
        message: 'Your patterns are becoming clear with SEREN. LUMA can help you expand beyond them.',
        urgency: 'medium'
      }
    }
  }

  // Expansion phase
  if (current_phase === 'expansion') {
    if (luma_conversations < 12) {
      return {
        type: 'continue_current',
        mirror: 'luma',
        message: 'Continue expanding consciousness with LUMA',
        urgency: 'low'
      }
    } else {
      return {
        type: 'phase_transition',
        currentMirror: 'luma',
        suggestedMirror: 'echo',
        message: "You've questioned deep beliefs with LUMA. ECHO can help integrate everything.",
        urgency: 'high'
      }
    }
  }

  // Integration phase
  if (current_phase === 'integration') {
    if (echo_conversations < 15) {
      return {
        type: 'continue_current',
        mirror: 'echo',
        message: 'Keep integrating with ECHO to complete the journey',
        urgency: 'medium'
      }
    } else {
      return {
        type: 'journey_complete',
        message: "You've completed the full ANIMA journey. You can always return to any mirror when needed.",
        urgency: 'completion'
      }
    }
  }

  // Fallback
  return {
    type: 'explore',
    message: 'Explore any mirror that calls to you',
    urgency: 'low'
  }
}
