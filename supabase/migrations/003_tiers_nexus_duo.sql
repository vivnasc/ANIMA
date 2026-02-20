-- ============================================
-- ANIMA - Tiers, NEXUS Mirror & Duo System
-- Migration: 003_tiers_nexus_duo.sql
-- ============================================

-- ============================================
-- 1. UPDATE SUBSCRIPTION TIERS
-- ============================================
-- Old: 'free' | 'premium'
-- New: 'free' | 'essencial' | 'relacional' | 'duo' | 'profundo'
-- Migrate existing premium users to essencial
UPDATE users SET subscription_tier = 'essencial' WHERE subscription_tier = 'premium';

-- ============================================
-- 2. DUO PARTNER COLUMNS
-- ============================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS duo_partner_id UUID REFERENCES users(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS duo_invite_code TEXT UNIQUE;

-- ============================================
-- 3. INSERT NEXUS MIRROR
-- ============================================
INSERT INTO mirrors (slug, name, description_pt, description_en, description_fr, description_es, system_prompt, color_theme, icon, journey_phase, is_active, is_premium, display_order)
VALUES (
  'nexus',
  'NEXUS',
  'Explora os teus padrões relacionais — vinculação, comunicação, conflito e intimidade.',
  'Explore your relational patterns — attachment, communication, conflict and intimacy.',
  'Explore tes schémas relationnels — attachement, communication, conflit et intimité.',
  'Explora tus patrones relacionales — apego, comunicación, conflicto e intimidad.',
  'NEXUS relational mirror',
  '#ec4899',
  '🔗',
  'relational',
  true,
  true,
  5
) ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- 4. NEXUS SESSION DEFINITIONS (7 sessions)
-- ============================================
INSERT INTO mirror_sessions (mirror_slug, session_number, title_pt, title_en, title_es, title_fr, subtitle_pt, subtitle_en, subtitle_es, subtitle_fr, session_prompt, estimated_minutes, unlock_after) VALUES

-- Session 1: Attachment / Vinculação
('nexus', 1,
 'Vinculação', 'Attachment', 'Apego', 'Attachement',
 'Como te ligas aos outros?', 'How do you bond with others?', '¿Cómo te vinculas a los demás?', 'Comment te lies-tu aux autres?',
 'Esta é a primeira sessão NEXUS. O foco é VINCULAÇÃO (attachment). Explora o estilo de vinculação da pessoa: ansioso, evitante, desorganizado ou seguro. Perguntas-chave: "Como te sentes quando alguém se aproxima muito?", "O que fazes quando sentes que podes ser abandonado/a?", "Pedir ajuda é fácil para ti?". Não rotules — ajuda a pessoa a descobrir por si.',
 20, NULL),

-- Session 2: Projecção
('nexus', 2,
 'Projecção', 'Projection', 'Proyección', 'Projection',
 'O que é teu e o que é do outro?', 'What is yours and what is theirs?', '¿Qué es tuyo y qué es del otro?', 'Qu''est-ce qui est à toi et qu''est-ce qui est à l''autre?',
 'Foco: PROJECÇÃO. Ajuda a pessoa a separar o que é dela do que projecta no outro. "O que te irrita mais no outro — será que é algo teu?", "Estás a reagir à pessoa real ou à história que contas sobre ela?". Conecta com padrões de LUMA (crenças) e SEREN (emoções reactivas).',
 20, 1),

-- Session 3: Comunicação
('nexus', 3,
 'Comunicação', 'Communication', 'Comunicación', 'Communication',
 'O que precisas que nunca dizes?', 'What do you need that you never say?', '¿Qué necesitas que nunca dices?', 'Ce dont tu as besoin et que tu ne dis jamais?',
 'Foco: COMUNICAÇÃO de necessidades. "O que precisas que nunca dizes?", "Quando te magoas, como é que o outro fica a saber?", "Dizes está tudo bem quando não está?". Explora comunicação não-violenta vs. padrões passivo-agressivos ou de silêncio.',
 20, 2),

-- Session 4: Conflito
('nexus', 4,
 'Conflito', 'Conflict', 'Conflicto', 'Conflit',
 'Lutas, foges ou congelas?', 'Do you fight, flee or freeze?', '¿Luchas, huyes o te congelas?', 'Tu te bats, tu fuis ou tu te figes?',
 'Foco: CONFLITO. Explora a resposta automática ao conflito: fight, flight, freeze, fawn. "O que acontece no teu corpo quando começa uma discussão?", "Qual é o teu reflexo? Atacas, foges, congelas ou agradas?". Conecta com SOMA (reacções corporais ao conflito).',
 20, 3),

-- Session 5: Intimidade
('nexus', 5,
 'Intimidade', 'Intimacy', 'Intimidad', 'Intimité',
 'Mostras-te ou proteges-te?', 'Do you show yourself or protect yourself?', '¿Te muestras o te proteges?', 'Tu te montres ou tu te protèges?',
 'Foco: INTIMIDADE e vulnerabilidade. "O que é intimidade para ti?", "Quando foi a última vez que mostraste uma parte tua que normalmente escondes?", "O que aconteceria se fosses completamente honesto/a?". Explora a relação entre segurança interna e capacidade de intimidade.',
 20, 4),

-- Session 6: Repetição
('nexus', 6,
 'Repetição', 'Repetition', 'Repetición', 'Répétition',
 'Os mesmos padrões, vínculos diferentes', 'Same patterns, different bonds', 'Los mismos patrones, vínculos diferentes', 'Les mêmes schémas, des liens différents',
 'Foco: REPETIÇÕES RELACIONAIS. "Que tipo de pessoa atrais repetidamente?", "Que papel assumes sempre nas relações?", "Olhando para as tuas 3 relações mais significativas, qual é o padrão comum?". Integra com ECHO (padrões repetitivos) aplicados a relações.',
 20, 5),

-- Session 7: Integração Relacional
('nexus', 7,
 'Integração Relacional', 'Relational Integration', 'Integración Relacional', 'Intégration Relationnelle',
 'O que aprendeste sobre ti nos teus vínculos?', 'What have you learned about yourself through your bonds?', '¿Qué aprendiste de ti en tus vínculos?', 'Qu''as-tu appris de toi à travers tes liens?',
 'Foco: INTEGRAÇÃO RELACIONAL. Sessão final do NEXUS. Sintetiza tudo: vinculação, projecção, comunicação, conflito, intimidade, repetições. "O que aprendeste sobre ti através dos teus vínculos?", "Que tipo de relação queres construir agora?", "O que precisas dar a ti mesmo/a antes de dar a alguém?". Celebra as descobertas.',
 25, 6)

ON CONFLICT (mirror_slug, session_number) DO NOTHING;

-- ============================================
-- 5. DUO INVITES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS duo_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inviter_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  invite_code TEXT UNIQUE NOT NULL,
  invitee_email TEXT,
  accepted_by UUID REFERENCES users(id),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days')
);

-- RLS for duo_invites
ALTER TABLE duo_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own invites" ON duo_invites
  FOR SELECT USING (auth.uid() = inviter_id OR auth.uid() = accepted_by);

CREATE POLICY "Users can create invites" ON duo_invites
  FOR INSERT WITH CHECK (auth.uid() = inviter_id);

CREATE POLICY "Users can update invites they accepted" ON duo_invites
  FOR UPDATE USING (auth.uid() = accepted_by OR auth.uid() = inviter_id);

-- ============================================
-- 6. NEXUS MILESTONES
-- ============================================
INSERT INTO milestones (trigger_type, trigger_value, title_pt, title_en, title_es, title_fr, description_pt, description_en, description_es, description_fr, mirror_slug) VALUES
('session_complete', 'nexus_1', 'Primeiro Vínculo', 'First Bond', 'Primer Vínculo', 'Premier Lien',
 'Começaste a explorar os teus padrões relacionais', 'You started exploring your relational patterns', 'Empezaste a explorar tus patrones relacionales', 'Tu as commencé à explorer tes schémas relationnels', 'nexus'),
('phase_complete', 'nexus', 'Mestre Relacional', 'Relational Master', 'Maestro Relacional', 'Maître Relationnel',
 'Completaste todas as sessões NEXUS — agora vês como funcionas nos vínculos', 'You completed all NEXUS sessions — now you see how you function in bonds', 'Completaste todas las sesiones NEXUS — ahora ves cómo funcionas en los vínculos', 'Tu as complété toutes les sessions NEXUS — maintenant tu vois comment tu fonctionnes dans les liens', 'nexus')
ON CONFLICT DO NOTHING;
