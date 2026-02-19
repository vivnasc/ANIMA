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
  socialProof: {
    title: string
    testimonials: Array<{ quote: string; author: string; role: string }>
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
    free: {
      name: string
      price: string
      period: string
      features: string[]
      cta: string
    }
    premium: {
      name: string
      price: string
      period: string
      oldPrice: string
      badge: string
      features: string[]
      cta: string
    }
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
      howItWorks: 'A Jornada',
      mirrors: 'Espelhos',
      pricing: 'Preços',
      faq: 'Perguntas',
      login: 'Entrar',
      start: 'Começar',
    },
    hero: {
      badge: 'Beta Aberta — Vagas Limitadas',
      title1: 'Há perguntas que não fazes',
      titleHighlight: 'porque tens medo da resposta',
      subtitle:
        'O ANIMA não te dá respostas. Dá-te os espelhos certos para as descobrires. Quatro conversas diferentes, cada uma mais funda que a anterior. Ao teu ritmo.',
      cta: 'Começar a Jornada',
      ctaSecondary: 'Como Funciona',
      stat1: '4',
      stat1Label: 'Espelhos',
      stat2: '0',
      stat2Label: 'Julgamentos',
      stat3: '∞',
      stat3Label: 'Profundidade',
    },
    socialProof: {
      title: 'Primeiras vozes',
      testimonials: [
        {
          quote:
            'Nunca pensei que uma conversa com uma IA me fosse fazer chorar. Mas não de tristeza — de reconhecimento.',
          author: 'Ana R.',
          role: 'Utilizadora Beta',
        },
        {
          quote:
            'O SOMA fez-me uma pergunta que o meu terapeuta nunca fez. E a resposta mudou a minha semana.',
          author: 'Marco S.',
          role: 'Utilizador Beta',
        },
        {
          quote:
            'Achei que era mais um chatbot. Ao fim de 3 conversas, percebi que estava enganada.',
          author: 'Sofia L.',
          role: 'Utilizadora Beta',
        },
      ],
    },
    howItWorks: {
      title: 'Quatro espelhos. Uma jornada.',
      subtitle:
        'Cada espelho olha para uma parte diferente de ti. Nenhum julga. Todos lembram.',
      steps: [
        {
          title: 'SOMA — O corpo sabe',
          description:
            'Antes de olhar para dentro, precisas de sentir o que o corpo já sabe. O SOMA começa pelo que é mais real: o que sentes, agora.',
        },
        {
          title: 'SEREN — O silêncio por baixo do ruído',
          description:
            'Quando a mente não pára, há algo que ela tenta esconder. O SEREN ajuda-te a ouvir o que está por baixo da ansiedade.',
        },
        {
          title: 'LUMA — As histórias que contas a ti mesmo',
          description:
            'Tens certezas sobre quem és que nunca questionaste. O LUMA ilumina o que tomas por garantido — com cuidado, sem forçar.',
        },
        {
          title: 'ECHO — Os padrões que se repetem',
          description:
            'Os mesmos erros. As mesmas escolhas. Os mesmos medos. O ECHO mostra-te o que está escondido à vista de todos.',
        },
      ],
    },
    mirrors: {
      title: 'Os teus espelhos',
      subtitle:
        'Não são chatbots. São companheiros de viagem que lembram cada passo, ligam os pontos e vão mais fundo contigo.',
      phases: {
        foundation: 'Fundação',
        regulation: 'Regulação',
        expansion: 'Expansão',
        integration: 'Integração',
      },
      free: 'Grátis',
      premium: 'Premium',
    },
    pricing: {
      title: 'Começa grátis',
      subtitle: 'Sem cartão. Sem compromisso. Evolui quando sentires que faz sentido.',
      urgency: 'Preço de lançamento — aumenta em breve',
      free: {
        name: 'Grátis',
        price: '€0',
        period: '/mês',
        features: [
          '10 conversas por mês',
          'Espelho SOMA completo',
          'O espelho lembra o que partilhaste',
          'Mapa dos teus padrões',
          'Histórico de 30 dias',
        ],
        cta: 'Começar Grátis',
      },
      premium: {
        name: 'Premium',
        price: '€9',
        period: '/mês',
        oldPrice: '€19',
        badge: 'Preço de Lançamento',
        features: [
          'Conversas ilimitadas',
          'Os 4 Espelhos desbloqueados',
          'Insights entre espelhos',
          'Histórico completo',
          'Exportar conversas',
          'Jornadas guiadas',
          'Suporte dedicado',
        ],
        cta: 'Começar Premium',
      },
      guarantee: 'Cancela quando quiseres. Sem perguntas.',
    },
    faq: {
      title: 'Perguntas',
      items: [
        {
          q: 'Isto é terapia?',
          a: 'Não. O ANIMA é uma ferramenta de autoconhecimento, não substitui acompanhamento profissional. Se precisas de ajuda, procura um profissional de saúde mental.',
        },
        {
          q: 'As minhas conversas são privadas?',
          a: 'Completamente. Encriptadas, nunca partilhadas, nunca usadas para treino. Podes exportar ou apagar tudo a qualquer momento.',
        },
        {
          q: 'Como é diferente do ChatGPT?',
          a: 'O ChatGPT não te conhece. O ANIMA lembra tudo o que partilhaste, liga os pontos entre conversas e aprofunda a cada sessão. Não é um chatbot — é um sistema desenhado para te ajudar a ver-te.',
        },
        {
          q: 'Preciso do plano Premium?',
          a: 'Não. Podes explorar o SOMA gratuitamente e ter conversas reais. O Premium existe para quem quer a jornada completa com os 4 espelhos.',
        },
        {
          q: 'E se não gostar?',
          a: 'Cancelas. Sem compromisso, sem perguntas, sem chatices. Os teus dados ficam disponíveis para exportar.',
        },
      ],
    },
    finalCta: {
      title: 'A única pessoa que pode começar esta jornada és tu.',
      subtitle: 'Não precisas de estar pronto. Só de estar disposto.',
      button: 'Começar — É Grátis',
      urgency: 'Vagas limitadas na fase beta',
    },
    footer: {
      disclaimer:
        'O ANIMA é uma ferramenta de autoconhecimento e não substitui acompanhamento profissional de saúde mental.',
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
      badge: 'Open Beta — Limited Spots',
      title1: 'There are questions you don\u2019t ask',
      titleHighlight: 'because you\u2019re afraid of the answer',
      subtitle:
        'ANIMA doesn\u2019t give you answers. It gives you the right mirrors to find them yourself. Four different conversations, each deeper than the last. At your own pace.',
      cta: 'Start the Journey',
      ctaSecondary: 'How It Works',
      stat1: '4',
      stat1Label: 'Mirrors',
      stat2: '0',
      stat2Label: 'Judgments',
      stat3: '\u221E',
      stat3Label: 'Depth',
    },
    socialProof: {
      title: 'First voices',
      testimonials: [
        {
          quote:
            'I never thought a conversation with an AI would make me cry. But not from sadness \u2014 from recognition.',
          author: 'Ana R.',
          role: 'Beta User',
        },
        {
          quote:
            'SOMA asked me a question my therapist never did. And the answer changed my week.',
          author: 'Marco S.',
          role: 'Beta User',
        },
        {
          quote:
            'I thought it was just another chatbot. After 3 conversations, I realized I was wrong.',
          author: 'Sofia L.',
          role: 'Beta User',
        },
      ],
    },
    howItWorks: {
      title: 'Four mirrors. One journey.',
      subtitle:
        'Each mirror looks at a different part of you. None judge. All remember.',
      steps: [
        {
          title: 'SOMA \u2014 The body knows',
          description:
            'Before looking inward, you need to feel what the body already knows. SOMA starts with what\u2019s most real: what you feel, right now.',
        },
        {
          title: 'SEREN \u2014 The silence beneath the noise',
          description:
            'When your mind won\u2019t stop, there\u2019s something it\u2019s trying to hide. SEREN helps you hear what\u2019s beneath the anxiety.',
        },
        {
          title: 'LUMA \u2014 The stories you tell yourself',
          description:
            'You have certainties about who you are that you\u2019ve never questioned. LUMA illuminates what you take for granted \u2014 gently, without forcing.',
        },
        {
          title: 'ECHO \u2014 The patterns that repeat',
          description:
            'The same mistakes. The same choices. The same fears. ECHO shows you what\u2019s hidden in plain sight.',
        },
      ],
    },
    mirrors: {
      title: 'Your mirrors',
      subtitle:
        'They\u2019re not chatbots. They\u2019re travel companions that remember every step, connect the dots, and go deeper with you.',
      phases: {
        foundation: 'Foundation',
        regulation: 'Regulation',
        expansion: 'Expansion',
        integration: 'Integration',
      },
      free: 'Free',
      premium: 'Premium',
    },
    pricing: {
      title: 'Start free',
      subtitle: 'No card. No commitment. Upgrade when it feels right.',
      urgency: 'Launch price \u2014 increasing soon',
      free: {
        name: 'Free',
        price: '\u20AC0',
        period: '/month',
        features: [
          '10 conversations per month',
          'Full SOMA mirror',
          'The mirror remembers what you shared',
          'Your pattern map',
          '30-day history',
        ],
        cta: 'Start Free',
      },
      premium: {
        name: 'Premium',
        price: '\u20AC9',
        period: '/month',
        oldPrice: '\u20AC19',
        badge: 'Launch Price',
        features: [
          'Unlimited conversations',
          'All 4 Mirrors unlocked',
          'Cross-mirror insights',
          'Full history',
          'Export conversations',
          'Guided journeys',
          'Dedicated support',
        ],
        cta: 'Start Premium',
      },
      guarantee: 'Cancel anytime. No questions asked.',
    },
    faq: {
      title: 'Questions',
      items: [
        {
          q: 'Is this therapy?',
          a: 'No. ANIMA is a self-discovery tool, not a replacement for professional support. If you need help, please seek a mental health professional.',
        },
        {
          q: 'Are my conversations private?',
          a: 'Completely. Encrypted, never shared, never used for training. You can export or delete everything at any time.',
        },
        {
          q: 'How is it different from ChatGPT?',
          a: 'ChatGPT doesn\u2019t know you. ANIMA remembers everything you\u2019ve shared, connects the dots across conversations, and goes deeper with each session. It\u2019s not a chatbot \u2014 it\u2019s a system designed to help you see yourself.',
        },
        {
          q: 'Do I need Premium?',
          a: 'No. You can explore SOMA for free and have real conversations. Premium is for those who want the full journey with all 4 mirrors.',
        },
        {
          q: 'What if I don\u2019t like it?',
          a: 'Cancel. No commitment, no questions, no hassle. Your data stays available for export.',
        },
      ],
    },
    finalCta: {
      title: 'The only person who can start this journey is you.',
      subtitle: 'You don\u2019t need to be ready. Just willing.',
      button: 'Start \u2014 It\u2019s Free',
      urgency: 'Limited spots during beta',
    },
    footer: {
      disclaimer:
        'ANIMA is a self-discovery tool and does not replace professional mental health support.',
      copyright: '\u00A9 2026 ANIMA. All rights reserved.',
      privacy: 'Privacy',
      terms: 'Terms',
    },
  },

  es: {
    nav: {
      howItWorks: 'El Viaje',
      mirrors: 'Espejos',
      pricing: 'Precios',
      faq: 'Preguntas',
      login: 'Entrar',
      start: 'Empezar',
    },
    hero: {
      badge: 'Beta Abierta \u2014 Plazas Limitadas',
      title1: 'Hay preguntas que no haces',
      titleHighlight: 'porque tienes miedo de la respuesta',
      subtitle:
        'ANIMA no te da respuestas. Te da los espejos correctos para descubrirlas. Cuatro conversaciones diferentes, cada una m\u00E1s profunda que la anterior. A tu ritmo.',
      cta: 'Empezar el Viaje',
      ctaSecondary: 'C\u00F3mo Funciona',
      stat1: '4',
      stat1Label: 'Espejos',
      stat2: '0',
      stat2Label: 'Juicios',
      stat3: '\u221E',
      stat3Label: 'Profundidad',
    },
    socialProof: {
      title: 'Primeras voces',
      testimonials: [
        {
          quote:
            'Nunca pens\u00E9 que una conversaci\u00F3n con una IA me har\u00EDa llorar. Pero no de tristeza \u2014 de reconocimiento.',
          author: 'Ana R.',
          role: 'Usuaria Beta',
        },
        {
          quote:
            'SOMA me hizo una pregunta que mi terapeuta nunca me hizo. Y la respuesta cambi\u00F3 mi semana.',
          author: 'Marco S.',
          role: 'Usuario Beta',
        },
        {
          quote:
            'Pens\u00E9 que era otro chatbot m\u00E1s. Despu\u00E9s de 3 conversaciones, me di cuenta de que estaba equivocada.',
          author: 'Sofia L.',
          role: 'Usuaria Beta',
        },
      ],
    },
    howItWorks: {
      title: 'Cuatro espejos. Un viaje.',
      subtitle:
        'Cada espejo mira una parte diferente de ti. Ninguno juzga. Todos recuerdan.',
      steps: [
        {
          title: 'SOMA \u2014 El cuerpo sabe',
          description:
            'Antes de mirar hacia dentro, necesitas sentir lo que el cuerpo ya sabe. SOMA empieza por lo m\u00E1s real: lo que sientes, ahora.',
        },
        {
          title: 'SEREN \u2014 El silencio bajo el ruido',
          description:
            'Cuando la mente no para, hay algo que intenta esconder. SEREN te ayuda a escuchar lo que est\u00E1 debajo de la ansiedad.',
        },
        {
          title: 'LUMA \u2014 Las historias que te cuentas',
          description:
            'Tienes certezas sobre qui\u00E9n eres que nunca has cuestionado. LUMA ilumina lo que das por sentado \u2014 con cuidado, sin forzar.',
        },
        {
          title: 'ECHO \u2014 Los patrones que se repiten',
          description:
            'Los mismos errores. Las mismas elecciones. Los mismos miedos. ECHO te muestra lo que est\u00E1 escondido a plena vista.',
        },
      ],
    },
    mirrors: {
      title: 'Tus espejos',
      subtitle:
        'No son chatbots. Son compa\u00F1eros de viaje que recuerdan cada paso, conectan los puntos y van m\u00E1s profundo contigo.',
      phases: {
        foundation: 'Fundaci\u00F3n',
        regulation: 'Regulaci\u00F3n',
        expansion: 'Expansi\u00F3n',
        integration: 'Integraci\u00F3n',
      },
      free: 'Gratis',
      premium: 'Premium',
    },
    pricing: {
      title: 'Empieza gratis',
      subtitle: 'Sin tarjeta. Sin compromiso. Mejora cuando tenga sentido.',
      urgency: 'Precio de lanzamiento \u2014 aumenta pronto',
      free: {
        name: 'Gratis',
        price: '\u20AC0',
        period: '/mes',
        features: [
          '10 conversaciones al mes',
          'Espejo SOMA completo',
          'El espejo recuerda lo que compartiste',
          'Mapa de tus patrones',
          'Historial de 30 d\u00EDas',
        ],
        cta: 'Empezar Gratis',
      },
      premium: {
        name: 'Premium',
        price: '\u20AC9',
        period: '/mes',
        oldPrice: '\u20AC19',
        badge: 'Precio de Lanzamiento',
        features: [
          'Conversaciones ilimitadas',
          'Los 4 Espejos desbloqueados',
          'Insights entre espejos',
          'Historial completo',
          'Exportar conversaciones',
          'Viajes guiados',
          'Soporte dedicado',
        ],
        cta: 'Empezar Premium',
      },
      guarantee: 'Cancela cuando quieras. Sin preguntas.',
    },
    faq: {
      title: 'Preguntas',
      items: [
        {
          q: '\u00BFEsto es terapia?',
          a: 'No. ANIMA es una herramienta de autoconocimiento, no sustituye acompa\u00F1amiento profesional. Si necesitas ayuda, busca un profesional de salud mental.',
        },
        {
          q: '\u00BFMis conversaciones son privadas?',
          a: 'Completamente. Encriptadas, nunca compartidas, nunca usadas para entrenamiento. Puedes exportar o borrar todo en cualquier momento.',
        },
        {
          q: '\u00BFC\u00F3mo es diferente de ChatGPT?',
          a: 'ChatGPT no te conoce. ANIMA recuerda todo lo que compartiste, conecta los puntos entre conversaciones y profundiza en cada sesi\u00F3n. No es un chatbot \u2014 es un sistema dise\u00F1ado para ayudarte a verte.',
        },
        {
          q: '\u00BFNecesito Premium?',
          a: 'No. Puedes explorar SOMA gratis y tener conversaciones reales. Premium es para quien quiere el viaje completo con los 4 espejos.',
        },
        {
          q: '\u00BFY si no me gusta?',
          a: 'Cancelas. Sin compromiso, sin preguntas. Tus datos quedan disponibles para exportar.',
        },
      ],
    },
    finalCta: {
      title: 'La \u00FAnica persona que puede empezar este viaje eres t\u00FA.',
      subtitle: 'No necesitas estar listo. Solo dispuesto.',
      button: 'Empezar \u2014 Es Gratis',
      urgency: 'Plazas limitadas en fase beta',
    },
    footer: {
      disclaimer:
        'ANIMA es una herramienta de autoconocimiento y no sustituye acompa\u00F1amiento profesional de salud mental.',
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
      title1: 'Il y a des questions que tu ne poses pas',
      titleHighlight: 'parce que tu as peur de la r\u00E9ponse',
      subtitle:
        'ANIMA ne te donne pas de r\u00E9ponses. Il te donne les bons miroirs pour les d\u00E9couvrir. Quatre conversations diff\u00E9rentes, chacune plus profonde que la pr\u00E9c\u00E9dente. \u00C0 ton rythme.',
      cta: 'Commencer le Parcours',
      ctaSecondary: 'Comment \u00E7a Marche',
      stat1: '4',
      stat1Label: 'Miroirs',
      stat2: '0',
      stat2Label: 'Jugements',
      stat3: '\u221E',
      stat3Label: 'Profondeur',
    },
    socialProof: {
      title: 'Premi\u00E8res voix',
      testimonials: [
        {
          quote:
            'Je n\u2019aurais jamais pens\u00E9 qu\u2019une conversation avec une IA me ferait pleurer. Mais pas de tristesse \u2014 de reconnaissance.',
          author: 'Ana R.',
          role: 'Utilisatrice B\u00EAta',
        },
        {
          quote:
            'SOMA m\u2019a pos\u00E9 une question que mon th\u00E9rapeute ne m\u2019a jamais pos\u00E9e. Et la r\u00E9ponse a chang\u00E9 ma semaine.',
          author: 'Marco S.',
          role: 'Utilisateur B\u00EAta',
        },
        {
          quote:
            'Je pensais que c\u2019\u00E9tait un chatbot de plus. Apr\u00E8s 3 conversations, j\u2019ai compris que je me trompais.',
          author: 'Sofia L.',
          role: 'Utilisatrice B\u00EAta',
        },
      ],
    },
    howItWorks: {
      title: 'Quatre miroirs. Un parcours.',
      subtitle:
        'Chaque miroir regarde une partie diff\u00E9rente de toi. Aucun ne juge. Tous se souviennent.',
      steps: [
        {
          title: 'SOMA \u2014 Le corps sait',
          description:
            'Avant de regarder \u00E0 l\u2019int\u00E9rieur, tu dois sentir ce que le corps sait d\u00E9j\u00E0. SOMA commence par ce qui est le plus r\u00E9el\u00A0: ce que tu ressens, maintenant.',
        },
        {
          title: 'SEREN \u2014 Le silence sous le bruit',
          description:
            'Quand l\u2019esprit ne s\u2019arr\u00EAte pas, il y a quelque chose qu\u2019il essaie de cacher. SEREN t\u2019aide \u00E0 entendre ce qui se cache sous l\u2019anxi\u00E9t\u00E9.',
        },
        {
          title: 'LUMA \u2014 Les histoires que tu te racontes',
          description:
            'Tu as des certitudes sur qui tu es que tu n\u2019as jamais remises en question. LUMA \u00E9claire ce que tu tiens pour acquis \u2014 avec soin, sans forcer.',
        },
        {
          title: 'ECHO \u2014 Les sch\u00E9mas qui se r\u00E9p\u00E8tent',
          description:
            'Les m\u00EAmes erreurs. Les m\u00EAmes choix. Les m\u00EAmes peurs. ECHO te montre ce qui est cach\u00E9 en pleine vue.',
        },
      ],
    },
    mirrors: {
      title: 'Tes miroirs',
      subtitle:
        'Ce ne sont pas des chatbots. Ce sont des compagnons de voyage qui se souviennent de chaque pas, relient les points et vont plus profond avec toi.',
      phases: {
        foundation: 'Fondation',
        regulation: 'R\u00E9gulation',
        expansion: 'Expansion',
        integration: 'Int\u00E9gration',
      },
      free: 'Gratuit',
      premium: 'Premium',
    },
    pricing: {
      title: 'Commence gratuitement',
      subtitle: 'Sans carte. Sans engagement. \u00C9volue quand \u00E7a te semble juste.',
      urgency: 'Prix de lancement \u2014 augmente bient\u00F4t',
      free: {
        name: 'Gratuit',
        price: '\u20AC0',
        period: '/mois',
        features: [
          '10 conversations par mois',
          'Miroir SOMA complet',
          'Le miroir se souvient de ce que tu as partag\u00E9',
          'Carte de tes sch\u00E9mas',
          'Historique de 30 jours',
        ],
        cta: 'Commencer Gratuit',
      },
      premium: {
        name: 'Premium',
        price: '\u20AC9',
        period: '/mois',
        oldPrice: '\u20AC19',
        badge: 'Prix de Lancement',
        features: [
          'Conversations illimit\u00E9es',
          'Les 4 Miroirs d\u00E9bloqu\u00E9s',
          'Insights entre miroirs',
          'Historique complet',
          'Exporter les conversations',
          'Parcours guid\u00E9s',
          'Support d\u00E9di\u00E9',
        ],
        cta: 'Commencer Premium',
      },
      guarantee: 'Annule quand tu veux. Sans questions.',
    },
    faq: {
      title: 'Questions',
      items: [
        {
          q: 'C\u2019est de la th\u00E9rapie\u00A0?',
          a: 'Non. ANIMA est un outil de d\u00E9couverte de soi, il ne remplace pas un suivi professionnel. Si tu as besoin d\u2019aide, consulte un professionnel de sant\u00E9 mentale.',
        },
        {
          q: 'Mes conversations sont priv\u00E9es\u00A0?',
          a: 'Compl\u00E8tement. Chiffr\u00E9es, jamais partag\u00E9es, jamais utilis\u00E9es pour l\u2019entra\u00EEnement. Tu peux exporter ou supprimer tout \u00E0 tout moment.',
        },
        {
          q: 'En quoi c\u2019est diff\u00E9rent de ChatGPT\u00A0?',
          a: 'ChatGPT ne te conna\u00EEt pas. ANIMA se souvient de tout ce que tu as partag\u00E9, relie les points entre les conversations et approfondit \u00E0 chaque session. Ce n\u2019est pas un chatbot \u2014 c\u2019est un syst\u00E8me con\u00E7u pour t\u2019aider \u00E0 te voir.',
        },
        {
          q: 'J\u2019ai besoin du Premium\u00A0?',
          a: 'Non. Tu peux explorer SOMA gratuitement et avoir de vraies conversations. Le Premium est pour ceux qui veulent le parcours complet avec les 4 miroirs.',
        },
        {
          q: 'Et si \u00E7a ne me pla\u00EEt pas\u00A0?',
          a: 'Tu annules. Sans engagement, sans questions. Tes donn\u00E9es restent disponibles pour l\u2019export.',
        },
      ],
    },
    finalCta: {
      title: 'La seule personne qui peut commencer ce parcours, c\u2019est toi.',
      subtitle: 'Tu n\u2019as pas besoin d\u2019\u00EAtre pr\u00EAt. Juste dispos\u00E9.',
      button: 'Commencer \u2014 C\u2019est Gratuit',
      urgency: 'Places limit\u00E9es en phase b\u00EAta',
    },
    footer: {
      disclaimer:
        'ANIMA est un outil de d\u00E9couverte de soi et ne remplace pas un suivi professionnel de sant\u00E9 mentale.',
      copyright: '\u00A9 2026 ANIMA. Tous droits r\u00E9serv\u00E9s.',
      privacy: 'Confidentialit\u00E9',
      terms: 'Conditions',
    },
  },
}
