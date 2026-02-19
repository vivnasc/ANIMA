'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { MIRROR_LIST } from '@/lib/ai/mirrors'
import { translations } from '@/lib/landing-i18n'
import type { Language } from '@/types/database'

/* ── Design tokens (from LANDING_FINAL_SPECS) ── */
const ACCENT_PRIMARY = '#7c8adb'
const ACCENT_SECONDARY = '#a78bfa'

const LANDING_COLORS: Record<string, string> = {
  soma: '#34d399',
  seren: '#60a5fa',
  luma: '#fbbf24',
  echo: '#c084fc',
}

const MIRROR_LOGOS: Record<string, string> = {
  soma: '/logos/soma-logo.png',
  seren: '/logos/seren-logo.png',
  luma: '/logos/luma-logo.png',
  echo: '/logos/echo-logo.png',
}

/* ── Framer Motion variants ── */
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
}
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const LANG_LABELS: Record<Language, string> = { pt: 'PT', en: 'EN', es: 'ES', fr: 'FR' }

/* ── Glass morphism card base classes ── */
const glassCard =
  'bg-[rgba(20,20,20,0.8)] backdrop-blur-[20px] backdrop-saturate-[1.8] border border-white/[0.06]'

export default function LandingPage() {
  const [lang, setLang] = useState<Language>('pt')
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const t = translations[lang]

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      {/* ── Background pattern (z-0) ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-[#7c8adb]/[0.04] blur-[120px] animate-breathe" />
        <div
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-[#a78bfa]/[0.04] blur-[120px] animate-breathe"
          style={{ animationDelay: '3s' }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-[#c084fc]/[0.03] blur-[100px] animate-breathe"
          style={{ animationDelay: '1.5s' }}
        />
      </div>

      {/* ═══════════════════════════════════════════════════════════
          1. NAVIGATION — sticky, backdrop blur
          ═══════════════════════════════════════════════════════════ */}
      <header className="fixed top-0 left-0 right-0 z-[100] bg-[rgba(10,10,10,0.85)] backdrop-blur-[20px] border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-5 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/logos/anima-logo.png"
              alt="ANIMA"
              width={32}
              height={32}
              className="rounded-full"
            />
            <span className="text-lg font-bold tracking-[0.15em] text-white">ANIMA</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm text-[#b4b4b4]">
            <a href="#how-it-works" className="hover:text-white transition-colors">
              {t.nav.howItWorks}
            </a>
            <a href="#mirrors" className="hover:text-white transition-colors">
              {t.nav.mirrors}
            </a>
            <a href="#pricing" className="hover:text-white transition-colors">
              {t.nav.pricing}
            </a>
            <a href="#faq" className="hover:text-white transition-colors">
              {t.nav.faq}
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <div className="flex items-center rounded-full border border-white/[0.08] overflow-hidden text-xs">
              {(['pt', 'en', 'es', 'fr'] as Language[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-2.5 py-1.5 transition-colors ${
                    lang === l ? 'bg-white/10 text-white' : 'text-[#6b6b6b] hover:text-white'
                  }`}
                >
                  {LANG_LABELS[l]}
                </button>
              ))}
            </div>
            <Link
              href="/login"
              className="text-sm text-[#b4b4b4] hover:text-white transition-colors hidden sm:block"
            >
              {t.nav.login}
            </Link>
            <Link
              href="/signup"
              className="rounded-full px-5 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
              style={{ background: `linear-gradient(135deg, ${ACCENT_PRIMARY}, ${ACCENT_SECONDARY})` }}
            >
              {t.nav.start}
            </Link>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════
          2. HERO — centered, gradient title, CTAs
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        <div className="relative z-[1] max-w-4xl mx-auto px-5 text-center">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            {/* Badge */}
            <motion.div variants={fadeUp} className="mb-8">
              <span
                className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm"
                style={{
                  borderColor: `${ACCENT_PRIMARY}40`,
                  backgroundColor: `${ACCENT_PRIMARY}15`,
                  color: ACCENT_PRIMARY,
                }}
              >
                <span className="relative flex h-2 w-2">
                  <span
                    className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                    style={{ backgroundColor: ACCENT_PRIMARY }}
                  />
                  <span
                    className="relative inline-flex rounded-full h-2 w-2"
                    style={{ backgroundColor: ACCENT_PRIMARY }}
                  />
                </span>
                {t.hero.badge}
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1
              variants={fadeUp}
              className="text-[2.5rem] sm:text-[3.5rem] md:text-[4.5rem] font-bold tracking-[-0.02em] leading-[1.1]"
            >
              {t.hero.title1}{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${ACCENT_PRIMARY}, ${ACCENT_SECONDARY})`,
                }}
              >
                {t.hero.titleHighlight}
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={fadeUp}
              className="mt-6 text-lg md:text-xl text-[#b4b4b4] max-w-2xl mx-auto leading-relaxed"
            >
              {t.hero.subtitle}
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={fadeUp}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                href="/signup"
                className="rounded-full px-8 py-4 text-base font-semibold text-white hover:-translate-y-[1px] transition-all duration-300"
                style={{
                  background: `linear-gradient(135deg, ${ACCENT_PRIMARY}, ${ACCENT_SECONDARY})`,
                  boxShadow: `0 0 20px ${ACCENT_PRIMARY}30`,
                }}
              >
                {t.hero.cta}
              </Link>
              <a
                href="#how-it-works"
                className="rounded-full border border-white/[0.08] px-8 py-4 text-base font-medium text-[#b4b4b4] hover:text-white hover:border-white/20 transition-all"
              >
                {t.hero.ctaSecondary}
              </a>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
          <div className="w-6 h-10 rounded-full border-2 border-white/10 flex items-start justify-center p-1.5">
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-white/30"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          3. STATS BAR — 3 columns, gradient numbers
          ═══════════════════════════════════════════════════════════ */}
      <section className="border-t border-b border-white/[0.06] py-12 my-24">
        <div className="max-w-4xl mx-auto px-5">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-4"
          >
            {[
              { value: t.hero.stat1, label: t.hero.stat1Label },
              { value: t.hero.stat2, label: t.hero.stat2Label },
              { value: t.hero.stat3, label: t.hero.stat3Label },
            ].map((stat) => (
              <motion.div key={stat.label} variants={fadeUp} className="text-center">
                <div
                  className="text-[3rem] font-bold bg-clip-text text-transparent"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${ACCENT_PRIMARY}, ${ACCENT_SECONDARY})`,
                  }}
                >
                  {stat.value}
                </div>
                <div className="text-xs text-[#6b6b6b] mt-1 uppercase tracking-[0.15em]">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          4. TESTIMONIALS — 3 glass cards
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-5">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
          >
            <motion.h2
              variants={fadeUp}
              className="text-sm uppercase tracking-[0.2em] text-[#6b6b6b] text-center mb-12"
            >
              {t.socialProof.title}
            </motion.h2>

            <div className="grid md:grid-cols-3 gap-6">
              {t.socialProof.testimonials.map((testimonial, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className={`rounded-2xl ${glassCard} p-6 hover:border-white/[0.12] transition-all duration-300`}
                >
                  <p className="text-white/80 leading-relaxed mb-6">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                      style={{
                        background: `linear-gradient(135deg, ${ACCENT_PRIMARY}, ${ACCENT_SECONDARY})`,
                      }}
                    >
                      {testimonial.author[0]}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{testimonial.author}</div>
                      <div className="text-xs text-[#6b6b6b]">{testimonial.role}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          5. HOW IT WORKS — vertical timeline with real logos
          ═══════════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="py-24 border-t border-white/[0.06]">
        <div className="max-w-[800px] mx-auto px-5">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
          >
            <motion.div variants={fadeUp} className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-[-0.02em]">
                {t.howItWorks.title}
              </h2>
              <p className="mt-3 text-[#b4b4b4] text-lg">{t.howItWorks.subtitle}</p>
            </motion.div>

            <div className="relative">
              {/* Vertical gradient line */}
              <div
                className="absolute left-8 top-0 bottom-0 w-[2px] hidden md:block"
                style={{
                  background: `linear-gradient(to bottom, ${LANDING_COLORS.soma}, ${LANDING_COLORS.seren}, ${LANDING_COLORS.luma}, ${LANDING_COLORS.echo})`,
                }}
              />

              <div className="space-y-12">
                {t.howItWorks.steps.map((step, i) => {
                  const mirror = MIRROR_LIST[i]
                  const color = LANDING_COLORS[mirror.slug] || mirror.color
                  const logoSrc = MIRROR_LOGOS[mirror.slug]

                  return (
                    <motion.div
                      key={i}
                      variants={fadeUp}
                      className="flex gap-6 md:gap-8 items-start"
                    >
                      {/* Mirror logo (64px) */}
                      <div className="relative z-10 flex-shrink-0">
                        <div
                          className="w-16 h-16 rounded-2xl flex items-center justify-center border overflow-hidden"
                          style={{
                            backgroundColor: `${color}10`,
                            borderColor: `${color}30`,
                          }}
                        >
                          <Image
                            src={logoSrc}
                            alt={mirror.name}
                            width={64}
                            height={64}
                            className="object-contain p-1"
                          />
                        </div>
                      </div>
                      <div className="pt-2">
                        <h3
                          className="text-[1.75rem] font-semibold mb-2"
                          style={{ color }}
                        >
                          {step.title}
                        </h3>
                        <p className="text-[#b4b4b4] leading-relaxed">{step.description}</p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          6. MIRRORS GRID — 2x2 glass cards with real logos (72px)
          ═══════════════════════════════════════════════════════════ */}
      <section id="mirrors" className="py-24 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-5">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
          >
            <motion.div variants={fadeUp} className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-[-0.02em]">
                {t.mirrors.title}
              </h2>
              <p className="mt-3 text-[#b4b4b4] text-lg max-w-2xl mx-auto">
                {t.mirrors.subtitle}
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 gap-6">
              {MIRROR_LIST.map((mirror) => {
                const color = LANDING_COLORS[mirror.slug] || mirror.color
                const logoSrc = MIRROR_LOGOS[mirror.slug]

                return (
                  <motion.div
                    key={mirror.slug}
                    variants={fadeUp}
                    whileHover={{
                      y: -6,
                      borderColor: `${color}40`,
                      boxShadow: `0 16px 48px rgba(0, 0, 0, 0.4)`,
                      transition: { duration: 0.25 },
                    }}
                    className={`group relative rounded-[20px] ${glassCard} p-10 transition-all duration-300 overflow-hidden`}
                  >
                    {/* Hover glow effect */}
                    <div
                      className="absolute -top-24 -right-24 w-48 h-48 rounded-full opacity-0 group-hover:opacity-100 blur-[60px] transition-opacity duration-500"
                      style={{ backgroundColor: `${color}15` }}
                    />
                    {/* Radial gradient subtle bg */}
                    <div
                      className="absolute inset-0 rounded-[20px] opacity-[0.08]"
                      style={{
                        background: `radial-gradient(circle at 30% 30%, ${color}, transparent 70%)`,
                      }}
                    />

                    <div className="relative">
                      {/* Logo */}
                      <div className="mb-5">
                        <Image
                          src={logoSrc}
                          alt={mirror.name}
                          width={72}
                          height={72}
                          className="object-contain"
                        />
                      </div>

                      {/* Name + Badge */}
                      <div className="flex items-center justify-between mb-1">
                        <div>
                          <h3 className="text-xl font-bold" style={{ color }}>
                            {mirror.name}
                          </h3>
                          <span className="text-xs text-[#6b6b6b] uppercase tracking-wider">
                            {t.mirrors.phases[mirror.phase]}
                          </span>
                        </div>
                        <span
                          className="text-xs px-2.5 py-1 rounded-full font-medium"
                          style={{
                            backgroundColor: mirror.isPremium ? `${color}15` : `${LANDING_COLORS.soma}15`,
                            color: mirror.isPremium ? color : LANDING_COLORS.soma,
                          }}
                        >
                          {mirror.isPremium ? t.mirrors.premium : t.mirrors.free}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-[#b4b4b4] leading-relaxed mt-3">
                        {mirror.descriptions[lang]}
                      </p>
                    </div>

                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          7. PRICING — 2 columns, featured premium card
          ═══════════════════════════════════════════════════════════ */}
      <section id="pricing" className="py-24 border-t border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-5">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
          >
            <motion.div variants={fadeUp} className="text-center mb-6">
              <h2 className="text-3xl md:text-4xl font-bold tracking-[-0.02em]">
                {t.pricing.title}
              </h2>
              <p className="mt-3 text-[#b4b4b4] text-lg">{t.pricing.subtitle}</p>
            </motion.div>

            {/* Urgency */}
            <motion.div variants={fadeUp} className="text-center mb-12">
              <span className="inline-flex items-center gap-2 text-sm text-[#fbbf24]">
                <span className="text-base">&#128293;</span>
                {t.pricing.urgency}
              </span>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Free Plan */}
              <motion.div
                variants={fadeUp}
                className={`rounded-2xl ${glassCard} p-8`}
              >
                <h3 className="text-xl font-bold mb-1">{t.pricing.free.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold">{t.pricing.free.price}</span>
                  <span className="text-[#6b6b6b]">{t.pricing.free.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {t.pricing.free.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm text-[#b4b4b4]">
                      <svg
                        className="w-4 h-4 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke={LANDING_COLORS.soma}
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className="block text-center rounded-full border border-white/[0.08] px-6 py-3 text-sm font-medium hover:bg-white/5 hover:-translate-y-[1px] transition-all"
                >
                  {t.pricing.free.cta}
                </Link>
              </motion.div>

              {/* Premium Plan */}
              <motion.div
                variants={fadeUp}
                className={`relative rounded-2xl ${glassCard} p-8 animate-pulse-glow`}
                style={{ borderColor: `${ACCENT_PRIMARY}40` }}
              >
                {/* Badge */}
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span
                    className="rounded-full px-4 py-1 text-xs font-semibold text-white whitespace-nowrap"
                    style={{
                      background: `linear-gradient(135deg, ${ACCENT_PRIMARY}, ${ACCENT_SECONDARY})`,
                    }}
                  >
                    {t.pricing.premium.badge}
                  </span>
                </div>

                <h3 className="text-xl font-bold mb-1">{t.pricing.premium.name}</h3>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-4xl font-bold">{t.pricing.premium.price}</span>
                  <span className="text-[#6b6b6b]">{t.pricing.premium.period}</span>
                  <span className="text-sm text-[#6b6b6b] line-through ml-2 opacity-50">
                    {t.pricing.premium.oldPrice}
                  </span>
                </div>
                <ul className="space-y-3 mb-8">
                  {t.pricing.premium.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm text-[#b4b4b4]">
                      <svg
                        className="w-4 h-4 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke={ACCENT_PRIMARY}
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className="block text-center rounded-full px-6 py-3 text-sm font-semibold text-white hover:opacity-90 hover:-translate-y-[1px] transition-all"
                  style={{
                    background: `linear-gradient(135deg, ${ACCENT_PRIMARY}, ${ACCENT_SECONDARY})`,
                  }}
                >
                  {t.pricing.premium.cta}
                </Link>
              </motion.div>
            </div>

            <motion.p
              variants={fadeUp}
              className="text-center text-sm text-[#6b6b6b] mt-6"
            >
              {t.pricing.guarantee}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          8. FAQ — accordion, glass cards
          ═══════════════════════════════════════════════════════════ */}
      <section id="faq" className="py-24 border-t border-white/[0.06]">
        <div className="max-w-[800px] mx-auto px-5">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
          >
            <motion.h2
              variants={fadeUp}
              className="text-3xl md:text-4xl font-bold text-center mb-12 tracking-[-0.02em]"
            >
              {t.faq.title}
            </motion.h2>

            <div className="space-y-3">
              {t.faq.items.map((item, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className={`rounded-xl ${glassCard} overflow-hidden hover:border-white/[0.12] transition-colors`}
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-white/[0.02] transition-colors"
                  >
                    <span className="font-medium pr-4">{item.q}</span>
                    <svg
                      className={`w-5 h-5 text-[#6b6b6b] flex-shrink-0 transition-transform duration-300 ${
                        openFaq === i ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
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
                        <div className="px-6 pb-5 text-sm text-[#b4b4b4] leading-relaxed">
                          {item.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          9. CTA — gradient box with rotating border animation
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-5">
          {/* Outer wrapper for rotating border effect */}
          <div className="relative rounded-3xl p-[2px] overflow-hidden">
            {/* Rotating gradient pseudo-border */}
            <div className="absolute inset-[-50%] animate-spin-slow">
              <div
                className="w-full h-full"
                style={{
                  background: `conic-gradient(from 0deg, ${LANDING_COLORS.soma}, ${LANDING_COLORS.seren}, ${LANDING_COLORS.luma}, ${LANDING_COLORS.echo}, ${LANDING_COLORS.soma})`,
                }}
              />
            </div>

            {/* Inner content */}
            <div
              className="relative rounded-3xl px-8 py-24 text-center"
              style={{
                background: `linear-gradient(135deg, ${ACCENT_PRIMARY}, ${ACCENT_SECONDARY})`,
              }}
            >
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-100px' }}
                variants={stagger}
              >
                <motion.h2
                  variants={fadeUp}
                  className="text-3xl md:text-5xl font-bold tracking-[-0.02em]"
                >
                  {t.finalCta.title}
                </motion.h2>
                <motion.p variants={fadeUp} className="mt-4 text-lg text-white/80">
                  {t.finalCta.subtitle}
                </motion.p>
                <motion.div variants={fadeUp} className="mt-8">
                  <Link
                    href="/signup"
                    className="inline-block rounded-full bg-white px-10 py-4 text-base font-semibold hover:-translate-y-[1px] hover:shadow-xl transition-all duration-300"
                    style={{ color: ACCENT_PRIMARY }}
                  >
                    {t.finalCta.button}
                  </Link>
                </motion.div>
                <motion.p
                  variants={fadeUp}
                  className="mt-4 text-sm text-white/60"
                >
                  {t.finalCta.urgency}
                </motion.p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          10. FOOTER
          ═══════════════════════════════════════════════════════════ */}
      <footer className="border-t border-white/[0.06] py-12">
        <div className="max-w-6xl mx-auto px-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6 text-center md:text-left">
              <Link href="/" className="flex items-center gap-2.5">
                <Image
                  src="/logos/anima-logo.png"
                  alt="ANIMA"
                  width={28}
                  height={28}
                  className="rounded-full"
                />
                <span className="text-lg font-bold tracking-[0.15em]">ANIMA</span>
              </Link>
            </div>
            <div className="flex items-center gap-6 text-sm text-[#6b6b6b]">
              <span className="hover:text-white transition-colors cursor-pointer">
                {t.footer.privacy}
              </span>
              <span className="hover:text-white transition-colors cursor-pointer">
                {t.footer.terms}
              </span>
            </div>
          </div>
          <div className="mt-6 border-t border-white/[0.06] pt-6">
            <p className="text-xs text-[#6b6b6b] max-w-2xl">{t.footer.disclaimer}</p>
          </div>
          <div className="mt-4 text-center text-xs text-[#6b6b6b]/60">
            {t.footer.copyright}
          </div>
        </div>
      </footer>
    </div>
  )
}
