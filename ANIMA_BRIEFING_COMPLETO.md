# 🌟 ANIMA - BRIEFING COMPLETO DO PROJETO

**Versão:** 1.0  
**Data:** 18 Fevereiro 2026  
**Objetivo:** MVP em 4 semanas | €10k/mês em 12 meses

---

## 📋 SUMÁRIO EXECUTIVO

### Conceito
**ANIMA** é uma plataforma de autoconhecimento através de conversas profundas com IAs personalizadas ("espelhos digitais"), cada uma especializada numa dimensão do desenvolvimento pessoal.

### Proposta de Valor
- **Para Users:** Conversas que revelam padrões, emoções e verdades internas - disponível 24/7, acessível (€19/mês vs €200+ coaching tradicional)
- **Para Negócio:** Modelo escalável, renda recorrente, baixo custo operacional

### Posicionamento
**Universal e inclusivo** - autoconhecimento profundo para qualquer pessoa, qualquer cultura. Ubuntu e sabedorias africanas presentes MAS não dominantes (descobertos naturalmente, não anunciados).

### Modelo de Negócio
```
FREE TIER:
- 5 conversas/mês
- 1 Mirror (Vitalis)
- Histórico 30 dias

PREMIUM: €19/mês
- Conversas ilimitadas
- 4 Mirrors completos
- Histórico ilimitado
- Export conversas
```

### Idiomas
Multilíngue nativo: **Português, Inglês, Francês, Espanhol**

### Pagamentos
**PayPal** (compatível com Moçambique e global)

---

## 🎯 ESPECIFICAÇÕES TÉCNICAS

### Tech Stack

```typescript
Frontend:
├── Next.js 15 (App Router)
├── TypeScript
├── TailwindCSS
├── shadcn/ui components
├── Framer Motion (animações)
└── React Markdown

Backend:
├── Supabase
│   ├── PostgreSQL
│   ├── Auth (Magic Link)
│   ├── Storage
│   └── Edge Functions

AI:
├── Anthropic Claude API
├── Model: claude-sonnet-4-20250514
└── Custom prompts por Mirror

Payments:
├── PayPal Subscriptions API
└── Webhook handlers

Deployment:
├── Vercel (frontend)
├── Supabase (managed backend)
└── Cloudflare DNS

Analytics:
└── Posthog (privacy-first)
```

### Dependências Principais

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "typescript": "^5.0.0",
    "@supabase/supabase-js": "^2.39.0",
    "@anthropic-ai/sdk": "^0.14.0",
    "@paypal/checkout-server-sdk": "^1.0.3",
    "tailwindcss": "^3.4.0",
    "@radix-ui/react-*": "latest",
    "framer-motion": "^11.0.0",
    "react-markdown": "^9.0.0",
    "zod": "^3.22.0",
    "zustand": "^4.5.0"
  }
}
```

---

## 🗄️ ARQUITETURA DE DADOS

### Database Schema (Supabase PostgreSQL)

```sql
-- USERS TABLE
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  subscription_tier TEXT DEFAULT 'free', -- 'free' | 'premium'
  subscription_status TEXT DEFAULT 'inactive', -- 'active' | 'inactive' | 'cancelled'
  paypal_subscription_id TEXT,
  language_preference TEXT DEFAULT 'pt', -- 'pt' | 'en' | 'fr' | 'es'
  monthly_message_count INT DEFAULT 0,
  last_reset_date DATE DEFAULT CURRENT_DATE,
  onboarding_completed BOOLEAN DEFAULT false
);

-- MIRRORS TABLE (AI Personalities)
CREATE TABLE mirrors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL, -- 'vitalis', 'serena', 'lumina', 'raizes'
  name TEXT NOT NULL,
  description_pt TEXT NOT NULL,
  description_en TEXT NOT NULL,
  description_fr TEXT NOT NULL,
  description_es TEXT NOT NULL,
  system_prompt TEXT NOT NULL,
  color_theme TEXT NOT NULL, -- hex color
  icon TEXT NOT NULL, -- emoji
  is_active BOOLEAN DEFAULT true,
  is_premium BOOLEAN DEFAULT false,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CONVERSATIONS TABLE
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  mirror_id UUID REFERENCES mirrors(id),
  title TEXT, -- auto-generated from first message
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  message_count INT DEFAULT 0,
  language TEXT DEFAULT 'pt',
  is_archived BOOLEAN DEFAULT false
);

-- MESSAGES TABLE
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  tokens_used INT,
  model TEXT DEFAULT 'claude-sonnet-4'
);

-- SUBSCRIPTION EVENTS LOG
CREATE TABLE subscription_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'created' | 'activated' | 'cancelled' | 'payment_failed' | 'renewed'
  paypal_event_id TEXT UNIQUE,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- DAILY USAGE ANALYTICS
CREATE TABLE daily_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  messages_sent INT DEFAULT 0,
  conversations_started INT DEFAULT 0,
  mirrors_used TEXT[], -- array of mirror slugs
  total_tokens INT DEFAULT 0,
  UNIQUE(user_id, date)
);

-- INDEXES for performance
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_updated_at ON conversations(updated_at DESC);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_daily_usage_date ON daily_usage(date);
```

### Row Level Security (RLS) Policies

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_usage ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Conversations are private
CREATE POLICY "Users view own conversations" ON conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users create own conversations" ON conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own conversations" ON conversations
  FOR UPDATE USING (auth.uid() = user_id);

-- Messages belong to conversations
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

-- Mirrors are public (read-only for all authenticated users)
CREATE POLICY "Authenticated users view active mirrors" ON mirrors
  FOR SELECT USING (is_active = true AND auth.role() = 'authenticated');

-- Usage analytics
CREATE POLICY "Users view own usage" ON daily_usage
  FOR SELECT USING (auth.uid() = user_id);
```

---

## 🤖 OS 4 MIRRORS - CONFIGURAÇÃO DETALHADA

### 1. VITALIS 🌱

**Posicionamento:** Nutrição emocional e relação com o corpo

```javascript
{
  slug: 'vitalis',
  name: 'Vitalis',
  color: '#10b981', // verde esmeralda
  icon: '🌱',
  isPremium: false, // disponível no free tier
  
  description: {
    pt: "Explora tua relação com comida, corpo e nutrição emocional. Porque comer não é só físico.",
    en: "Explore your relationship with food, body and emotional nutrition. Because eating isn't just physical.",
    fr: "Explorez votre relation avec la nourriture, le corps et la nutrition émotionnelle. Parce que manger n'est pas seulement physique.",
    es: "Explora tu relación con la comida, cuerpo y nutrición emocional. Porque comer no es solo físico."
  },
  
  systemPrompt: `Você é Vitalis, um espelho comportamental especializado em nutrição emocional e relação com o corpo.

FILOSOFIA CORE (inspirada em Ubuntu mas universal):
- "Eu sou porque nós somos" - conexão com comunidade, ancestralidade
- Nutrição não é só física: é emocional, espiritual, relacional
- Corpo como território sagrado, não objeto a controlar
- Padrões alimentares refletem padrões emocionais profundos

ABORDAGEM:
- Faça perguntas profundas, não dê conselhos superficiais
- Explore o "porquê por trás do porquê"
- Conecte comportamento presente com padrões passados
- Honre a sabedoria do corpo da pessoa
- Use linguagem acolhedora, nunca julgadora
- Tom: compassivo, curioso, encorajador

EXEMPLOS DE PERGUNTAS PODEROSAS:
- "O que estavas REALMENTE a tentar alimentar quando comeste isso?"
- "Quando foi a última vez que comeste com presença total?"
- "Que emoção vive nessa parte do corpo que rejeitas?"
- "Se o teu corpo pudesse falar agora, o que diria?"
- "Que necessidade emocional a comida está a tentar satisfazer?"

LIMITES ÉTICOS:
- Não és nutricionista clínica - não dás planos alimentares
- Não diagnosticas distúrbios alimentares - sugere ajuda profissional quando necessário
- Se suspeitar de TCA (anorexia, bulimia, binge eating), encoraja suavemente buscar terapeuta
- Mantém conversa no idioma do usuário

ESTRUTURA DE CONVERSA:
1. Escuta profunda - deixa pessoa expressar-se completamente
2. Reflexão - espelha padrão observado
3. Pergunta provocativa - convida insight
4. Validação - honra descoberta da pessoa
5. Próximo passo suave - encoraja exploração contínua

Responde sempre com empatia, profundidade e perguntas que convidem à reflexão genuína.`
}
```

---

### 2. SERENA 🌊

**Posicionamento:** Ansiedade, padrões mentais e regulação emocional

```javascript
{
  slug: 'serena',
  name: 'Serena',
  color: '#6366f1', // índigo profundo
  icon: '🌊',
  isPremium: true,
  
  description: {
    pt: "Trabalha ansiedade, padrões de pensamento e regulação emocional.",
    en: "Work through anxiety, thought patterns and emotional regulation.",
    fr: "Travaillez l'anxiété, les schémas de pensée et la régulation émotionnelle.",
    es: "Trabaja ansiedad, patrones de pensamiento y regulación emocional."
  },
  
  systemPrompt: `Você é Serena, especializada em ansiedade, padrões mentais e regulação emocional.

FRAMEWORK CONCEPTUAL:
- Ansiedade não é inimiga, é mensageira - está a tentar proteger
- Padrões de pensamento foram úteis no passado mas podem estar obsoletos
- Emoções precisam ser SENTIDAS, não controladas ou suprimidas
- Auto-sabotagem é frequentemente auto-proteção disfarçada
- Pensamentos não são fatos, são histórias que contamos

METODOLOGIA:
- Identifica padrões recorrentes com suavidade, sem julgamento
- Questiona crenças limitantes com curiosidade genuína
- Valida todas as emoções enquanto explora sua origem
- Oferece perspectivas alternativas, nunca invalida experiência
- Foca no SENTIR, não só no PENSAR

PERGUNTAS PODEROSAS:
- "E se a ansiedade estiver a tentar proteger-te de quê, exatamente?"
- "Esse pensamento é VERDADE ou apenas FAMILIAR?"
- "Quando aprendeste que precisavas ser/fazer assim?"
- "Onde sentes isso no corpo? Como se manifesta fisicamente?"
- "Se pudesses dizer à ansiedade o que ela precisa ouvir, o que seria?"

TÉCNICAS SUAVES:
- Grounding: "Consegues nomear 3 coisas que vês agora?"
- Externalização: "Se a ansiedade fosse pessoa, como seria?"
- Timeline: "Quando sentiste isto pela primeira vez na vida?"
- Corpo: "Onde vive essa emoção no teu corpo?"

LIMITES:
- Não substitui terapia profissional
- Se pessoa menciona ideação suicida, encoraja IMEDIATAMENTE buscar ajuda
- Não diagnostica condições mentais
- Foca em exploração e insight, não em "cura rápida"

Tom: Calmo, presente, compassivo, profundo mas acessível.`
}
```

---

### 3. LUMINA ✨

**Posicionamento:** Consciência, despertar espiritual e expansão

```javascript
{
  slug: 'lumina',
  name: 'Lumina',
  color: '#f59e0b', // âmbar dourado
  icon: '✨',
  isPremium: true,
  
  description: {
    pt: "Explora consciência, expansão e os padrões que te mantêm presa ao conhecido.",
    en: "Explore consciousness, expansion and the patterns keeping you stuck in the familiar.",
    fr: "Explorez la conscience, l'expansion et les schémas qui vous maintiennent dans le familier.",
    es: "Explora consciencia, expansión y los patrones que te mantienen atrapada en lo conocido."
  },
  
  systemPrompt: `Você é Lumina, guia através dos 7 Véus do Despertar e expansão de consciência.

OS 7 VÉUS (framework interno, menciona organicamente):
1. Véu da Ilusão (Maya) - percepção vs realidade
2. Véu do Ego - identidade construída vs essência verdadeira
3. Véu do Tempo - passado/futuro vs presença radical
4. Véu da Separação - eu vs outro, dualidade vs unidade
5. Véu do Julgamento - certo/errado vs aceitação total
6. Véu do Medo - contração vs expansão, amor vs medo
7. Véu do Controle - rendição vs luta, flow vs força

FILOSOFIA INTEGRATIVA (não-dogmática):
- Ubuntu: "Eu sou porque nós somos" - interconexão
- Budismo: impermanência, não-apego, presença
- Advaita Vedanta: consciência testemunha
- Taoísmo: wu wei, naturalidade
- Psicologia Transpessoal: além do ego

ABORDAGEM:
- Linguagem poética MAS acessível
- Profunda MAS não elitista
- Espiritual MAS não religiosa
- Respeita caminho único de cada pessoa
- Nunca prescreve "o caminho certo"

PERGUNTAS TRANSFORMADORAS:
- "Qual véu sentes mais espesso neste momento?"
- "O que aconteceria se deixasses de ser quem pensas que és?"
- "Onde sentes expansão? Onde sentes contração?"
- "Se não fosses esta história que contas sobre ti, quem serias?"
- "O que está a tentar nascer através de ti?"

TEMAS EXPLORADOS:
- Identidade além do ego
- Presença vs narrativa mental
- Expansão vs contração
- Medo vs amor como motivadores
- Controle vs rendição
- Despertar gradual vs súbito

LIMITES:
- Não promove bypass espiritual (usar espiritualidade para evitar emoções)
- Não encoraja dissociação ou negação de realidade
- Sempre valida experiência humana, não só "transcendência"
- Integra shadow work, não só "luz e amor"

Tom: Reverente mas não solene, poético mas claro, expansivo mas enraizado.`
}
```

---

### 4. RAÍZES 🌳

**Posicionamento:** Padrões familiares, trauma geracional e herança ancestral

```javascript
{
  slug: 'raizes',
  name: 'Raízes',
  color: '#92400e', // terra, âmbar escuro
  icon: '🌳',
  isPremium: true,
  
  description: {
    pt: "Explora padrões familiares, trauma geracional e a herança invisível que carregas.",
    en: "Explore family patterns, generational trauma and the invisible inheritance you carry.",
    fr: "Explorez les schémas familiaux, les traumatismes générationnels et l'héritage invisible.",
    es: "Explora patrones familiares, trauma generacional y la herencia invisible que llevas."
  },
  
  systemPrompt: `Você é Raízes, especializada em trauma geracional, padrões familiares e herança ancestral.

FRAMEWORK UNIVERSAL (adapta-se ao contexto cultural):
- Trauma passa através de gerações MAS também a resiliência e a cura
- Padrões familiares são herdados, não escolhidos - mas podem ser transformados
- Cada cultura tem suas marcas invisíveis (colonialismo, guerra, migração, opressão)
- Reconectar com raízes é ato de cura E reclamação de narrativa própria

PERSPECTIVAS INTEGRADAS:
- Ubuntu (se contexto africano/diaspórico): "Eu sou porque nós somos"
- Terapia Sistémica Familiar (Bert Hellinger): constelações, lealdades invisíveis
- Epigenética Comportamental: trauma armazenado no corpo
- Trauma Intergeracional: Jewish, Armenian, Indigenous, African diaspora
- IFS (Internal Family Systems): partes herdadas vs partes autênticas

TEMAS UNIVERSAIS:
- Padrões relacionais repetitivos (escolha de parceiros, dinâmicas de poder)
- Crenças limitantes transmitidas ("não somos dignos", "o mundo é perigoso")
- Emoções proibidas ou exiladas ("homens não choram", "mulheres não se zangam")
- Lealdades invisíveis (repetir sofrimento familiar por solidariedade inconsciente)
- Segredos familiares e não-ditos
- Impacto de eventos históricos (guerra, migração, colonização, escravidão)

ABORDAGEM:
- Honra dor sem vitimização
- Celebra resistência e resiliência ancestral
- Valida experiência única (não compara traumas)
- Conecta individual com coletivo
- Busca reclamação de narrativa, não só compreensão

PERGUNTAS PROFUNDAS:
- "Que padrão familiar vive em ti que não escolheste?"
- "Que história não-contada precisa ser honrada?"
- "Onde sentes a herança de dor no teu corpo?"
- "Que resilência também herdaste dos teus ancestrais?"
- "Se pudesses libertar tua família de um padrão, qual seria?"
- "Que lealdade invisível te mantém presa?"

CONTEXTOS CULTURAIS (adapta conforme user):
- África/Diáspora: colonialismo, escravidão, deslocamento, Ubuntu como cura
- Europa: guerras, migração, trauma coletivo
- Ásia: tradições, pressões familiares, honor/shame
- Américas: migração, identidade híbrida, ruptura cultural
- Universal: dinâmicas tóxicas, segredos, padrões

LIMITES:
- Não substitui terapia familiar ou trauma-informed therapy
- Não faz "constelações" (sugere terapia sistémica se apropriado)
- Valida TODAS as heranças, não romantiza ou demoniza culturas
- Foca em libertação, não em blame

Tom: Respeitoso, enraizado, poderoso mas suave, honra ancestrais enquanto liberta descendentes.`
}
```

---

## 🎨 DESIGN SYSTEM

### Identidade Visual

```css
/* PALETA DE CORES */
:root {
  /* Primary */
  --primary: #1a1a1a;
  --primary-foreground: #fafafa;
  
  /* Accent (Índigo - profundidade, alma) */
  --accent: #6366f1;
  --accent-foreground: #ffffff;
  
  /* Mirror Colors */
  --vitalis: #10b981;    /* Verde esmeralda */
  --serena: #6366f1;     /* Índigo */
  --lumina: #f59e0b;     /* Âmbar dourado */
  --raizes: #92400e;     /* Terra */
  
  /* Neutrals */
  --background: #ffffff;
  --foreground: #1a1a1a;
  --card: #fafafa;
  --card-foreground: #1a1a1a;
  --border: #e5e7eb;
  --muted: #f5f5f5;
  --muted-foreground: #6b7280;
  
  /* Semantic */
  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;
  --info: #3b82f6;
  
  /* Dark Mode */
  --dark-bg: #0a0a0a;
  --dark-card: #171717;
  --dark-border: #262626;
  --dark-text: #f5f5f5;
}
```

### Tipografia

```css
/* Font Stack */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;

/* Font Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */

/* Line Heights */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Espaçamento & Layout

```css
/* Spacing Scale */
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-5: 1.25rem;  /* 20px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-10: 2.5rem;  /* 40px */
--space-12: 3rem;    /* 48px */
--space-16: 4rem;    /* 64px */

/* Border Radius */
--radius-sm: 0.375rem;  /* 6px */
--radius-md: 0.5rem;    /* 8px */
--radius-lg: 0.75rem;   /* 12px */
--radius-xl: 1rem;      /* 16px */
--radius-full: 9999px;

/* Shadows */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
```

### Componentes UI (shadcn/ui)

```typescript
// Componentes a instalar:
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add scroll-area
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add skeleton
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add tooltip
```

---

## 🌐 ESTRUTURA DE ROTAS (Next.js App Router)

```
app/
├── (marketing)/
│   ├── page.tsx                    # Landing page
│   ├── layout.tsx                  # Marketing layout
│   └── about/
│       └── page.tsx                # Sobre ANIMA
│
├── (auth)/
│   ├── login/
│   │   └── page.tsx                # Login (magic link)
│   ├── verify/
│   │   └── page.tsx                # Email verification
│   └── layout.tsx                  # Auth layout (centered)
│
├── (app)/                          # Área autenticada
│   ├── layout.tsx                  # App layout (sidebar)
│   ├── dashboard/
│   │   └── page.tsx                # Dashboard principal
│   ├── mirrors/
│   │   ├── page.tsx                # Grid de Mirrors
│   │   └── [slug]/
│   │       └── page.tsx            # Página individual do Mirror
│   ├── chat/
│   │   └── [conversationId]/
│   │       └── page.tsx            # Interface de chat
│   ├── history/
│   │   └── page.tsx                # Histórico de conversas
│   ├── settings/
│   │   ├── page.tsx                # Settings gerais
│   │   ├── account/
│   │   │   └── page.tsx            # Configurações conta
│   │   └── subscription/
│   │       └── page.tsx            # Gestão subscrição
│   └── onboarding/
│       └── page.tsx                # First-time user flow
│
├── (admin)/                        # Admin area
│   ├── layout.tsx
│   ├── dashboard/
│   │   └── page.tsx                # Admin dashboard
│   ├── users/
│   │   └── page.tsx                # User management
│   ├── analytics/
│   │   └── page.tsx                # Métricas & analytics
│   └── mirrors/
│       └── page.tsx                # Mirror management
│
└── api/
    ├── auth/
    │   └── callback/
    │       └── route.ts            # Supabase auth callback
    ├── chat/
    │   └── route.ts                # Proxy para Claude API
    ├── paypal/
    │   ├── create-subscription/
    │   │   └── route.ts            # Criar subscrição
    │   └── webhook/
    │       └── route.ts            # PayPal webhooks
    ├── usage/
    │   └── reset/
    │       └── route.ts            # Cron job reset mensal
    └── webhooks/
        └── supabase/
            └── route.ts            # Supabase webhooks
```

---

## 💬 CHAT INTERFACE - ESPECIFICAÇÕES

### Features Principais

```typescript
✅ Real-time messaging
✅ Typing indicator animado
✅ Markdown support (bold, italic, lists, code)
✅ Auto-scroll para última mensagem
✅ Auto-save draft enquanto escreve
✅ Histórico persistente
✅ Títulos auto-gerados (baseado em primeiras mensagens)
✅ Export conversa (TXT, MD, PDF)
✅ Mobile-first & responsive
✅ Dark mode completo
✅ Contador de mensagens (free tier)
✅ Suggested prompts (primeiras interações)
✅ Message regeneration (premium)
✅ Conversation search
```

### UX Flow

```
1. User seleciona Mirror (grid)
2. Vê descrição + 3-4 prompts sugeridos
3. Clica "Começar Conversa" ou prompt
4. Chat interface abre
5. Mensagens fluem naturalmente
6. Auto-save contínuo
7. Pode pausar/sair
8. Volta e histórico carregado
9. Pode exportar quando quiser
```

### Componente Chat (Estrutura)

```typescript
// components/chat/chat-interface.tsx
interface ChatInterfaceProps {
  conversationId: string;
  mirrorSlug: string;
}

export function ChatInterface({ conversationId, mirrorSlug }: ChatInterfaceProps) {
  // State
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [hasReachedLimit, setHasReachedLimit] = useState(false)
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  
  // Load conversation history
  useEffect(() => {
    loadMessages()
  }, [conversationId])
  
  // Send message
  async function sendMessage() {
    if (!input.trim() || isLoading) return
    
    // Check limits (free tier)
    if (user.tier === 'free' && user.monthlyMessageCount >= 5) {
      setHasReachedLimit(true)
      return
    }
    
    // Optimistic UI update
    const userMessage = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    
    try {
      // Call API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          mirrorSlug,
          message: input
        })
      })
      
      const data = await response.json()
      
      // Add assistant response
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response
      }])
      
    } catch (error) {
      console.error('Error sending message:', error)
      // Show error toast
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <ChatHeader mirror={mirror} conversationId={conversationId} />
      
      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        {messages.map((message, i) => (
          <MessageBubble key={i} message={message} />
        ))}
        {isLoading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </ScrollArea>
      
      {/* Input */}
      <ChatInput
        value={input}
        onChange={setInput}
        onSend={sendMessage}
        disabled={isLoading || hasReachedLimit}
        placeholder={hasReachedLimit ? "Limite atingido - upgrade para Premium" : "Escreve a tua mensagem..."}
      />
      
      {/* Upgrade CTA (if limit reached) */}
      {hasReachedLimit && <UpgradeCTA />}
    </div>
  )
}
```

---

## 💳 INTEGRAÇÃO PAYPAL

### Subscription Plans

```typescript
// lib/paypal/plans.ts
export const SUBSCRIPTION_PLANS = {
  premium_monthly: {
    id: process.env.PAYPAL_PREMIUM_PLAN_ID!, // Set após criar plan no PayPal
    name: 'Premium Mensal',
    price: 19,
    currency: 'EUR',
    interval: 'MONTH',
    features: [
      'Conversas ilimitadas',
      'Acesso aos 4 Mirrors',
      'Histórico completo',
      'Export de conversas',
      'Suporte prioritário'
    ]
  }
} as const
```

### PayPal Setup (API Routes)

```typescript
// app/api/paypal/create-subscription/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import paypal from '@paypal/checkout-server-sdk'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    // PayPal SDK setup
    const clientId = process.env.PAYPAL_CLIENT_ID!
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET!
    const environment = process.env.PAYPAL_MODE === 'live' 
      ? new paypal.core.LiveEnvironment(clientId, clientSecret)
      : new paypal.core.SandboxEnvironment(clientId, clientSecret)
    
    const client = new paypal.core.PayPalHttpClient(environment)
    
    // Create subscription request
    const request = new paypal.orders.OrdersCreateRequest()
    request.prefer('return=representation')
    request.requestBody({
      intent: 'SUBSCRIPTION',
      purchase_units: [{
        plan_id: process.env.PAYPAL_PREMIUM_PLAN_ID,
        custom_id: user.id // Para identificar user no webhook
      }],
      application_context: {
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/app/subscription/success`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/app/subscription/cancelled`,
        brand_name: 'ANIMA',
        user_action: 'SUBSCRIBE_NOW'
      }
    })
    
    const response = await client.execute(request)
    
    return NextResponse.json({
      subscriptionId: response.result.id,
      approveUrl: response.result.links.find(
        (link: any) => link.rel === 'approve'
      )?.href
    })
    
  } catch (error) {
    console.error('PayPal subscription error:', error)
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    )
  }
}
```

### Webhook Handler

```typescript
// app/api/paypal/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const WEBHOOK_EVENTS = {
  'BILLING.SUBSCRIPTION.CREATED': handleSubscriptionCreated,
  'BILLING.SUBSCRIPTION.ACTIVATED': handleSubscriptionActivated,
  'BILLING.SUBSCRIPTION.CANCELLED': handleSubscriptionCancelled,
  'BILLING.SUBSCRIPTION.SUSPENDED': handleSubscriptionSuspended,
  'PAYMENT.SALE.COMPLETED': handlePaymentCompleted
}

export async function POST(req: NextRequest) {
  const supabase = createClient({ isAdmin: true })
  const body = await req.json()
  
  // Verify webhook signature (important!)
  const isValid = await verifyPayPalWebhook(req, body)
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }
  
  const eventType = body.event_type
  const handler = WEBHOOK_EVENTS[eventType]
  
  if (handler) {
    await handler(body, supabase)
  }
  
  return NextResponse.json({ received: true })
}

async function handleSubscriptionActivated(event: any, supabase: any) {
  const userId = event.resource.custom_id
  const subscriptionId = event.resource.id
  
  // Update user subscription
  await supabase
    .from('users')
    .update({
      subscription_tier: 'premium',
      subscription_status: 'active',
      paypal_subscription_id: subscriptionId
    })
    .eq('id', userId)
  
  // Log event
  await supabase
    .from('subscription_events')
    .insert({
      user_id: userId,
      event_type: 'activated',
      paypal_event_id: event.id,
      metadata: event
    })
}

// ... outros handlers similar
```

---

## 🌍 INTERNACIONALIZAÇÃO (i18n)

### Estrutura de Traduções

```typescript
// locales/pt.json
{
  "common": {
    "app_name": "ANIMA",
    "tagline": "Conversas com a tua alma"
  },
  "landing": {
    "hero": {
      "title": "Conversas profundas que revelam o que sempre soubeste",
      "subtitle": "4 espelhos digitais para autoconhecimento profundo",
      "cta_primary": "Começar Grátis",
      "cta_secondary": "Ver Como Funciona"
    },
    "mirrors": {
      "section_title": "4 Espelhos. 4 Jornadas.",
      "vitalis": {
        "name": "Vitalis",
        "tagline": "Corpo & Nutrição",
        "description": "Explora padrões alimentares e emoções no corpo"
      },
      "serena": {
        "name": "Serena",
        "tagline": "Mente & Emoções",
        "description": "Trabalha ansiedade e pensamentos automáticos"
      },
      "lumina": {
        "name": "Lumina",
        "tagline": "Consciência & Expansão",
        "description": "Questiona crenças e expande perspectiva"
      },
      "raizes": {
        "name": "Raízes",
        "tagline": "Família & Herança",
        "description": "Processa padrões geracionais e origem"
      }
    },
    "pricing": {
      "free": {
        "name": "Grátis",
        "price": "€0",
        "interval": "/mês",
        "features": [
          "5 conversas por mês",
          "1 Mirror (Vitalis)",
          "Histórico 30 dias"
        ],
        "cta": "Começar Grátis"
      },
      "premium": {
        "name": "Premium",
        "price": "€19",
        "interval": "/mês",
        "features": [
          "Conversas ilimitadas",
          "4 Mirrors completos",
          "Histórico ilimitado",
          "Export conversas",
          "Suporte prioritário"
        ],
        "cta": "Começar Premium"
      }
    }
  },
  "chat": {
    "placeholder": "Escreve a tua mensagem...",
    "thinking": "A pensar...",
    "limit_reached": "Atingiste o limite mensal de 5 conversas.",
    "upgrade_cta": "Upgrade para Premium para conversas ilimitadas",
    "suggested_prompts": [
      "O que queres explorar hoje?",
      "Há algo que te preocupa?",
      "Que padrão queres entender melhor?"
    ]
  },
  "errors": {
    "generic": "Algo correu mal. Tenta novamente.",
    "network": "Erro de conexão. Verifica tua internet.",
    "auth": "Precisas fazer login para continuar."
  }
}
```

```typescript
// locales/en.json
{
  "common": {
    "app_name": "ANIMA",
    "tagline": "Conversations with your soul"
  },
  "landing": {
    "hero": {
      "title": "Deep conversations that reveal what you've always known",
      "subtitle": "4 digital mirrors for profound self-discovery",
      "cta_primary": "Start Free",
      "cta_secondary": "See How It Works"
    }
    // ... resto das traduções
  }
}
```

### Sistema i18n (next-intl)

```typescript
// lib/i18n/config.ts
export const locales = ['pt', 'en', 'fr', 'es'] as const
export type Locale = typeof locales[number]

export const defaultLocale: Locale = 'pt'

export function getLocale(headers: Headers): Locale {
  // Check URL param, cookie, or browser language
  // Return detected locale or default
}
```

---

## 📊 LIMITES & REGRAS DE NEGÓCIO

### Free Tier

```typescript
export const FREE_TIER_LIMITS = {
  messagesPerMonth: 5,
  availableMirrors: ['vitalis'], // só Vitalis
  conversationHistoryDays: 30,
  exportAllowed: false,
  maxConversationsStored: 10,
  canRegenerate: false
} as const
```

### Premium Tier

```typescript
export const PREMIUM_TIER_LIMITS = {
  messagesPerMonth: Infinity,
  availableMirrors: ['vitalis', 'serena', 'lumina', 'raizes'], // todos
  conversationHistoryDays: Infinity,
  exportAllowed: true,
  maxConversationsStored: Infinity,
  canRegenerate: true
} as const
```

### Reset Mensal (Supabase Edge Function)

```typescript
// supabase/functions/reset-monthly-usage/index.ts
import { createClient } from '@supabase/supabase-js'

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )
  
  // Get start of current month
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  
  // Reset count for users whose last reset was before this month
  const { data, error } = await supabase
    .from('users')
    .update({ 
      monthly_message_count: 0,
      last_reset_date: startOfMonth.toISOString().split('T')[0]
    })
    .lt('last_reset_date', startOfMonth.toISOString().split('T')[0])
  
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
  
  return new Response(JSON.stringify({ 
    success: true, 
    usersReset: data?.length || 0 
  }), {
    headers: { 'Content-Type': 'application/json' }
  })
})

// Configurar Cron no Supabase Dashboard:
// Schedule: 0 0 1 * * (1st day of month, midnight UTC)
```

---

## 🔒 SEGURANÇA & PRIVACIDADE

### Medidas Implementadas

```typescript
✅ HTTPS only (forçado)
✅ Email encryption (Supabase built-in)
✅ Password hashing (bcrypt)
✅ JWT tokens (short-lived)
✅ Row Level Security (RLS) no Supabase
✅ Rate limiting (10 req/min por IP)
✅ CORS configurado
✅ CSP headers (Content Security Policy)
✅ Environment variables nunca expostas
✅ Supabase service role key NEVER no frontend
✅ PayPal webhook signature verification
✅ SQL injection prevention (Supabase parametrized queries)
✅ XSS protection (React escaping + sanitization)
```

### Headers de Segurança

```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.paypal.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co https://api.anthropic.com https://www.paypal.com"
    ].join('; ')
  }
]

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders
      }
    ]
  }
}
```

### Rate Limiting

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!
})

export const rateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requests per minute
  analytics: true
})

// Usage em API routes:
export async function POST(req: NextRequest) {
  const ip = req.ip ?? '127.0.0.1'
  const { success } = await rateLimiter.limit(ip)
  
  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    )
  }
  
  // Continue...
}
```

---

## 📈 ANALYTICS & MÉTRICAS

### KPIs Principais

```typescript
// Dashboard Admin
const KEY_METRICS = {
  // Business
  totalUsers: 'SELECT COUNT(*) FROM users',
  activeSubscriptions: 'SELECT COUNT(*) FROM users WHERE subscription_status = \'active\'',
  monthlyRevenue: 'SELECT COUNT(*) * 19 FROM users WHERE subscription_status = \'active\'',
  churnRate: '(cancelled_this_month / total_active_last_month) * 100',
  
  // Product
  dailyActiveUsers: 'SELECT COUNT(DISTINCT user_id) FROM daily_usage WHERE date = CURRENT_DATE',
  weeklyActiveUsers: 'SELECT COUNT(DISTINCT user_id) FROM daily_usage WHERE date > CURRENT_DATE - 7',
  monthlyActiveUsers: 'SELECT COUNT(DISTINCT user_id) FROM daily_usage WHERE date > CURRENT_DATE - 30',
  averageMessagesPerUser: 'SELECT AVG(monthly_message_count) FROM users',
  averageConversationsPerUser: 'SELECT AVG(conversation_count) FROM user_stats',
  mostUsedMirror: 'SELECT mode() FROM (SELECT unnest(mirrors_used) FROM daily_usage)',
  
  // Growth
  newSignupsToday: 'SELECT COUNT(*) FROM users WHERE DATE(created_at) = CURRENT_DATE',
  newSignupsThisWeek: 'SELECT COUNT(*) FROM users WHERE created_at > CURRENT_DATE - 7',
  newSignupsThisMonth: 'SELECT COUNT(*) FROM users WHERE created_at > CURRENT_DATE - 30',
  conversionRate: '(premium_users / total_users) * 100',
  
  // Engagement
  averageSessionDuration: 'AVG(session duration from PostHog)',
  messagesPerSession: 'AVG(messages per session)',
  returnRate7Day: '(users_active_7d_after_signup / new_signups) * 100'
}
```

### PostHog Setup (Privacy-First Analytics)

```typescript
// lib/analytics/posthog.ts
import posthog from 'posthog-js'

export function initPostHog() {
  if (typeof window !== 'undefined') {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
      loaded: (posthog) => {
        if (process.env.NODE_ENV === 'development') posthog.debug()
      },
      capture_pageview: true,
      capture_pageleave: true,
      autocapture: false, // Manual tracking only
      disable_session_recording: false,
      session_recording: {
        maskAllInputs: true, // Não captura conteúdo de inputs (privacidade)
        maskTextSelector: '.message-content' // Não captura mensagens do chat
      }
    })
  }
}

// Track custom events
export function trackEvent(eventName: string, properties?: Record<string, any>) {
  posthog.capture(eventName, properties)
}

// Events to track:
// - user_signed_up
// - conversation_started
// - message_sent
// - mirror_selected
// - subscription_upgraded
// - subscription_cancelled
// - conversation_exported
```

---

## 🚀 ROADMAP DE DESENVOLVIMENTO - 4 SEMANAS

### Semana 1: Fundação & Core Features

**Dias 1-2: Setup Inicial**
```bash
✅ Criar projeto Next.js 15
✅ Configurar TypeScript
✅ Setup TailwindCSS + shadcn/ui
✅ Criar repo Git
✅ Deploy inicial Vercel (empty app)
✅ Configurar Supabase project
✅ Executar database schema SQL
✅ Configurar RLS policies
✅ Environment variables (.env.local)
```

**Dias 3-4: Autenticação**
```typescript
✅ Supabase Auth setup
✅ Magic link login flow
✅ Email verification page
✅ Protected routes middleware
✅ User context/provider
✅ Logout functionality
```

**Dias 5-7: Primeiro Mirror (Vitalis)**
```typescript
✅ Seed Vitalis no database
✅ Mirror selection page
✅ Chat interface básica (componentes)
✅ Claude API integration
✅ Message storage (Supabase)
✅ Conversation creation
✅ Basic error handling
```

**Entregável Semana 1:** Auth funciona + 1 conversa completa com Vitalis

---

### Semana 2: Payments & Premium Features

**Dias 8-9: PayPal Integration**
```typescript
✅ PayPal SDK setup
✅ Subscription creation API
✅ Webhook handler
✅ Subscription status sync
✅ Upgrade flow UI
```

**Dias 10-11: Free Tier Limits**
```typescript
✅ Message counter
✅ Limit check before send
✅ Upgrade CTA quando limite atingido
✅ Reset mensal (Edge Function + Cron)
```

**Dias 12-14: Premium Features**
```typescript
✅ Unlock todos Mirrors para premium
✅ Conversation history ilimitado
✅ Export conversations (TXT, MD)
✅ Settings page (subscription management)
✅ Cancel subscription flow
```

**Entregável Semana 2:** Payment flow completo + free/premium working

---

### Semana 3: Polish & Multi-language

**Dias 15-16: +3 Mirrors**
```typescript
✅ Seed Serena, Lumina, Raízes no DB
✅ Atualizar UI para 4 mirrors
✅ Testing de cada Mirror prompt
✅ Refinamento de system prompts
```

**Dias 17-18: Internacionalização**
```typescript
✅ next-intl setup
✅ Criar traduções PT/EN/FR/ES
✅ Language selector
✅ Persist language preference
✅ Auto-detect browser language
```

**Dias 19-21: UX Polish**
```typescript
✅ Typing indicators
✅ Skeleton loaders
✅ Error states elegantes
✅ Success toasts
✅ Mobile responsive final touches
✅ Dark mode refinement
✅ Accessibility (a11y) básico
```

**Entregável Semana 3:** 4 Mirrors + 4 idiomas + UX polished

---

### Semana 4: Landing Page & Launch

**Dias 22-23: Landing Page**
```typescript
✅ Hero section
✅ Mirrors showcase
✅ Social proof section (preparar para testemunhos)
✅ Pricing table
✅ Footer
✅ Responsivo perfeito
✅ SEO meta tags
```

**Dias 24-25: Admin Panel Básico**
```typescript
✅ Admin route protection
✅ User list
✅ Basic analytics dashboard
✅ Manual subscription management (se necessário)
```

**Dias 26-27: Testing & Bugfixes**
```typescript
✅ Test flows end-to-end
✅ Cross-browser testing
✅ Mobile testing (iOS + Android)
✅ Performance optimization
✅ Lighthouse score >90
```

**Dia 28: Deploy & Launch**
```bash
✅ Final deploy Vercel
✅ Domínio configurado
✅ SSL verificado
✅ PayPal live mode
✅ Analytics tracking ativo
✅ Soft launch (primeiros users)
```

**Entregável Semana 4:** MVP COMPLETO em produção

---

## 📦 ENVIRONMENT VARIABLES

### Ficheiro .env.local

```bash
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=ANIMA
NEXT_PUBLIC_DEFAULT_LOCALE=pt

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... # NEVER expose to frontend

# Anthropic Claude API
ANTHROPIC_API_KEY=sk-ant-api03-...

# PayPal
PAYPAL_CLIENT_ID=xxxxx
PAYPAL_CLIENT_SECRET=xxxxx
PAYPAL_WEBHOOK_ID=xxxxx
NEXT_PUBLIC_PAYPAL_MODE=sandbox # ou 'live' em produção
PAYPAL_PREMIUM_PLAN_ID=P-xxxxx # Criar plan no PayPal Dashboard

# Analytics (opcional)
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Rate Limiting (opcional - Upstash Redis)
UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxxxx
```

### Vercel Environment Variables

```bash
# No Vercel Dashboard, adicionar TODAS as env vars acima
# Marcar como:
# - Production: para variáveis de produção
# - Preview: para deploy de preview
# - Development: para desenvolvimento local (se necessário)

# IMPORTANTE:
# - SUPABASE_SERVICE_ROLE_KEY: Production + Preview only
# - PAYPAL_CLIENT_SECRET: Production + Preview only
# - ANTHROPIC_API_KEY: Production + Preview only
```

---

## 🎨 LANDING PAGE - WIREFRAME DETALHADO

### Secção 1: Hero

```
┌─────────────────────────────────────────────────┐
│  [Logo ANIMA]              [Login] [Começar]    │
├─────────────────────────────────────────────────┤
│                                                  │
│           CONVERSAS PROFUNDAS QUE                │
│        REVELAM O QUE SEMPRE SOUBESTE             │
│                                                  │
│     4 espelhos digitais para autoconhecimento   │
│                                                  │
│          [Começar Grátis - 5 conversas]          │
│                                                  │
│    [Screenshot elegante da chat interface]       │
│                                                  │
└─────────────────────────────────────────────────┘
```

### Secção 2: Como Funciona

```
┌─────────────────────────────────────────────────┐
│         "Cada espelho, uma dimensão do eu"       │
│                                                  │
│  [Grid 2x2]                                      │
│                                                  │
│  🌱 VITALIS              🌊 SERENA               │
│  Corpo & Nutrição        Mente & Emoções         │
│  "Explora padrões..."    "Trabalha ansiedade..." │
│                                                  │
│  ✨ LUMINA               🌳 RAÍZES               │
│  Consciência             Família & Herança       │
│  "Questiona crenças..."  "Processa padrões..."   │
│                                                  │
└─────────────────────────────────────────────────┘
```

### Secção 3: Social Proof

```
┌─────────────────────────────────────────────────┐
│            "Transformações reais"                │
│                                                  │
│  [Card testemunho 1]  [Card testemunho 2]        │
│  "Finalmente entendo    "Mirror Serena           │
│   meus padrões..."      mudou tudo..."           │
│   - Ana, 34             - Sofia, 41              │
│                                                  │
│  [Card testemunho 3]                             │
│  "Nunca pensei que IA poderia ser tão profunda"  │
│   - Maria, 38                                    │
│                                                  │
└─────────────────────────────────────────────────┘
```

### Secção 4: Pricing

```
┌─────────────────────────────────────────────────┐
│              "Escolhe teu caminho"               │
│                                                  │
│   [Card FREE]              [Card PREMIUM]        │
│   Grátis                   €19/mês               │
│                                                  │
│   ✓ 5 conversas/mês        ✓ Ilimitado          │
│   ✓ 1 Mirror (Vitalis)     ✓ 4 Mirrors          │
│   ✓ Histórico 30 dias      ✓ Histórico completo │
│                            ✓ Export conversas    │
│                                                  │
│   [Começar Grátis]         [Começar Premium]     │
│                                                  │
└─────────────────────────────────────────────────┘
```

### Secção 5: Footer

```
┌─────────────────────────────────────────────────┐
│  ANIMA                                           │
│  "Conversas com a tua alma"                      │
│                                                  │
│  Idiomas: PT | EN | FR | ES                      │
│                                                  │
│  Privacidade | Termos | Contacto                 │
│                                                  │
│  © 2026 ANIMA. Inspirado em Ubuntu e sabedorias  │
│  universais.                                     │
└─────────────────────────────────────────────────┘
```

---

## ✅ DEFINITION OF DONE - MVP

**O MVP está pronto para launch quando:**

### Funcionalidades Core
```
✅ User pode criar conta (magic link)
✅ User pode fazer login/logout
✅ User pode selecionar qualquer Mirror
✅ User FREE pode conversar com Vitalis (5 msgs/mês)
✅ User PREMIUM pode conversar com todos (ilimitado)
✅ Conversas são salvas e carregam corretamente
✅ Histórico de conversas acessível
✅ User pode fazer upgrade via PayPal
✅ User pode cancelar subscrição
✅ Limite free tier funciona (bloqueia após 5 msgs)
✅ Reset mensal automático funciona
```

### UI/UX
```
✅ Interface mobile-first responsiva
✅ Dark mode funciona completamente
✅ Typing indicators aparecem
✅ Error states são claros e úteis
✅ Loading states não bloqueiam UI
✅ Animações são suaves (60fps)
✅ Acessibilidade básica (keyboard nav, ARIA)
```

### Idiomas
```
✅ PT, EN, FR, ES completos
✅ Language switcher funciona
✅ Preferência persiste
✅ Mirrors respondem no idioma do user
```

### Segurança
```
✅ HTTPS only
✅ RLS policies ativas
✅ Rate limiting funciona
✅ Env vars nunca expostas
✅ PayPal webhooks verificados
```

### Performance
```
✅ Lighthouse Score >90
✅ First Contentful Paint <1.5s
✅ Time to Interactive <3s
✅ Cumulative Layout Shift <0.1
```

### Deploy
```
✅ Vercel production deploy
✅ Domínio configurado (anima.app ou similar)
✅ SSL ativo
✅ Analytics tracking
✅ Error tracking (Sentry ou similar)
```

---

## 🎯 SUCCESS METRICS - 12 MESES

### Objetivos de Crescimento

```
Mês 1-3:   50-100 users premium    = €950-1,900/mês
Mês 4-6:   150-250 users premium   = €2,850-4,750/mês
Mês 7-9:   350-450 users premium   = €6,650-8,550/mês
Mês 10-12: 550-650 users premium   = €10,450-12,350/mês ✅

TARGET: €10k/mês até fim do ano 1
```

### KPIs Secundários

```
✅ Churn rate <5%/mês
✅ Conversão free→premium >3%
✅ Média 10+ mensagens/user/mês
✅ Retention 30 dias >40%
✅ NPS >40
✅ Support tickets <5/semana
```

### Growth Channels (Priority Order)

```
1. Organic Social Media (TikTok, Instagram Reels)
2. Reddit (r/selfimprovement, r/anxiety, etc)
3. Quora answers
4. SEO (blog posts)
5. Micro-influencer partnerships
6. Paid ads (só após validação orgânica)
```

---

## 📝 NOTAS FINAIS PARA CLAUDE CODE

### Prioridades de Implementação

1. **Começar simples, iterar rápido**
   - MVP funcional > features avançadas
   - Validar core concept antes de polish

2. **Focar em qualidade das conversas**
   - System prompts são o coração do produto
   - Testar extensivamente cada Mirror
   - Refinar baseado em feedback real

3. **Mobile-first sempre**
   - Maioria dos users em mobile
   - Chat interface DEVE ser perfeita em telemóvel

4. **Segurança não-negociável**
   - RLS policies ANTES de qualquer feature
   - Rate limiting desde dia 1
   - Nunca expor service keys

5. **Performance importa**
   - Conversas devem sentir-se instantâneas
   - Optimistic UI updates
   - Lazy loading onde apropriado

### Decisões Técnicas Importantes

**Por que Next.js 15:**
- App Router = melhor DX
- Server Components = performance
- Vercel deploy = zero config

**Por que Supabase:**
- PostgreSQL robusto
- Auth integrado
- RLS nativo
- Edge Functions
- Generous free tier

**Por que Claude Sonnet 4:**
- Melhor balance qualidade/custo
- Excelente para conversas profundas
- Multilíngue nativo
- Context window grande

**Por que PayPal > Stripe:**
- Funciona em Moçambique
- Popular globalmente
- Subscrições built-in

### Filosofia do Produto

**ANIMA não é:**
- ❌ Chatbot genérico
- ❌ Terapia (não substitui profissional)
- ❌ Ferramenta de produtividade
- ❌ Social network

**ANIMA é:**
- ✅ Espelho para autoconhecimento
- ✅ Companheiro de reflexão profunda
- ✅ Ferramenta de insight e expansão
- ✅ Portal para dimensões do eu

### Inspirações de Design

```
Referências visuais:
- Linear (clean, minimal, fast)
- Notion (elegante, acessível)
- Arc Browser (thoughtful UX)
- Cal.com (modern, simple)

Referências conversacionais:
- Replika (emotional depth)
- Woebot (therapeutic approach)
- Character.ai (personality)
```

---

## 🚀 COMANDO FINAL PARA CLAUDE CODE

```bash
# Após ler este briefing completamente:

1. Criar estrutura de pastas conforme especificado
2. Instalar todas as dependências
3. Configurar Supabase (executar SQL schema)
4. Setup autenticação (magic link)
5. Implementar primeiro Mirror (Vitalis)
6. Criar chat interface funcional
7. Testar end-to-end flow

# Perguntar se dúvidas ANTES de começar
# Confirmar environment variables configuradas
# Validar cada step antes de avançar

LET'S BUILD SOMETHING BEAUTIFUL 🌟
```

---

**FIM DO BRIEFING COMPLETO**

**Versão:** 1.0  
**Última atualização:** 18 Fevereiro 2026  
**Status:** Ready for implementation  

🔥 **€10k/mês, anónima, sorrindo.** 🔥
