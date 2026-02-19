import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getNextSuggestion } from '@/lib/journey/suggestions'
import { MIRRORS } from '@/lib/ai/mirrors'
import { MILESTONES } from '@/lib/journey/constants'
import Link from 'next/link'
import Image from 'next/image'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [journeyResult, patternsResult, insightsResult, userResult] = await Promise.all([
    supabase.from('user_journey').select('*').eq('user_id', user.id).single(),
    supabase.from('user_patterns').select('*').eq('user_id', user.id).eq('is_active', true).order('discovered_at', { ascending: false }).limit(6),
    supabase.from('user_insights').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
    supabase.from('users').select('subscription_tier, language_preference, monthly_message_count').eq('id', user.id).single()
  ])

  const journey = journeyResult.data
  const patterns = patternsResult.data || []
  const insights = insightsResult.data || []
  const userData = userResult.data

  if (!journey) {
    await supabase.from('user_journey').insert({
      user_id: user.id,
      current_phase: 'foundation',
      foundation_started_at: new Date().toISOString()
    })
    redirect('/dashboard')
  }

  const suggestion = getNextSuggestion(journey)
  const lang = (userData?.language_preference || 'pt') as keyof typeof MIRRORS.soma.descriptions

  const phases = [
    { name: 'Fundação', mirror: 'soma' as const, complete: journey.foundation_completed, current: journey.current_phase === 'foundation', conversations: journey.soma_conversations },
    { name: 'Regulação', mirror: 'seren' as const, complete: journey.regulation_completed, current: journey.current_phase === 'regulation', conversations: journey.seren_conversations },
    { name: 'Expansão', mirror: 'luma' as const, complete: journey.expansion_completed, current: journey.current_phase === 'expansion', conversations: journey.luma_conversations },
    { name: 'Integração', mirror: 'echo' as const, complete: journey.integration_completed, current: journey.current_phase === 'integration', conversations: journey.echo_conversations }
  ]

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 md:px-8 space-y-8">
      {/* Welcome */}
      <div className="pt-8 md:pt-0">
        <h1 className="text-2xl md:text-3xl font-heading font-semibold" style={{ color: '#2a2520' }}>
          A Tua Jornada
        </h1>
        <p className="mt-1" style={{ color: '#7a746b' }}>
          {journey.total_conversations} conversas na tua jornada
          {userData?.subscription_tier === 'free' && (
            <span className="text-xs ml-2 px-2.5 py-1 rounded-full" style={{ backgroundColor: '#e8e3da', color: '#7a746b' }}>
              Plano grátis — {10 - (userData?.monthly_message_count || 0)} mensagens restantes
            </span>
          )}
        </p>
      </div>

      {/* Phase Progress */}
      <div className="rounded-2xl p-6 md:p-8" style={{ backgroundColor: '#f0ece6', border: '1px solid #ccc7bc' }}>
        <h2 className="text-xs font-semibold uppercase tracking-widest mb-6" style={{ color: '#9a7b50' }}>
          Progresso da Jornada
        </h2>
        <div className="flex items-center justify-between gap-1 sm:gap-3">
          {phases.map((phase, i) => {
            const mirrorConfig = MIRRORS[phase.mirror]
            return (
              <div key={phase.name} className="flex items-center gap-1 sm:gap-3 flex-1">
                <Link
                  href={`/chat/${phase.mirror}`}
                  className="flex flex-col items-center gap-2 group flex-1"
                >
                  <div
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all group-hover:scale-105 overflow-hidden"
                    style={{
                      backgroundColor: phase.complete
                        ? mirrorConfig.color
                        : phase.current
                        ? `${mirrorConfig.color}20`
                        : '#e8e3da',
                      boxShadow: phase.current ? `0 0 0 4px ${mirrorConfig.color}30` : undefined,
                    }}
                  >
                    {phase.complete ? (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20,6 9,17 4,12" />
                      </svg>
                    ) : (
                      <Image
                        src={mirrorConfig.logo}
                        alt={mirrorConfig.name}
                        width={36}
                        height={36}
                        className="rounded-full"
                      />
                    )}
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-xs sm:text-sm" style={{ color: '#2a2520' }}>{phase.name}</p>
                    <p className="text-[10px] sm:text-xs" style={{ color: '#7a746b' }}>
                      {mirrorConfig.name} · {phase.conversations}
                    </p>
                  </div>
                </Link>
                {i < phases.length - 1 && (
                  <div
                    className="h-0.5 flex-1 min-w-2 hidden sm:block rounded-full"
                    style={{
                      backgroundColor: phase.complete ? mirrorConfig.color : '#ccc7bc'
                    }}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Next Suggestion */}
      {suggestion && (
        <div className="rounded-2xl p-6" style={{ backgroundColor: '#f0ece6', border: '1px solid #ccc7bc' }}>
          <h2 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#9a7b50' }}>
            Próximo Passo Sugerido
          </h2>
          <p className="text-sm mb-4" style={{ color: '#2a2520' }}>{suggestion.message}</p>
          {(suggestion.mirror || suggestion.suggestedMirror) && (() => {
            const mirrorKey = (suggestion.mirror || suggestion.suggestedMirror) as keyof typeof MIRRORS
            const mirrorConfig = MIRRORS[mirrorKey]
            return (
              <Link
                href={`/chat/${mirrorKey}`}
                className="inline-flex items-center gap-2.5 rounded-xl px-5 py-2.5 text-sm font-medium text-white transition-all hover:opacity-90"
                style={{ backgroundColor: mirrorConfig?.color || '#9a7b50' }}
              >
                <Image src={mirrorConfig.logo} alt={mirrorConfig.name} width={20} height={20} className="rounded" />
                Iniciar conversa
              </Link>
            )
          })()}
        </div>
      )}

      {/* Patterns */}
      <div className="rounded-2xl p-6" style={{ backgroundColor: '#f0ece6', border: '1px solid #ccc7bc' }}>
        <h2 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#9a7b50' }}>
          Padrões Identificados
        </h2>
        {patterns.length === 0 ? (
          <p className="text-sm" style={{ color: '#7a746b' }}>
            À medida que exploras, padrões vão emergir e aparecer aqui
          </p>
        ) : (
          <div className="space-y-3">
            {patterns.slice(0, 4).map((pattern) => (
              <div key={pattern.id} className="flex items-start gap-3 p-3 rounded-xl" style={{ backgroundColor: '#e8e3da' }}>
                <span
                  className="shrink-0 text-[10px] px-2 py-0.5 rounded-full font-medium text-white"
                  style={{ backgroundColor: MIRRORS[pattern.discovered_in_mirror as keyof typeof MIRRORS]?.color || '#888' }}
                >
                  {pattern.discovered_in_mirror.toUpperCase()}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm" style={{ color: '#2a2520' }}>
                    {pattern.pattern_type.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </p>
                  {pattern.pattern_description && (
                    <p className="text-xs line-clamp-2 mt-0.5" style={{ color: '#7a746b' }}>
                      {pattern.pattern_description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        backgroundColor: i < pattern.integration_level
                          ? MIRRORS[pattern.discovered_in_mirror as keyof typeof MIRRORS]?.color || '#888'
                          : '#ccc7bc'
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Insights */}
      {insights.length > 0 && (
        <div className="rounded-2xl p-6" style={{ backgroundColor: '#f0ece6', border: '1px solid #ccc7bc' }}>
          <h2 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#9a7b50' }}>
            Insights Recentes
          </h2>
          <div className="space-y-3">
            {insights.map((insight) => (
              <div key={insight.id} className="flex items-start gap-3 p-3 rounded-xl" style={{ backgroundColor: '#e8e3da' }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: '#9a7b5020' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9a7b50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm" style={{ color: '#2a2520' }}>{insight.insight_text}</p>
                  <p className="text-xs mt-1" style={{ color: '#7a746b' }}>
                    {insight.mirror_slug?.toUpperCase()} · {new Date(insight.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Milestones */}
      {journey.milestones_unlocked && journey.milestones_unlocked.length > 0 && (
        <div className="rounded-2xl p-6" style={{ backgroundColor: '#f0ece6', border: '1px solid #ccc7bc' }}>
          <h2 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#9a7b50' }}>
            Milestones
          </h2>
          <div className="flex flex-wrap gap-3">
            {journey.milestones_unlocked.map((milestone: string) => {
              const config = MILESTONES[milestone]
              if (!config) return null
              return (
                <div key={milestone} className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm" style={{ backgroundColor: '#e8e3da', color: '#2a2520' }}>
                  <span>{config.icon}</span>
                  <span className="font-medium">{config.title}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Mirrors Quick Access */}
      <div className="rounded-2xl p-6" style={{ backgroundColor: '#f0ece6', border: '1px solid #ccc7bc' }}>
        <h2 className="text-xs font-semibold uppercase tracking-widest mb-5" style={{ color: '#9a7b50' }}>
          Todos os Espelhos
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Object.values(MIRRORS).sort((a, b) => a.order - b.order).map((mirror) => (
            <Link
              key={mirror.slug}
              href={`/chat/${mirror.slug}`}
              className="flex flex-col items-center gap-3 p-5 rounded-xl transition-all group hover:shadow-md"
              style={{ backgroundColor: '#fffcf8', border: '1px solid #e8e3da' }}
            >
              <div className="w-14 h-14 rounded-full flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105"
                style={{ backgroundColor: `${mirror.color}12` }}
              >
                <Image
                  src={mirror.logo}
                  alt={mirror.name}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              </div>
              <div className="text-center">
                <p className="font-semibold text-sm" style={{ color: mirror.color }}>{mirror.name}</p>
                <p className="text-[10px] mt-0.5" style={{ color: '#7a746b' }}>
                  {mirror.descriptions[lang]}
                </p>
              </div>
              {mirror.isPremium && userData?.subscription_tier !== 'premium' && (
                <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: '#e8e3da', color: '#7a746b' }}>
                  Premium
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
