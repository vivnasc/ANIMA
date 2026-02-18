import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MIRRORS } from '@/lib/ai/mirrors'
import Link from 'next/link'
import type { Language } from '@/types/database'

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

  const isPremium = userData?.subscription_tier === 'premium'
  const lang = (userData?.language_preference || 'pt') as Language

  const mirrors = Object.values(MIRRORS).sort((a, b) => a.order - b.order)

  const phaseLabels: Record<string, Record<Language, string>> = {
    foundation: { pt: 'Fase 1: Fundação', en: 'Phase 1: Foundation', fr: 'Phase 1: Fondation', es: 'Fase 1: Fundación' },
    regulation: { pt: 'Fase 2: Regulação', en: 'Phase 2: Regulation', fr: 'Phase 2: Régulation', es: 'Fase 2: Regulación' },
    expansion: { pt: 'Fase 3: Expansão', en: 'Phase 3: Expansion', fr: 'Phase 3: Expansion', es: 'Fase 3: Expansión' },
    integration: { pt: 'Fase 4: Integração', en: 'Phase 4: Integration', fr: 'Phase 4: Intégration', es: 'Fase 4: Integración' }
  }

  const conversationCounts: Record<string, number> = {
    soma: journey?.soma_conversations || 0,
    seren: journey?.seren_conversations || 0,
    luma: journey?.luma_conversations || 0,
    echo: journey?.echo_conversations || 0
  }

  return (
    <div className="container max-w-4xl py-8 px-4 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">
          {lang === 'pt' ? 'Os 4 Espelhos' :
           lang === 'fr' ? 'Les 4 Miroirs' :
           lang === 'es' ? 'Los 4 Espejos' :
           'The 4 Mirrors'}
        </h1>
        <p className="text-muted-foreground">
          {lang === 'pt' ? 'Cada espelho representa uma fase da tua jornada de autoconhecimento' :
           lang === 'fr' ? 'Chaque miroir représente une phase de votre parcours de connaissance de soi' :
           lang === 'es' ? 'Cada espejo representa una fase de tu viaje de autoconocimiento' :
           'Each mirror represents a phase of your self-discovery journey'}
        </p>
      </div>

      {/* Journey Flow */}
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        {mirrors.map((mirror, i) => (
          <div key={mirror.slug} className="flex items-center gap-2">
            <span style={{ color: mirror.color }}>{mirror.icon} {mirror.name}</span>
            {i < mirrors.length - 1 && <span>→</span>}
          </div>
        ))}
      </div>

      {/* Mirror Cards */}
      <div className="space-y-4">
        {mirrors.map((mirror) => {
          const locked = mirror.isPremium && !isPremium
          const convCount = conversationCounts[mirror.slug]

          return (
            <div
              key={mirror.slug}
              className="rounded-xl border border-border bg-card overflow-hidden"
              style={{ borderLeftWidth: '4px', borderLeftColor: mirror.color }}
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
                      style={{ backgroundColor: `${mirror.color}15` }}
                    >
                      {mirror.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold" style={{ color: mirror.color }}>
                          {mirror.name}
                        </h2>
                        <span className="text-xs text-muted-foreground">
                          {phaseLabels[mirror.phase]?.[lang] || mirror.phase}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {mirror.descriptions[lang]}
                      </p>
                      {convCount > 0 && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {convCount} {lang === 'pt' ? 'conversas' :
                                       lang === 'fr' ? 'conversations' :
                                       lang === 'es' ? 'conversaciones' :
                                       'conversations'}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    {locked ? (
                      <Link
                        href="/settings"
                        className="inline-flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
                      >
                        🔒 Upgrade
                      </Link>
                    ) : (
                      <Link
                        href={`/chat/${mirror.slug}`}
                        className="inline-flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
                        style={{ backgroundColor: mirror.color }}
                      >
                        {lang === 'pt' ? 'Conversar' :
                         lang === 'fr' ? 'Parler' :
                         lang === 'es' ? 'Conversar' :
                         'Start'}
                        {' →'}
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
