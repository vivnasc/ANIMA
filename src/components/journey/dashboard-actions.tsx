'use client'

import { useState } from 'react'
import type { Language } from '@/types/database'

interface DashboardActionsProps {
  language: Language
  journeyComplete: boolean
}

export function DashboardActions({ language, journeyComplete }: DashboardActionsProps) {
  const [restarting, setRestarting] = useState(false)
  const [restartDone, setRestartDone] = useState(false)

  const labels = {
    exportDiary: {
      pt: 'Exportar diário', en: 'Export diary', es: 'Exportar diario', fr: 'Exporter journal'
    },
    restartJourney: {
      pt: 'Recomeçar jornada', en: 'Restart journey', es: 'Reiniciar viaje', fr: 'Recommencer le voyage'
    },
    restartConfirm: {
      pt: 'Tens a certeza? A jornada recomeça do início.',
      en: 'Are you sure? The journey restarts from the beginning.',
      es: '¿Estás seguro? El viaje se reinicia desde el principio.',
      fr: 'Es-tu sûr(e) ? Le voyage recommence depuis le début.'
    },
    restartDone: {
      pt: 'Jornada reiniciada. Novos olhos, novas descobertas.',
      en: 'Journey restarted. New eyes, new discoveries.',
      es: 'Viaje reiniciado. Nuevos ojos, nuevos descubrimientos.',
      fr: 'Voyage recommencé. Nouveaux yeux, nouvelles découvertes.'
    },
    yes: { pt: 'Sim, recomeçar', en: 'Yes, restart', es: 'Sí, reiniciar', fr: 'Oui, recommencer' },
    cancel: { pt: 'Cancelar', en: 'Cancel', es: 'Cancelar', fr: 'Annuler' }
  }

  const handleExport = () => {
    window.open(`/api/export/diary?lang=${language}`, '_blank')
  }

  const handleRestart = async () => {
    if (!confirm(labels.restartConfirm[language])) return

    setRestarting(true)
    try {
      const res = await fetch('/api/journey/restart', { method: 'POST' })
      if (res.ok) {
        setRestartDone(true)
        setTimeout(() => window.location.reload(), 1500)
      }
    } catch {
      // ignore
    } finally {
      setRestarting(false)
    }
  }

  if (restartDone) {
    return (
      <div className="text-center p-4">
        <p className="text-sm font-heading italic" style={{ color: '#9a7b50' }}>
          {labels.restartDone[language]}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={handleExport}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-90"
        style={{ backgroundColor: '#e8e3da', color: '#2a2520', border: '1px solid #ccc7bc' }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        {labels.exportDiary[language]}
      </button>

      {journeyComplete && (
        <button
          onClick={handleRestart}
          disabled={restarting}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: '#f0ece6', color: '#7a746b', border: '1px solid #ccc7bc' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
          {labels.restartJourney[language]}
        </button>
      )}
    </div>
  )
}
