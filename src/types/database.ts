export type SubscriptionTier = 'free' | 'essencial' | 'relacional' | 'duo' | 'profundo'
export type SubscriptionStatus = 'active' | 'inactive' | 'cancelled'
export type Language = 'pt' | 'en' | 'fr' | 'es'
export type MirrorSlug = 'soma' | 'seren' | 'luma' | 'echo' | 'nexus'
export type JourneyPhase = 'foundation' | 'regulation' | 'expansion' | 'integration' | 'complete'
export type MessageRole = 'user' | 'assistant'
export type InsightType = 'awareness' | 'breakthrough' | 'connection' | 'integration'

export interface User {
  id: string
  email: string
  created_at: string
  subscription_tier: SubscriptionTier
  subscription_status: SubscriptionStatus
  paypal_subscription_id: string | null
  language_preference: Language
  monthly_message_count: number
  last_reset_date: string
  onboarding_completed: boolean
  preferred_start_mirror: MirrorSlug
  duo_partner_id: string | null
  duo_invite_code: string | null
}

export interface UserJourney {
  id: string
  user_id: string
  current_phase: JourneyPhase
  foundation_completed: boolean
  regulation_completed: boolean
  expansion_completed: boolean
  integration_completed: boolean
  soma_conversations: number
  seren_conversations: number
  luma_conversations: number
  echo_conversations: number
  nexus_conversations: number
  total_conversations: number
  milestones_unlocked: string[]
  foundation_started_at: string | null
  regulation_started_at: string | null
  expansion_started_at: string | null
  integration_started_at: string | null
  journey_completed_at: string | null
  created_at: string
  updated_at: string
}

export interface Mirror {
  id: string
  slug: MirrorSlug
  name: string
  description_pt: string
  description_en: string
  description_fr: string
  description_es: string
  system_prompt: string
  color_theme: string
  icon: string
  journey_phase: JourneyPhase
  is_active: boolean
  is_premium: boolean
  display_order: number
  created_at: string
}

export interface Conversation {
  id: string
  user_id: string
  mirror_id: string
  title: string | null
  created_at: string
  updated_at: string
  message_count: number
  language: Language
  is_archived: boolean
  journey_phase_at_creation: JourneyPhase | null
}

export interface Message {
  id: string
  conversation_id: string
  role: MessageRole
  content: string
  created_at: string
  tokens_used: number | null
  model: string
  patterns_detected: string[]
  insights_flagged: string[]
}

export interface UserPattern {
  id: string
  user_id: string
  pattern_type: string
  pattern_description: string | null
  discovered_in_mirror: MirrorSlug
  discovered_at: string
  related_patterns: string[] | null
  is_active: boolean
  integration_level: number
  conversation_id: string | null
  message_id: string | null
}

export interface UserInsight {
  id: string
  user_id: string
  insight_text: string
  insight_type: InsightType | null
  mirror_slug: MirrorSlug | null
  journey_phase: JourneyPhase | null
  created_at: string
  is_favorited: boolean
  user_notes: string | null
}

export interface SubscriptionEvent {
  id: string
  user_id: string
  event_type: string
  paypal_event_id: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

export interface DailyUsage {
  id: string
  user_id: string
  date: string
  messages_sent: number
  conversations_started: number
  mirrors_used: string[]
  total_tokens: number
}

// Travessia types
export type SessionStatus = 'locked' | 'available' | 'in_progress' | 'completed'

export interface MirrorSession {
  id: string
  mirror_slug: MirrorSlug
  session_number: number
  title_pt: string
  title_en: string
  title_es: string
  title_fr: string
  subtitle_pt: string
  subtitle_en: string
  subtitle_es: string
  subtitle_fr: string
  session_prompt: string
  estimated_minutes: number
  unlock_after: number | null
}

export interface UserSessionRecord {
  id: string
  user_id: string
  mirror_slug: MirrorSlug
  session_number: number
  status: SessionStatus
  started_at: string | null
  completed_at: string | null
  conversation_id: string | null
  exit_insight: string | null
  created_at: string
}

export interface UserStreak {
  id: string
  user_id: string
  current_streak: number
  longest_streak: number
  last_session_date: string | null
  updated_at: string
}

export interface MilestoneRecord {
  id: string
  trigger_type: string
  trigger_value: string
  title_pt: string
  title_en: string
  title_es: string
  title_fr: string
  description_pt: string
  description_en: string
  description_es: string
  description_fr: string
  mirror_slug: MirrorSlug | null
}

export interface UserMilestone {
  id: string
  user_id: string
  milestone_id: string
  unlocked_at: string
  seen: boolean
}

// Database type for Supabase
export interface Database {
  public: {
    Tables: {
      users: {
        Row: User
        Insert: Partial<User> & { email: string }
        Update: Partial<User>
      }
      user_journey: {
        Row: UserJourney
        Insert: Partial<UserJourney> & { user_id: string }
        Update: Partial<UserJourney>
      }
      mirrors: {
        Row: Mirror
        Insert: Partial<Mirror> & { slug: string; name: string; system_prompt: string; color_theme: string; icon: string; journey_phase: string; description_pt: string; description_en: string; description_fr: string; description_es: string }
        Update: Partial<Mirror>
      }
      conversations: {
        Row: Conversation
        Insert: Partial<Conversation> & { user_id: string; mirror_id: string }
        Update: Partial<Conversation>
      }
      messages: {
        Row: Message
        Insert: Partial<Message> & { conversation_id: string; role: MessageRole; content: string }
        Update: Partial<Message>
      }
      user_patterns: {
        Row: UserPattern
        Insert: Partial<UserPattern> & { user_id: string; pattern_type: string }
        Update: Partial<UserPattern>
      }
      user_insights: {
        Row: UserInsight
        Insert: Partial<UserInsight> & { user_id: string; insight_text: string }
        Update: Partial<UserInsight>
      }
      subscription_events: {
        Row: SubscriptionEvent
        Insert: Partial<SubscriptionEvent> & { user_id: string; event_type: string }
        Update: Partial<SubscriptionEvent>
      }
      daily_usage: {
        Row: DailyUsage
        Insert: Partial<DailyUsage> & { user_id: string }
        Update: Partial<DailyUsage>
      }
      mirror_sessions: {
        Row: MirrorSession
        Insert: Partial<MirrorSession> & { mirror_slug: string; session_number: number; title_pt: string; title_en: string; title_es: string; title_fr: string; subtitle_pt: string; subtitle_en: string; subtitle_es: string; subtitle_fr: string; session_prompt: string }
        Update: Partial<MirrorSession>
      }
      user_sessions: {
        Row: UserSessionRecord
        Insert: Partial<UserSessionRecord> & { user_id: string; mirror_slug: string; session_number: number }
        Update: Partial<UserSessionRecord>
      }
      user_streaks: {
        Row: UserStreak
        Insert: Partial<UserStreak> & { user_id: string }
        Update: Partial<UserStreak>
      }
      milestones: {
        Row: MilestoneRecord
        Insert: Partial<MilestoneRecord> & { trigger_type: string; trigger_value: string; title_pt: string; title_en: string; title_es: string; title_fr: string; description_pt: string; description_en: string; description_es: string; description_fr: string }
        Update: Partial<MilestoneRecord>
      }
      user_milestones: {
        Row: UserMilestone
        Insert: Partial<UserMilestone> & { user_id: string; milestone_id: string }
        Update: Partial<UserMilestone>
      }
    }
  }
}
