'use client'

import Image from 'next/image'
import { MIRRORS } from '@/lib/ai/mirrors'
import type { Language, MirrorSlug } from '@/types/database'

interface MilestoneInfo {
  id: string
  title: string
  description: string
  mirror_slug: MirrorSlug | null
}

interface MilestoneOverlayProps {
  milestone: MilestoneInfo
  language: Language
  onDismiss: () => void
}

export function MilestoneOverlay({ milestone, language, onDismiss }: MilestoneOverlayProps) {
  const mirror = milestone.mirror_slug ? MIRRORS[milestone.mirror_slug] : null
  const color = mirror?.color || '#9a7b50'

  const buttonLabel = {
    pt: 'Continuar jornada', en: 'Continue journey',
    es: 'Continuar viaje', fr: 'Continuer le voyage'
  }

  const marcoLabel = {
    pt: 'Marco alcançado', en: 'Milestone reached',
    es: 'Hito alcanzado', fr: 'Jalon atteint'
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center p-7"
      style={{ backgroundColor: 'rgba(221, 216, 207, 0.97)', animation: 'fadeIn 0.4s ease' }}
    >
      <div style={{ animation: 'scaleIn 0.6s cubic-bezier(0.34,1.56,0.64,1)' }}>
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-5 overflow-hidden"
          style={{
            backgroundColor: `${color}15`,
            boxShadow: `0 0 40px ${color}15`,
          }}
        >
          {mirror ? (
            <Image src={mirror.logo} alt={mirror.name} width={56} height={56} className="rounded-full" />
          ) : (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          )}
        </div>
      </div>

      <div
        className="text-[10px] font-semibold uppercase tracking-[0.14em] mb-2.5"
        style={{ color }}
      >
        {marcoLabel[language]}
      </div>

      <h2 className="text-xl font-heading text-center mb-2 leading-snug" style={{ color: '#2a2520' }}>
        {milestone.title}
      </h2>

      <p className="text-sm text-center max-w-xs leading-relaxed mb-7" style={{ color: '#7a746b' }}>
        {milestone.description}
      </p>

      <button
        onClick={onDismiss}
        className="px-7 py-2.5 rounded-full text-sm font-medium transition-all hover:opacity-90"
        style={{
          backgroundColor: '#e8e3da',
          color: '#2a2520',
          border: '1px solid #ccc7bc',
        }}
      >
        {buttonLabel[language]}
      </button>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.85) } to { opacity: 1; transform: scale(1) } }
      `}</style>
    </div>
  )
}
