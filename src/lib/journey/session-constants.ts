import type { MirrorSlug, Language } from '@/types/database'

export const RITUAL_CONTENT: Record<MirrorSlug, Record<Language, string>> = {
  soma: {
    pt: 'Coloca uma mão no peito. Sente o teu corpo presente.',
    en: 'Place a hand on your chest. Feel your body present.',
    es: 'Pon una mano en el pecho. Siente tu cuerpo presente.',
    fr: 'Pose une main sur ta poitrine. Sens ton corps présent.',
  },
  seren: {
    pt: 'Fecha os olhos por um momento. O que sentes agora?',
    en: 'Close your eyes for a moment. What do you feel now?',
    es: 'Cierra los ojos un momento. Qué sientes ahora?',
    fr: 'Ferme les yeux un instant. Que ressens-tu maintenant?',
  },
  luma: {
    pt: 'Respira. Abre espaço para o que vier.',
    en: 'Breathe. Make space for whatever comes.',
    es: 'Respira. Abre espacio para lo que venga.',
    fr: 'Respire. Ouvre l\'espace pour ce qui viendra.',
  },
  echo: {
    pt: 'Recorda o caminho até aqui. Estás pronta.',
    en: 'Remember the path here. You are ready.',
    es: 'Recuerda el camino hasta aquí. Estás lista.',
    fr: 'Souviens-toi du chemin. Tu es prête.',
  },
  nexus: {
    pt: 'Pensa em alguém importante. O que sentes?',
    en: 'Think of someone important. What do you feel?',
    es: 'Piensa en alguien importante. ¿Qué sientes?',
    fr: 'Pense à quelqu\'un d\'important. Que ressens-tu?',
  },
}
