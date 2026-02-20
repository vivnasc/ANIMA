import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MIRRORS } from '@/lib/ai/mirrors'
import { canAccessMirror } from '@/lib/journey/constants'
import Link from 'next/link'
import Image from 'next/image'
import type { Language, SubscriptionTier } from '@/types/database'

export default async function MirrorsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase
    .from('users')
    .select('subscription_tier, language_preference')
    .eq('id', user.id)
    .single()

  const { data: journey } = await supabase
    .from('user_journey')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const tier = (userData?.subscription_tier || 'free') as SubscriptionTier
  const lang = (userData?.language_preference || 'pt') as Language

  const mirrors = Object.values(MIRRORS).sort((a, b) => a.order - b.order)

  const phaseLabels: Record<string, Record<Language, string>> = {
    foundation: { pt: 'Fase 1: Fundação', en: 'Phase 1: Foundation', fr: 'Phase 1: Fondation', es: 'Fase 1: Fundación' },
    regulation: { pt: 'Fase 2: Regulação', en: 'Phase 2: Regulation', fr: 'Phase 2: Régulation', es: 'Fase 2: Regulación' },
    expansion: { pt: 'Fase 3: Expansão', en: 'Phase 3: Expansion', fr: 'Phase 3: Expansion', es: 'Fase 3: Expansión' },
    integration: { pt: 'Fase 4: Integração', en: 'Phase 4: Integration', fr: 'Phase 4: Intégration', es: 'Fase 4: Integración' },
    relational: { pt: 'Fase 5: Relacional', en: 'Phase 5: Relational', fr: 'Phase 5: Relationnel', es: 'Fase 5: Relacional' }
  }

  const tierLabels: Record<string, Record<Language, string>> = {
    essencial: { pt: 'Essencial', en: 'Essential', fr: 'Essentiel', es: 'Esencial' },
    relacional: { pt: 'Relacional', en: 'Relational', fr: 'Relationnel', es: 'Relacional' },
  }

  const conversationCounts: Record<string, number> = {
    soma: journey?.soma_conversations || 0,
    seren: journey?.seren_conversations || 0,
    luma: journey?.luma_conversations || 0,
    echo: journey?.echo_conversations || 0,
    nexus: (journey as Record<string, unknown>)?.nexus_conversations as number || 0,
  }

  const mirrorCount = mirrors.filter(m => canAccessMirror(tier, m.slug)).length

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 md:px-8 space-y-8">
      <div className="pt-8 md:pt-0">
        <h1 className="text-2xl md:text-3xl font-heading font-semibold" style={{ color: '#2a2520' }}>
          {lang === 'pt' ? `Os ${mirrorCount} Espelhos` :
           lang === 'fr' ? `Les ${mirrorCount} Miroirs` :
           lang === 'es' ? `Los ${mirrorCount} Espejos` :
           `The ${mirrorCount} Mirrors`}
        </h1>
        <p style={{ color: '#7a746b' }}>
          {lang === 'pt' ? 'Cada espelho representa uma fase da tua jornada de autoconhecimento' :
           lang === 'fr' ? 'Chaque miroir représente une phase de votre parcours de connaissance de soi' :
           lang === 'es' ? 'Cada espejo representa una fase de tu viaje de autoconocimiento' :
           'Each mirror represents a phase of your self-discovery journey'}
        </p>
      </div>

      {/* Journey Flow */}
      <div className="flex items-center justify-center gap-3 py-2 flex-wrap">
        {mirrors.map((mirror, i) => (
          <div key={mirror.slug} className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Image src={mirror.logo} alt={mirror.name} width={24} height={24} className="rounded" />
              <span className="text-sm font-medium" style={{ color: canAccessMirror(tier, mirror.slug) ? mirror.color : '#a89f94' }}>{mirror.name}</span>
            </div>
            {i < mirrors.length - 1 && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ccc7bc" strokeWidth="2" strokeLinecap="round">
                <polyline points="9,6 15,12 9,18" />
              </svg>
            )}
          </div>
        ))}
      </div>

      {/* Mirror Cards */}
      <div className="space-y-4">
        {mirrors.map((mirror) => {
          const locked = !canAccessMirror(tier, mirror.slug)
          const convCount = conversationCounts[mirror.slug] || 0
          const requiredTier = mirror.requiredTier || (mirror.isPremium ? 'essencial' : null)

          return (
            <div
              key={mirror.slug}
              className="rounded-2xl overflow-hidden"
              style={{
                backgroundColor: '#f0ece6',
                border: '1px solid #ccc7bc',
                borderLeftWidth: '4px',
                borderLeftColor: locked ? '#a89f94' : mirror.color,
                opacity: locked ? 0.7 : 1
              }}
            >
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center overflow-hidden shrink-0"
                      style={{ backgroundColor: `${mirror.color}15` }}
                    >
                      <Image src={mirror.logo} alt={mirror.name} width={40} height={40} className="rounded-full" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-lg font-heading font-bold" style={{ color: mirror.color }}>
                          {mirror.name}
                        </h2>
                        <span className="text-xs" style={{ color: '#7a746b' }}>
                          {phaseLabels[mirror.phase]?.[lang] || mirror.phase}
                        </span>
                        {locked && requiredTier && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: '#e8e3da', color: '#7a746b' }}>
                            {tierLabels[requiredTier]?.[lang] || requiredTier}
                          </span>
                        )}
                      </div>
                      <p className="text-sm mt-1" style={{ color: '#5a554e' }}>
                        {mirror.descriptions[lang]}
                      </p>
                      {convCount > 0 && (
                        <p className="text-xs mt-2" style={{ color: '#7a746b' }}>
                          {convCount} {lang === 'pt' ? 'conversas' :
                                       lang === 'fr' ? 'conversations' :
                                       lang === 'es' ? 'conversaciones' :
                                       'conversations'}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0">
                    {locked ? (
                      <Link
                        href="/settings"
                        className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
                        style={{ backgroundColor: '#e8e3da', color: '#7a746b' }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                        Upgrade
                      </Link>
                    ) : (
                      <Link
                        href={`/chat/${mirror.slug}`}
                        className="inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-medium text-white transition-all hover:opacity-90"
                        style={{ backgroundColor: mirror.color }}
                      >
                        {lang === 'pt' ? 'Conversar' :
                         lang === 'fr' ? 'Parler' :
                         lang === 'es' ? 'Conversar' :
                         'Start'}
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12,5 19,12 12,19" />
                        </svg>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
