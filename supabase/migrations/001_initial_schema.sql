-- ============================================
-- ANIMA - Initial Database Schema
-- Migration: 001_initial_schema.sql
-- Description: Complete schema for the ANIMA self-knowledge platform
-- ============================================

-- ============================================
-- EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Subscription
  subscription_tier TEXT DEFAULT 'free',       -- 'free' | 'premium'
  subscription_status TEXT DEFAULT 'inactive', -- 'active' | 'inactive' | 'cancelled'
  paypal_subscription_id TEXT,

  -- Preferences
  language_preference TEXT DEFAULT 'pt',        -- 'pt' | 'en' | 'fr' | 'es'

  -- Usage tracking
  monthly_message_count INT DEFAULT 0,
  last_reset_date DATE DEFAULT CURRENT_DATE,

  -- Onboarding
  onboarding_completed BOOLEAN DEFAULT false,
  preferred_start_mirror TEXT DEFAULT 'soma'    -- suggestion, not obligation
);

-- ============================================
-- USER JOURNEY TABLE (Core progression tracking)
-- ============================================
CREATE TABLE user_journey (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,

  -- Current phase
  current_phase TEXT DEFAULT 'foundation',
  -- 'foundation' | 'regulation' | 'expansion' | 'integration' | 'complete'

  -- Phase completion flags
  foundation_completed BOOLEAN DEFAULT false,
  regulation_completed BOOLEAN DEFAULT false,
  expansion_completed BOOLEAN DEFAULT false,
  integration_completed BOOLEAN DEFAULT false,

  -- Conversation counters per mirror
  soma_conversations INT DEFAULT 0,
  seren_conversations INT DEFAULT 0,
  luma_conversations INT DEFAULT 0,
  echo_conversations INT DEFAULT 0,

  -- Total conversations
  total_conversations INT DEFAULT 0,

  -- Milestones unlocked
  milestones_unlocked TEXT[] DEFAULT '{}',

  -- Phase timestamps
  foundation_started_at TIMESTAMPTZ,
  regulation_started_at TIMESTAMPTZ,
  expansion_started_at TIMESTAMPTZ,
  integration_started_at TIMESTAMPTZ,
  journey_completed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MIRRORS TABLE
-- ============================================
CREATE TABLE mirrors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,     -- 'soma', 'seren', 'luma', 'echo'
  name TEXT NOT NULL,

  -- Multilingual descriptions
  description_pt TEXT NOT NULL,
  description_en TEXT NOT NULL,
  description_fr TEXT NOT NULL,
  description_es TEXT NOT NULL,

  -- System prompt (adapts to user language at runtime)
  system_prompt TEXT NOT NULL,

  -- Visual identity
  color_theme TEXT NOT NULL,     -- hex color
  icon TEXT NOT NULL,            -- emoji

  -- Journey phase mapping
  journey_phase TEXT NOT NULL,
  -- 'foundation' | 'regulation' | 'expansion' | 'integration'

  -- Access control
  is_active BOOLEAN DEFAULT true,
  is_premium BOOLEAN DEFAULT false,

  -- Display ordering
  display_order INT DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CONVERSATIONS TABLE
-- ============================================
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  mirror_id UUID REFERENCES mirrors(id),

  title TEXT,                    -- auto-generated from first messages

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  message_count INT DEFAULT 0,
  language TEXT DEFAULT 'pt',

  is_archived BOOLEAN DEFAULT false,

  -- Journey context at time of conversation
  journey_phase_at_creation TEXT
);

-- ============================================
-- MESSAGES TABLE
-- ============================================
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,

  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- AI metadata
  tokens_used INT,
  model TEXT DEFAULT 'claude-sonnet-4',

  -- Pattern tagging for cross-mirror intelligence
  patterns_detected TEXT[] DEFAULT '{}',
  insights_flagged TEXT[] DEFAULT '{}'
);

-- ============================================
-- USER PATTERNS TABLE (Cross-Mirror Intelligence)
-- ============================================
CREATE TABLE user_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  -- Pattern identification
  pattern_type TEXT NOT NULL,
  pattern_description TEXT,

  -- Source
  discovered_in_mirror TEXT,     -- 'soma', 'seren', 'luma', 'echo'
  discovered_at TIMESTAMPTZ DEFAULT NOW(),

  -- Cross-references
  related_patterns UUID[],       -- IDs of related patterns

  -- Status
  is_active BOOLEAN DEFAULT true,
  integration_level INT DEFAULT 0, -- 0-5, increases as worked through

  -- Metadata linking back to origin
  conversation_id UUID REFERENCES conversations(id),
  message_id UUID REFERENCES messages(id)
);

-- ============================================
-- USER INSIGHTS TABLE (Dashboard & Progress)
-- ============================================
CREATE TABLE user_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  insight_text TEXT NOT NULL,
  insight_type TEXT,             -- 'awareness' | 'breakthrough' | 'connection' | 'integration'

  mirror_slug TEXT,              -- which mirror generated it
  journey_phase TEXT,            -- which phase user was in

  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- User interaction
  is_favorited BOOLEAN DEFAULT false,
  user_notes TEXT
);

-- ============================================
-- SUBSCRIPTION EVENTS LOG
-- ============================================
CREATE TABLE subscription_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  event_type TEXT NOT NULL,
  -- 'created' | 'activated' | 'cancelled' | 'payment_failed' | 'renewed'

  paypal_event_id TEXT UNIQUE,
  metadata JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- DAILY USAGE ANALYTICS
-- ============================================
CREATE TABLE daily_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,

  messages_sent INT DEFAULT 0,
  conversations_started INT DEFAULT 0,

  mirrors_used TEXT[],           -- e.g. ['soma', 'seren']

  total_tokens INT DEFAULT 0,

  UNIQUE(user_id, date)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Conversations
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_mirror_id ON conversations(mirror_id);
CREATE INDEX idx_conversations_updated_at ON conversations(updated_at DESC);

-- Messages
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_patterns ON messages USING GIN(patterns_detected);

-- User Journey
CREATE INDEX idx_user_journey_user_id ON user_journey(user_id);
CREATE INDEX idx_user_journey_current_phase ON user_journey(current_phase);

-- User Patterns
CREATE INDEX idx_user_patterns_user_id ON user_patterns(user_id);
CREATE INDEX idx_user_patterns_mirror ON user_patterns(discovered_in_mirror);
CREATE INDEX idx_user_patterns_active ON user_patterns(is_active);

-- Daily Usage
CREATE INDEX idx_daily_usage_date ON daily_usage(date);
CREATE INDEX idx_daily_usage_user_date ON daily_usage(user_id, date);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_journey ENABLE ROW LEVEL SECURITY;
ALTER TABLE mirrors ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_usage ENABLE ROW LEVEL SECURITY;

-- Users: can only see and modify their own row
CREATE POLICY "Users view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- User Journey: own data only
CREATE POLICY "Users view own journey" ON user_journey
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users update own journey" ON user_journey
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Auto-insert journey on signup" ON user_journey
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Mirrors: publicly readable for authenticated users
CREATE POLICY "Authenticated users view mirrors" ON mirrors
  FOR SELECT USING (is_active = true AND auth.role() = 'authenticated');

-- Conversations: own data only
CREATE POLICY "Users view own conversations" ON conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users create own conversations" ON conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own conversations" ON conversations
  FOR UPDATE USING (auth.uid() = user_id);

-- Messages: own data only (via conversation ownership)
CREATE POLICY "Users view own messages" ON messages
  FOR SELECT USING (
    conversation_id IN (
      SELECT id FROM conversations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users create messages in own conversations" ON messages
  FOR INSERT WITH CHECK (
    conversation_id IN (
      SELECT id FROM conversations WHERE user_id = auth.uid()
    )
  );

-- User Patterns: own data only
CREATE POLICY "Users view own patterns" ON user_patterns
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System creates patterns" ON user_patterns
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User Insights: own data only
CREATE POLICY "Users view own insights" ON user_insights
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users create own insights" ON user_insights
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own insights" ON user_insights
  FOR UPDATE USING (auth.uid() = user_id);

-- Subscription Events: own data only
CREATE POLICY "Users view own subscription events" ON subscription_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System creates subscription events" ON subscription_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Daily Usage: own data only
CREATE POLICY "Users view own usage" ON daily_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users create own usage" ON daily_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own usage" ON daily_usage
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- TRIGGER: Auto-create user_journey on new user
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user_journey()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_journey (user_id, foundation_started_at)
  VALUES (NEW.id, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_user_created_create_journey
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user_journey();

-- ============================================
-- FUNCTION: Reset monthly message counts
-- Called via cron job or Supabase scheduled function
-- Resets monthly_message_count for all users whose
-- last_reset_date is in a previous calendar month.
-- ============================================
CREATE OR REPLACE FUNCTION reset_monthly_message_counts()
RETURNS void AS $$
BEGIN
  UPDATE users
  SET
    monthly_message_count = 0,
    last_reset_date = CURRENT_DATE
  WHERE last_reset_date < date_trunc('month', CURRENT_DATE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SEED DATA: The 4 Mirrors
-- ============================================
INSERT INTO mirrors (slug, name, color_theme, icon, journey_phase, is_premium, display_order, description_pt, description_en, description_fr, description_es, system_prompt) VALUES
(
  'soma',
  'SOMA',
  '#10b981',
  '🌱',
  'foundation',
  false,
  1,
  'Explora tua relação com corpo e nutrição emocional. Fundamenta-te no físico.',
  'Explore your relationship with body and emotional nutrition. Ground yourself in the physical.',
  'Explorez votre relation avec le corps et la nutrition émotionnelle. Ancrez-vous dans le physique.',
  'Explora tu relación con el cuerpo y la nutrición emocional. Fundamenta en lo físico.',
  '[SEE APPLICATION CODE]'
),
(
  'seren',
  'SEREN',
  '#6366f1',
  '🌊',
  'regulation',
  true,
  2,
  'Trabalha ansiedade, padrões de pensamento e regulação emocional.',
  'Work through anxiety, thought patterns and emotional regulation.',
  E'Travaillez l''anxiété, les schémas de pensée et la régulation émotionnelle.',
  'Trabaja ansiedad, patrones de pensamiento y regulación emocional.',
  '[SEE APPLICATION CODE]'
),
(
  'luma',
  'LUMA',
  '#f59e0b',
  '✨',
  'expansion',
  true,
  3,
  'Expande consciência e questiona as crenças que te limitam.',
  'Expand consciousness and question the beliefs that limit you.',
  E'Élargissez la conscience et questionnez les croyances qui vous limitent.',
  'Expande la consciencia y cuestiona las creencias que te limitan.',
  '[SEE APPLICATION CODE]'
),
(
  'echo',
  'ECHO',
  '#8b5cf6',
  '🔊',
  'integration',
  true,
  4,
  'Identifica padrões que ecoam na tua vida e integra toda a jornada.',
  'Identify patterns that echo through your life and integrate the entire journey.',
  E'Identifiez les schémas qui résonnent dans votre vie et intégrez tout le parcours.',
  'Identifica patrones que resuenan en tu vida e integra todo el viaje.',
  '[SEE APPLICATION CODE]'
);
