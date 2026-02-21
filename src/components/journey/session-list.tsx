'use client'

import Image from 'next/image'
import type { MirrorConfig } from '@/lib/ai/mirrors'
import type { Language } from '@/types/database'

interface SessionInfo {
  session_number: number
  status: 'locked' | 'available' | 'in_progress' | 'completed'
  title: string
  subtitle: string
  estimated_minutes: number
}

interface SessionListProps {
  mirror: MirrorConfig
  sessions: SessionInfo[]
  language: Language
  onSelectSession: (sessionNumber: number) => void
}

export function SessionList({ mirror, sessions, language, onSelectSession }: SessionListProps) {
  const completedCount = sessions.filter(s => s.status === 'completed').length
  const totalCount = sessions.length || 7
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const phaseLabels: Record<string, Record<Language, string>> = {
    foundation: { pt: 'Fundação', en: 'Foundation', fr: 'Fondation', es: 'Fundación' },
    regulation: { pt: 'Regulação', en: 'Regulation', fr: 'Régulation', es: 'Regulación' },
    expansion: { pt: 'Expansão', en: 'Expansion', fr: 'Expansion', es: 'Expansión' },
    integration: { pt: 'Integração', en: 'Integration', fr: 'Intégration', es: 'Integración' }
  }

  return (
    <div className="max-w-lg mx-auto py-8 px-4 space-y-6">
      {/* Mirror Header */}
      <div className="flex items-center gap-4">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center overflow-hidden shrink-0"
          style={{ backgroundColor: `${mirror.color}15` }}
        >
          <Image src={mirror.logo} alt={mirror.name} width={40} height={40} className="rounded-full" />
        </div>
        <div>
          <h1 className="text-xl font-heading font-semibold" style={{ color: mirror.color }}>
            {mirror.name}
          </h1>
          <p className="text-sm" style={{ color: '#7a746b' }}>
            {phaseLabels[mirror.phase]?.[language] || mirror.phase} &middot; {completedCount} de {totalCount}{' '}
            {language === 'pt' ? 'sessões completas' :
             language === 'es' ? 'sesiones completas' :
             language === 'fr' ? 'sessions complètes' :
             'sessions completed'}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="rounded-xl p-4" style={{ backgroundColor: '#f0ece6', border: '1px solid #ccc7bc' }}>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-medium" style={{ color: '#7a746b' }}>
            {language === 'pt' ? 'Progresso' : language === 'es' ? 'Progreso' : language === 'fr' ? 'Progression' : 'Progress'}
          </span>
          <span className="text-xs font-semibold" style={{ color: mirror.color }}>{progressPercent}%</span>
        </div>
        <div className="h-2 rounded-full" style={{ backgroundColor: '#e8e3da' }}>
          <div
            className="h-2 rounded-full transition-all duration-700"
            style={{ width: `${progressPercent}%`, backgroundColor: mirror.color }}
          />
        </div>
      </div>

      {/* Session Cards */}
      <div className="space-y-2">
        {sessions.map((session) => {
          const isLocked = session.status === 'locked'
          const isCompleted = session.status === 'completed'
          const isCurrent = session.status === 'available' || session.status === 'in_progress'

          return (
            <button
              key={session.session_number}
              onClick={() => !isLocked && onSelectSession(session.session_number)}
              disabled={isLocked}
              className="w-full text-left rounded-xl p-4 transition-all"
              style={{
                backgroundColor: isCurrent ? '#f0ece6' : isCompleted ? '#f0ece6' : '#f5f2ed',
                border: isCurrent
                  ? `2px solid ${mirror.color}40`
                  : '1px solid #e8e3da',
                opacity: isLocked ? 0.45 : 1,
                cursor: isLocked ? 'default' : 'pointer',
              }}
            >
              <div className="flex items-center gap-3">
                {/* Number/Status */}
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-sm font-semibold"
                  style={{
                    backgroundColor: isCompleted
                      ? `${mirror.color}20`
                      : isCurrent
                      ? mirror.color
                      : '#e8e3da',
                    color: isCompleted
                      ? mirror.color
                      : isCurrent
                      ? '#fff'
                      : '#7a746b',
                  }}
                >
                  {isCompleted ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20,6 9,17 4,12" />
                    </svg>
                  ) : isLocked ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  ) : (
                    session.session_number
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div
                    className="text-sm font-medium"
                    style={{ color: isCurrent ? '#2a2520' : isCompleted ? '#5a554e' : '#7a746b' }}
                  >
                    {session.title}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: '#9a947b' }}>
                    {session.subtitle}
                  </div>
                </div>

                {/* Duration & Status Dot */}
                <div className="shrink-0 flex items-center gap-2">
                  {!isLocked && (
                    <span className="text-[10px]" style={{ color: '#9a947b' }}>
                      ~{session.estimated_minutes}min
                    </span>
                  )}
                  {isCurrent && (
                    <div
                      className="w-2 h-2 rounded-full animate-pulse"
                      style={{ backgroundColor: mirror.color }}
                    />
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
