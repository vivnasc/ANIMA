import type { JourneyPhase, MirrorSlug } from '@/types/database'

export interface PhaseConfig {
  name: string
  mirror: MirrorSlug
  order: number
  description: string
  suggestedMinConversations: number
  suggestedMaxConversations: number
  unlocks: string[]
}

export const JOURNEY_PHASES: Record<Exclude<JourneyPhase, 'complete'>, PhaseConfig> = {
  foundation: {
    name: 'Foundation',
    mirror: 'soma',
    order: 1,
    description: 'Reconnect with your body and establish foundations',
    suggestedMinConversations: 8,
    suggestedMaxConversations: 10,
    unlocks: ['regulation']
  },
  regulation: {
    name: 'Regulation',
    mirror: 'seren',
    order: 2,
    description: 'Regulate emotions and understand mental patterns',
    suggestedMinConversations: 10,
    suggestedMaxConversations: 15,
    unlocks: ['expansion']
  },
  expansion: {
    name: 'Expansion',
    mirror: 'luma',
    order: 3,
    description: 'Expand consciousness and question limiting beliefs',
    suggestedMinConversations: 12,
    suggestedMaxConversations: 15,
    unlocks: ['integration']
  },
  integration: {
    name: 'Integration',
    mirror: 'echo',
    order: 4,
    description: 'Integrate all learnings and identify recurring patterns',
    suggestedMinConversations: 15,
    suggestedMaxConversations: 20,
    unlocks: ['complete']
  }
}

export interface MilestoneConfig {
  title: string
  description: string
  icon: string
}

export const MILESTONES: Record<string, MilestoneConfig> = {
  first_conversation: {
    title: 'First Step',
    description: 'You started the journey',
    icon: '🌱'
  },
  soma_engaged: {
    title: 'Body Awareness',
    description: 'Deep exploration with SOMA',
    icon: '💚'
  },
  foundation_complete: {
    title: 'Foundation Established',
    description: 'Foundation phase completed',
    icon: '🏛️'
  },
  first_pattern_identified: {
    title: 'Pattern Recognition',
    description: 'First important pattern identified',
    icon: '🔍'
  },
  cross_mirror_insight: {
    title: 'Connection Made',
    description: 'Cross-mirror insight discovered',
    icon: '🔗'
  },
  regulation_mastery: {
    title: 'Emotional Regulation',
    description: 'Self-regulation capacity developed',
    icon: '🌊'
  },
  consciousness_shift: {
    title: 'Expanded Awareness',
    description: 'Perspective shift with LUMA',
    icon: '✨'
  },
  pattern_integration: {
    title: 'Integration Complete',
    description: 'ECHO helped integrate the journey',
    icon: '🔊'
  },
  journey_complete: {
    title: 'Full Circle',
    description: 'All 4 phases of ANIMA completed',
    icon: '🌟'
  },
  deep_explorer: {
    title: 'Deep Explorer',
    description: '50+ deep conversations',
    icon: '🧭'
  }
}

export const PHASE_ORDER: JourneyPhase[] = ['foundation', 'regulation', 'expansion', 'integration', 'complete']

export const MIRROR_TO_PHASE: Record<string, string> = {
  soma: 'foundation',
  seren: 'regulation',
  luma: 'expansion',
  echo: 'integration',
  nexus: 'relational',
}

export const PHASE_TO_MIRROR: Record<Exclude<JourneyPhase, 'complete'>, MirrorSlug> = {
  foundation: 'soma',
  regulation: 'seren',
  expansion: 'luma',
  integration: 'echo'
}

export const FREE_TIER_MONTHLY_LIMIT = 10
export const FREE_TIER_MIRRORS: MirrorSlug[] = ['soma']

// Tier access configuration
import type { SubscriptionTier } from '@/types/database'

export interface TierConfig {
  price: number
  mirrors: MirrorSlug[]
  monthlyLimit: number | null // null = unlimited
  totalSessions: number
  features: string[]
}

export const TIER_CONFIG: Record<SubscriptionTier, TierConfig> = {
  free: {
    price: 0,
    mirrors: ['soma'],
    monthlyLimit: 10,
    totalSessions: 7,
    features: ['soma_mirror', 'basic_patterns'],
  },
  essencial: {
    price: 19,
    mirrors: ['soma', 'seren', 'luma', 'echo'],
    monthlyLimit: null,
    totalSessions: 28,
    features: ['all_4_mirrors', 'ai_patterns', 'diary_export', 'streaks'],
  },
  relacional: {
    price: 29,
    mirrors: ['soma', 'seren', 'luma', 'echo', 'nexus'],
    monthlyLimit: null,
    totalSessions: 35,
    features: ['all_5_mirrors', 'ai_patterns', 'diary_export', 'streaks', 'relational_sessions'],
  },
  duo: {
    price: 39,
    mirrors: ['soma', 'seren', 'luma', 'echo', 'nexus'],
    monthlyLimit: null,
    totalSessions: 35,
    features: ['all_5_mirrors', 'ai_patterns', 'diary_export', 'streaks', 'relational_sessions', 'duo_journey', 'shared_insights'],
  },
  profundo: {
    price: 49,
    mirrors: ['soma', 'seren', 'luma', 'echo', 'nexus'],
    monthlyLimit: null,
    totalSessions: 35,
    features: ['all_5_mirrors', 'ai_patterns', 'diary_export', 'streaks', 'relational_sessions', 'free_sessions', 'monthly_report', 'pattern_timeline'],
  },
}

export function canAccessMirror(tier: SubscriptionTier, mirror: MirrorSlug): boolean {
  return TIER_CONFIG[tier]?.mirrors.includes(mirror) ?? false
}

export function hasFeature(tier: SubscriptionTier, feature: string): boolean {
  return TIER_CONFIG[tier]?.features.includes(feature) ?? false
}

export function getMonthlyLimit(tier: SubscriptionTier): number | null {
  return TIER_CONFIG[tier]?.monthlyLimit ?? 10
}
