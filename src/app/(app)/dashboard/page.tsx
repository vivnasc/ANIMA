import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getNextSuggestion } from '@/lib/journey/suggestions'
import { MIRRORS } from '@/lib/ai/mirrors'
import { MILESTONES, canAccessMirror } from '@/lib/journey/constants'
import { getSessionProgress, getNextAvailableSession, getMirrorSessionDefinitions } from '@/lib/journey/sessions'
import { getStreak } from '@/lib/journey/streaks'
import { DashboardActions } from '@/components/journey/dashboard-actions'
import Link from 'next/link'
import Image from 'next/image'
import type { Language } from '@/types/database'

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

  const lang = (userData?.language_preference || 'pt') as Language
  const suggestion = getNextSuggestion(journey)

  // Travessia data
  const [sessionProgress, streak, nextSession] = await Promise.all([
    getSessionProgress(user.id),
    getStreak(user.id),
    getNextAvailableSession(user.id)
  ])

  // Get session definition for next session
  let nextSessionDef = null
  if (nextSession) {
    const defs = await getMirrorSessionDefinitions(nextSession.mirror_slug as 'soma' | 'seren' | 'luma' | 'echo')
    const def = defs.find(d => d.session_number === nextSession.session_number)
    if (def) {
      const titleKey = `title_${lang}` as keyof typeof def
      const subtitleKey = `subtitle_${lang}` as keyof typeof def
      nextSessionDef = {
        mirror_slug: nextSession.mirror_slug,
        session_number: nextSession.session_number,
        title: (def[titleKey] as string) || def.title_en,
        subtitle: (def[subtitleKey] as string) || def.subtitle_en,
        estimated_minutes: def.estimated_minutes,
      }
    }
  }

  const phases = [
    { name: 'Fundação', mirror: 'soma' as const, complete: journey.foundation_completed, current: journey.current_phase === 'foundation', conversations: journey.soma_conversations },
    { name: 'Regulação', mirror: 'seren' as const, complete: journey.regulation_completed, current: journey.current_phase === 'regulation', conversations: journey.seren_conversations },
    { name: 'Expansão', mirror: 'luma' as const, complete: journey.expansion_completed, current: journey.current_phase === 'expansion', conversations: journey.luma_conversations },
    { name: 'Integração', mirror: 'echo' as const, complete: journey.integration_completed, current: journey.current_phase === 'integration', conversations: journey.echo_conversations }
  ]

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 md:px-8 space-y-8">
      {/* Welcome + Travessia Stats */}
      <div className="pt-8 md:pt-0">
        <h1 className="text-2xl md:text-3xl font-heading font-semibold" style={{ color: '#2a2520' }}>
          {lang === 'pt' ? 'A Tua Travessia' : lang === 'es' ? 'Tu Travesía' : lang === 'fr' ? 'Ta Traversée' : 'Your Journey'}
        </h1>
        <div className="flex flex-wrap items-center gap-3 mt-2">
          {/* Streak */}
          {streak.current_streak > 0 && (
            <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full" style={{ backgroundColor: '#f0ece6', color: '#7a746b' }}>
              <span style={{ color: '#f59e0b' }}>&#9632;</span>
              {streak.current_streak} {lang === 'pt' ? 'dias seguidos' : 'day streak'}
            </span>
          )}
          {/* Insights count */}
          {insights.length > 0 && (
            <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full" style={{ backgroundColor: '#f0ece6', color: '#7a746b' }}>
              {insights.length} insights
            </span>
          )}
          {/* Patterns count */}
          {patterns.length > 0 && (
            <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full" style={{ backgroundColor: '#f0ece6', color: '#7a746b' }}>
              {patterns.length} {lang === 'pt' ? 'padrões' : 'patterns'}
            </span>
          )}
          {userData?.subscription_tier === 'free' && (
            <span className="text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: '#e8e3da', color: '#7a746b' }}>
              {lang === 'pt' ? 'Plano grátis' : 'Free plan'} — {10 - (userData?.monthly_message_count || 0)} {lang === 'pt' ? 'mensagens restantes' : 'messages left'}
            </span>
          )}
        </div>
      </div>

      {/* Travessia Progress */}
      <div className="rounded-2xl p-6 md:p-8" style={{ backgroundColor: '#f0ece6', border: '1px solid #ccc7bc' }}>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#9a7b50' }}>
            {lang === 'pt' ? 'Progresso da Travessia' : 'Journey Progress'}
          </h2>
          <span className="text-sm font-semibold" style={{ color: '#9a7b50' }}>{sessionProgress.percentage}%</span>
        </div>
        <div className="h-2 rounded-full mb-2" style={{ backgroundColor: '#e8e3da' }}>
          <div
            className="h-2 rounded-full transition-all duration-1000"
            style={{ width: `${sessionProgress.percentage}%`, background: 'linear-gradient(90deg, #10b981, #6366f1, #f59e0b, #8b5cf6)' }}
          />
        </div>
        <p className="text-xs" style={{ color: '#7a746b' }}>
          {sessionProgress.completed} de {sessionProgress.total} {lang === 'pt' ? 'sessões completas' : 'sessions completed'}
        </p>

        {/* Phase orbs */}
        <div className="flex items-center justify-between gap-1 sm:gap-3 mt-6">
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
                      {mirrorConfig.name}
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

      {/* Next Session */}
      {nextSessionDef && (
        <div className="rounded-2xl p-6" style={{ backgroundColor: '#f0ece6', border: '1px solid #ccc7bc' }}>
          <h2 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#9a7b50' }}>
            {lang === 'pt' ? 'Próxima Sessão' : 'Next Session'}
          </h2>
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden shrink-0"
              style={{ backgroundColor: `${MIRRORS[nextSessionDef.mirror_slug as keyof typeof MIRRORS]?.color}15` }}
            >
              <Image
                src={MIRRORS[nextSessionDef.mirror_slug as keyof typeof MIRRORS]?.logo || ''}
                alt={nextSessionDef.mirror_slug}
                width={32}
                height={32}
                className="rounded-full"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium" style={{ color: '#2a2520' }}>
                {nextSessionDef.title}
              </p>
              <p className="text-xs mt-0.5" style={{ color: '#7a746b' }}>
                {nextSessionDef.subtitle} &middot; ~{nextSessionDef.estimated_minutes}min
              </p>
            </div>
            <Link
              href={`/chat/${nextSessionDef.mirror_slug}`}
              className="shrink-0 inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-medium text-white transition-all hover:opacity-90"
              style={{ backgroundColor: MIRRORS[nextSessionDef.mirror_slug as keyof typeof MIRRORS]?.color || '#9a7b50' }}
            >
              {lang === 'pt' ? 'Continuar' : 'Continue'}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12,5 19,12 12,19" />
              </svg>
            </Link>
          </div>
        </div>
      )}

      {/* Next Suggestion (legacy - shows when no session data yet) */}
      {suggestion && !nextSessionDef && (
        <div className="rounded-2xl p-6" style={{ backgroundColor: '#f0ece6', border: '1px solid #ccc7bc' }}>
          <h2 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#9a7b50' }}>
            {lang === 'pt' ? 'Próximo Passo Sugerido' : 'Suggested Next Step'}
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
                {lang === 'pt' ? 'Iniciar conversa' : 'Start conversation'}
              </Link>
            )
          })()}
        </div>
      )}

      {/* Recent Insights */}
      {insights.length > 0 && (
        <div className="rounded-2xl p-6" style={{ backgroundColor: '#f0ece6', border: '1px solid #ccc7bc' }}>
          <h2 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#9a7b50' }}>
            {lang === 'pt' ? 'Últimos Insights' : 'Recent Insights'}
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
                  <p className="text-sm font-heading italic" style={{ color: '#2a2520' }}>
                    &ldquo;{insight.insight_text}&rdquo;
                  </p>
                  <p className="text-xs mt-1" style={{ color: '#7a746b' }}>
                    {insight.mirror_slug?.toUpperCase()} &middot; {new Date(insight.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Patterns */}
      {patterns.length > 0 && (
        <div className="rounded-2xl p-6" style={{ backgroundColor: '#f0ece6', border: '1px solid #ccc7bc' }}>
          <h2 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#9a7b50' }}>
            {lang === 'pt' ? 'Padrões Identificados' : 'Identified Patterns'}
          </h2>
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

      {/* Actions: Export + Restart */}
      <DashboardActions
        language={lang}
        journeyComplete={sessionProgress.completed >= 28}
      />

      {/* Mirrors Quick Access */}
      <div className="rounded-2xl p-6" style={{ backgroundColor: '#f0ece6', border: '1px solid #ccc7bc' }}>
        <h2 className="text-xs font-semibold uppercase tracking-widest mb-5" style={{ color: '#9a7b50' }}>
          {lang === 'pt' ? 'Todos os Espelhos' : 'All Mirrors'}
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
              {mirror.isPremium && !canAccessMirror((userData?.subscription_tier || 'free') as import('@/types/database').SubscriptionTier, mirror.slug) && (
                <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: '#e8e3da', color: '#7a746b' }}>
                  Upgrade
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
