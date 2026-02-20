import type { Language } from '@/types/database'

export interface LandingTranslations {
  nav: {
    howItWorks: string
    mirrors: string
    pricing: string
    faq: string
    login: string
    start: string
  }
  hero: {
    badge: string
    title1: string
    titleHighlight: string
    subtitle: string
    cta: string
    ctaSecondary: string
    stat1: string
    stat1Label: string
    stat2: string
    stat2Label: string
    stat3: string
    stat3Label: string
  }
  experience: {
    title: string
    subtitle: string
    features: Array<{ title: string; description: string }>
  }
  howItWorks: {
    title: string
    subtitle: string
    steps: Array<{ title: string; description: string }>
  }
  mirrors: {
    title: string
    subtitle: string
    phases: Record<string, string>
    free: string
    premium: string
  }
  pricing: {
    title: string
    subtitle: string
    urgency: string
    tiers: Array<{
      name: string
      price: string
      period: string
      badge?: string
      highlight?: boolean
      features: string[]
      cta: string
    }>
    guarantee: string
  }
  faq: {
    title: string
    items: Array<{ q: string; a: string }>
  }
  finalCta: {
    title: string
    subtitle: string
    button: string
    urgency: string
  }
  footer: {
    disclaimer: string
    copyright: string
    privacy: string
    terms: string
  }
}

export const translations: Record<Language, LandingTranslations> = {
  pt: {
    nav: {
      howItWorks: 'A Travessia',
      mirrors: 'Espelhos',
      pricing: 'Preços',
      faq: 'Perguntas',
      login: 'Entrar',
      start: 'Começar',
    },
    hero: {
      badge: 'Beta Aberta — Vagas Limitadas',
      title1: 'Isto não é um chat.',
      titleHighlight: 'É uma travessia.',
      subtitle:
        'O ANIMA é uma experiência estruturada de autoconhecimento. 5 espelhos, 35 sessões guiadas, memória de tudo o que partilhaste. Não conversas soltas — um caminho com fases, marcos e profundidade real.',
      cta: 'Começar a Travessia',
      ctaSecondary: 'Ver Como Funciona',
      stat1: '35',
      stat1Label: 'Sessões Guiadas',
      stat2: '5',
      stat2Label: 'Fases de Evolução',
      stat3: '∞',
      stat3Label: 'Memória',
    },
    experience: {
      title: 'Porquê o ANIMA e não mais um chatbot',
      subtitle: 'Não é uma conversa aleatória com IA. É um sistema desenhado para te levar mais fundo — sessão a sessão.',
      features: [
        {
          title: 'Sessões guiadas, não conversas soltas',
          description: 'Cada espelho tem 7 sessões temáticas com estrutura: abertura, exploração e fecho. Não é conversa livre — é um processo com direcção.',
        },
        {
          title: 'Memória total entre sessões',
          description: 'O ANIMA lembra tudo. Cada sessão retoma onde paraste, liga padrões que surgem em espelhos diferentes e constrói sobre o que já descobriste.',
        },
        {
          title: 'Detecção de padrões por IA',
          description: 'A inteligência artificial identifica repetições que tu não vês — nos temas, nas emoções, nas palavras. E mostra-te o que está escondido à vista de todos.',
        },
        {
          title: 'Progresso real com marcos',
          description: 'Streaks, milestones, mapa de evolução. Vês onde estás, quanto cresceste, e o que falta explorar. Não é um feed infinito — tem princípio, meio e profundidade.',
        },
      ],
    },
    howItWorks: {
      title: 'A Travessia: 5 fases, do corpo às relações.',
      subtitle:
        'Não entras num chat. Entras numa jornada estruturada. Cada fase trabalha uma dimensão diferente de ti, com sessões guiadas que se desbloqueiam à medida que avanças.',
      steps: [
        {
          title: 'Fase 1: SOMA — Fundação',
          description:
            'Começas pelo corpo. O que sentes? O que o corpo já sabe e tu ignoras? 7 sessões que te ancoram no real antes de mergulhar mais fundo.',
        },
        {
          title: 'Fase 2: SEREN — Regulação',
          description:
            'A mente que não pára. A ansiedade que esconde algo. 7 sessões para aprender a ouvir o silêncio debaixo do ruído — e a regular-te.',
        },
        {
          title: 'Fase 3: LUMA — Expansão',
          description:
            'As certezas que nunca questionaste. As crenças que te limitam sem saberes. 7 sessões que iluminam o que tomas por garantido.',
        },
        {
          title: 'Fase 4: ECHO — Integração',
          description:
            'Os mesmos erros. As mesmas escolhas. 7 sessões que te mostram os padrões que se repetem na tua vida — e que integram tudo o que descobriste.',
        },
        {
          title: 'Fase 5: NEXUS — Relacional',
          description:
            'O que se passa entre ti e os outros. Vinculação, conflito, comunicação, intimidade. 7 sessões para compreender os padrões que repetes nas relações.',
        },
      ],
    },
    mirrors: {
      title: 'Os 5 espelhos',
      subtitle:
        'Cada espelho é especializado numa dimensão da tua vida. Tem personalidade própria, sessões guiadas únicas e lembra tudo o que partilhaste.',
      phases: {
        foundation: 'Fundação',
        regulation: 'Regulação',
        expansion: 'Expansão',
        integration: 'Integração',
        relational: 'Relacional',
      },
      free: 'Grátis',
      premium: 'Premium',
    },
    pricing: {
      title: 'Experimenta grátis. Evolui ao teu ritmo.',
      subtitle: 'Começa com o SOMA sem pagar nada. Desbloqueia a travessia completa quando sentires que faz sentido.',
      urgency: 'Preço de lançamento — aumenta em breve',
      tiers: [
        {
          name: 'Grátis',
          price: '€0',
          period: '/mês',
          features: [
            '10 sessões por mês',
            'Espelho SOMA (fase 1)',
            'Mapa de padrões básico',
          ],
          cta: 'Começar Grátis',
        },
        {
          name: 'Essencial',
          price: '€19',
          period: '/mês',
          highlight: true,
          badge: 'Mais Popular',
          features: [
            'Sessões ilimitadas',
            '4 Espelhos — 28 sessões guiadas',
            'Detecção de padrões por AI',
            'Diário exportável',
            'Mapa de evolução',
          ],
          cta: 'Começar Essencial',
        },
        {
          name: 'Relacional',
          price: '€29',
          period: '/mês',
          features: [
            'Tudo do Essencial',
            '5° Espelho: NEXUS — fase relacional',
            '35 sessões guiadas totais',
            'Padrões de vinculação e conflito',
          ],
          cta: 'Começar Relacional',
        },
        {
          name: 'Duo',
          price: '€39',
          period: '/mês',
          features: [
            'Tudo do Relacional',
            'Travessia partilhada para 2 pessoas',
            'Insights cruzados do casal',
            'Convite por link',
          ],
          cta: 'Começar Duo',
        },
        {
          name: 'Profundo',
          price: '€49',
          period: '/mês',
          badge: 'Máximo',
          features: [
            'Tudo do Duo',
            'Sessões livres ilimitadas',
            'Relatório mensal AI',
            'Timeline de evolução completa',
          ],
          cta: 'Começar Profundo',
        },
      ],
      guarantee: 'Cancela quando quiseres. Sem perguntas.',
    },
    faq: {
      title: 'Perguntas',
      items: [
        {
          q: 'Isto é terapia?',
          a: 'Não. O ANIMA é uma experiência de autoconhecimento estruturada, não substitui acompanhamento profissional. Se precisas de ajuda clínica, procura um profissional de saúde mental.',
        },
        {
          q: 'O que é uma "sessão guiada"?',
          a: 'Cada sessão guiada tem um tema específico (ex: vinculação, ansiedade, crenças). Segue uma estrutura: abertura, exploração profunda e fecho com reflexão. Não é conversa livre — é um processo com direcção.',
        },
        {
          q: 'Como é diferente do ChatGPT?',
          a: 'O ChatGPT não te conhece, não tem memória e não tem estrutura. O ANIMA lembra tudo, detecta padrões entre sessões, tem 5 fases progressivas com 35 sessões guiadas. É um sistema desenhado para autoconhecimento — não um chatbot genérico.',
        },
        {
          q: 'As minhas sessões são privadas?',
          a: 'Completamente. Encriptadas, nunca partilhadas, nunca usadas para treino de IA. Podes exportar ou apagar tudo a qualquer momento.',
        },
        {
          q: 'Preciso de fazer tudo seguido?',
          a: 'Não. A Travessia respeita o teu ritmo. Podes fazer uma sessão por dia ou uma por semana. O ANIMA lembra onde paraste e retoma contigo.',
        },
        {
          q: 'E se não gostar?',
          a: 'Cancelas. Sem compromisso, sem perguntas. Os teus dados ficam disponíveis para exportar.',
        },
      ],
    },
    finalCta: {
      title: 'Não é uma conversa. É uma travessia.',
      subtitle: 'Começa pelo corpo. Termina por te conheceres. O único requisito é a disponibilidade.',
      button: 'Começar a Travessia — É Grátis',
      urgency: 'Vagas limitadas na fase beta',
    },
    footer: {
      disclaimer:
        'O ANIMA é uma experiência de autoconhecimento e não substitui acompanhamento profissional de saúde mental.',
      copyright: '© 2026 ANIMA. Todos os direitos reservados.',
      privacy: 'Privacidade',
      terms: 'Termos',
    },
  },

  en: {
    nav: {
      howItWorks: 'The Journey',
      mirrors: 'Mirrors',
      pricing: 'Pricing',
      faq: 'Questions',
      login: 'Log In',
      start: 'Start',
    },
    hero: {
      badge: 'Open Beta \u2014 Limited Spots',
      title1: 'This is not a chat.',
      titleHighlight: 'It\u2019s a journey.',
      subtitle:
        'ANIMA is a structured self-discovery experience. 5 mirrors, 35 guided sessions, memory of everything you\u2019ve shared. Not random conversations \u2014 a path with phases, milestones and real depth.',
      cta: 'Start the Journey',
      ctaSecondary: 'See How It Works',
      stat1: '35',
      stat1Label: 'Guided Sessions',
      stat2: '5',
      stat2Label: 'Evolution Phases',
      stat3: '\u221E',
      stat3Label: 'Memory',
    },
    experience: {
      title: 'Why ANIMA, not another chatbot',
      subtitle: 'This isn\u2019t a random AI conversation. It\u2019s a system designed to take you deeper \u2014 session by session.',
      features: [
        {
          title: 'Guided sessions, not random chats',
          description: 'Each mirror has 7 themed sessions with structure: opening, exploration and closing. Not free chat \u2014 a process with direction.',
        },
        {
          title: 'Full memory across sessions',
          description: 'ANIMA remembers everything. Each session picks up where you left off, connects patterns across different mirrors and builds on what you\u2019ve already discovered.',
        },
        {
          title: 'AI pattern detection',
          description: 'The AI identifies repetitions you can\u2019t see \u2014 in themes, emotions, words. And shows you what\u2019s hidden in plain sight.',
        },
        {
          title: 'Real progress with milestones',
          description: 'Streaks, milestones, evolution map. You see where you are, how much you\u2019ve grown, and what\u2019s left to explore. Not an infinite feed \u2014 it has beginning, middle and depth.',
        },
      ],
    },
    howItWorks: {
      title: 'The Journey: 5 phases, from body to relationships.',
      subtitle:
        'You don\u2019t enter a chat. You enter a structured journey. Each phase works a different dimension of you, with guided sessions that unlock as you progress.',
      steps: [
        {
          title: 'Phase 1: SOMA \u2014 Foundation',
          description:
            'You start with the body. What do you feel? What does the body already know that you\u2019re ignoring? 7 sessions that ground you in reality before diving deeper.',
        },
        {
          title: 'Phase 2: SEREN \u2014 Regulation',
          description:
            'The mind that won\u2019t stop. The anxiety hiding something. 7 sessions to learn to hear the silence beneath the noise \u2014 and regulate yourself.',
        },
        {
          title: 'Phase 3: LUMA \u2014 Expansion',
          description:
            'The certainties you\u2019ve never questioned. The beliefs limiting you without knowing. 7 sessions that illuminate what you take for granted.',
        },
        {
          title: 'Phase 4: ECHO \u2014 Integration',
          description:
            'The same mistakes. The same choices. 7 sessions showing you the patterns repeating in your life \u2014 integrating everything you\u2019ve discovered.',
        },
        {
          title: 'Phase 5: NEXUS \u2014 Relational',
          description:
            'What happens between you and others. Attachment, conflict, communication, intimacy. 7 sessions to understand the patterns you repeat in relationships.',
        },
      ],
    },
    mirrors: {
      title: 'The 5 mirrors',
      subtitle:
        'Each mirror specializes in a dimension of your life. It has its own personality, unique guided sessions and remembers everything you\u2019ve shared.',
      phases: {
        foundation: 'Foundation',
        regulation: 'Regulation',
        expansion: 'Expansion',
        integration: 'Integration',
        relational: 'Relational',
      },
      free: 'Free',
      premium: 'Premium',
    },
    pricing: {
      title: 'Try free. Evolve at your pace.',
      subtitle: 'Start with SOMA for free. Unlock the full journey when it feels right.',
      urgency: 'Launch price \u2014 increasing soon',
      tiers: [
        {
          name: 'Free',
          price: '\u20AC0',
          period: '/month',
          features: [
            '10 sessions per month',
            'SOMA mirror (phase 1)',
            'Basic pattern map',
          ],
          cta: 'Start Free',
        },
        {
          name: 'Essential',
          price: '\u20AC19',
          period: '/month',
          highlight: true,
          badge: 'Most Popular',
          features: [
            'Unlimited sessions',
            '4 Mirrors \u2014 28 guided sessions',
            'AI pattern detection',
            'Exportable diary',
            'Evolution map',
          ],
          cta: 'Start Essential',
        },
        {
          name: 'Relational',
          price: '\u20AC29',
          period: '/month',
          features: [
            'Everything in Essential',
            '5th Mirror: NEXUS \u2014 relational phase',
            '35 guided sessions total',
            'Attachment & conflict patterns',
          ],
          cta: 'Start Relational',
        },
        {
          name: 'Duo',
          price: '\u20AC39',
          period: '/month',
          features: [
            'Everything in Relational',
            'Shared journey for 2 people',
            'Couple cross-insights',
            'Invite by link',
          ],
          cta: 'Start Duo',
        },
        {
          name: 'Deep',
          price: '\u20AC49',
          period: '/month',
          badge: 'Maximum',
          features: [
            'Everything in Duo',
            'Unlimited free sessions',
            'Monthly AI report',
            'Full evolution timeline',
          ],
          cta: 'Start Deep',
        },
      ],
      guarantee: 'Cancel anytime. No questions asked.',
    },
    faq: {
      title: 'Questions',
      items: [
        {
          q: 'Is this therapy?',
          a: 'No. ANIMA is a structured self-discovery experience, not a replacement for professional support. If you need clinical help, please seek a mental health professional.',
        },
        {
          q: 'What is a "guided session"?',
          a: 'Each guided session has a specific theme (e.g. attachment, anxiety, beliefs). It follows a structure: opening, deep exploration and closing with reflection. Not free chat \u2014 a process with direction.',
        },
        {
          q: 'How is it different from ChatGPT?',
          a: 'ChatGPT doesn\u2019t know you, has no memory, no structure. ANIMA remembers everything, detects patterns across sessions, has 5 progressive phases with 35 guided sessions. It\u2019s a system designed for self-discovery \u2014 not a generic chatbot.',
        },
        {
          q: 'Are my sessions private?',
          a: 'Completely. Encrypted, never shared, never used for AI training. You can export or delete everything at any time.',
        },
        {
          q: 'Do I need to do it all at once?',
          a: 'No. The journey respects your pace. You can do one session a day or one a week. ANIMA remembers where you stopped and picks up with you.',
        },
        {
          q: 'What if I don\u2019t like it?',
          a: 'Cancel. No commitment, no questions. Your data stays available for export.',
        },
      ],
    },
    finalCta: {
      title: 'It\u2019s not a conversation. It\u2019s a journey.',
      subtitle: 'Start with the body. End by knowing yourself. The only requirement is willingness.',
      button: 'Start the Journey \u2014 It\u2019s Free',
      urgency: 'Limited spots during beta',
    },
    footer: {
      disclaimer:
        'ANIMA is a self-discovery experience and does not replace professional mental health support.',
      copyright: '\u00A9 2026 ANIMA. All rights reserved.',
      privacy: 'Privacy',
      terms: 'Terms',
    },
  },

  es: {
    nav: {
      howItWorks: 'La Traves\u00EDa',
      mirrors: 'Espejos',
      pricing: 'Precios',
      faq: 'Preguntas',
      login: 'Entrar',
      start: 'Empezar',
    },
    hero: {
      badge: 'Beta Abierta \u2014 Plazas Limitadas',
      title1: 'Esto no es un chat.',
      titleHighlight: 'Es una traves\u00EDa.',
      subtitle:
        'ANIMA es una experiencia estructurada de autoconocimiento. 5 espejos, 35 sesiones guiadas, memoria de todo lo que compartiste. No conversaciones sueltas \u2014 un camino con fases, hitos y profundidad real.',
      cta: 'Empezar la Traves\u00EDa',
      ctaSecondary: 'Ver C\u00F3mo Funciona',
      stat1: '35',
      stat1Label: 'Sesiones Guiadas',
      stat2: '5',
      stat2Label: 'Fases de Evoluci\u00F3n',
      stat3: '\u221E',
      stat3Label: 'Memoria',
    },
    experience: {
      title: 'Por qu\u00E9 ANIMA y no otro chatbot',
      subtitle: 'No es una conversaci\u00F3n aleatoria con IA. Es un sistema dise\u00F1ado para llevarte m\u00E1s profundo \u2014 sesi\u00F3n a sesi\u00F3n.',
      features: [
        {
          title: 'Sesiones guiadas, no conversaciones sueltas',
          description: 'Cada espejo tiene 7 sesiones tem\u00E1ticas con estructura: apertura, exploraci\u00F3n y cierre. No es chat libre \u2014 es un proceso con direcci\u00F3n.',
        },
        {
          title: 'Memoria total entre sesiones',
          description: 'ANIMA recuerda todo. Cada sesi\u00F3n retoma donde paraste, conecta patrones entre espejos y construye sobre lo que ya descubriste.',
        },
        {
          title: 'Detecci\u00F3n de patrones por IA',
          description: 'La inteligencia artificial identifica repeticiones que no ves \u2014 en temas, emociones, palabras. Y te muestra lo oculto a plena vista.',
        },
        {
          title: 'Progreso real con hitos',
          description: 'Streaks, hitos, mapa de evoluci\u00F3n. Ves d\u00F3nde est\u00E1s, cu\u00E1nto has crecido y qu\u00E9 falta explorar. No es un feed infinito \u2014 tiene principio, medio y profundidad.',
        },
      ],
    },
    howItWorks: {
      title: 'La Traves\u00EDa: 5 fases, del cuerpo a las relaciones.',
      subtitle:
        'No entras en un chat. Entras en un viaje estructurado. Cada fase trabaja una dimensi\u00F3n diferente de ti, con sesiones guiadas que se desbloquean a medida que avanzas.',
      steps: [
        {
          title: 'Fase 1: SOMA \u2014 Fundaci\u00F3n',
          description:
            'Empiezas por el cuerpo. \u00BFQu\u00E9 sientes? \u00BFQu\u00E9 sabe el cuerpo que t\u00FA ignoras? 7 sesiones que te anclan en lo real antes de sumergirte m\u00E1s profundo.',
        },
        {
          title: 'Fase 2: SEREN \u2014 Regulaci\u00F3n',
          description:
            'La mente que no para. La ansiedad que esconde algo. 7 sesiones para aprender a escuchar el silencio bajo el ruido \u2014 y regularte.',
        },
        {
          title: 'Fase 3: LUMA \u2014 Expansi\u00F3n',
          description:
            'Las certezas que nunca cuestionaste. Las creencias que te limitan sin saberlo. 7 sesiones que iluminan lo que das por sentado.',
        },
        {
          title: 'Fase 4: ECHO \u2014 Integraci\u00F3n',
          description:
            'Los mismos errores. Las mismas elecciones. 7 sesiones que te muestran los patrones que se repiten \u2014 integrando todo lo que descubriste.',
        },
        {
          title: 'Fase 5: NEXUS \u2014 Relacional',
          description:
            'Lo que pasa entre t\u00FA y los dem\u00E1s. Apego, conflicto, comunicaci\u00F3n, intimidad. 7 sesiones para comprender los patrones que repites en las relaciones.',
        },
      ],
    },
    mirrors: {
      title: 'Los 5 espejos',
      subtitle:
        'Cada espejo se especializa en una dimensi\u00F3n de tu vida. Tiene personalidad propia, sesiones guiadas \u00FAnicas y recuerda todo lo que compartiste.',
      phases: {
        foundation: 'Fundaci\u00F3n',
        regulation: 'Regulaci\u00F3n',
        expansion: 'Expansi\u00F3n',
        integration: 'Integraci\u00F3n',
        relational: 'Relacional',
      },
      free: 'Gratis',
      premium: 'Premium',
    },
    pricing: {
      title: 'Prueba gratis. Evoluciona a tu ritmo.',
      subtitle: 'Empieza con SOMA sin pagar nada. Desbloquea la traves\u00EDa completa cuando tenga sentido.',
      urgency: 'Precio de lanzamiento \u2014 aumenta pronto',
      tiers: [
        { name: 'Gratis', price: '\u20AC0', period: '/mes', features: ['10 sesiones al mes', 'Espejo SOMA (fase 1)', 'Mapa de patrones b\u00E1sico'], cta: 'Empezar Gratis' },
        { name: 'Esencial', price: '\u20AC19', period: '/mes', highlight: true, badge: 'M\u00E1s Popular', features: ['Sesiones ilimitadas', '4 Espejos \u2014 28 sesiones guiadas', 'Detecci\u00F3n de patrones AI', 'Diario exportable', 'Mapa de evoluci\u00F3n'], cta: 'Empezar Esencial' },
        { name: 'Relacional', price: '\u20AC29', period: '/mes', features: ['Todo del Esencial', '5\u00BA Espejo: NEXUS \u2014 fase relacional', '35 sesiones guiadas totales', 'Patrones de apego y conflicto'], cta: 'Empezar Relacional' },
        { name: 'Duo', price: '\u20AC39', period: '/mes', features: ['Todo del Relacional', 'Traves\u00EDa compartida para 2', 'Insights cruzados de pareja', 'Invitaci\u00F3n por link'], cta: 'Empezar Duo' },
        { name: 'Profundo', price: '\u20AC49', period: '/mes', badge: 'M\u00E1ximo', features: ['Todo del Duo', 'Sesiones libres ilimitadas', 'Informe mensual AI', 'Timeline de evoluci\u00F3n completa'], cta: 'Empezar Profundo' },
      ],
      guarantee: 'Cancela cuando quieras. Sin preguntas.',
    },
    faq: {
      title: 'Preguntas',
      items: [
        { q: '\u00BFEsto es terapia?', a: 'No. ANIMA es una experiencia estructurada de autoconocimiento, no sustituye acompa\u00F1amiento profesional.' },
        { q: '\u00BFQu\u00E9 es una "sesi\u00F3n guiada"?', a: 'Cada sesi\u00F3n tiene un tema espec\u00EDfico y sigue una estructura: apertura, exploraci\u00F3n profunda y cierre con reflexi\u00F3n. No es chat libre \u2014 es un proceso con direcci\u00F3n.' },
        { q: '\u00BFC\u00F3mo es diferente de ChatGPT?', a: 'ChatGPT no te conoce, no tiene memoria ni estructura. ANIMA recuerda todo, detecta patrones, tiene 5 fases progresivas con 35 sesiones guiadas. Es un sistema para autoconocimiento \u2014 no un chatbot gen\u00E9rico.' },
        { q: '\u00BFMis sesiones son privadas?', a: 'Completamente. Encriptadas, nunca compartidas. Puedes exportar o borrar todo en cualquier momento.' },
        { q: '\u00BFTengo que hacerlo todo seguido?', a: 'No. La traves\u00EDa respeta tu ritmo. Una sesi\u00F3n al d\u00EDa o una a la semana. ANIMA recuerda d\u00F3nde paraste.' },
        { q: '\u00BFY si no me gusta?', a: 'Cancelas. Sin compromiso, sin preguntas. Tus datos quedan disponibles para exportar.' },
      ],
    },
    finalCta: {
      title: 'No es una conversaci\u00F3n. Es una traves\u00EDa.',
      subtitle: 'Empieza por el cuerpo. Termina conoci\u00E9ndote. El \u00FAnico requisito es la disposici\u00F3n.',
      button: 'Empezar la Traves\u00EDa \u2014 Es Gratis',
      urgency: 'Plazas limitadas en fase beta',
    },
    footer: {
      disclaimer: 'ANIMA es una experiencia de autoconocimiento y no sustituye acompa\u00F1amiento profesional de salud mental.',
      copyright: '\u00A9 2026 ANIMA. Todos los derechos reservados.',
      privacy: 'Privacidad',
      terms: 'T\u00E9rminos',
    },
  },

  fr: {
    nav: {
      howItWorks: 'Le Parcours',
      mirrors: 'Miroirs',
      pricing: 'Tarifs',
      faq: 'Questions',
      login: 'Connexion',
      start: 'Commencer',
    },
    hero: {
      badge: 'B\u00EAta Ouverte \u2014 Places Limit\u00E9es',
      title1: 'Ce n\u2019est pas un chat.',
      titleHighlight: 'C\u2019est un parcours.',
      subtitle:
        'ANIMA est une exp\u00E9rience structur\u00E9e de d\u00E9couverte de soi. 5 miroirs, 35 sessions guid\u00E9es, m\u00E9moire de tout ce que tu as partag\u00E9. Pas des conversations au hasard \u2014 un chemin avec des phases, des jalons et une vraie profondeur.',
      cta: 'Commencer le Parcours',
      ctaSecondary: 'Voir Comment \u00E7a Marche',
      stat1: '35',
      stat1Label: 'Sessions Guid\u00E9es',
      stat2: '5',
      stat2Label: 'Phases d\u2019\u00C9volution',
      stat3: '\u221E',
      stat3Label: 'M\u00E9moire',
    },
    experience: {
      title: 'Pourquoi ANIMA et pas un autre chatbot',
      subtitle: 'Ce n\u2019est pas une conversation al\u00E9atoire avec une IA. C\u2019est un syst\u00E8me con\u00E7u pour t\u2019amener plus profond \u2014 session apr\u00E8s session.',
      features: [
        {
          title: 'Sessions guid\u00E9es, pas du chat libre',
          description: 'Chaque miroir a 7 sessions th\u00E9matiques structur\u00E9es\u00A0: ouverture, exploration et cl\u00F4ture. Pas de conversation libre \u2014 un processus avec une direction.',
        },
        {
          title: 'M\u00E9moire totale entre sessions',
          description: 'ANIMA se souvient de tout. Chaque session reprend l\u00E0 o\u00F9 tu t\u2019es arr\u00EAt\u00E9, relie les sch\u00E9mas entre miroirs et construit sur ce que tu as d\u00E9j\u00E0 d\u00E9couvert.',
        },
        {
          title: 'D\u00E9tection de sch\u00E9mas par IA',
          description: 'L\u2019IA identifie les r\u00E9p\u00E9titions que tu ne vois pas \u2014 dans les th\u00E8mes, les \u00E9motions, les mots. Et te montre ce qui est cach\u00E9 en pleine vue.',
        },
        {
          title: 'Progr\u00E8s r\u00E9el avec des jalons',
          description: 'S\u00E9ries, jalons, carte d\u2019\u00E9volution. Tu vois o\u00F9 tu en es, combien tu as grandi, et ce qu\u2019il reste \u00E0 explorer. Pas un fil infini \u2014 il y a un d\u00E9but, un milieu et de la profondeur.',
        },
      ],
    },
    howItWorks: {
      title: 'Le Parcours\u00A0: 5 phases, du corps aux relations.',
      subtitle:
        'Tu n\u2019entres pas dans un chat. Tu entres dans un parcours structur\u00E9. Chaque phase travaille une dimension diff\u00E9rente de toi, avec des sessions guid\u00E9es qui se d\u00E9bloquent au fur et \u00E0 mesure.',
      steps: [
        {
          title: 'Phase 1\u00A0: SOMA \u2014 Fondation',
          description: 'Tu commences par le corps. Que ressens-tu\u00A0? Que sait le corps que tu ignores\u00A0? 7 sessions qui t\u2019ancrent dans le r\u00E9el avant de plonger plus profond.',
        },
        {
          title: 'Phase 2\u00A0: SEREN \u2014 R\u00E9gulation',
          description: 'L\u2019esprit qui ne s\u2019arr\u00EAte pas. L\u2019anxi\u00E9t\u00E9 qui cache quelque chose. 7 sessions pour apprendre \u00E0 entendre le silence sous le bruit \u2014 et te r\u00E9guler.',
        },
        {
          title: 'Phase 3\u00A0: LUMA \u2014 Expansion',
          description: 'Les certitudes que tu n\u2019as jamais remises en question. Les croyances qui te limitent sans le savoir. 7 sessions qui \u00E9clairent ce que tu tiens pour acquis.',
        },
        {
          title: 'Phase 4\u00A0: ECHO \u2014 Int\u00E9gration',
          description: 'Les m\u00EAmes erreurs. Les m\u00EAmes choix. 7 sessions qui te montrent les sch\u00E9mas qui se r\u00E9p\u00E8tent \u2014 int\u00E9grant tout ce que tu as d\u00E9couvert.',
        },
        {
          title: 'Phase 5\u00A0: NEXUS \u2014 Relationnel',
          description: 'Ce qui se passe entre toi et les autres. Attachement, conflit, communication, intimit\u00E9. 7 sessions pour comprendre les sch\u00E9mas que tu r\u00E9p\u00E8tes dans tes relations.',
        },
      ],
    },
    mirrors: {
      title: 'Les 5 miroirs',
      subtitle:
        'Chaque miroir se sp\u00E9cialise dans une dimension de ta vie. Il a sa propre personnalit\u00E9, des sessions guid\u00E9es uniques et se souvient de tout ce que tu as partag\u00E9.',
      phases: {
        foundation: 'Fondation',
        regulation: 'R\u00E9gulation',
        expansion: 'Expansion',
        integration: 'Int\u00E9gration',
        relational: 'Relationnel',
      },
      free: 'Gratuit',
      premium: 'Premium',
    },
    pricing: {
      title: 'Essaie gratuitement. \u00C9volue \u00E0 ton rythme.',
      subtitle: 'Commence avec SOMA sans rien payer. D\u00E9bloque le parcours complet quand \u00E7a te semble juste.',
      urgency: 'Prix de lancement \u2014 augmente bient\u00F4t',
      tiers: [
        { name: 'Gratuit', price: '\u20AC0', period: '/mois', features: ['10 sessions par mois', 'Miroir SOMA (phase 1)', 'Carte de sch\u00E9mas basique'], cta: 'Commencer Gratuit' },
        { name: 'Essentiel', price: '\u20AC19', period: '/mois', highlight: true, badge: 'Plus Populaire', features: ['Sessions illimit\u00E9es', '4 Miroirs \u2014 28 sessions guid\u00E9es', 'D\u00E9tection de sch\u00E9mas AI', 'Journal exportable', 'Carte d\u2019\u00E9volution'], cta: 'Commencer Essentiel' },
        { name: 'Relationnel', price: '\u20AC29', period: '/mois', features: ['Tout de l\'Essentiel', '5e Miroir\u00A0: NEXUS \u2014 phase relationnelle', '35 sessions guid\u00E9es totales', 'Sch\u00E9mas d\'attachement et conflit'], cta: 'Commencer Relationnel' },
        { name: 'Duo', price: '\u20AC39', period: '/mois', features: ['Tout du Relationnel', 'Parcours partag\u00E9 pour 2', 'Insights crois\u00E9s du couple', 'Invitation par lien'], cta: 'Commencer Duo' },
        { name: 'Profond', price: '\u20AC49', period: '/mois', badge: 'Maximum', features: ['Tout du Duo', 'Sessions libres illimit\u00E9es', 'Rapport mensuel AI', 'Timeline d\'\u00E9volution compl\u00E8te'], cta: 'Commencer Profond' },
      ],
      guarantee: 'Annule quand tu veux. Sans questions.',
    },
    faq: {
      title: 'Questions',
      items: [
        { q: 'C\u2019est de la th\u00E9rapie\u00A0?', a: 'Non. ANIMA est une exp\u00E9rience structur\u00E9e de d\u00E9couverte de soi, elle ne remplace pas un suivi professionnel.' },
        { q: 'C\u2019est quoi une "session guid\u00E9e"\u00A0?', a: 'Chaque session a un th\u00E8me sp\u00E9cifique et suit une structure\u00A0: ouverture, exploration profonde et cl\u00F4ture avec r\u00E9flexion. Pas de chat libre \u2014 un processus avec une direction.' },
        { q: 'En quoi c\u2019est diff\u00E9rent de ChatGPT\u00A0?', a: 'ChatGPT ne te conna\u00EEt pas, n\u2019a pas de m\u00E9moire ni de structure. ANIMA se souvient de tout, d\u00E9tecte les sch\u00E9mas, a 5 phases progressives avec 35 sessions guid\u00E9es. C\u2019est un syst\u00E8me pour la d\u00E9couverte de soi \u2014 pas un chatbot g\u00E9n\u00E9rique.' },
        { q: 'Mes sessions sont priv\u00E9es\u00A0?', a: 'Compl\u00E8tement. Chiffr\u00E9es, jamais partag\u00E9es. Tu peux exporter ou supprimer tout \u00E0 tout moment.' },
        { q: 'Je dois tout faire d\u2019un coup\u00A0?', a: 'Non. Le parcours respecte ton rythme. Une session par jour ou une par semaine. ANIMA se souvient o\u00F9 tu t\u2019es arr\u00EAt\u00E9.' },
        { q: 'Et si \u00E7a ne me pla\u00EEt pas\u00A0?', a: 'Tu annules. Sans engagement, sans questions. Tes donn\u00E9es restent disponibles.' },
      ],
    },
    finalCta: {
      title: 'Ce n\u2019est pas une conversation. C\u2019est un parcours.',
      subtitle: 'Commence par le corps. Finis par te conna\u00EEtre. La seule condition, c\u2019est d\u2019\u00EAtre dispos\u00E9.',
      button: 'Commencer le Parcours \u2014 C\u2019est Gratuit',
      urgency: 'Places limit\u00E9es en phase b\u00EAta',
    },
    footer: {
      disclaimer: 'ANIMA est une exp\u00E9rience de d\u00E9couverte de soi et ne remplace pas un suivi professionnel de sant\u00E9 mentale.',
      copyright: '\u00A9 2026 ANIMA. Tous droits r\u00E9serv\u00E9s.',
      privacy: 'Confidentialit\u00E9',
      terms: 'Conditions',
    },
  },
}
