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
      howItWorks: 'Como Funciona',
      mirrors: 'Espelhos',
      pricing: 'Preços',
      faq: 'FAQ',
      login: 'Entrar',
      start: 'Começar Grátis',
    },
    hero: {
      badge: 'Beta Aberta — Vagas Limitadas',
      title1: 'Descobre quem és',
      titleHighlight: 'através de conversas profundas',
      subtitle:
        'Uma jornada estruturada de autoconhecimento com 4 espelhos de IA. Cada um guia-te numa dimensão diferente do teu crescimento — corpo, mente, consciência e integração.',
      cta: 'Começar Minha Jornada — Grátis',
      ctaSecondary: 'Ver Como Funciona',
      stat1: '4',
      stat1Label: 'Espelhos de IA',
      stat2: '4',
      stat2Label: 'Idiomas',
      stat3: '∞',
      stat3Label: 'Profundidade',
    },
    socialProof: {
      title: 'O que dizem os primeiros utilizadores',
      testimonials: [
        {
          quote:
            'O SOMA ajudou-me a perceber padrões emocionais que nunca tinha notado. É como ter um espelho que realmente vê.',
          author: 'Ana R.',
          role: 'Utilizadora Beta',
        },
        {
          quote:
            'A progressão entre espelhos faz toda a diferença. Cada conversa constrói sobre a anterior.',
          author: 'Marco S.',
          role: 'Utilizador Beta',
        },
        {
          quote:
            'Finalmente algo que não é terapia nem chatbot genérico. O ANIMA encontrou o equilíbrio perfeito.',
          author: 'Sofia L.',
          role: 'Utilizadora Beta',
        },
      ],
    },
    howItWorks: {
      title: 'Como Funciona',
      subtitle: 'Uma jornada progressiva desenhada para profundidade real',
      steps: [
        {
          title: 'Começa com SOMA',
          description:
            'Explora a tua relação com o corpo e fundações emocionais. O SOMA lembra cada insight para construir sobre eles.',
        },
        {
          title: 'Progride para SEREN',
          description:
            'Trabalha ansiedade e regulação emocional. O SEREN usa os padrões do SOMA para ir mais fundo.',
        },
        {
          title: 'Expande com LUMA',
          description:
            'Questiona crenças limitantes e expande a tua consciência. O LUMA conecta insights dos espelhos anteriores.',
        },
        {
          title: 'Integra com ECHO',
          description:
            'Identifica os padrões que ecoam na tua vida e integra toda a jornada numa visão unificada.',
        },
      ],
    },
    mirrors: {
      title: 'Os 4 Espelhos',
      subtitle:
        'Cada espelho é especializado numa dimensão do teu crescimento. A IA lembra, conecta e aprofunda.',
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
      title: 'Preço Simples, Transparente',
      subtitle: 'Começa grátis. Evolui quando estiveres pronto.',
      urgency: 'Preço de lançamento — aumenta em breve',
      free: {
        name: 'Grátis',
        price: '€0',
        period: '/mês',
        features: [
          '10 conversas por mês',
          'Espelho SOMA completo',
          'Histórico de 30 dias',
          'Dashboard de padrões',
          'Suporte a 4 idiomas',
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
          'Todos os 4 Espelhos',
          'Histórico ilimitado',
          'Insights cross-mirror',
          'Exportar conversas',
          'Jornadas guiadas',
          'Suporte prioritário',
        ],
        cta: 'Começar Premium',
      },
      guarantee: 'Cancela a qualquer momento. Sem compromisso.',
    },
    faq: {
      title: 'Perguntas Frequentes',
      items: [
        {
          q: 'O ANIMA é terapia?',
          a: 'Não. O ANIMA é uma ferramenta de autoconhecimento estruturado. Não substitui acompanhamento profissional. Se precisas de ajuda, procura um profissional de saúde mental.',
        },
        {
          q: 'Os meus dados estão seguros?',
          a: 'Sim. As tuas conversas são encriptadas e nunca partilhadas. Usamos Supabase com segurança de nível empresarial. Podes exportar ou apagar os teus dados a qualquer momento.',
        },
        {
          q: 'Em que idiomas funciona?',
          a: 'O ANIMA funciona em Português, Inglês, Espanhol e Francês. Os espelhos adaptam-se ao teu idioma preferido.',
        },
        {
          q: 'Posso cancelar quando quiser?',
          a: 'Sim. Sem compromisso, sem perguntas. Os teus dados ficam disponíveis mesmo depois de cancelar.',
        },
        {
          q: 'Como é diferente do ChatGPT?',
          a: 'O ANIMA oferece uma jornada estruturada com 4 espelhos especializados que lembram os teus insights e constroem sobre conversas anteriores. Não é um chatbot genérico — é um sistema desenhado para autoconhecimento profundo.',
        },
        {
          q: 'Preciso do plano Premium?',
          a: 'Podes começar gratuitamente com o espelho SOMA. O Premium desbloqueia os 3 espelhos adicionais e conversas ilimitadas para uma jornada completa.',
        },
      ],
    },
    finalCta: {
      title: 'Começa a tua jornada hoje',
      subtitle:
        'Junta-te a centenas de pessoas que estão a descobrir-se através de conversas profundas.',
      button: 'Começar Grátis — Sem Cartão',
      urgency: 'Beta aberta com vagas limitadas',
    },
    footer: {
      disclaimer:
        'O ANIMA não substitui terapia profissional. Se precisas de ajuda, procura um profissional de saúde mental.',
      copyright: '© 2026 ANIMA. Todos os direitos reservados.',
      privacy: 'Privacidade',
      terms: 'Termos',
    },
  },

  en: {
    nav: {
      howItWorks: 'How It Works',
      mirrors: 'Mirrors',
      pricing: 'Pricing',
      faq: 'FAQ',
      login: 'Log In',
      start: 'Start Free',
    },
    hero: {
      badge: 'Open Beta — Limited Spots',
      title1: 'Discover who you are',
      titleHighlight: 'through deep conversations',
      subtitle:
        'A structured self-discovery journey with 4 AI mirrors. Each guides you through a different dimension of your growth — body, mind, consciousness, and integration.',
      cta: 'Start My Journey — Free',
      ctaSecondary: 'See How It Works',
      stat1: '4',
      stat1Label: 'AI Mirrors',
      stat2: '4',
      stat2Label: 'Languages',
      stat3: '∞',
      stat3Label: 'Depth',
    },
    socialProof: {
      title: 'What early users are saying',
      testimonials: [
        {
          quote:
            "SOMA helped me notice emotional patterns I'd never seen before. It's like having a mirror that truly sees.",
          author: 'Ana R.',
          role: 'Beta User',
        },
        {
          quote:
            'The progression between mirrors makes all the difference. Each conversation builds on the last.',
          author: 'Marco S.',
          role: 'Beta User',
        },
        {
          quote:
            "Finally something that's neither therapy nor a generic chatbot. ANIMA found the perfect balance.",
          author: 'Sofia L.',
          role: 'Beta User',
        },
      ],
    },
    howItWorks: {
      title: 'How It Works',
      subtitle: 'A progressive journey designed for real depth',
      steps: [
        {
          title: 'Start with SOMA',
          description:
            'Explore your relationship with body and emotional foundations. SOMA remembers each insight to build upon them.',
        },
        {
          title: 'Progress to SEREN',
          description:
            "Work through anxiety and emotional regulation. SEREN uses SOMA's patterns to go deeper.",
        },
        {
          title: 'Expand with LUMA',
          description:
            'Question limiting beliefs and expand your consciousness. LUMA connects insights from previous mirrors.',
        },
        {
          title: 'Integrate with ECHO',
          description:
            'Identify patterns echoing through your life and integrate the entire journey into a unified vision.',
        },
      ],
    },
    mirrors: {
      title: 'The 4 Mirrors',
      subtitle:
        'Each mirror specializes in a dimension of your growth. The AI remembers, connects, and deepens.',
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
      title: 'Simple, Transparent Pricing',
      subtitle: "Start free. Upgrade when you're ready.",
      urgency: 'Launch price — increasing soon',
      free: {
        name: 'Free',
        price: '€0',
        period: '/month',
        features: [
          '10 conversations per month',
          'Full SOMA mirror',
          '30-day history',
          'Pattern dashboard',
          '4-language support',
        ],
        cta: 'Start Free',
      },
      premium: {
        name: 'Premium',
        price: '€9',
        period: '/month',
        oldPrice: '€19',
        badge: 'Launch Price',
        features: [
          'Unlimited conversations',
          'All 4 Mirrors',
          'Unlimited history',
          'Cross-mirror insights',
          'Export conversations',
          'Guided journeys',
          'Priority support',
        ],
        cta: 'Start Premium',
      },
      guarantee: 'Cancel anytime. No commitment.',
    },
    faq: {
      title: 'Frequently Asked Questions',
      items: [
        {
          q: 'Is ANIMA therapy?',
          a: 'No. ANIMA is a structured self-discovery tool. It does not replace professional support. If you need help, please seek a mental health professional.',
        },
        {
          q: 'Is my data safe?',
          a: 'Yes. Your conversations are encrypted and never shared. We use Supabase with enterprise-grade security. You can export or delete your data anytime.',
        },
        {
          q: 'What languages does it support?',
          a: 'ANIMA works in Portuguese, English, Spanish, and French. The mirrors adapt to your preferred language.',
        },
        {
          q: 'Can I cancel anytime?',
          a: 'Yes. No commitment, no questions asked. Your data remains available even after cancellation.',
        },
        {
          q: 'How is it different from ChatGPT?',
          a: "ANIMA offers a structured journey with 4 specialized mirrors that remember your insights and build on previous conversations. It's not a generic chatbot — it's a system designed for deep self-discovery.",
        },
        {
          q: 'Do I need Premium?',
          a: 'You can start for free with the SOMA mirror. Premium unlocks the 3 additional mirrors and unlimited conversations for a complete journey.',
        },
      ],
    },
    finalCta: {
      title: 'Start your journey today',
      subtitle:
        'Join hundreds of people discovering themselves through deep conversations.',
      button: 'Start Free — No Card Required',
      urgency: 'Open beta with limited spots',
    },
    footer: {
      disclaimer:
        'ANIMA does not replace professional therapy. If you need help, please seek a mental health professional.',
      copyright: '© 2026 ANIMA. All rights reserved.',
      privacy: 'Privacy',
      terms: 'Terms',
    },
  },

  es: {
    nav: {
      howItWorks: 'Cómo Funciona',
      mirrors: 'Espejos',
      pricing: 'Precios',
      faq: 'FAQ',
      login: 'Entrar',
      start: 'Empezar Gratis',
    },
    hero: {
      badge: 'Beta Abierta — Plazas Limitadas',
      title1: 'Descubre quién eres',
      titleHighlight: 'a través de conversaciones profundas',
      subtitle:
        'Un viaje estructurado de autoconocimiento con 4 espejos de IA. Cada uno te guía en una dimensión diferente de tu crecimiento — cuerpo, mente, consciencia e integración.',
      cta: 'Empezar Mi Viaje — Gratis',
      ctaSecondary: 'Ver Cómo Funciona',
      stat1: '4',
      stat1Label: 'Espejos de IA',
      stat2: '4',
      stat2Label: 'Idiomas',
      stat3: '∞',
      stat3Label: 'Profundidad',
    },
    socialProof: {
      title: 'Lo que dicen los primeros usuarios',
      testimonials: [
        {
          quote:
            'SOMA me ayudó a notar patrones emocionales que nunca había visto. Es como tener un espejo que realmente ve.',
          author: 'Ana R.',
          role: 'Usuaria Beta',
        },
        {
          quote:
            'La progresión entre espejos marca toda la diferencia. Cada conversación construye sobre la anterior.',
          author: 'Marco S.',
          role: 'Usuario Beta',
        },
        {
          quote:
            'Finalmente algo que no es terapia ni un chatbot genérico. ANIMA encontró el equilibrio perfecto.',
          author: 'Sofia L.',
          role: 'Usuaria Beta',
        },
      ],
    },
    howItWorks: {
      title: 'Cómo Funciona',
      subtitle: 'Un viaje progresivo diseñado para profundidad real',
      steps: [
        {
          title: 'Empieza con SOMA',
          description:
            'Explora tu relación con el cuerpo y fundaciones emocionales. SOMA recuerda cada insight para construir sobre ellos.',
        },
        {
          title: 'Progresa a SEREN',
          description:
            'Trabaja ansiedad y regulación emocional. SEREN usa los patrones de SOMA para ir más profundo.',
        },
        {
          title: 'Expande con LUMA',
          description:
            'Cuestiona creencias limitantes y expande tu consciencia. LUMA conecta insights de los espejos anteriores.',
        },
        {
          title: 'Integra con ECHO',
          description:
            'Identifica patrones que resuenan en tu vida e integra todo el viaje en una visión unificada.',
        },
      ],
    },
    mirrors: {
      title: 'Los 4 Espejos',
      subtitle:
        'Cada espejo se especializa en una dimensión de tu crecimiento. La IA recuerda, conecta y profundiza.',
      phases: {
        foundation: 'Fundación',
        regulation: 'Regulación',
        expansion: 'Expansión',
        integration: 'Integración',
      },
      free: 'Gratis',
      premium: 'Premium',
    },
    pricing: {
      title: 'Precio Simple, Transparente',
      subtitle: 'Empieza gratis. Mejora cuando estés listo.',
      urgency: 'Precio de lanzamiento — aumenta pronto',
      free: {
        name: 'Gratis',
        price: '€0',
        period: '/mes',
        features: [
          '10 conversaciones al mes',
          'Espejo SOMA completo',
          'Historial de 30 días',
          'Dashboard de patrones',
          'Soporte en 4 idiomas',
        ],
        cta: 'Empezar Gratis',
      },
      premium: {
        name: 'Premium',
        price: '€9',
        period: '/mes',
        oldPrice: '€19',
        badge: 'Precio de Lanzamiento',
        features: [
          'Conversaciones ilimitadas',
          'Los 4 Espejos',
          'Historial ilimitado',
          'Insights cross-mirror',
          'Exportar conversaciones',
          'Viajes guiados',
          'Soporte prioritario',
        ],
        cta: 'Empezar Premium',
      },
      guarantee: 'Cancela cuando quieras. Sin compromiso.',
    },
    faq: {
      title: 'Preguntas Frecuentes',
      items: [
        {
          q: '¿ANIMA es terapia?',
          a: 'No. ANIMA es una herramienta de autoconocimiento estructurado. No sustituye acompañamiento profesional. Si necesitas ayuda, busca un profesional de salud mental.',
        },
        {
          q: '¿Mis datos están seguros?',
          a: 'Sí. Tus conversaciones están encriptadas y nunca se comparten. Usamos Supabase con seguridad de nivel empresarial. Puedes exportar o borrar tus datos en cualquier momento.',
        },
        {
          q: '¿En qué idiomas funciona?',
          a: 'ANIMA funciona en Portugués, Inglés, Español y Francés. Los espejos se adaptan a tu idioma preferido.',
        },
        {
          q: '¿Puedo cancelar cuando quiera?',
          a: 'Sí. Sin compromiso, sin preguntas. Tus datos permanecen disponibles incluso después de cancelar.',
        },
        {
          q: '¿Cómo es diferente de ChatGPT?',
          a: 'ANIMA ofrece un viaje estructurado con 4 espejos especializados que recuerdan tus insights y construyen sobre conversaciones anteriores. No es un chatbot genérico — es un sistema diseñado para autoconocimiento profundo.',
        },
        {
          q: '¿Necesito el plan Premium?',
          a: 'Puedes empezar gratis con el espejo SOMA. Premium desbloquea los 3 espejos adicionales y conversaciones ilimitadas para un viaje completo.',
        },
      ],
    },
    finalCta: {
      title: 'Empieza tu viaje hoy',
      subtitle:
        'Únete a cientos de personas descubriéndose a través de conversaciones profundas.',
      button: 'Empezar Gratis — Sin Tarjeta',
      urgency: 'Beta abierta con plazas limitadas',
    },
    footer: {
      disclaimer:
        'ANIMA no sustituye terapia profesional. Si necesitas ayuda, busca un profesional de salud mental.',
      copyright: '© 2026 ANIMA. Todos los derechos reservados.',
      privacy: 'Privacidad',
      terms: 'Términos',
    },
  },

  fr: {
    nav: {
      howItWorks: 'Comment ça marche',
      mirrors: 'Miroirs',
      pricing: 'Tarifs',
      faq: 'FAQ',
      login: 'Connexion',
      start: 'Commencer Gratuit',
    },
    hero: {
      badge: 'Bêta Ouverte — Places Limitées',
      title1: 'Découvrez qui vous êtes',
      titleHighlight: 'à travers des conversations profondes',
      subtitle:
        "Un parcours structuré de découverte de soi avec 4 miroirs d'IA. Chacun vous guide dans une dimension différente de votre croissance — corps, esprit, conscience et intégration.",
      cta: 'Commencer Mon Parcours — Gratuit',
      ctaSecondary: 'Voir Comment ça Marche',
      stat1: '4',
      stat1Label: "Miroirs d'IA",
      stat2: '4',
      stat2Label: 'Langues',
      stat3: '∞',
      stat3Label: 'Profondeur',
    },
    socialProof: {
      title: 'Ce que disent les premiers utilisateurs',
      testimonials: [
        {
          quote:
            "SOMA m'a aidé à remarquer des schémas émotionnels que je n'avais jamais vus. C'est comme avoir un miroir qui voit vraiment.",
          author: 'Ana R.',
          role: 'Utilisatrice Bêta',
        },
        {
          quote:
            'La progression entre les miroirs fait toute la différence. Chaque conversation construit sur la précédente.',
          author: 'Marco S.',
          role: 'Utilisateur Bêta',
        },
        {
          quote:
            "Enfin quelque chose qui n'est ni thérapie ni chatbot générique. ANIMA a trouvé l'équilibre parfait.",
          author: 'Sofia L.',
          role: 'Utilisatrice Bêta',
        },
      ],
    },
    howItWorks: {
      title: 'Comment ça Marche',
      subtitle: 'Un parcours progressif conçu pour une profondeur réelle',
      steps: [
        {
          title: 'Commencez avec SOMA',
          description:
            "Explorez votre relation avec le corps et les fondations émotionnelles. SOMA se souvient de chaque insight pour construire dessus.",
        },
        {
          title: 'Progressez vers SEREN',
          description:
            "Travaillez l'anxiété et la régulation émotionnelle. SEREN utilise les schémas de SOMA pour aller plus profond.",
        },
        {
          title: 'Élargissez avec LUMA',
          description:
            'Questionnez les croyances limitantes et élargissez votre conscience. LUMA connecte les insights des miroirs précédents.',
        },
        {
          title: 'Intégrez avec ECHO',
          description:
            'Identifiez les schémas qui résonnent dans votre vie et intégrez tout le parcours en une vision unifiée.',
        },
      ],
    },
    mirrors: {
      title: 'Les 4 Miroirs',
      subtitle:
        "Chaque miroir est spécialisé dans une dimension de votre croissance. L'IA se souvient, connecte et approfondit.",
      phases: {
        foundation: 'Fondation',
        regulation: 'Régulation',
        expansion: 'Expansion',
        integration: 'Intégration',
      },
      free: 'Gratuit',
      premium: 'Premium',
    },
    pricing: {
      title: 'Tarification Simple, Transparente',
      subtitle: 'Commencez gratuitement. Évoluez quand vous êtes prêt.',
      urgency: 'Prix de lancement — augmente bientôt',
      free: {
        name: 'Gratuit',
        price: '€0',
        period: '/mois',
        features: [
          '10 conversations par mois',
          'Miroir SOMA complet',
          'Historique de 30 jours',
          'Dashboard de schémas',
          'Support 4 langues',
        ],
        cta: 'Commencer Gratuit',
      },
      premium: {
        name: 'Premium',
        price: '€9',
        period: '/mois',
        oldPrice: '€19',
        badge: 'Prix de Lancement',
        features: [
          'Conversations illimitées',
          'Les 4 Miroirs',
          'Historique illimité',
          'Insights cross-miroir',
          'Exporter conversations',
          'Parcours guidés',
          'Support prioritaire',
        ],
        cta: 'Commencer Premium',
      },
      guarantee: 'Annulez à tout moment. Sans engagement.',
    },
    faq: {
      title: 'Questions Fréquentes',
      items: [
        {
          q: 'ANIMA est-il une thérapie ?',
          a: "Non. ANIMA est un outil structuré de découverte de soi. Il ne remplace pas un suivi professionnel. Si vous avez besoin d'aide, consultez un professionnel de santé mentale.",
        },
        {
          q: 'Mes données sont-elles sécurisées ?',
          a: 'Oui. Vos conversations sont chiffrées et jamais partagées. Nous utilisons Supabase avec une sécurité de niveau entreprise. Vous pouvez exporter ou supprimer vos données à tout moment.',
        },
        {
          q: 'Quelles langues sont supportées ?',
          a: "ANIMA fonctionne en Portugais, Anglais, Espagnol et Français. Les miroirs s'adaptent à votre langue préférée.",
        },
        {
          q: 'Puis-je annuler quand je veux ?',
          a: 'Oui. Sans engagement, sans questions. Vos données restent disponibles même après annulation.',
        },
        {
          q: 'En quoi est-ce différent de ChatGPT ?',
          a: "ANIMA offre un parcours structuré avec 4 miroirs spécialisés qui se souviennent de vos insights et construisent sur les conversations précédentes. Ce n'est pas un chatbot générique — c'est un système conçu pour la découverte de soi profonde.",
        },
        {
          q: 'Ai-je besoin du plan Premium ?',
          a: 'Vous pouvez commencer gratuitement avec le miroir SOMA. Premium débloque les 3 miroirs supplémentaires et des conversations illimitées pour un parcours complet.',
        },
      ],
    },
    finalCta: {
      title: "Commencez votre parcours aujourd'hui",
      subtitle:
        'Rejoignez des centaines de personnes qui se découvrent à travers des conversations profondes.',
      button: 'Commencer Gratuit — Sans Carte',
      urgency: 'Bêta ouverte avec places limitées',
    },
    footer: {
      disclaimer:
        "ANIMA ne remplace pas une thérapie professionnelle. Si vous avez besoin d'aide, consultez un professionnel de santé mentale.",
      copyright: '© 2026 ANIMA. Tous droits réservés.',
      privacy: 'Confidentialité',
      terms: 'Conditions',
    },
  },
}
