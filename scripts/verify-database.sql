-- ============================================
-- ANIMA - Database Verification Script
-- Run this in the Supabase SQL Editor to verify
-- all required tables and columns exist
-- ============================================

-- 1. CHECK ALL REQUIRED TABLES EXIST
SELECT
  table_name,
  CASE WHEN table_name IS NOT NULL THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
FROM (
  VALUES
    ('users'), ('user_journey'), ('mirrors'), ('conversations'),
    ('messages'), ('user_patterns'), ('user_insights'),
    ('subscription_events'), ('daily_usage'),
    ('mirror_sessions'), ('user_sessions'), ('user_streaks'),
    ('milestones'), ('user_milestones'), ('duo_invites')
) AS required(table_name)
LEFT JOIN information_schema.tables t
  ON t.table_name = required.table_name
  AND t.table_schema = 'public'
ORDER BY required.table_name;

-- 2. CHECK CRITICAL COLUMNS ON users TABLE
SELECT column_name, data_type,
  CASE WHEN column_name IS NOT NULL THEN '✅' ELSE '❌' END as status
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;

-- 3. CHECK NEXUS COLUMNS ON user_journey
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'user_journey'
  AND column_name = 'nexus_conversations';

-- 4. CHECK DUO COLUMNS ON users
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'users'
  AND column_name IN ('duo_partner_id', 'duo_invite_code');

-- 5. COUNT MIRROR RECORDS (should be 5: soma, seren, luma, echo, nexus)
SELECT slug, name, journey_phase, is_active, is_premium, display_order
FROM mirrors
ORDER BY display_order;

-- 6. COUNT SESSION DEFINITIONS (should be 35: 7 per mirror × 5 mirrors)
SELECT mirror_slug, COUNT(*) as session_count
FROM mirror_sessions
GROUP BY mirror_slug
ORDER BY mirror_slug;

-- 7. COUNT MILESTONES (should be >= 10)
SELECT COUNT(*) as total_milestones FROM milestones;

-- 8. CHECK RLS IS ENABLED ON ALL TABLES
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'users', 'user_journey', 'mirrors', 'conversations',
    'messages', 'user_patterns', 'user_insights',
    'subscription_events', 'daily_usage',
    'mirror_sessions', 'user_sessions', 'user_streaks',
    'milestones', 'user_milestones', 'duo_invites'
  )
ORDER BY tablename;

-- 9. CHECK RLS POLICIES EXIST
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
