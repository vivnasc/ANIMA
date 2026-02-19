import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getNextSuggestion } from '@/lib/journey/suggestions'
import { MIRRORS } from '@/lib/ai/mirrors'
import { MILESTONES } from '@/lib/journey/constants'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch all dashboard data in parallel
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

  // Handle case where journey doesn't exist yet
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
    <div className="container max-w-4xl py-8 px-4 space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold">A Tua Jornada</h1>
        <p className="text-muted-foreground">
          {journey.total_conversations} conversas na tua jornada
          {userData?.subscription_tier === 'free' && (
            <span className="text-xs ml-2 px-2 py-0.5 rounded-full bg-muted">
              Plano grátis - {10 - (userData?.monthly_message_count || 0)} mensagens restantes este mês
            </span>
          )}
        </p>
      </div>

      {/* Phase Progress */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-6">
          Progresso da Jornada
        </h2>
        <div className="flex items-center justify-between gap-1 sm:gap-2">
          {phases.map((phase, i) => {
            const mirrorConfig = MIRRORS[phase.mirror]
            return (
              <div key={phase.name} className="flex items-center gap-1 sm:gap-2 flex-1">
                <Link
                  href={`/chat/${phase.mirror}`}
                  className="flex flex-col items-center gap-2 group flex-1"
                >
                  <div
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-xl sm:text-2xl transition-all group-hover:scale-105"
                    style={{
                      backgroundColor: phase.complete
                        ? mirrorConfig.color
                        : phase.current
                        ? `${mirrorConfig.color}20`
                        : undefined,
                      boxShadow: phase.current ? `0 0 0 4px ${mirrorConfig.color}30` : undefined,
                      color: phase.complete ? 'white' : undefined,
                    }}
                  >
                    {phase.complete ? '✓' : mirrorConfig.icon}
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-xs sm:text-sm">{phase.name}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      {mirrorConfig.name} · {phase.conversations}
                    </p>
                  </div>
                </Link>
                {i < phases.length - 1 && (
                  <div
                    className="h-0.5 flex-1 min-w-2 transition-all hidden sm:block"
                    style={{
                      backgroundColor: phase.complete ? mirrorConfig.color : 'var(--border)'
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
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Próximo Passo Sugerido
          </h2>
          <p className="text-sm mb-4">{suggestion.message}</p>
          {(suggestion.mirror || suggestion.suggestedMirror) && (
            <Link
              href={`/chat/${suggestion.mirror || suggestion.suggestedMirror}`}
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
              style={{
                backgroundColor: MIRRORS[(suggestion.mirror || suggestion.suggestedMirror) as keyof typeof MIRRORS]?.color || '#6366f1'
              }}
            >
              {MIRRORS[(suggestion.mirror || suggestion.suggestedMirror) as keyof typeof MIRRORS]?.icon}{' '}
              Iniciar conversa
            </Link>
          )}
        </div>
      )}

      {/* Patterns */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Padrões Identificados
        </h2>
        {patterns.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            À medida que exploras, padrões vão emergir e aparecer aqui
          </p>
        ) : (
          <div className="space-y-3">
            {patterns.slice(0, 4).map((pattern) => (
              <div key={pattern.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                <span
                  className="shrink-0 text-[10px] px-2 py-0.5 rounded-full font-medium text-white"
                  style={{ backgroundColor: MIRRORS[pattern.discovered_in_mirror as keyof typeof MIRRORS]?.color || '#888' }}
                >
                  {pattern.discovered_in_mirror.toUpperCase()}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">
                    {pattern.pattern_type.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </p>
                  {pattern.pattern_description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
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
                          : 'var(--border)'
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
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Insights Recentes
          </h2>
          <div className="space-y-3">
            {insights.map((insight) => (
              <div key={insight.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                <span className="text-lg">💡</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{insight.insight_text}</p>
                  <p className="text-xs text-muted-foreground mt-1">
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
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Milestones
          </h2>
          <div className="flex flex-wrap gap-3">
            {journey.milestones_unlocked.map((milestone: string) => {
              const config = MILESTONES[milestone]
              if (!config) return null
              return (
                <div key={milestone} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 text-sm">
                  <span>{config.icon}</span>
                  <span className="font-medium">{config.title}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Mirrors Quick Access */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Todos os Espelhos
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.values(MIRRORS).sort((a, b) => a.order - b.order).map((mirror) => (
            <Link
              key={mirror.slug}
              href={`/chat/${mirror.slug}`}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border hover:shadow-md transition-all group"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform">{mirror.icon}</span>
              <div className="text-center">
                <p className="font-semibold text-sm" style={{ color: mirror.color }}>{mirror.name}</p>
                <p className="text-[10px] text-muted-foreground">
                  {mirror.descriptions[lang]}
                </p>
              </div>
              {mirror.isPremium && userData?.subscription_tier !== 'premium' && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
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
