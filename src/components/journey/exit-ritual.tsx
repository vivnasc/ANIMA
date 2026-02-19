'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { MirrorConfig } from '@/lib/ai/mirrors'
import type { Language } from '@/types/database'

interface ExitRitualProps {
  mirror: MirrorConfig
  language: Language
  onSaveInsight: (insight: string) => void
  onSkip: () => void
}

export function ExitRitual({ mirror, language, onSaveInsight, onSkip }: ExitRitualProps) {
  const [insight, setInsight] = useState('')

  const labels = {
    ritualTitle: {
      pt: 'Ritual de Saída', en: 'Exit Ritual', es: 'Ritual de Salida', fr: 'Rituel de Sortie'
    },
    question: {
      pt: 'O que levas desta conversa?', en: 'What do you take from this conversation?',
      es: '¿Qué te llevas de esta conversación?', fr: 'Que retiens-tu de cette conversation?'
    },
    subtitle: {
      pt: 'Captura uma frase, um sentimento, uma descoberta.',
      en: 'Capture a phrase, a feeling, a discovery.',
      es: 'Captura una frase, un sentimiento, un descubrimiento.',
      fr: 'Capture une phrase, un sentiment, une découverte.'
    },
    placeholder: {
      pt: 'Hoje percebi que...', en: 'Today I realized that...',
      es: 'Hoy me di cuenta de que...', fr: "Aujourd'hui j'ai réalisé que..."
    },
    save: {
      pt: 'Guardar insight', en: 'Save insight', es: 'Guardar insight', fr: 'Sauvegarder l\'insight'
    },
    skip: {
      pt: 'Saltar', en: 'Skip', es: 'Saltar', fr: 'Passer'
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-7"
      style={{ backgroundColor: 'rgba(221, 216, 207, 0.97)', animation: 'fadeIn 0.6s ease' }}
    >
      {/* Mirror orb */}
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-7 overflow-hidden"
        style={{ backgroundColor: `${mirror.color}15`, border: `2px solid ${mirror.color}20` }}
      >
        <Image src={mirror.logo} alt={mirror.name} width={36} height={36} className="rounded-full" />
      </div>

      <div className="text-center max-w-sm w-full">
        <div
          className="text-[10px] font-semibold uppercase tracking-[0.14em] mb-3"
          style={{ color: mirror.color }}
        >
          {labels.ritualTitle[language]}
        </div>

        <h2 className="text-lg font-heading leading-relaxed mb-1.5" style={{ color: '#2a2520' }}>
          {labels.question[language]}
        </h2>
        <p className="text-sm mb-5" style={{ color: '#7a746b' }}>
          {labels.subtitle[language]}
        </p>

        <textarea
          value={insight}
          onChange={e => setInsight(e.target.value)}
          placeholder={labels.placeholder[language]}
          rows={3}
          className="w-full rounded-xl px-4 py-3 text-sm font-heading resize-none focus:outline-none focus:ring-2"
          style={{
            backgroundColor: '#f0ece6',
            border: `1px solid ${mirror.color}30`,
            color: '#2a2520',
            lineHeight: 1.6,
          }}
        />

        <div className="flex gap-3 mt-5 w-full">
          <button
            onClick={onSkip}
            className="flex-1 py-3 rounded-full text-xs font-medium transition-colors"
            style={{
              backgroundColor: '#e8e3da',
              color: '#7a746b',
              border: '1px solid #ccc7bc',
            }}
          >
            {labels.skip[language]}
          </button>
          <button
            onClick={() => onSaveInsight(insight)}
            disabled={!insight.trim()}
            className="flex-[2] py-3 rounded-full text-xs font-semibold text-white transition-all"
            style={{
              backgroundColor: insight.trim() ? mirror.color : '#ccc7bc',
              opacity: insight.trim() ? 1 : 0.5,
              cursor: insight.trim() ? 'pointer' : 'default',
            }}
          >
            {labels.save[language]}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
      `}</style>
    </div>
  )
}
