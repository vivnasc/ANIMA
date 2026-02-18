# 🚀 ANIMA - FEATURES AVANÇADAS

**Documento:** Add-ons ao MVP Core  
**Data:** 18 Fevereiro 2026  
**Status:** Ready to implement progressivamente

---

## 📋 ÍNDICE

1. [Anonymous Insights Wall](#1-anonymous-insights-wall)
2. [Círculos de Espelhos (Comunidade)](#2-círculos-de-espelhos)
3. [Ghost Users Strategy](#3-ghost-users-strategy)
4. [Jornadas Guiadas](#4-jornadas-guiadas)
5. [Gamificação Robusta](#5-gamificação-robusta)
6. [Email Automation](#6-email-automation)
7. [Referral Program](#7-referral-program)

---

## 1. ANONYMOUS INSIGHTS WALL

### Conceito

Feed público onde users partilham insights marcantes das suas conversas com os Mirrors - **100% anónimo**, sem comentários, só "ressonâncias".

### Objetivos

- ✅ Elemento social LEVE (não invasivo)
- ✅ Inspiração para outros users
- ✅ Prova social ("outros estão tendo breakthroughs")
- ✅ Retenção (users voltam para ver insights)
- ✅ Premium incentive (só premium pode partilhar)

---

### Database Schema

```sql
-- ============================================
-- SHARED INSIGHTS TABLE
-- ============================================
CREATE TABLE shared_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Content
  insight_text TEXT NOT NULL, -- Max 280 chars (tweet-length)
  
  -- Source
  mirror_slug TEXT NOT NULL, -- 'soma', 'seren', 'luma', 'echo'
  journey_phase TEXT, -- fase quando partilhado
  original_insight_id UUID REFERENCES user_insights(id), -- link to private insight
  
  -- Engagement
  resonance_count INT DEFAULT 0, -- quantos "ressoaram"
  
  -- Moderation
  is_approved BOOLEAN DEFAULT true, -- auto-approved, admin pode remover
  is_flagged BOOLEAN DEFAULT false,
  flagged_count INT DEFAULT 0,
  
  -- Metadata
  is_ghost BOOLEAN DEFAULT false, -- TRUE para ghosts (content seeding)
  ghost_persona TEXT, -- 'sofia', 'marco', etc (se ghost)
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INSIGHT RESONANCES (who resonated)
-- ============================================
CREATE TABLE insight_resonances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shared_insight_id UUID REFERENCES shared_insights(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(shared_insight_id, user_id) -- can't resonate twice
);

-- Indexes
CREATE INDEX idx_shared_insights_mirror ON shared_insights(mirror_slug);
CREATE INDEX idx_shared_insights_created ON shared_insights(created_at DESC);
CREATE INDEX idx_shared_insights_resonance ON shared_insights(resonance_count DESC);
CREATE INDEX idx_insight_resonances_user ON insight_resonances(user_id);

-- RLS Policies
ALTER TABLE shared_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE insight_resonances ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view approved insights
CREATE POLICY "View approved insights" ON shared_insights
  FOR SELECT USING (is_approved = true AND auth.role() = 'authenticated');

-- Premium users can share insights
CREATE POLICY "Premium users share insights" ON shared_insights
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND subscription_tier = 'premium'
    )
  );

-- Users can delete their own
CREATE POLICY "Delete own insights" ON shared_insights
  FOR DELETE USING (auth.uid() = user_id);

-- Users can resonate
CREATE POLICY "Users can resonate" ON insight_resonances
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can un-resonate
CREATE POLICY "Users can un-resonate" ON insight_resonances
  FOR DELETE USING (auth.uid() = user_id);
```

---

### UI Components

#### Feed Principal

```typescript
// app/(app)/insights/page.tsx

export default async function InsightsWallPage() {
  const insights = await getSharedInsights({ limit: 20 })
  
  return (
    <div className="container max-w-2xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Insights Wall</h1>
        <p className="text-muted-foreground">
          Anonymous breakthroughs from the ANIMA community
        </p>
      </div>
      
      {/* Filter by Mirror */}
      <MirrorFilter />
      
      {/* Insights Feed */}
      <div className="space-y-4">
        {insights.map(insight => (
          <InsightCard key={insight.id} insight={insight} />
        ))}
      </div>
      
      {/* Load More */}
      <LoadMoreButton />
    </div>
  )
}
```

#### Insight Card

```typescript
// components/insights/insight-card.tsx

interface InsightCardProps {
  insight: SharedInsight
}

export function InsightCard({ insight }: InsightCardProps) {
  const [hasResonated, setHasResonated] = useState(false)
  const [resonanceCount, setResonanceCount] = useState(insight.resonance_count)
  
  async function handleResonate() {
    if (hasResonated) {
      // Un-resonate
      await fetch(`/api/insights/${insight.id}/resonate`, { method: 'DELETE' })
      setResonanceCount(prev => prev - 1)
      setHasResonated(false)
    } else {
      // Resonate
      await fetch(`/api/insights/${insight.id}/resonate`, { method: 'POST' })
      setResonanceCount(prev => prev + 1)
      setHasResonated(true)
    }
  }
  
  return (
    <Card className="relative overflow-hidden">
      {/* Mirror Color Accent */}
      <div 
        className="absolute top-0 left-0 w-1 h-full"
        style={{ backgroundColor: MIRROR_COLORS[insight.mirror_slug] }}
      />
      
      <CardContent className="pt-6 pl-6">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="outline" className="text-xs">
            {MIRROR_ICONS[insight.mirror_slug]} {insight.mirror_slug.toUpperCase()}
          </Badge>
          
          {insight.is_ghost && (
            <Badge variant="secondary" className="text-xs">
              Curated Example
            </Badge>
          )}
          
          <span className="text-xs text-muted-foreground ml-auto">
            {formatDistanceToNow(new Date(insight.created_at))} ago
          </span>
        </div>
        
        {/* Insight Text */}
        <blockquote className="text-base leading-relaxed mb-4 italic">
          "{insight.insight_text}"
        </blockquote>
        
        {/* Resonance Button */}
        <div className="flex items-center justify-between">
          <Button
            variant={hasResonated ? "default" : "ghost"}
            size="sm"
            onClick={handleResonate}
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            {hasResonated ? 'Resonated' : 'Resonate'}
          </Button>
          
          {resonanceCount > 0 && (
            <span className="text-sm text-muted-foreground">
              ✨ {resonanceCount} {resonanceCount === 1 ? 'person' : 'people'} resonated
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
```

#### Share Insight (from conversation)

```typescript
// components/chat/share-insight-button.tsx

export function ShareInsightButton({ 
  insightId, 
  insightText 
}: { 
  insightId: string
  insightText: string 
}) {
  const [isSharing, setIsSharing] = useState(false)
  const { user } = useUser()
  
  if (user?.subscription_tier !== 'premium') {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="sm" disabled>
            <Share2 className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          Upgrade to Premium to share insights
        </TooltipContent>
      </Tooltip>
    )
  }
  
  async function handleShare() {
    setIsSharing(true)
    
    try {
      await fetch('/api/insights/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ insightId })
      })
      
      toast.success('Insight shared anonymously!')
    } catch (error) {
      toast.error('Failed to share insight')
    } finally {
      setIsSharing(false)
    }
  }
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleShare}
          disabled={isSharing}
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        Share anonymously to Insights Wall
      </TooltipContent>
    </Tooltip>
  )
}
```

---

### API Routes

```typescript
// app/api/insights/share/route.ts

export async function POST(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Check premium
  const { data: userData } = await supabase
    .from('users')
    .select('subscription_tier')
    .eq('id', user.id)
    .single()
  
  if (userData?.subscription_tier !== 'premium') {
    return NextResponse.json({ error: 'Premium only' }, { status: 403 })
  }
  
  const { insightId } = await req.json()
  
  // Get original insight
  const { data: insight } = await supabase
    .from('user_insights')
    .select('*')
    .eq('id', insightId)
    .eq('user_id', user.id)
    .single()
  
  if (!insight) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  
  // Share it (create shared_insight)
  const { data: sharedInsight, error } = await supabase
    .from('shared_insights')
    .insert({
      user_id: user.id,
      insight_text: insight.insight_text.slice(0, 280), // max 280 chars
      mirror_slug: insight.mirror_slug,
      journey_phase: insight.journey_phase,
      original_insight_id: insight.id
    })
    .select()
    .single()
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json({ success: true, sharedInsight })
}
```

```typescript
// app/api/insights/[id]/resonate/route.ts

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const insightId = params.id
  
  // Create resonance
  const { error } = await supabase
    .from('insight_resonances')
    .insert({
      shared_insight_id: insightId,
      user_id: user.id
    })
  
  if (error && error.code === '23505') {
    // Already resonated
    return NextResponse.json({ error: 'Already resonated' }, { status: 400 })
  }
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  // Increment count
  await supabase.rpc('increment_resonance', { insight_id: insightId })
  
  return NextResponse.json({ success: true })
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Delete resonance
  await supabase
    .from('insight_resonances')
    .delete()
    .match({ 
      shared_insight_id: params.id,
      user_id: user.id 
    })
  
  // Decrement count
  await supabase.rpc('decrement_resonance', { insight_id: params.id })
  
  return NextResponse.json({ success: true })
}
```

---

## 2. CÍRCULOS DE ESPELHOS

### Conceito

Espaços temáticos por **fase da jornada** onde users podem trocar experiências de forma estruturada e moderada.

### Estrutura

```
🌱 Círculo SOMA (Foundation)
- Users na fase Foundation
- Focus: corpo, nutrição emocional, embodiment

🌊 Círculo SEREN (Regulation)
- Users trabalhando regulação
- Focus: ansiedade, padrões mentais

✨ Círculo LUMA (Expansion)
- Exploradores de consciência
- Focus: crenças, expansão

🔊 Círculo ECHO (Integration)
- Users integrando
- Focus: padrões, síntese
```

---

### Database Schema

```sql
-- ============================================
-- CIRCLES TABLE
-- ============================================
CREATE TABLE circles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL, -- 'soma-circle', 'seren-circle', etc
  name TEXT NOT NULL,
  description TEXT,
  mirror_slug TEXT NOT NULL, -- which mirror/phase
  
  -- Settings
  is_active BOOLEAN DEFAULT true,
  is_premium_only BOOLEAN DEFAULT true,
  
  -- Moderation
  moderator_ids UUID[], -- array of user IDs who can moderate
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CIRCLE THREADS (weekly prompts)
-- ============================================
CREATE TABLE circle_threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  circle_id UUID REFERENCES circles(id) ON DELETE CASCADE,
  
  -- Content
  title TEXT NOT NULL,
  prompt TEXT NOT NULL, -- guiding question/theme
  
  -- Timing
  week_number INT, -- week 1, 2, 3... of month
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  
  -- Engagement
  response_count INT DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_pinned BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CIRCLE RESPONSES
-- ============================================
CREATE TABLE circle_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID REFERENCES circle_threads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Content
  content TEXT NOT NULL, -- max 500 chars
  
  -- Engagement
  resonance_count INT DEFAULT 0,
  
  -- Moderation
  is_approved BOOLEAN DEFAULT true,
  is_flagged BOOLEAN DEFAULT false,
  
  -- Ghost
  is_ghost BOOLEAN DEFAULT false,
  ghost_persona TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CIRCLE MEMBERS (tracking)
-- ============================================
CREATE TABLE circle_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  circle_id UUID REFERENCES circles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Engagement
  total_responses INT DEFAULT 0,
  last_active_at TIMESTAMPTZ,
  
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(circle_id, user_id)
);

-- Indexes
CREATE INDEX idx_circle_threads_circle ON circle_threads(circle_id);
CREATE INDEX idx_circle_threads_active ON circle_threads(is_active, starts_at DESC);
CREATE INDEX idx_circle_responses_thread ON circle_responses(thread_id);
CREATE INDEX idx_circle_responses_user ON circle_responses(user_id);

-- RLS Policies
ALTER TABLE circles ENABLE ROW LEVEL SECURITY;
ALTER TABLE circle_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE circle_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE circle_members ENABLE ROW LEVEL SECURITY;

-- Premium users can view circles
CREATE POLICY "Premium users view circles" ON circles
  FOR SELECT USING (
    is_active = true AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND subscription_tier = 'premium'
    )
  );

-- Anyone can view active threads
CREATE POLICY "View active threads" ON circle_threads
  FOR SELECT USING (is_active = true);

-- Premium users can post responses
CREATE POLICY "Premium users respond" ON circle_responses
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND subscription_tier = 'premium'
    )
  );

-- Users can update/delete own responses
CREATE POLICY "Manage own responses" ON circle_responses
  FOR ALL USING (auth.uid() = user_id);
```

---

### Seed Initial Circles

```sql
INSERT INTO circles (slug, name, description, mirror_slug, is_premium_only) VALUES
(
  'soma-circle',
  'Círculo SOMA',
  'Espaço para explorar relação com corpo e nutrição emocional',
  'soma',
  true
),
(
  'seren-circle',
  'Círculo SEREN',
  'Partilha sobre ansiedade, padrões mentais e regulação emocional',
  'seren',
  true
),
(
  'luma-circle',
  'Círculo LUMA',
  'Discussões sobre consciência, crenças e expansão',
  'luma',
  true
),
(
  'echo-circle',
  'Círculo ECHO',
  'Integração de aprendizados e identificação de padrões',
  'echo',
  true
);
```

---

### UI Components

#### Circles Hub

```typescript
// app/(app)/circles/page.tsx

export default async function CirclesPage() {
  const circles = await getCircles()
  const { user } = await getUser()
  
  if (user.subscription_tier !== 'premium') {
    return <UpgradeToPremiumCTA feature="Círculos" />
  }
  
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Círculos de Espelhos</h1>
        <p className="text-muted-foreground">
          Espaços temáticos para partilhar jornadas
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        {circles.map(circle => (
          <CircleCard key={circle.id} circle={circle} />
        ))}
      </div>
    </div>
  )
}
```

#### Circle Card

```typescript
export function CircleCard({ circle }: { circle: Circle }) {
  const activeThread = circle.active_thread
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
            style={{ backgroundColor: `${MIRROR_COLORS[circle.mirror_slug]}20` }}
          >
            {MIRROR_ICONS[circle.mirror_slug]}
          </div>
          <div>
            <CardTitle>{circle.name}</CardTitle>
            <CardDescription className="text-xs">
              {circle.response_count} participantes ativos
            </CardDescription>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {circle.description}
        </p>
      </CardHeader>
      
      {activeThread && (
        <CardContent>
          <div className="p-4 rounded-lg bg-muted/30">
            <p className="font-medium text-sm mb-2">Esta semana:</p>
            <p className="text-sm italic">"{activeThread.prompt}"</p>
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-muted-foreground">
                {activeThread.response_count} respostas
              </span>
              <Button size="sm" asChild>
                <Link href={`/circles/${circle.slug}`}>
                  Participar
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
```

#### Circle Detail (Thread + Responses)

```typescript
// app/(app)/circles/[slug]/page.tsx

export default async function CircleDetailPage({ 
  params 
}: { 
  params: { slug: string } 
}) {
  const circle = await getCircle(params.slug)
  const activeThread = await getActiveThread(circle.id)
  const responses = await getThreadResponses(activeThread.id)
  
  return (
    <div className="container max-w-3xl py-8">
      {/* Circle Header */}
      <div className="mb-8">
        <Link href="/circles" className="text-sm text-muted-foreground mb-2 inline-block">
          ← Voltar aos Círculos
        </Link>
        <h1 className="text-3xl font-bold">{circle.name}</h1>
        <p className="text-muted-foreground mt-2">{circle.description}</p>
      </div>
      
      {/* Active Thread Prompt */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-xl">{activeThread.title}</CardTitle>
          <CardDescription>
            Semana de {format(activeThread.starts_at, 'MMM d')} - {format(activeThread.ends_at, 'MMM d, yyyy')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <blockquote className="border-l-4 border-primary pl-4 italic text-lg">
            {activeThread.prompt}
          </blockquote>
        </CardContent>
      </Card>
      
      {/* Response Form */}
      <ResponseForm threadId={activeThread.id} />
      
      {/* Responses */}
      <div className="space-y-4 mt-8">
        <h2 className="text-xl font-semibold">
          {responses.length} Respostas
        </h2>
        
        {responses.map(response => (
          <ResponseCard key={response.id} response={response} />
        ))}
      </div>
    </div>
  )
}
```

---

### Weekly Thread Prompts (Examples)

#### SOMA Circle Prompts

```typescript
const SOMA_PROMPTS = [
  {
    week: 1,
    title: "Reconectar com o Corpo",
    prompt: "Quando foi a última vez que comeste com total presença? Sem telemóvel, sem distração - só tu e a comida. O que notaste?"
  },
  {
    week: 2,
    title: "Emoções no Corpo",
    prompt: "Onde no teu corpo sentes ansiedade? E alegria? E tristeza? Partilha o teu mapa corporal emocional."
  },
  {
    week: 3,
    title: "Padrões Alimentares",
    prompt: "Identificaste algum padrão entre emoções e comida? (ex: como doces quando triste, salto refeições quando ansiosa)"
  },
  {
    week: 4,
    title: "Honrar o Corpo",
    prompt: "Que mudança pequena fizeste esta semana para honrar as necessidades do teu corpo?"
  }
]
```

#### SEREN Circle Prompts

```typescript
const SEREN_PROMPTS = [
  {
    week: 1,
    title: "Ansiedade Como Mensageira",
    prompt: "Se a tua ansiedade pudesse falar, o que diria que está a tentar proteger?"
  },
  {
    week: 2,
    title: "Pensamentos vs Verdade",
    prompt: "Identifica um pensamento recorrente. É verdade objetiva ou história que contas?"
  },
  {
    week: 3,
    title: "Regulação Que Funciona",
    prompt: "Partilha uma técnica/prática que te ajuda a regular quando sobrecarregada."
  },
  {
    week: 4,
    title: "Auto-sabotagem",
    prompt: "Reconheces algum padrão de auto-sabotagem? Como se manifesta?"
  }
]
```

---

## 3. GHOST USERS STRATEGY

### Filosofia

Ghosts **NÃO são users falsos para inflacionar números**.  
São **exemplos curados** para:
- Demonstrar possibilidades
- Inspirar exploração
- Criar referências de qualidade
- Preencher vazio inicial (cold start problem)

**100% transparentes** - sempre marcados como "Curated Example" ou similar.

---

### Ghost Personas (3-5 arquétipos)

```typescript
const GHOST_PERSONAS = {
  sofia: {
    name: 'Sofia',
    phase: 'foundation',
    primaryMirror: 'soma',
    archetype: 'Reconnecting with Body',
    
    profile: {
      age: 34,
      context: 'Professional woman rediscovering body after burnout',
      patterns: ['emotional_eating', 'body_disconnection'],
      journey_arc: 'Foundation phase, 8 conversations with SOMA'
    },
    
    sampleInsights: [
      "Percebi que como sempre em pé, a correr. Nunca me sento para uma refeição real.",
      "O meu corpo estava a gritar 'PARA!' e eu fingia não ouvir.",
      "Hoje comi uma maçã com total presença. Chorei. Foi a primeira vez em anos."
    ],
    
    sampleCircleResponses: [
      {
        thread: 'Reconectar com o Corpo',
        response: "Tentei comer o pequeno-almoço sem telemóvel. Foi estranho no início - percebi que uso distração para não sentir. Mas depois de alguns minutos, consegui realmente saborear. Pequena vitória."
      }
    ]
  },
  
  marco: {
    name: 'Marco',
    phase: 'regulation',
    primaryMirror: 'seren',
    archetype: 'Anxiety Warrior',
    
    profile: {
      age: 41,
      context: 'Entrepreneur learning to regulate anxiety',
      patterns: ['catastrophic_thinking', 'avoidance'],
      journey_arc: 'Regulation phase, 12 conversations with SEREN'
    },
    
    sampleInsights: [
      "A ansiedade não quer destruir-me. Quer proteger-me. Mudou tudo.",
      "Sempre achei que 'pensar positivo' resolveria. SEREN ensinou-me a SENTIR, não reprimir.",
      "Pergunta que me libertou: 'E se esse pensamento não for verdade?'"
    ],
    
    sampleCircleResponses: [
      {
        thread: 'Ansiedade Como Mensageira',
        response: "A minha ansiedade diz: 'Vais falhar e todos vão ver.' Percebi que vem do meu pai nunca ter celebrado sucessos, só apontado erros. É proteção antiga que já não preciso."
      }
    ]
  },
  
  ana: {
    name: 'Ana',
    phase: 'expansion',
    primaryMirror: 'luma',
    archetype: 'Consciousness Explorer',
    
    profile: {
      age: 38,
      context: 'Spiritual seeker questioning identity',
      patterns: ['identity_attachment', 'perfectionism'],
      journey_arc: 'Expansion phase, 15 conversations with LUMA'
    },
    
    sampleInsights: [
      "Sempre fui 'a perfeccionista'. Hoje perguntei: e se não for quem eu sou, mas o que faço quando tenho medo?",
      "LUMA: 'Quem observa os pensamentos?' Mente = explodida 🤯",
      "Viver sem história sobre mim é aterrorizador. E libertador."
    ]
  },
  
  rui: {
    name: 'Rui',
    phase: 'integration',
    primaryMirror: 'echo',
    archetype: 'Pattern Integrator',
    
    profile: {
      age: 45,
      context: 'Therapist working on own patterns',
      patterns: ['people_pleasing', 'emotional_caretaking'],
      journey_arc: 'Integration phase, completing journey'
    },
    
    sampleInsights: [
      "ECHO mostrou: o padrão não começou nos relacionamentos. Começou aos 7 anos quando pai saiu.",
      "40 anos a cuidar de outros = evitar cuidar de mim. Loop quebrado.",
      "A jornada completa: SOMA fundamentou, SEREN regulou, LUMA expandiu, ECHO integrou. Funciona."
    ]
  },
  
  ines: {
    name: 'Inês',
    phase: 'foundation',
    primaryMirror: 'soma',
    archetype: 'Body Acceptance Journey',
    
    profile: {
      age: 29,
      context: 'Artist healing relationship with body image',
      patterns: ['body_rejection', 'comparison'],
      journey_arc: 'Early foundation, 5 conversations with SOMA'
    },
    
    sampleInsights: [
      "Espelho mostrou corpo que odeio. SOMA perguntou: 'Que parte é tua, que parte é da mãe?' Percebi que não é meu ódio.",
      "Corpo não é projeto. É casa. Mudança radical de paradigma.",
      "Primeira vez em anos que olhei espelho sem criticar. Só observei. Chorei de alívio."
    ]
  }
}
```

---

### Implementation

```typescript
// lib/ghosts/seed-ghosts.ts

export async function seedGhostContent() {
  const supabase = createClient({ isAdmin: true })
  
  for (const [id, persona] of Object.entries(GHOST_PERSONAS)) {
    // Create ghost user (flagged as ghost)
    const { data: ghostUser } = await supabase
      .from('users')
      .insert({
        email: `ghost-${id}@anima.internal`,
        is_ghost: true,
        ghost_persona: id,
        subscription_tier: 'premium'
      })
      .select()
      .single()
    
    // Seed insights to Insights Wall
    for (const insight of persona.sampleInsights) {
      await supabase
        .from('shared_insights')
        .insert({
          user_id: ghostUser.id,
          insight_text: insight,
          mirror_slug: persona.primaryMirror,
          journey_phase: persona.phase,
          is_ghost: true,
          ghost_persona: id,
          resonance_count: Math.floor(Math.random() * 50) + 10 // random 10-60
        })
    }
    
    // Seed circle responses
    if (persona.sampleCircleResponses) {
      for (const response of persona.sampleCircleResponses) {
        // Find thread by title
        const { data: thread } = await supabase
          .from('circle_threads')
          .select('id')
          .eq('title', response.thread)
          .single()
        
        if (thread) {
          await supabase
            .from('circle_responses')
            .insert({
              thread_id: thread.id,
              user_id: ghostUser.id,
              content: response.response,
              is_ghost: true,
              ghost_persona: id,
              resonance_count: Math.floor(Math.random() * 20) + 5
            })
        }
      }
    }
  }
}

// Run once on initial deploy
// Then manually add more ghost content as needed
```

---

### UI Transparency

```typescript
// Always show badge on ghost content

{insight.is_ghost && (
  <Badge variant="secondary" className="text-xs">
    <Sparkles className="h-3 w-3 mr-1" />
    Curated Example
  </Badge>
)}

// On hover, tooltip explains
<Tooltip>
  <TooltipContent>
    This is a curated example to inspire your journey. 
    All ghost content is clearly marked.
  </TooltipContent>
</Tooltip>
```

---

## 4. JORNADAS GUIADAS

### Conceito

Sequências estruturadas de 7, 14 ou 30 dias com **prompts diários** focados num tema.

**NÃO são rígidos** - user pode seguir ou ignorar.  
São **sugestões gentis** para quem quer estrutura.

---

### Database Schema

```sql
-- ============================================
-- GUIDED JOURNEYS (templates)
-- ============================================
CREATE TABLE guided_journeys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Duration
  duration_days INT NOT NULL, -- 7, 14, 30
  
  -- Targeting
  mirror_slug TEXT, -- primary mirror (null = all)
  journey_phase TEXT, -- phase (null = all)
  
  -- Content
  prompts JSONB NOT NULL, -- array of daily prompts
  
  -- Visibility
  is_active BOOLEAN DEFAULT true,
  is_premium BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- USER JOURNEY ENROLLMENTS
-- ============================================
CREATE TABLE user_journey_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  journey_id UUID REFERENCES guided_journeys(id) ON DELETE CASCADE,
  
  -- Progress
  current_day INT DEFAULT 1,
  completed_days INT DEFAULT 0,
  
  -- Status
  status TEXT DEFAULT 'active', -- 'active' | 'paused' | 'completed' | 'abandoned'
  
  -- Timestamps
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, journey_id, started_at)
);

-- ============================================
-- DAILY RESPONSES (user engagement)
-- ============================================
CREATE TABLE journey_daily_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enrollment_id UUID REFERENCES user_journey_enrollments(id) ON DELETE CASCADE,
  day_number INT NOT NULL,
  
  -- User's response/reflection
  response_text TEXT,
  
  -- Completion
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(enrollment_id, day_number)
);

-- Indexes
CREATE INDEX idx_enrollments_user ON user_journey_enrollments(user_id);
CREATE INDEX idx_enrollments_status ON user_journey_enrollments(status);

-- RLS
ALTER TABLE guided_journeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_journey_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE journey_daily_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View active journeys" ON guided_journeys
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users manage own enrollments" ON user_journey_enrollments
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own responses" ON journey_daily_responses
  FOR ALL USING (
    enrollment_id IN (
      SELECT id FROM user_journey_enrollments WHERE user_id = auth.uid()
    )
  );
```

---

### Seed Example Journeys

```sql
-- 7-Day Foundation with SOMA
INSERT INTO guided_journeys (slug, name, description, duration_days, mirror_slug, journey_phase, is_premium, prompts) VALUES
(
  '7-day-body-awareness',
  '7 Dias de Consciência Corporal',
  'Uma semana para reconectar com o teu corpo através de práticas simples',
  7,
  'soma',
  'foundation',
  false, -- free users can try
  '[
    {
      "day": 1,
      "title": "Acordar o Corpo",
      "prompt": "Antes de sair da cama, faz um scan corporal. Onde sentes tensão? Onde sentes relaxamento? Partilha com SOMA."
    },
    {
      "day": 2,
      "title": "Refeição Consciente",
      "prompt": "Escolhe uma refeição hoje para comer sem distrações. Nota sabores, texturas, sensações. Como foi diferente?"
    },
    {
      "day": 3,
      "title": "Emoção no Corpo",
      "prompt": "Quando sentires uma emoção forte hoje, para. Onde vive no teu corpo? Que sensação física tem?"
    },
    {
      "day": 4,
      "title": "Movimento Intuitivo",
      "prompt": "Pergunta ao teu corpo: como queres mover-te hoje? Dance, espreguiça, caminha - o que pedir."
    },
    {
      "day": 5,
      "title": "Padrão Identificado",
      "prompt": "Notaste algum padrão entre emoções e corpo esta semana? Ex: ansiedade = estômago apertado?"
    },
    {
      "day": 6,
      "title": "Gratidão Corporal",
      "prompt": "Lista 3 coisas que o teu corpo faz por ti todos os dias que tomas como garantidas."
    },
    {
      "day": 7,
      "title": "Integração",
      "prompt": "Reflete nos 7 dias. O que mudou na tua relação com o corpo? Que prática vais manter?"
    }
  ]'::jsonb
);

-- 14-Day Anxiety Regulation with SEREN
INSERT INTO guided_journeys (slug, name, description, duration_days, mirror_slug, journey_phase, is_premium, prompts) VALUES
(
  '14-day-anxiety-regulation',
  '14 Dias de Regulação Emocional',
  'Duas semanas para desenvolver ferramentas de auto-regulação',
  14,
  'seren',
  'regulation',
  true, -- premium only
  '[
    {
      "day": 1,
      "title": "Nomear a Ansiedade",
      "prompt": "Quando ansiedade surgir hoje, dá-lhe um nome. Não julgues, apenas identifica: \'Olá, Ansiedade.\"
    },
    {
      "day": 2,
      "title": "Onde Vive",
      "prompt": "Ansiedade tem localização física? Peito, estômago, garganta? Descreve a sensação."
    },
    {
      "day": 3,
      "title": "O Que Protege",
      "prompt": "Pergunta à ansiedade: \'O que estás a tentar proteger?\' A primeira resposta que vier."
    },
    {
      "day": 4,
      "title": "Respiração Consciente",
      "prompt": "Pratica: 4 tempos inspira, 4 pausa, 6 expira, 2 pausa. 5 minutos. Nota mudanças."
    },
    {
      "day": 5,
      "title": "Pensamento vs Realidade",
      "prompt": "Capta um pensamento ansioso. É facto comprovado ou previsão catastrófica?"
    },
    {
      "day": 6,
      "title": "Grounding 5-4-3-2-1",
      "prompt": "5 coisas que vês, 4 que ouves, 3 que tocas, 2 que cheiras, 1 que saboreias."
    },
    {
      "day": 7,
      "title": "Mid-Point Reflexão",
      "prompt": "Uma semana completa. Que padrões notaste nos teus gatilhos de ansiedade?"
    },
    {
      "day": 8,
      "title": "Externalizar",
      "prompt": "Se ansiedade fosse personagem, como seria? Nome, aparência, voz? Desenha ou descreve."
    },
    {
      "day": 9,
      "title": "Timeline",
      "prompt": "Quando sentiste ansiedade pela primeira vez na vida? Que idade tinhas? Que aconteceu?"
    },
    {
      "day": 10,
      "title": "Auto-Compaixão",
      "prompt": "Fala com a parte ansiosa de ti como falarias com criança assustada. O que dirias?"
    },
    {
      "day": 11,
      "title": "Ferramentas Personalizadas",
      "prompt": "Das práticas experimentadas, qual te regula melhor? Cria teu kit de emergência."
    },
    {
      "day": 12,
      "title": "Antecedentes",
      "prompt": "Ansiedade costuma vir depois de quê? Falta de sono? Cafeína? Conflito? Mapa padrões."
    },
    {
      "day": 13,
      "title": "Celebração Pequena",
      "prompt": "Um momento esta semana onde conseguiste regular. Mesmo pequeno. Honra-o."
    },
    {
      "day": 14,
      "title": "Integração Final",
      "prompt": "14 dias depois: como mudou tua relação com ansiedade? Que aprendeste sobre regulação?"
    }
  ]'::jsonb
);

-- Add more journeys for LUMA and ECHO...
```

---

### UI Components

#### Journeys Library

```typescript
// app/(app)/journeys/page.tsx

export default async function JourneysPage() {
  const journeys = await getGuidedJourneys()
  const userEnrollments = await getUserEnrollments()
  
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">Jornadas Guiadas</h1>
      <p className="text-muted-foreground mb-8">
        Sequências estruturadas para aprofundar exploração
      </p>
      
      {/* Active Enrollments */}
      {userEnrollments.filter(e => e.status === 'active').length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Em Progresso</h2>
          <div className="space-y-4">
            {userEnrollments
              .filter(e => e.status === 'active')
              .map(enrollment => (
                <ActiveJourneyCard key={enrollment.id} enrollment={enrollment} />
              ))}
          </div>
        </div>
      )}
      
      {/* Available Journeys */}
      <h2 className="text-xl font-semibold mb-4">Disponíveis</h2>
      <div className="grid md:grid-cols-2 gap-6">
        {journeys.map(journey => (
          <JourneyCard key={journey.id} journey={journey} />
        ))}
      </div>
    </div>
  )
}
```

#### Journey Card

```typescript
export function JourneyCard({ journey }: { journey: GuidedJourney }) {
  const [isEnrolling, setIsEnrolling] = useState(false)
  
  async function handleEnroll() {
    setIsEnrolling(true)
    await fetch('/api/journeys/enroll', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ journeyId: journey.id })
    })
    router.refresh()
  }
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <Badge>{journey.duration_days} dias</Badge>
          {journey.is_premium && <Badge variant="secondary">Premium</Badge>}
        </div>
        <CardTitle>{journey.name}</CardTitle>
        <CardDescription>{journey.description}</CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <span>{MIRROR_ICONS[journey.mirror_slug]}</span>
          <span>{journey.mirror_slug?.toUpperCase() || 'All Mirrors'}</span>
        </div>
        
        <Button 
          className="w-full" 
          onClick={handleEnroll}
          disabled={isEnrolling}
        >
          Começar Jornada
        </Button>
      </CardContent>
    </Card>
  )
}
```

#### Daily Prompt View

```typescript
// app/(app)/journeys/[id]/page.tsx

export default async function JourneyDetailPage({ params }: { params: { id: string } }) {
  const enrollment = await getEnrollment(params.id)
  const journey = enrollment.journey
  const todayPrompt = journey.prompts[enrollment.current_day - 1]
  
  return (
    <div className="container max-w-2xl py-8">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">
            Dia {enrollment.current_day} de {journey.duration_days}
          </span>
          <span className="text-sm text-muted-foreground">
            {Math.round((enrollment.completed_days / journey.duration_days) * 100)}% completo
          </span>
        </div>
        <Progress 
          value={(enrollment.completed_days / journey.duration_days) * 100} 
        />
      </div>
      
      {/* Today's Prompt */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{todayPrompt.title}</CardTitle>
          <CardDescription>Dia {todayPrompt.day}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-lg leading-relaxed mb-6">
            {todayPrompt.prompt}
          </p>
          
          {/* Response Form */}
          <DailyResponseForm 
            enrollmentId={enrollment.id} 
            dayNumber={enrollment.current_day}
            onComplete={() => {
              // Mark day complete, advance to next
            }}
          />
        </CardContent>
      </Card>
      
      {/* Talk to Mirror CTA */}
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground mb-4">
            Pronto para explorar este prompt?
          </p>
          <Button asChild className="w-full">
            <Link href={`/chat/${journey.mirror_slug}`}>
              Conversar com {journey.mirror_slug?.toUpperCase()}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
```

---

## 5. GAMIFICAÇÃO ROBUSTA

### Badges & Achievements

```sql
-- ============================================
-- BADGES (predefined achievements)
-- ============================================
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT, -- emoji
  
  -- Unlock criteria
  criteria_type TEXT NOT NULL,
  -- 'conversations_count' | 'phase_complete' | 'pattern_identified' | 
  -- 'journey_complete' | 'streak' | 'insight_shared' | 'circle_engaged'
  
  criteria_value JSONB, -- flexible criteria
  
  -- Rarity
  rarity TEXT DEFAULT 'common', -- 'common' | 'rare' | 'epic' | 'legendary'
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- USER BADGES (earned)
-- ============================================
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
  
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, badge_id)
);

-- Seed initial badges
INSERT INTO badges (slug, name, description, icon, criteria_type, criteria_value, rarity) VALUES
-- Foundation
('first_step', 'First Step', 'Tiveste tua primeira conversa', '🌱', 'conversations_count', '{"min": 1}'::jsonb, 'common'),
('soma_explorer', 'Body Explorer', 'Tiveste 10 conversas com SOMA', '💚', 'mirror_conversations', '{"mirror": "soma", "min": 10}'::jsonb, 'common'),
('foundation_complete', 'Foundation Laid', 'Completaste a fase Foundation', '🏛️', 'phase_complete', '{"phase": "foundation"}'::jsonb, 'rare'),

-- Regulation
('seren_regular', 'Emotional Regulator', 'Tiveste 15 conversas com SEREN', '🌊', 'mirror_conversations', '{"mirror": "seren", "min": 15}'::jsonb, 'rare'),
('pattern_spotter', 'Pattern Spotter', 'Identificaste 5 padrões emocionais', '🔍', 'patterns_identified', '{"min": 5}'::jsonb, 'rare'),

-- Expansion  
('consciousness_shift', 'Consciousness Shifter', 'Completaste fase Expansion', '✨', 'phase_complete', '{"phase": "expansion"}'::jsonb, 'epic'),

-- Integration
('full_circle', 'Full Circle', 'Completaste as 4 fases', '🌟', 'journey_complete', '{}'::jsonb, 'legendary'),
('echo_master', 'Pattern Master', 'Integraste 10+ padrões com ECHO', '🔊', 'patterns_integrated', '{"min": 10}'::jsonb, 'epic'),

-- Engagement
('consistent', '7-Day Streak', 'Conversaste 7 dias seguidos', '🔥', 'streak', '{"days": 7}'::jsonb, 'rare'),
('dedicated', '30-Day Streak', 'Conversaste 30 dias seguidos', '💎', 'streak', '{"days": 30}'::jsonb, 'legendary'),

-- Community
('insight_sharer', 'Insight Sharer', 'Partilhaste 3 insights', '💡', 'insights_shared', '{"min": 3}'::jsonb, 'common'),
('circle_contributor', 'Circle Contributor', 'Participaste em 5 threads de Círculo', '🤝', 'circle_responses', '{"min": 5}'::jsonb, 'rare'),

-- Journey
('guided_completer', 'Journey Completer', 'Completaste uma Jornada Guiada', '🗺️', 'guided_journey_complete', '{"min": 1}'::jsonb, 'rare');
```

---

### Streaks System

```sql
-- ============================================
-- USER STREAKS
-- ============================================
CREATE TABLE user_streaks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  
  -- Current streak
  current_streak INT DEFAULT 0,
  last_activity_date DATE,
  
  -- Records
  longest_streak INT DEFAULT 0,
  total_active_days INT DEFAULT 0,
  
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to update streak
CREATE OR REPLACE FUNCTION update_user_streak(p_user_id UUID)
RETURNS void AS $$
DECLARE
  v_streak user_streaks%ROWTYPE;
  v_today DATE := CURRENT_DATE;
  v_yesterday DATE := CURRENT_DATE - INTERVAL '1 day';
BEGIN
  -- Get current streak record
  SELECT * INTO v_streak 
  FROM user_streaks 
  WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    -- First time, create record
    INSERT INTO user_streaks (user_id, current_streak, last_activity_date, longest_streak, total_active_days)
    VALUES (p_user_id, 1, v_today, 1, 1);
    RETURN;
  END IF;
  
  -- Check if activity is today (already counted)
  IF v_streak.last_activity_date = v_today THEN
    RETURN; -- no update needed
  END IF;
  
  -- Check if yesterday (continue streak)
  IF v_streak.last_activity_date = v_yesterday THEN
    UPDATE user_streaks
    SET 
      current_streak = current_streak + 1,
      longest_streak = GREATEST(longest_streak, current_streak + 1),
      total_active_days = total_active_days + 1,
      last_activity_date = v_today,
      updated_at = NOW()
    WHERE user_id = p_user_id;
  ELSE
    -- Streak broken, restart
    UPDATE user_streaks
    SET 
      current_streak = 1,
      total_active_days = total_active_days + 1,
      last_activity_date = v_today,
      updated_at = NOW()
    WHERE user_id = p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Call this function whenever user has a conversation
-- In app/api/chat/route.ts, after saving message:
-- await supabase.rpc('update_user_streak', { p_user_id: user.id })
```

---

### Leaderboard (Optional, Subtle)

```sql
-- Weekly leaderboard query (for admins or subtle display)
SELECT 
  u.id,
  COUNT(DISTINCT c.id) as conversations_this_week,
  COUNT(DISTINCT si.id) as insights_shared,
  us.current_streak
FROM users u
LEFT JOIN conversations c ON c.user_id = u.id 
  AND c.created_at > NOW() - INTERVAL '7 days'
LEFT JOIN shared_insights si ON si.user_id = u.id
  AND si.created_at > NOW() - INTERVAL '7 days'
LEFT JOIN user_streaks us ON us.user_id = u.id
WHERE u.subscription_tier = 'premium'
GROUP BY u.id, us.current_streak
ORDER BY conversations_this_week DESC, us.current_streak DESC
LIMIT 10;
```

**Mostrar leaderboard de forma MUITO sutil:**
- Não promove competição tóxica
- Apenas "Most Active Explorers This Week" (sem nomes, só números)
- Foco em celebração, não comparação

---

## 6. EMAIL AUTOMATION

### Objetivos

- ✅ Onboarding smooth
- ✅ Re-engagement de users inativos
- ✅ Nudges gentis para continuar jornada
- ✅ Milestone celebrations
- ✅ Phase transition suggestions

---

### Email Types & Triggers

```typescript
// lib/emails/triggers.ts

export const EMAIL_TRIGGERS = {
  // Onboarding
  welcome: {
    trigger: 'user_signup',
    delay: '0 hours',
    template: 'welcome'
  },
  
  first_conversation_prompt: {
    trigger: 'user_signup',
    delay: '24 hours',
    condition: 'no_conversations_yet',
    template: 'first_conversation'
  },
  
  // Engagement
  day_3_checkin: {
    trigger: 'user_signup',
    delay: '72 hours',
    template: 'day_3_checkin'
  },
  
  week_1_progress: {
    trigger: 'user_signup',
    delay: '7 days',
    template: 'week_1_progress'
  },
  
  // Re-engagement
  inactive_7_days: {
    trigger: 'last_activity',
    delay: '7 days',
    condition: 'no_recent_activity',
    template: 'come_back'
  },
  
  inactive_14_days: {
    trigger: 'last_activity',
    delay: '14 days',
    condition: 'no_recent_activity',
    template: 'we_miss_you'
  },
  
  // Milestones
  phase_completed: {
    trigger: 'phase_completion',
    delay: '0 hours',
    template: 'phase_celebration'
  },
  
  badge_earned: {
    trigger: 'badge_unlock',
    delay: '0 hours',
    template: 'badge_earned'
  },
  
  // Journey-specific
  journey_day_reminder: {
    trigger: 'guided_journey_daily',
    delay: '9:00 AM user_timezone',
    template: 'daily_prompt'
  },
  
  journey_completed: {
    trigger: 'journey_completion',
    delay: '0 hours',
    template: 'journey_celebration'
  },
  
  // Conversion
  free_limit_reached: {
    trigger: 'message_limit_hit',
    delay: '0 hours',
    template: 'upgrade_prompt'
  },
  
  trial_ending: {
    trigger: 'trial_end',
    delay: '-3 days', // 3 days before end
    template: 'trial_ending'
  }
}
```

---

### Email Templates (usando react-email)

```bash
npm install react-email @react-email/components
```

```tsx
// emails/welcome.tsx

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from '@react-email/components'

interface WelcomeEmailProps {
  userName?: string
}

export default function WelcomeEmail({ userName }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Bem-vinda à ANIMA - A tua jornada começa aqui</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Bem-vinda à ANIMA 🌟</Heading>
          
          <Text style={text}>
            Olá{userName ? ` ${userName}` : ''},
          </Text>
          
          <Text style={text}>
            Criaste conta na ANIMA - um sistema de autoconhecimento profundo 
            através de 4 espelhos digitais.
          </Text>
          
          <Text style={text}>
            A tua jornada tem 4 fases:
          </Text>
          
          <ul>
            <li><strong>🌱 SOMA (Foundation):</strong> Reconecta com o corpo</li>
            <li><strong>🌊 SEREN (Regulation):</strong> Regula emoções e mente</li>
            <li><strong>✨ LUMA (Expansion):</strong> Expande consciência</li>
            <li><strong>🔊 ECHO (Integration):</strong> Integra padrões</li>
          </ul>
          
          <Text style={text}>
            Recomendamos começar com SOMA, mas és livre de explorar como quiseres.
          </Text>
          
          <Button style={button} href={`${process.env.NEXT_PUBLIC_APP_URL}/app/mirrors`}>
            Começar Primeira Conversa
          </Button>
          
          <Text style={footer}>
            Qualquer dúvida, responde a este email.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
}

const h1 = {
  color: '#1a1a1a',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
}

const text = {
  color: '#444',
  fontSize: '16px',
  lineHeight: '26px',
}

const button = {
  backgroundColor: '#6366f1',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 20px',
  margin: '32px 0',
}

const footer = {
  color: '#898989',
  fontSize: '14px',
  lineHeight: '22px',
  marginTop: '32px',
}
```

---

### Email Sending (using Resend)

```bash
npm install resend
```

```typescript
// lib/emails/send.ts

import { Resend } from 'resend'
import WelcomeEmail from '@/emails/welcome'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendWelcomeEmail(
  to: string,
  userName?: string
) {
  try {
    await resend.emails.send({
      from: 'ANIMA <hello@anima.app>',
      to,
      subject: 'Bem-vinda à ANIMA 🌟',
      react: WelcomeEmail({ userName })
    })
  } catch (error) {
    console.error('Failed to send welcome email:', error)
  }
}

// Similar functions for other email types...
```

---

### Automated Triggers (Supabase Edge Functions + Cron)

```typescript
// supabase/functions/send-scheduled-emails/index.ts

import { createClient } from '@supabase/supabase-js'
import { sendEmail } from './email-service'

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )
  
  // Check for users who should get re-engagement emails (7 days inactive)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  
  const { data: inactiveUsers } = await supabase
    .from('users')
    .select('id, email')
    .lt('last_active_at', sevenDaysAgo.toISOString())
    .eq('email_preferences->re_engagement', true) // respect preferences
  
  for (const user of inactiveUsers || []) {
    await sendEmail(user.email, 'come_back', { userId: user.id })
  }
  
  // Check for guided journey daily reminders
  const { data: activeJourneys } = await supabase
    .from('user_journey_enrollments')
    .select('*, users(email), guided_journeys(*)')
    .eq('status', 'active')
  
  for (const enrollment of activeJourneys || []) {
    // Send daily prompt email
    const todayPrompt = enrollment.guided_journeys.prompts[enrollment.current_day - 1]
    await sendEmail(enrollment.users.email, 'daily_prompt', {
      journeyName: enrollment.guided_journeys.name,
      dayNumber: enrollment.current_day,
      prompt: todayPrompt.prompt
    })
  }
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  })
})

// Configure cron in Supabase: daily at 9am UTC
```

---

## 7. REFERRAL PROGRAM

### Conceito

Users convidam amigos → ambos ganham benefício.

**Benefícios:**
- Referrer: 1 mês grátis por cada amigo que faz upgrade
- Referred: 20% desconto no primeiro mês

---

### Database Schema

```sql
-- ============================================
-- REFERRAL CODES
-- ============================================
CREATE TABLE referral_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  code TEXT UNIQUE NOT NULL, -- ex: "SOFIA2024"
  
  -- Stats
  uses_count INT DEFAULT 0,
  successful_conversions INT DEFAULT 0,
  
  -- Rewards earned
  free_months_earned INT DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- REFERRALS (tracking)
-- ============================================
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  referrer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  referred_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  referral_code TEXT,
  
  -- Status
  status TEXT DEFAULT 'pending', -- 'pending' | 'converted' | 'expired'
  converted_at TIMESTAMPTZ,
  
  -- Rewards
  referrer_rewarded BOOLEAN DEFAULT false,
  referred_discount_applied BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_referral_codes_user ON referral_codes(user_id);
CREATE INDEX idx_referral_codes_code ON referral_codes(code);
CREATE INDEX idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX idx_referrals_referred ON referrals(referred_id);

-- Function to generate unique code
CREATE OR REPLACE FUNCTION generate_referral_code(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_code TEXT;
  v_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate random 8-char code
    v_code := upper(substr(md5(random()::text), 1, 8));
    
    -- Check if exists
    SELECT EXISTS(SELECT 1 FROM referral_codes WHERE code = v_code) INTO v_exists;
    
    EXIT WHEN NOT v_exists;
  END LOOP;
  
  -- Insert code
  INSERT INTO referral_codes (user_id, code)
  VALUES (p_user_id, v_code);
  
  RETURN v_code;
END;
$$ LANGUAGE plpgsql;
```

---

### API Routes

```typescript
// app/api/referral/generate/route.ts

export async function POST(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Check if user already has code
  const { data: existingCode } = await supabase
    .from('referral_codes')
    .select('code')
    .eq('user_id', user.id)
    .single()
  
  if (existingCode) {
    return NextResponse.json({ code: existingCode.code })
  }
  
  // Generate new code
  const { data } = await supabase.rpc('generate_referral_code', {
    p_user_id: user.id
  })
  
  return NextResponse.json({ code: data })
}
```

```typescript
// app/api/referral/apply/route.ts

export async function POST(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const { code } = await req.json()
  
  // Validate code
  const { data: referralCode } = await supabase
    .from('referral_codes')
    .select('*, users!inner(id)')
    .eq('code', code)
    .single()
  
  if (!referralCode) {
    return NextResponse.json({ error: 'Invalid code' }, { status: 400 })
  }
  
  // Can't refer yourself
  if (referralCode.user_id === user.id) {
    return NextResponse.json({ error: 'Cannot use own code' }, { status: 400 })
  }
  
  // Check if user already used a code
  const { data: existingReferral } = await supabase
    .from('referrals')
    .select('id')
    .eq('referred_id', user.id)
    .single()
  
  if (existingReferral) {
    return NextResponse.json({ error: 'Already used a referral' }, { status: 400 })
  }
  
  // Create referral
  await supabase
    .from('referrals')
    .insert({
      referrer_id: referralCode.user_id,
      referred_id: user.id,
      referral_code: code
    })
  
  // Increment uses
  await supabase
    .from('referral_codes')
    .update({ uses_count: referralCode.uses_count + 1 })
    .eq('id', referralCode.id)
  
  return NextResponse.json({ success: true, discount: 20 })
}
```

---

### UI Components

```typescript
// components/referral/referral-card.tsx

export function ReferralCard() {
  const [code, setCode] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  
  useEffect(() => {
    async function loadCode() {
      const res = await fetch('/api/referral/generate', { method: 'POST' })
      const data = await res.json()
      setCode(data.code)
    }
    loadCode()
  }, [])
  
  function copyCode() {
    navigator.clipboard.writeText(
      `${process.env.NEXT_PUBLIC_APP_URL}?ref=${code}`
    )
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5" />
          Convida Amigos
        </CardTitle>
        <CardDescription>
          Ganham ambos quando amigos fazem upgrade
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Benefits */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
            <div>
              <p className="text-sm font-medium">Eles ganham</p>
              <p className="text-2xl font-bold text-primary">20% OFF</p>
              <p className="text-xs text-muted-foreground">primeiro mês</p>
            </div>
            <div>
              <p className="text-sm font-medium">Tu ganhas</p>
              <p className="text-2xl font-bold text-primary">1 MÊS</p>
              <p className="text-xs text-muted-foreground">grátis por referral</p>
            </div>
          </div>
          
          {/* Code */}
          {code && (
            <div>
              <label className="text-sm font-medium mb-2 block">
                Teu código de convite:
              </label>
              <div className="flex gap-2">
                <Input 
                  value={`${process.env.NEXT_PUBLIC_APP_URL}?ref=${code}`}
                  readOnly
                  className="font-mono"
                />
                <Button 
                  onClick={copyCode}
                  variant={copied ? "default" : "outline"}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}
          
          {/* Share buttons */}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" asChild>
              <a 
                href={`https://wa.me/?text=Experimenta ANIMA - autoconhecimento profundo através de IAs: ${process.env.NEXT_PUBLIC_APP_URL}?ref=${code}`}
                target="_blank"
              >
                WhatsApp
              </a>
            </Button>
            <Button variant="outline" className="flex-1" asChild>
              <a 
                href={`mailto:?subject=Experimenta ANIMA&body=Descobri esta plataforma de autoconhecimento incrível: ${process.env.NEXT_PUBLIC_APP_URL}?ref=${code}`}
              >
                Email
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

---

## 📦 IMPLEMENTATION PRIORITY

### Phase 1 (Adicionar ao MVP imediatamente):
1. ✅ **Ghost Users** - seed logo no início para dinamismo
2. ✅ **Email Automation (básico)** - welcome + re-engagement
3. ✅ **Streaks System** - engagement retention

### Phase 2 (Adicionar Semana 1-2 pós-launch):
4. ✅ **Anonymous Insights Wall** - social leve
5. ✅ **Badges básicos** - primeiros achievements

### Phase 3 (Adicionar Mês 1):
6. ✅ **Jornadas Guiadas** - 2-3 journeys iniciais
7. ✅ **Círculos** - começar com 2 círculos (SOMA + SEREN)

### Phase 4 (Adicionar Mês 2-3):
8. ✅ **Referral Program** - growth loop
9. ✅ **Gamificação completa** - todos badges

---

## 🎯 MÉTRICAS DE SUCESSO (Features Avançadas)

```
Insights Wall:
- 30% users premium partilham pelo menos 1 insight
- 5+ insights partilhados por dia (incluindo ghosts)
- Avg 15 resonances por insight

Círculos:
- 40% users premium participam em pelo menos 1 círculo
- 3+ responses por thread
- 70% satisfaction rate

Jornadas Guiadas:
- 50% completion rate (pelo menos)
- 60% dos completers fazem upgrade

Gamificação:
- 20% users desbloqueiam 5+ badges
- Streaks aumentam retention em 25%

Referral:
- 10% users partilham código
- 5% conversion rate (referred→premium)

Email:
- 40% open rate
- 10% click-through rate
- 20% re-engagement success
```

---

**FIM DO DOCUMENTO - FEATURES AVANÇADAS**

Todas as features estão **prontas para implementação modular**.  
Adiciona ao projeto quando fizer sentido na timeline! 🚀
