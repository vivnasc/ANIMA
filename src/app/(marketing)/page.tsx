'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { MIRROR_LIST } from '@/lib/ai/mirrors'
import { translations } from '@/lib/landing-i18n'
import type { Language } from '@/types/database'

/* ═══════════════════════════════════════════════════
   WARM NEUTRAL PALETTE — intimate, sober, human
   Warm parchment/stone — neither dark nor light
   ═══════════════════════════════════════════════════ */
const W = {
  bg: '#ddd8cf',                        // warm parchment stone
  surface: 'rgba(255, 252, 248, 0.6)',  // lighter card surface (paper)
  surfaceBorder: 'rgba(42, 37, 32, 0.10)',
  surfaceBorderHover: 'rgba(42, 37, 32, 0.20)',
  text: '#2a2520',                      // warm near-black
  textSec: '#5a554e',                   // warm medium brown
  textMuted: '#8a847a',                 // warm muted
  gold: '#9a7b50',                      // deeper gold for contrast
  goldSoft: '#9a7b5020',               // gold at 13% opacity
  // For dark accent sections (CTA box)
  darkBg: '#2a2520',
  darkText: '#ede9e3',
  darkTextSec: '#a89f94',
  darkGold: '#c9a96e',
}

const MIRROR_COLORS: Record<string, string> = {
  soma: '#34d399',
  seren: '#60a5fa',
  luma: '#fbbf24',
  echo: '#c084fc',
  nexus: '#ec4899',
}

const MIRROR_LOGOS: Record<string, string> = {
  soma: '/logos/soma-logo.png',
  seren: '/logos/seren-logo.png',
  luma: '/logos/luma-logo.png',
  echo: '/logos/echo-logo.png',
  nexus: '/logos/nexus-logo.png',
}

/* ── Animations: slow, organic ── */
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.25, 0.4, 0.25, 1] as const },
  },
}
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

const LANG_LABELS: Record<Language, string> = { pt: 'PT', en: 'EN', es: 'ES', fr: 'FR' }

/* ── Glass card base — warm paper on neutral bg ── */
const glass = `bg-[rgba(255,252,248,0.6)] backdrop-blur-[20px] border border-[rgba(42,37,32,0.10)]`

export default function LandingPage() {
  const [lang, setLang] = useState<Language>('pt')
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const t = translations[lang]

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: W.bg, color: W.text }}>
      {/* ── Background: subtle warm orbs ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute top-[20%] left-[15%] w-[500px] h-[500px] rounded-full animate-breathe"
          style={{ backgroundColor: 'rgba(154, 123, 80, 0.06)' }}
        />
        <div
          className="absolute bottom-[20%] right-[15%] w-[400px] h-[400px] rounded-full animate-breathe"
          style={{ backgroundColor: 'rgba(139, 127, 181, 0.05)', animationDelay: '4s' }}
        />
      </div>

      {/* ═══════════════════════════════════════════════
          1. NAVIGATION
          ═══════════════════════════════════════════════ */}
      <header
        className="fixed top-0 left-0 right-0 z-[100] backdrop-blur-[20px]"
        style={{ backgroundColor: 'rgba(221, 216, 207, 0.88)', borderBottom: `1px solid ${W.surfaceBorder}` }}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logos/anima-logo.png" alt="ANIMA" width={36} height={36} className="rounded-full" />
            <span className="font-heading text-lg font-semibold tracking-[0.12em]" style={{ color: W.text }}>
              ANIMA
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm" style={{ color: W.textSec }}>
            <a href="#how-it-works" className="hover:text-[#2a2520] transition-colors duration-300">{t.nav.howItWorks}</a>
            <a href="#mirrors" className="hover:text-[#2a2520] transition-colors duration-300">{t.nav.mirrors}</a>
            <a href="#pricing" className="hover:text-[#2a2520] transition-colors duration-300">{t.nav.pricing}</a>
            <a href="#faq" className="hover:text-[#2a2520] transition-colors duration-300">{t.nav.faq}</a>
          </nav>

          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-full overflow-hidden text-xs" style={{ border: `1px solid ${W.surfaceBorder}` }}>
              {(['pt', 'en', 'es', 'fr'] as Language[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className="px-2.5 py-1.5 transition-colors duration-300"
                  style={{ color: lang === l ? W.text : W.textMuted, backgroundColor: lang === l ? 'rgba(42,37,32,0.08)' : 'transparent' }}
                >
                  {LANG_LABELS[l]}
                </button>
              ))}
            </div>
            <Link href="/login" className="text-sm hidden sm:block transition-colors duration-300 hover:text-[#2a2520]" style={{ color: W.textSec }}>
              {t.nav.login}
            </Link>
            <Link
              href="/signup"
              className="rounded-full px-5 py-2 text-sm font-medium transition-all duration-300 hover:opacity-90"
              style={{ backgroundColor: W.gold, color: '#fff' }}
            >
              {t.nav.start}
            </Link>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════
          2. HERO — serif headline, warm, intimate
          ═══════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        <div className="relative z-[1] max-w-3xl mx-auto px-6 text-center">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            {/* Badge */}
            <motion.div variants={fadeUp} className="mb-10">
              <span
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm"
                style={{ border: `1px solid ${W.goldSoft}`, backgroundColor: 'rgba(201,169,110,0.08)', color: W.gold }}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style={{ backgroundColor: W.gold }} />
                  <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: W.gold }} />
                </span>
                {t.hero.badge}
              </span>
            </motion.div>

            {/* Title — serif, warm */}
            <motion.h1
              variants={fadeUp}
              className="font-heading text-[2.5rem] sm:text-[3.25rem] md:text-[4rem] font-semibold leading-[1.15] tracking-[-0.01em]"
            >
              {t.hero.title1}{' '}
              <em style={{ color: W.gold }}>{t.hero.titleHighlight}</em>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={fadeUp}
              className="mt-8 text-lg md:text-xl leading-[1.85] max-w-2xl mx-auto"
              style={{ color: W.textSec }}
            >
              {t.hero.subtitle}
            </motion.p>

            {/* CTAs */}
            <motion.div variants={fadeUp} className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="rounded-full px-8 py-4 text-base font-medium transition-all duration-300 hover:-translate-y-[1px]"
                style={{ backgroundColor: W.gold, color: '#fff', boxShadow: '0 4px 24px rgba(154,123,80,0.25)' }}
              >
                {t.hero.cta}
              </Link>
              <a
                href="#how-it-works"
                className="rounded-full px-8 py-4 text-base font-medium transition-all duration-300 hover:border-[rgba(237,233,227,0.2)]"
                style={{ border: `1px solid ${W.surfaceBorderHover}`, color: W.textSec }}
              >
                {t.hero.ctaSecondary}
              </a>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-float">
          <div className="w-6 h-10 rounded-full flex items-start justify-center p-1.5" style={{ border: `2px solid ${W.surfaceBorderHover}` }}>
            <motion.div
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: W.textMuted }}
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          3. STATS BAR — warm gold numbers
          ═══════════════════════════════════════════════ */}
      <section style={{ borderTop: `1px solid ${W.surfaceBorder}`, borderBottom: `1px solid ${W.surfaceBorder}` }} className="py-14">
        <div className="max-w-3xl mx-auto px-6">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-4"
          >
            {[
              { value: t.hero.stat1, label: t.hero.stat1Label },
              { value: t.hero.stat2, label: t.hero.stat2Label },
              { value: t.hero.stat3, label: t.hero.stat3Label },
            ].map((stat) => (
              <motion.div key={stat.label} variants={fadeUp} className="text-center">
                <div className="font-heading text-[3.5rem] font-semibold" style={{ color: W.gold }}>{stat.value}</div>
                <div className="text-xs mt-1 uppercase tracking-[0.15em]" style={{ color: W.textMuted }}>{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          4. TESTIMONIALS — italic quotes, warm cards
          ═══════════════════════════════════════════════ */}
      <section className="py-32">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={stagger}>
            <motion.h2
              variants={fadeUp}
              className="text-sm uppercase tracking-[0.2em] text-center mb-14"
              style={{ color: W.textMuted }}
            >
              {t.socialProof.title}
            </motion.h2>

            <div className="grid md:grid-cols-3 gap-6">
              {t.socialProof.testimonials.map((testimonial, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  whileHover={{ y: -4, transition: { duration: 0.3 } }}
                  className={`rounded-2xl ${glass} p-7 transition-all duration-300`}
                >
                  <p className="font-heading italic leading-[1.8] mb-6" style={{ color: W.text }}>
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium"
                      style={{ backgroundColor: W.goldSoft, color: W.gold }}
                    >
                      {testimonial.author[0]}
                    </div>
                    <div>
                      <div className="text-sm font-medium" style={{ color: W.text }}>{testimonial.author}</div>
                      <div className="text-xs" style={{ color: W.textMuted }}>{testimonial.role}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          5. HOW IT WORKS — timeline with BIG logos
          ═══════════════════════════════════════════════ */}
      <section id="how-it-works" className="py-32" style={{ borderTop: `1px solid ${W.surfaceBorder}` }}>
        <div className="max-w-3xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-20">
              <h2 className="font-heading text-3xl md:text-4xl font-semibold">{t.howItWorks.title}</h2>
              <p className="mt-4 text-lg leading-relaxed" style={{ color: W.textSec }}>{t.howItWorks.subtitle}</p>
            </motion.div>

            <div className="relative">
              {/* Vertical gradient line */}
              <div
                className="absolute left-10 top-0 bottom-0 w-[2px] hidden md:block"
                style={{
                  background: `linear-gradient(to bottom, ${MIRROR_COLORS.soma}, ${MIRROR_COLORS.seren}, ${MIRROR_COLORS.luma}, ${MIRROR_COLORS.echo}, ${MIRROR_COLORS.nexus})`,
                  opacity: 0.4,
                }}
              />

              <div className="space-y-16">
                {t.howItWorks.steps.map((step, i) => {
                  const mirror = MIRROR_LIST[i]
                  const color = MIRROR_COLORS[mirror.slug] || mirror.color
                  const logoSrc = MIRROR_LOGOS[mirror.slug]

                  return (
                    <motion.div key={i} variants={fadeUp} className="flex gap-6 md:gap-8 items-start">
                      <div className="relative z-10 flex-shrink-0 w-20 h-20 flex items-center justify-center">
                        <Image src={logoSrc} alt={mirror.name} width={80} height={80} className="object-contain drop-shadow-lg" />
                      </div>
                      <div className="pt-3">
                        <h3 className="font-heading text-2xl font-semibold mb-3" style={{ color }}>{step.title}</h3>
                        <p className="leading-[1.8]" style={{ color: W.textSec }}>{step.description}</p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          6. MIRRORS GRID — BIG logos, warm cards, generous space
          ═══════════════════════════════════════════════ */}
      <section id="mirrors" className="py-32" style={{ borderTop: `1px solid ${W.surfaceBorder}` }}>
        <div className="max-w-5xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-20">
              <h2 className="font-heading text-3xl md:text-4xl font-semibold">{t.mirrors.title}</h2>
              <p className="mt-4 text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: W.textSec }}>{t.mirrors.subtitle}</p>
            </motion.div>

            <div className="grid sm:grid-cols-2 gap-8">
              {MIRROR_LIST.map((mirror, idx) => {
                const color = MIRROR_COLORS[mirror.slug] || mirror.color
                const logoSrc = MIRROR_LOGOS[mirror.slug]
                const isLastOdd = MIRROR_LIST.length % 2 !== 0 && idx === MIRROR_LIST.length - 1

                return (
                  <motion.div
                    key={mirror.slug}
                    variants={fadeUp}
                    whileHover={{
                      y: -6,
                      borderColor: `${color}30`,
                      boxShadow: `0 20px 60px rgba(0, 0, 0, 0.08), 0 0 40px ${color}12`,
                      transition: { duration: 0.3 },
                    }}
                    className={`group relative rounded-[20px] ${glass} p-10 transition-all duration-300 overflow-hidden ${isLastOdd ? 'sm:col-span-2 sm:max-w-[50%] sm:mx-auto' : ''}`}
                  >
                    {/* Warm radial glow */}
                    <div
                      className="absolute inset-0 rounded-[20px] opacity-[0.06] group-hover:opacity-[0.12] transition-opacity duration-500"
                      style={{ background: `radial-gradient(circle at 30% 20%, ${color}, transparent 70%)` }}
                    />

                    <div className="relative">
                      {/* Logo — BIG and prominent */}
                      <div className="mb-8 flex justify-center">
                        <Image
                          src={logoSrc}
                          alt={mirror.name}
                          width={128}
                          height={128}
                          className="object-contain drop-shadow-lg"
                        />
                      </div>

                      {/* Name + Phase + Badge */}
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-heading text-xl font-semibold" style={{ color }}>{mirror.name}</h3>
                          <span className="text-xs uppercase tracking-[0.12em]" style={{ color: W.textMuted }}>
                            {t.mirrors.phases[mirror.phase]}
                          </span>
                        </div>
                        <span
                          className="text-xs px-2.5 py-1 rounded-full font-medium mt-0.5"
                          style={{
                            backgroundColor: mirror.isPremium ? `${color}12` : `${MIRROR_COLORS.soma}12`,
                            color: mirror.isPremium ? color : MIRROR_COLORS.soma,
                          }}
                        >
                          {mirror.isPremium ? t.mirrors.premium : t.mirrors.free}
                        </span>
                      </div>

                      <p className="leading-[1.8] mt-4" style={{ color: W.textSec }}>{mirror.descriptions[lang]}</p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          7. PRICING — warm, clean, gold accent
          ═══════════════════════════════════════════════ */}
      <section id="pricing" className="py-32" style={{ borderTop: `1px solid ${W.surfaceBorder}` }}>
        <div className="max-w-6xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-8">
              <h2 className="font-heading text-3xl md:text-4xl font-semibold">{t.pricing.title}</h2>
              <p className="mt-4 text-lg" style={{ color: W.textSec }}>{t.pricing.subtitle}</p>
            </motion.div>

            <motion.div variants={fadeUp} className="text-center mb-14">
              <span className="text-sm" style={{ color: W.gold }}>{t.pricing.urgency}</span>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {t.pricing.tiers.map((tier, i) => {
                const isHighlight = tier.highlight
                const tierColors = ['#34d399', '#9a7b50', '#ec4899', '#c084fc', '#f59e0b']
                const accentColor = tierColors[i] || W.gold
                return (
                  <motion.div
                    key={tier.name}
                    variants={fadeUp}
                    className={`relative rounded-2xl ${glass} p-6 flex flex-col ${isHighlight ? 'animate-pulse-glow' : ''}`}
                    style={isHighlight ? { borderColor: `${W.gold}40`, borderWidth: '2px' } : {}}
                  >
                    {tier.badge && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="rounded-full px-3 py-0.5 text-[10px] font-medium whitespace-nowrap" style={{ backgroundColor: accentColor, color: '#fff' }}>
                          {tier.badge}
                        </span>
                      </div>
                    )}

                    <h3 className="font-heading text-lg font-semibold mb-1">{tier.name}</h3>
                    <div className="flex items-baseline gap-1 mb-6">
                      <span className="text-3xl font-heading font-semibold">{tier.price}</span>
                      <span className="text-sm" style={{ color: W.textMuted }}>{tier.period}</span>
                    </div>
                    <ul className="space-y-2.5 mb-8 flex-1">
                      {tier.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-xs" style={{ color: W.textSec }}>
                          <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke={accentColor} strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href="/signup"
                      className="block text-center rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-300 hover:opacity-90"
                      style={isHighlight
                        ? { backgroundColor: W.gold, color: '#fff' }
                        : { border: `1px solid ${W.surfaceBorderHover}`, color: W.textSec }
                      }
                    >
                      {tier.cta}
                    </Link>
                  </motion.div>
                )
              })}
            </div>

            <motion.p variants={fadeUp} className="text-center text-sm mt-8" style={{ color: W.textMuted }}>
              {t.pricing.guarantee}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          8. FAQ — warm accordion
          ═══════════════════════════════════════════════ */}
      <section id="faq" className="py-32" style={{ borderTop: `1px solid ${W.surfaceBorder}` }}>
        <div className="max-w-3xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={stagger}>
            <motion.h2 variants={fadeUp} className="font-heading text-3xl md:text-4xl font-semibold text-center mb-14">
              {t.faq.title}
            </motion.h2>

            <div className="space-y-3">
              {t.faq.items.map((item, i) => (
                <motion.div key={i} variants={fadeUp} className={`rounded-xl ${glass} overflow-hidden transition-colors duration-300`}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-6 py-5 text-left transition-colors duration-300"
                  >
                    <span className="font-medium pr-4">{item.q}</span>
                    <svg
                      className="w-5 h-5 flex-shrink-0 transition-transform duration-300"
                      style={{ color: W.textMuted, transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0deg)' }}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="px-6 pb-5 text-sm leading-[1.8]" style={{ color: W.textSec }}>{item.a}</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          9. CTA — warm, invitational, not aggressive
          ═══════════════════════════════════════════════ */}
      <section className="py-32">
        <div className="max-w-3xl mx-auto px-6">
          <div
            className="rounded-3xl px-8 py-24 text-center relative overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${W.darkBg}, #3d3630)`, border: `1px solid rgba(201,169,110,0.15)` }}
          >
            {/* Warm glow behind */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[200px] rounded-full animate-ember"
              style={{ backgroundColor: 'rgba(201,169,110,0.06)' }}
            />

            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={stagger}
              className="relative"
            >
              <motion.h2 variants={fadeUp} className="font-heading text-3xl md:text-[2.75rem] font-semibold leading-[1.2]" style={{ color: W.darkText }}>
                {t.finalCta.title}
              </motion.h2>
              <motion.p variants={fadeUp} className="mt-5 text-lg leading-relaxed" style={{ color: W.darkTextSec }}>
                {t.finalCta.subtitle}
              </motion.p>
              <motion.div variants={fadeUp} className="mt-10">
                <Link
                  href="/signup"
                  className="inline-block rounded-full px-10 py-4 text-base font-medium transition-all duration-300 hover:-translate-y-[1px]"
                  style={{ backgroundColor: W.darkGold, color: W.darkBg, boxShadow: '0 4px 24px rgba(201,169,110,0.3)' }}
                >
                  {t.finalCta.button}
                </Link>
              </motion.div>
              <motion.p variants={fadeUp} className="mt-5 text-sm" style={{ color: '#6b6560' }}>
                {t.finalCta.urgency}
              </motion.p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          10. FOOTER — warm, minimal
          ═══════════════════════════════════════════════ */}
      <footer style={{ borderTop: `1px solid ${W.surfaceBorder}` }} className="py-14">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <Link href="/" className="flex items-center gap-2.5">
              <Image src="/logos/anima-logo.png" alt="ANIMA" width={28} height={28} className="rounded-full" />
              <span className="font-heading text-lg font-semibold tracking-[0.12em]">ANIMA</span>
            </Link>
            <div className="flex items-center gap-6 text-sm" style={{ color: W.textMuted }}>
              <span className="hover:text-[#2a2520] transition-colors duration-300 cursor-pointer">{t.footer.privacy}</span>
              <span className="hover:text-[#2a2520] transition-colors duration-300 cursor-pointer">{t.footer.terms}</span>
            </div>
          </div>
          <div className="mt-8 pt-8" style={{ borderTop: `1px solid ${W.surfaceBorder}` }}>
            <p className="text-xs max-w-2xl leading-relaxed" style={{ color: W.textMuted }}>{t.footer.disclaimer}</p>
          </div>
          <div className="mt-6 text-center text-xs" style={{ color: W.textMuted }}>
            {t.footer.copyright}
          </div>
        </div>
      </footer>
    </div>
  )
}
