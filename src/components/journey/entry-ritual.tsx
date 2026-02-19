'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import type { MirrorConfig } from '@/lib/ai/mirrors'
import type { Language } from '@/types/database'

interface EntryRitualProps {
  mirror: MirrorConfig
  sessionTitle: string
  ritualPrompt: string
  language: Language
  onEnter: () => void
  onSkip: () => void
}

export function EntryRitual({ mirror, sessionTitle, ritualPrompt, language, onEnter, onSkip }: EntryRitualProps) {
  const [step, setStep] = useState<'intro' | 'breathing' | 'ready'>('intro')
  const [breathCount, setBreathCount] = useState(0)

  useEffect(() => {
    if (step === 'breathing' && breathCount < 3) {
      const t = setTimeout(() => setBreathCount(c => c + 1), 4000)
      return () => clearTimeout(t)
    }
    if (step === 'breathing' && breathCount >= 3) {
      const t = setTimeout(() => setStep('ready'), 500)
      return () => clearTimeout(t)
    }
  }, [step, breathCount])

  const labels = {
    ritualTitle: {
      pt: 'Ritual de Entrada', en: 'Entry Ritual', es: 'Ritual de Entrada', fr: "Rituel d'Entrée"
    },
    present: {
      pt: 'Estou presente', en: 'I am present', es: 'Estoy presente', fr: 'Je suis présent(e)'
    },
    skip: {
      pt: 'Saltar ritual', en: 'Skip ritual', es: 'Saltar ritual', fr: 'Passer le rituel'
    },
    begin: {
      pt: 'Começar sessão', en: 'Begin session', es: 'Comenzar sesión', fr: 'Commencer la session'
    },
    ready: {
      pt: 'Estás aqui. Estás presente.', en: 'You are here. You are present.',
      es: 'Estás aquí. Estás presente.', fr: 'Tu es ici. Tu es présent(e).'
    },
    breathe: [
      { pt: 'Inspira profundamente...', en: 'Breathe in deeply...', es: 'Inspira profundamente...', fr: 'Inspire profondément...' },
      { pt: 'Expira devagar...', en: 'Breathe out slowly...', es: 'Expira despacio...', fr: 'Expire lentement...' },
      { pt: 'Mais uma vez...', en: 'Once more...', es: 'Una vez más...', fr: 'Encore une fois...' },
    ]
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-7"
      style={{ backgroundColor: 'rgba(221, 216, 207, 0.97)', animation: 'fadeIn 0.6s ease' }}
    >
      {/* Mirror orb */}
      <div
        className="rounded-full flex items-center justify-center mb-9 overflow-hidden transition-all duration-1000"
        style={{
          width: step === 'breathing' ? 140 : 90,
          height: step === 'breathing' ? 140 : 90,
          backgroundColor: `${mirror.color}15`,
          border: `2px solid ${mirror.color}30`,
          animation: step === 'breathing' ? 'breathe 4s ease-in-out infinite' : undefined,
        }}
      >
        <Image src={mirror.logo} alt={mirror.name} width={step === 'breathing' ? 80 : 52} height={step === 'breathing' ? 80 : 52} className="rounded-full" />
      </div>

      <div className="text-center max-w-sm">
        {/* Ritual title */}
        <div
          className="text-[10px] font-semibold uppercase tracking-[0.14em] mb-3"
          style={{ color: mirror.color }}
        >
          {labels.ritualTitle[language]}
        </div>

        {/* Session title */}
        <div className="text-xs mb-4" style={{ color: '#7a746b' }}>
          {sessionTitle}
        </div>

        {step === 'intro' && (
          <div style={{ animation: 'slideUp 0.5s ease' }}>
            <p className="text-lg font-heading leading-relaxed mb-3" style={{ color: '#2a2520' }}>
              {ritualPrompt}
            </p>
            <button
              onClick={() => setStep('breathing')}
              className="mt-6 px-8 py-3 rounded-full text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ backgroundColor: mirror.color }}
            >
              {labels.present[language]}
            </button>
            <div>
              <button
                onClick={onSkip}
                className="mt-3 px-4 py-2 text-xs border-none bg-transparent"
                style={{ color: '#9a947b', cursor: 'pointer' }}
              >
                {labels.skip[language]} &rarr;
              </button>
            </div>
          </div>
        )}

        {step === 'breathing' && (
          <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div className="flex gap-2 justify-center mb-4">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full transition-colors duration-500"
                  style={{
                    backgroundColor: i < breathCount ? mirror.color : '#ccc7bc'
                  }}
                />
              ))}
            </div>
            <p className="text-sm" style={{ color: '#7a746b' }}>
              {labels.breathe[Math.min(breathCount, 2)][language]}
            </p>
          </div>
        )}

        {step === 'ready' && (
          <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <p className="text-sm font-heading italic mb-6" style={{ color: '#5a554e' }}>
              {labels.ready[language]}
            </p>
            <button
              onClick={onEnter}
              className="px-8 py-3 rounded-full text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ backgroundColor: mirror.color }}
            >
              {labels.begin[language]}
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>
    </div>
  )
}
