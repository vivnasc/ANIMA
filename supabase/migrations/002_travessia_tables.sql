-- ============================================
-- TRAVESSIA: Structured Sessions, Streaks, Milestones
-- Migration 002
-- ============================================

-- ============================================
-- MIRROR SESSIONS (7 per mirror, with prompts)
-- ============================================
CREATE TABLE IF NOT EXISTS mirror_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mirror_slug TEXT NOT NULL,
  session_number INTEGER NOT NULL CHECK (session_number BETWEEN 1 AND 7),
  title_pt TEXT NOT NULL,
  title_en TEXT NOT NULL,
  title_es TEXT NOT NULL,
  title_fr TEXT NOT NULL,
  subtitle_pt TEXT NOT NULL,
  subtitle_en TEXT NOT NULL,
  subtitle_es TEXT NOT NULL,
  subtitle_fr TEXT NOT NULL,
  session_prompt TEXT NOT NULL,
  estimated_minutes INTEGER DEFAULT 15,
  unlock_after INTEGER DEFAULT NULL,
  UNIQUE(mirror_slug, session_number)
);

-- ============================================
-- USER SESSIONS (per-user progress tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mirror_slug TEXT NOT NULL,
  session_number INTEGER NOT NULL,
  status TEXT DEFAULT 'locked' CHECK (status IN ('locked', 'available', 'in_progress', 'completed')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  conversation_id UUID,
  exit_insight TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, mirror_slug, session_number)
);

ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own sessions" ON user_sessions
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- USER STREAKS
-- ============================================
CREATE TABLE IF NOT EXISTS user_streaks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_session_date DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own streaks" ON user_streaks
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- MILESTONES (definitions)
-- ============================================
CREATE TABLE IF NOT EXISTS milestones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trigger_type TEXT NOT NULL,
  trigger_value TEXT NOT NULL,
  title_pt TEXT NOT NULL,
  title_en TEXT NOT NULL,
  title_es TEXT NOT NULL,
  title_fr TEXT NOT NULL,
  description_pt TEXT NOT NULL,
  description_en TEXT NOT NULL,
  description_es TEXT NOT NULL,
  description_fr TEXT NOT NULL,
  mirror_slug TEXT,
  UNIQUE(trigger_type, trigger_value)
);

-- ============================================
-- USER MILESTONES (unlocked per user)
-- ============================================
CREATE TABLE IF NOT EXISTS user_milestones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  milestone_id UUID NOT NULL REFERENCES milestones(id),
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  seen BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, milestone_id)
);

ALTER TABLE user_milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own milestones" ON user_milestones
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_mirror ON user_sessions(user_id, mirror_slug);
CREATE INDEX IF NOT EXISTS idx_user_streaks_user ON user_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_milestones_user ON user_milestones(user_id);
CREATE INDEX IF NOT EXISTS idx_user_milestones_unseen ON user_milestones(user_id, seen);

-- ============================================
-- SEED: SOMA SESSIONS (7)
-- ============================================
INSERT INTO mirror_sessions (mirror_slug, session_number, title_pt, title_en, title_es, title_fr, subtitle_pt, subtitle_en, subtitle_es, subtitle_fr, session_prompt, estimated_minutes, unlock_after) VALUES

('soma', 1,
 'O corpo que habitas', 'The body you inhabit', 'El cuerpo que habitas', 'Le corps que tu habites',
 'Reconexão com sensações físicas', 'Reconnecting with physical sensations', 'Reconexión con sensaciones físicas', 'Reconnexion avec les sensations physiques',
 'SESSÃO 1: O foco é ajudar a pessoa a SENTIR o corpo agora. Perguntas: como está o corpo neste momento? Onde há tensão? Onde há conforto? Quando foi a última vez que parou para sentir? NÃO dar conselhos — guiar atenção para o corpo.',
 15, NULL),

('soma', 2,
 'Fome de quê?', 'Hungry for what?', 'Hambre de qué?', 'Faim de quoi?',
 'Quando comes, o que alimentas realmente?', 'When you eat, what do you really feed?', 'Cuando comes, qué alimentas realmente?', 'Quand tu manges, que nourris-tu vraiment?',
 'SESSÃO 2: Nutrição emocional vs física. Explorar: o que sentias ANTES de comer? O que tentavas alimentar? Quando foi a última vez que comeste com presença total? Conectar padrões alimentares com estados emocionais.',
 12, 1),

('soma', 3,
 'Onde mora a tensão', 'Where tension lives', 'Donde vive la tensión', 'Où vit la tension',
 'O mapa emocional do teu corpo', 'The emotional map of your body', 'El mapa emocional de tu cuerpo', 'La carte émotionnelle de ton corps',
 'SESSÃO 3: Mapeamento corporal de emoções. Guiar: ONDE no corpo sentes stress? Alegria? Medo? Raiva? Construir mapa pessoal. O corpo guarda tudo — onde guardas o quê?',
 15, 2),

('soma', 4,
 'O peso invisível', 'The invisible weight', 'El peso invisible', 'Le poids invisible',
 'Crenças sobre o corpo que carregas sem saber', 'Body beliefs you carry unknowingly', 'Creencias corporales que cargas sin saber', 'Croyances corporelles portées sans le savoir',
 'SESSÃO 4: Crenças limitantes sobre o corpo. De onde vêm? Quem disse que devias ser diferente? Que voz interna fala ao espelho? Separar voz própria das vozes herdadas.',
 15, 3),

('soma', 5,
 'Rituais de cuidado', 'Rituals of care', 'Rituales de cuidado', 'Rituels de soin',
 'Práticas simples de presença corporal', 'Simple practices of body presence', 'Prácticas simples de presencia corporal', 'Pratiques simples de présence corporelle',
 'SESSÃO 5: Sessão prática. Definir 1-2 rituais simples de conexão corporal. Não exercícios — rituais. Ex: 30s de respiração ao acordar, uma refeição em silêncio. O que é possível e sustentável para esta pessoa?',
 12, 4),

('soma', 6,
 'O espelho interior', 'The inner mirror', 'El espejo interior', 'Le miroir intérieur',
 'Como te vês vs. como és', 'How you see yourself vs. who you are', 'Cómo te ves vs. cómo eres', 'Comment tu te vois vs. qui tu es',
 'SESSÃO 6: Auto-imagem corporal. Diferença entre corpo imaginado e corpo real. Quando te olhas, o que vês primeiro? O que evitas ver? Se o teu corpo falasse, o que diria sobre como o tratas?',
 15, 5),

('soma', 7,
 'Integração somática', 'Somatic integration', 'Integración somática', 'Intégration somatique',
 'Tudo o que o corpo te ensinou', 'Everything the body taught you', 'Todo lo que el cuerpo te enseñó', 'Tout ce que le corps t''a appris',
 'SESSÃO 7 (FINAL): Revisitar as 6 sessões. O que mudou? Que padrões foram identificados? Que rituais funcionaram? Preparar transição para SEREN. O corpo agora tem voz — a mente quer ouvir.',
 20, 6);

-- ============================================
-- SEED: SEREN SESSIONS (7)
-- ============================================
INSERT INTO mirror_sessions (mirror_slug, session_number, title_pt, title_en, title_es, title_fr, subtitle_pt, subtitle_en, subtitle_es, subtitle_fr, session_prompt, estimated_minutes, unlock_after) VALUES

('seren', 1,
 'O ruído que não pára', 'The noise that won''t stop', 'El ruido que no para', 'Le bruit qui ne s''arrête pas',
 'O que a mente faz quando não a observas', 'What the mind does when unobserved', 'Lo que la mente hace sin ser observada', 'Ce que l''esprit fait sans surveillance',
 'SESSÃO 1: Explorar diálogo interno. Quantos pensamentos sem parar? Que temas repetem? A mente protege de quê? Se referir insights de SOMA quando relevante. NÃO julgar pensamentos — observar.',
 15, NULL),

('seren', 2,
 'A ansiedade tem um nome', 'Anxiety has a name', 'La ansiedad tiene nombre', 'L''anxiété a un nom',
 'Dar forma ao que parece sem forma', 'Giving shape to what feels shapeless', 'Dar forma a lo informe', 'Donner forme à l''informe',
 'SESSÃO 2: Personificar a ansiedade. Se fosse uma pessoa, como seria? Que idade tem? O que quer? Quando aparece? Técnica de externalização para criar distância saudável do estado ansioso.',
 12, 1),

('seren', 3,
 'Gatilhos e reações', 'Triggers and reactions', 'Disparadores y reacciones', 'Déclencheurs et réactions',
 'O espaço entre o que acontece e o que fazes', 'The space between what happens and what you do', 'El espacio entre lo que pasa y lo que haces', 'L''espace entre ce qui arrive et ce que tu fais',
 'SESSÃO 3: Mapear ciclos reactivos. Que situações disparam reacções automáticas? O que acontece no corpo (link SOMA) antes da reacção? Existe espaço entre estímulo e resposta? Quanto espaço?',
 15, 2),

('seren', 4,
 'O que evitas sentir', 'What you avoid feeling', 'Lo que evitas sentir', 'Ce que tu évites de ressentir',
 'As emoções que empurras para baixo', 'The emotions you push down', 'Las emociones que empujas hacia abajo', 'Les émotions que tu repousses',
 'SESSÃO 4: Explorar evitamento emocional. Que emoções são "proibidas"? Tristeza? Raiva? Vulnerabilidade? Quem ensinou que não podias sentir isso? O que acontece quando tentas NÃO sentir?',
 15, 3),

('seren', 5,
 'O porto seguro', 'The safe harbour', 'El puerto seguro', 'Le port sûr',
 'Construir regulação emocional própria', 'Building your own emotional regulation', 'Construir regulación emocional propia', 'Construire sa propre régulation émotionnelle',
 'SESSÃO 5: Prática de autorregulação. Não suprimir emoções — navegar. Que estratégias saudáveis já usas sem perceber? Quais podes fortalecer? Criar toolkit emocional pessoal.',
 12, 4),

('seren', 6,
 'Relações como espelhos', 'Relationships as mirrors', 'Relaciones como espejos', 'Relations comme miroirs',
 'O que os outros revelam sobre ti', 'What others reveal about you', 'Lo que otros revelan sobre ti', 'Ce que les autres révèlent de toi',
 'SESSÃO 6: Padrões relacionais. Que tipo de pessoas atrais? Que papel assumes nos conflitos? O que te irrita nos outros revela o quê sobre ti? Relações como espelhos do mundo interno.',
 15, 5),

('seren', 7,
 'Mente em paz', 'Mind at peace', 'Mente en paz', 'Esprit en paix',
 'Síntese emocional e transição', 'Emotional synthesis and transition', 'Síntesis emocional y transición', 'Synthèse émotionnelle et transition',
 'SESSÃO 7 (FINAL): Revisitar jornada SEREN. Gatilhos identificados, emoções nomeadas, estratégias criadas. Link com SOMA. Preparar LUMA: a mente acalmou — agora podes ver mais longe.',
 20, 6);

-- ============================================
-- SEED: LUMA SESSIONS (7)
-- ============================================
INSERT INTO mirror_sessions (mirror_slug, session_number, title_pt, title_en, title_es, title_fr, subtitle_pt, subtitle_en, subtitle_es, subtitle_fr, session_prompt, estimated_minutes, unlock_after) VALUES

('luma', 1,
 'As certezas que nunca questionaste', 'Certainties never questioned', 'Las certezas nunca cuestionadas', 'Les certitudes jamais questionnées',
 'Onde começa aquilo que acreditas ser verdade', 'Where what you believe to be true begins', 'Donde empieza lo que crees verdad', 'Où commence ce que tu crois vrai',
 'SESSÃO 1: Identificar crenças fundamentais sobre si. "Eu sou..." o quê? De onde vem essa certeza? Alguém disse ou tu decidiste? Começar a questionar sem destruir.',
 15, NULL),

('luma', 2,
 'A história que contas', 'The story you tell', 'La historia que cuentas', 'L''histoire que tu racontes',
 'A narrativa pessoal que constróis todos os dias', 'The personal narrative you build every day', 'La narrativa personal que construyes cada día', 'Le récit personnel que tu construis chaque jour',
 'SESSÃO 2: Explorar a narrativa autobiográfica. Que história contas sobre ti? É a mesma que contavas há 10 anos? Quem serias sem essa história? A história protege ou limita?',
 15, 1),

('luma', 3,
 'Medos disfarçados', 'Fears in disguise', 'Miedos disfrazados', 'Peurs déguisées',
 'O que parece razão mas é medo', 'What looks like reason but is fear', 'Lo que parece razón pero es miedo', 'Ce qui semble raison mais est peur',
 'SESSÃO 3: Distinguir decisões racionais de decisões baseadas em medo. "Não faço X porque é prudente" ou porque tenho medo? Que decisões importantes adias por "boas razões" que são na verdade medo?',
 15, 2),

('luma', 4,
 'Expansão e contração', 'Expansion and contraction', 'Expansión y contracción', 'Expansion et contraction',
 'Sentir a diferença entre crescer e encolher', 'Feeling the difference between growing and shrinking', 'Sentir la diferencia entre crecer y encogerse', 'Sentir la différence entre grandir et rétrécir',
 'SESSÃO 4: Usar sensações de expansão/contração como bússola. Que pensamentos expandem? Que pensamentos contraem? Que escolhas te fazem sentir maior? Menor? Referir mapa corporal de SOMA.',
 15, 3),

('luma', 5,
 'O eu que ninguém vê', 'The self nobody sees', 'El yo que nadie ve', 'Le moi que personne ne voit',
 'Partes de ti que escondes do mundo', 'Parts of you hidden from the world', 'Partes de ti que escondes del mundo', 'Parts de toi cachées du monde',
 'SESSÃO 5: Shadow work leve. Que partes de ti escondes? Porquê? Que qualidades admiras nos outros que não te permites ter? O que aconteceria se mostrasses essa parte?',
 15, 4),

('luma', 6,
 'Além da identidade', 'Beyond identity', 'Más allá de la identidad', 'Au-delà de l''identité',
 'Quem és quando largas todos os rótulos', 'Who are you when all labels drop', 'Quién eres cuando sueltas todas las etiquetas', 'Qui es-tu quand toutes les étiquettes tombent',
 'SESSÃO 6: Explorar identidade além de papéis (mãe, profissional, parceiro). Quem és quando tiras tudo? O que resta? Medo ou liberdade? Presença pura como fundação.',
 15, 5),

('luma', 7,
 'A luz que já és', 'The light you already are', 'La luz que ya eres', 'La lumière que tu es déjà',
 'Síntese da expansão de consciência', 'Synthesis of consciousness expansion', 'Síntesis de la expansión de consciencia', 'Synthèse de l''expansion de conscience',
 'SESSÃO 7 (FINAL): Integrar LUMA. Crenças questionadas, medos nomeados, identidade expandida. Link SOMA+SEREN. Preparar ECHO: agora que vês mais — que padrões atravessam TUDO?',
 20, 6);

-- ============================================
-- SEED: ECHO SESSIONS (7)
-- ============================================
INSERT INTO mirror_sessions (mirror_slug, session_number, title_pt, title_en, title_es, title_fr, subtitle_pt, subtitle_en, subtitle_es, subtitle_fr, session_prompt, estimated_minutes, unlock_after) VALUES

('echo', 1,
 'Os ciclos que se repetem', 'Cycles that repeat', 'Los ciclos que se repiten', 'Les cycles qui se répètent',
 'Padrões que atravessam toda a tua vida', 'Patterns that run through your entire life', 'Patrones que atraviesan toda tu vida', 'Schémas qui traversent toute ta vie',
 'SESSÃO 1: ECHO tem acesso a TODOS os insights de SOMA, SEREN e LUMA. Começar por mostrar meta-padrões. Que temas apareceram em TODOS os mirrors? Que ciclo se repete? Começar a integrar.',
 15, NULL),

('echo', 2,
 'A herança invisível', 'The invisible inheritance', 'La herencia invisible', 'L''héritage invisible',
 'O que herdaste sem saber', 'What you inherited unknowingly', 'Lo que heredaste sin saber', 'Ce que tu as hérité sans le savoir',
 'SESSÃO 2: Padrões intergeracionais. Que comportamentos dos teus pais reconheces em ti? Que medos (LUMA) ecoam de gerações anteriores? O que te foi passado sem palavras?',
 15, 1),

('echo', 3,
 'O fio condutor', 'The common thread', 'El hilo conductor', 'Le fil conducteur',
 'A ligação entre corpo, mente e consciência', 'The link between body, mind and consciousness', 'La conexión entre cuerpo, mente y consciencia', 'Le lien entre corps, esprit et conscience',
 'SESSÃO 3: Síntese cross-mirror explícita. O padrão corporal (SOMA) + o padrão emocional (SEREN) + a crença (LUMA) = o ECO. Mostrar como o mesmo tema apareceu em 3 formas diferentes.',
 15, 2),

('echo', 4,
 'Escolhas automáticas', 'Automatic choices', 'Elecciones automáticas', 'Choix automatiques',
 'Decisões que tomas sem decidir', 'Decisions you make without deciding', 'Decisiones que tomas sin decidir', 'Décisions prises sans décider',
 'SESSÃO 4: Loops comportamentais. Que escolhas repetes no piloto automático? Nas relações, no trabalho, no corpo. Agora que vês o padrão — o que fazes com essa informação?',
 15, 3),

('echo', 5,
 'Quebrar o ciclo', 'Breaking the cycle', 'Romper el ciclo', 'Briser le cycle',
 'Escolher diferente com consciência', 'Choosing differently with awareness', 'Elegir diferente con consciencia', 'Choisir différemment avec conscience',
 'SESSÃO 5: Da consciência à acção. Não basta ver — é preciso escolher. Que padrão queres interromper primeiro? Qual é o primeiro passo REAL? Não perfeito — possível.',
 15, 4),

('echo', 6,
 'A nova narrativa', 'The new narrative', 'La nueva narrativa', 'Le nouveau récit',
 'Reescrever a história com o que aprendeste', 'Rewriting the story with what you learned', 'Reescribir la historia con lo aprendido', 'Réécrire l''histoire avec ce que tu as appris',
 'SESSÃO 6: Reconstrução narrativa. Se LUMA questionou a história antiga — ECHO ajuda a escrever a nova. Não uma fantasia. Uma narrativa baseada em verdade, consciência e escolha.',
 15, 5),

('echo', 7,
 'O silêncio que integra', 'The silence that integrates', 'El silencio que integra', 'Le silence qui intègre',
 'Encerramento da jornada completa', 'Closing the complete journey', 'Cierre del viaje completo', 'Clôture du voyage complet',
 'SESSÃO 7 (FINAL DE TUDO): Encerramento da travessia. Revisitar TODA a jornada: SOMA→SEREN→LUMA→ECHO. Que pessoa começou? Que pessoa está aqui agora? Não termina — transforma. A jornada pode ser repetida com novos olhos.',
 20, 6);

-- ============================================
-- SEED: MILESTONES
-- ============================================
INSERT INTO milestones (trigger_type, trigger_value, title_pt, title_en, title_es, title_fr, description_pt, description_en, description_es, description_fr, mirror_slug) VALUES

('session_complete', 'soma_1', 'Primeiro passo', 'First step', 'Primer paso', 'Premier pas',
 'Começaste a ouvir o corpo. Isso muda tudo.', 'You started listening to the body. That changes everything.', 'Empezaste a escuchar el cuerpo. Eso lo cambia todo.', 'Tu as commencé à écouter le corps. Ça change tout.',
 'soma'),

('session_complete', 'soma_3', 'Corpo mapeado', 'Body mapped', 'Cuerpo mapeado', 'Corps cartographié',
 'Agora sabes onde moras. O mapa emocional do teu corpo tem forma.', 'Now you know where you live. Your body emotional map has shape.', 'Ahora sabes dónde vives. El mapa emocional tiene forma.', 'Maintenant tu sais où tu habites. La carte émotionnelle a une forme.',
 'soma'),

('phase_complete', 'soma', 'Corpo desperto', 'Body awakened', 'Cuerpo despierto', 'Corps éveillé',
 'Completaste a fundação. O corpo tem voz — e tu aprendeste a ouvir.', 'Foundation complete. The body has a voice — and you learned to listen.', 'Fundación completa. El cuerpo tiene voz — y aprendiste a escuchar.', 'Fondation complète. Le corps a une voix — et tu as appris à écouter.',
 'soma'),

('phase_complete', 'seren', 'Mente clara', 'Clear mind', 'Mente clara', 'Esprit clair',
 'A ansiedade tem nome. Os gatilhos são visíveis. A mente acalmou.', 'Anxiety has a name. Triggers are visible. The mind calmed.', 'La ansiedad tiene nombre. Los disparadores son visibles.', 'L''anxiété a un nom. Les déclencheurs sont visibles.',
 'seren'),

('phase_complete', 'luma', 'Horizonte aberto', 'Open horizon', 'Horizonte abierto', 'Horizon ouvert',
 'Crenças questionadas. Medos nomeados. Vês mais longe agora.', 'Beliefs questioned. Fears named. You see further now.', 'Creencias cuestionadas. Miedos nombrados. Ves más lejos.', 'Croyances questionnées. Peurs nommées. Tu vois plus loin.',
 'luma'),

('phase_complete', 'echo', 'Travessia completa', 'Journey complete', 'Travesía completa', 'Traversée complète',
 'Fizeste o caminho inteiro. Não o mesmo — um novo. E podes fazê-lo de novo, com novos olhos.', 'You walked the entire path. Not the same — a new one. And you can do it again, with new eyes.', 'Recorriste el camino entero. No el mismo — uno nuevo.', 'Tu as parcouru tout le chemin. Pas le même — un nouveau.',
 'echo'),

('streak', '7', '7 dias de presença', '7 days of presence', '7 días de presencia', '7 jours de présence',
 'Uma semana inteira a aparecer. Isso é compromisso.', 'A whole week showing up. That is commitment.', 'Una semana entera apareciendo. Eso es compromiso.', 'Une semaine entière à être présent. C''est de l''engagement.',
 NULL),

('streak', '30', '30 dias de travessia', '30 days of journey', '30 días de travesía', '30 jours de traversée',
 'Um mês de presença consistente. Não é disciplina — é transformação.', 'A month of consistent presence. Not discipline — transformation.', 'Un mes de presencia consistente. No es disciplina — es transformación.', 'Un mois de présence constante. Pas de la discipline — de la transformation.',
 NULL);
