import type { MirrorSlug, Language } from '@/types/database'

export interface MirrorConfig {
  slug: MirrorSlug
  name: string
  icon: string
  logo: string
  color: string
  phase: string
  isPremium: boolean
  requiredTier?: string
  order: number
  descriptions: Record<Language, string>
}

export const MIRRORS: Record<MirrorSlug, MirrorConfig> = {
  soma: {
    slug: 'soma',
    name: 'SOMA',
    icon: '🌱',
    logo: '/logos/soma-logo.png',
    color: '#10b981',
    phase: 'foundation',
    isPremium: false,
    order: 1,
    descriptions: {
      pt: 'Explora tua relação com corpo e nutrição emocional. Fundamenta-te no físico.',
      en: 'Explore your relationship with body and emotional nutrition. Ground yourself in the physical.',
      fr: 'Explorez votre relation avec le corps et la nutrition émotionnelle. Ancrez-vous dans le physique.',
      es: 'Explora tu relación con el cuerpo y la nutrición emocional. Fundamenta en lo físico.'
    }
  },
  seren: {
    slug: 'seren',
    name: 'SEREN',
    icon: '🌊',
    logo: '/logos/seren-logo.png',
    color: '#6366f1',
    phase: 'regulation',
    isPremium: true,
    order: 2,
    descriptions: {
      pt: 'Trabalha ansiedade, padrões de pensamento e regulação emocional.',
      en: 'Work through anxiety, thought patterns and emotional regulation.',
      fr: "Travaillez l'anxiété, les schémas de pensée et la régulation émotionnelle.",
      es: 'Trabaja ansiedad, patrones de pensamiento y regulación emocional.'
    }
  },
  luma: {
    slug: 'luma',
    name: 'LUMA',
    icon: '✨',
    logo: '/logos/luma-logo.png',
    color: '#f59e0b',
    phase: 'expansion',
    isPremium: true,
    order: 3,
    descriptions: {
      pt: 'Expande consciência e questiona as crenças que te limitam.',
      en: 'Expand consciousness and question the beliefs that limit you.',
      fr: 'Élargissez la conscience et questionnez les croyances qui vous limitent.',
      es: 'Expande la consciencia y cuestiona las creencias que te limitan.'
    }
  },
  echo: {
    slug: 'echo',
    name: 'ECHO',
    icon: '🔊',
    logo: '/logos/echo-logo.png',
    color: '#8b5cf6',
    phase: 'integration',
    isPremium: true,
    order: 4,
    descriptions: {
      pt: 'Identifica padrões que ecoam na tua vida e integra toda a jornada.',
      en: 'Identify patterns that echo through your life and integrate the entire journey.',
      fr: 'Identifiez les schémas qui résonnent dans votre vie et intégrez tout le parcours.',
      es: 'Identifica patrones que resuenan en tu vida e integra todo el viaje.'
    }
  },
  nexus: {
    slug: 'nexus',
    name: 'NEXUS',
    icon: '🔗',
    logo: '/logos/nexus-logo.png',
    color: '#ec4899',
    phase: 'relational',
    isPremium: true,
    requiredTier: 'relacional' as const,
    order: 5,
    descriptions: {
      pt: 'Explora os teus padrões relacionais — vinculação, comunicação, conflito e intimidade.',
      en: 'Explore your relational patterns — attachment, communication, conflict and intimacy.',
      fr: 'Explore tes schémas relationnels — attachement, communication, conflit et intimité.',
      es: 'Explora tus patrones relacionales — apego, comunicación, conflicto e intimidad.'
    }
  }
}

export const MIRROR_LIST = Object.values(MIRRORS).sort((a, b) => a.order - b.order)
