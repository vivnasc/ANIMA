-- ============================================
-- ANIMA - RLS Fixes & Consistency
-- Migration: 004_rls_fixes_and_consistency.sql
-- Description: Fix missing RLS policies and FK consistency
-- ============================================

-- ============================================
-- 1. FIX: Missing INSERT policy on users table
-- Without this, the auth callback cannot create user rows
-- ============================================
CREATE POLICY "Users insert own row" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- 2. FIX: Missing INSERT policy on user_journey
-- The trigger handles it with SECURITY DEFINER,
-- but the auth callback also inserts manually as fallback
-- ============================================
-- (Already has: "Auto-insert journey on signup" from 001)
-- No change needed — trigger uses SECURITY DEFINER

-- ============================================
-- 3. FIX: user_streaks needs INSERT policy
-- The streaks module needs to create streak records
-- ============================================
-- Policy from 002 uses FOR ALL which covers INSERT
-- No change needed

-- ============================================
-- 4. FIX: mirror_sessions needs to be readable by authenticated users
-- Sessions definitions are read by the app to display session info
-- ============================================
ALTER TABLE mirror_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users view mirror sessions" ON mirror_sessions
  FOR SELECT USING (auth.role() = 'authenticated');

-- ============================================
-- 5. FIX: milestones table needs to be readable
-- Milestones definitions are public reference data
-- ============================================
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users view milestones" ON milestones
  FOR SELECT USING (auth.role() = 'authenticated');

-- ============================================
-- 6. FIX: mirrors table SELECT policy is too restrictive
-- Current: requires is_active = true AND authenticated
-- Landing page may need to read mirrors without auth
-- Keep as-is but also allow anon read for public listing
-- ============================================
-- No change — mirrors are only read after login

-- ============================================
-- 7. ADD: Index on users.duo_invite_code for invite lookups
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_duo_invite_code ON users(duo_invite_code);
CREATE INDEX IF NOT EXISTS idx_duo_invites_code ON duo_invites(invite_code);

-- ============================================
-- 8. ADD: user_sessions index for status lookups
-- ============================================
CREATE INDEX IF NOT EXISTS idx_user_sessions_status ON user_sessions(user_id, status);

-- ============================================
-- 9. VERIFY: Ensure NEXUS sessions exist (idempotent)
-- ============================================
INSERT INTO mirror_sessions (mirror_slug, session_number, title_pt, title_en, title_es, title_fr, subtitle_pt, subtitle_en, subtitle_es, subtitle_fr, session_prompt, estimated_minutes, unlock_after)
SELECT 'nexus', 1, 'Vinculação', 'Attachment', 'Apego', 'Attachement',
  'Como te ligas aos outros?', 'How do you bond with others?', '¿Cómo te vinculas a los demás?', 'Comment te lies-tu aux autres?',
  'Sessão sobre vinculação', 20, NULL
WHERE NOT EXISTS (SELECT 1 FROM mirror_sessions WHERE mirror_slug = 'nexus' AND session_number = 1);
