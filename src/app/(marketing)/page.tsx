'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { MIRROR_LIST } from '@/lib/ai/mirrors'
import { translations } from '@/lib/landing-i18n'
import type { Language } from '@/types/database'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const } },
}
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

const LANG_LABELS: Record<Language, string> = { pt: 'PT', en: 'EN', es: 'ES', fr: 'FR' }

export default function LandingPage() {
  const [lang, setLang] = useState<Language>('pt')
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const t = translations[lang]

  return (
    <div className="min-h-screen bg-[#08080a] text-[#ede9e3] overflow-x-hidden">
      {/* ─── HEADER ─── */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#08080a]/80 border-b border-white/5">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-5 py-3">
          <Link href="/" className="text-xl font-bold tracking-[0.2em] text-[#ede9e3]">
            ANIMA
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-[#8b8680]">
            <a href="#how-it-works" className="hover:text-[#ede9e3] transition-colors">{t.nav.howItWorks}</a>
            <a href="#mirrors" className="hover:text-[#ede9e3] transition-colors">{t.nav.mirrors}</a>
            <a href="#pricing" className="hover:text-[#ede9e3] transition-colors">{t.nav.pricing}</a>
            <a href="#faq" className="hover:text-[#ede9e3] transition-colors">{t.nav.faq}</a>
          </nav>
          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <div className="flex items-center rounded-full border border-white/10 overflow-hidden text-xs">
              {(['pt', 'en', 'es', 'fr'] as Language[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-2.5 py-1.5 transition-colors ${
                    lang === l ? 'bg-white/10 text-[#ede9e3]' : 'text-[#8b8680] hover:text-[#ede9e3]'
                  }`}
                >
                  {LANG_LABELS[l]}
                </button>
              ))}
            </div>
            <Link href="/login" className="text-sm text-[#8b8680] hover:text-[#ede9e3] transition-colors hidden sm:block">
              {t.nav.login}
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-gradient-to-r from-[#10b981] to-[#6366f1] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
            >
              {t.nav.start}
            </Link>
          </div>
        </div>
      </header>

      {/* ─── HERO ─── */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        {/* Background gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-[#10b981]/8 blur-[120px] animate-breathe" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-[#6366f1]/8 blur-[120px] animate-breathe" style={{ animationDelay: '3s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-[#8b5cf6]/6 blur-[100px] animate-breathe" style={{ animationDelay: '1.5s' }} />
        </div>

        <div className="relative max-w-4xl mx-auto px-5 text-center">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            {/* Urgency Badge */}
            <motion.div variants={fadeUp} className="mb-8">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#c9a96e]/30 bg-[#c9a96e]/10 px-4 py-2 text-sm text-[#c9a96e]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c9a96e] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#c9a96e]" />
                </span>
                {t.hero.badge}
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]">
              {t.hero.title1}{' '}
              <span className="bg-gradient-to-r from-[#10b981] via-[#6366f1] to-[#8b5cf6] bg-clip-text text-transparent">
                {t.hero.titleHighlight}
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p variants={fadeUp} className="mt-6 text-lg md:text-xl text-[#8b8680] max-w-2xl mx-auto leading-relaxed">
              {t.hero.subtitle}
            </motion.p>

            {/* CTAs */}
            <motion.div variants={fadeUp} className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="group relative rounded-full bg-gradient-to-r from-[#10b981] to-[#6366f1] px-8 py-4 text-base font-semibold text-white hover:shadow-[0_0_30px_rgba(99,102,241,0.3)] transition-all duration-300"
              >
                {t.hero.cta}
              </Link>
              <a
                href="#how-it-works"
                className="rounded-full border border-white/10 px-8 py-4 text-base font-medium text-[#8b8680] hover:text-[#ede9e3] hover:border-white/20 transition-all"
              >
                {t.hero.ctaSecondary}
              </a>
            </motion.div>

            {/* Stats */}
            <motion.div variants={fadeUp} className="mt-16 flex items-center justify-center gap-8 sm:gap-16">
              {[
                { value: t.hero.stat1, label: t.hero.stat1Label },
                { value: t.hero.stat2, label: t.hero.stat2Label },
                { value: t.hero.stat3, label: t.hero.stat3Label },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#10b981] to-[#6366f1] bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-xs text-[#8b8680] mt-1 uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
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

      {/* ─── SOCIAL PROOF ─── */}
      <section className="py-24 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-5">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={stagger}>
            <motion.h2 variants={fadeUp} className="text-sm uppercase tracking-[0.2em] text-[#8b8680] text-center mb-12">
              {t.socialProof.title}
            </motion.h2>
            <div className="grid md:grid-cols-3 gap-6">
              {t.socialProof.testimonials.map((testimonial, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="rounded-2xl border border-white/5 bg-[#111113] p-6 hover:border-white/10 transition-colors"
                >
                  <p className="text-[#ede9e3]/80 leading-relaxed mb-6">&ldquo;{testimonial.quote}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#10b981] to-[#6366f1] flex items-center justify-center text-sm font-bold text-white">
                      {testimonial.author[0]}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{testimonial.author}</div>
                      <div className="text-xs text-[#8b8680]">{testimonial.role}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="py-24 border-t border-white/5">
        <div className="max-w-5xl mx-auto px-5">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold">{t.howItWorks.title}</h2>
              <p className="mt-3 text-[#8b8680] text-lg">{t.howItWorks.subtitle}</p>
            </motion.div>

            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-[#10b981] via-[#6366f1] to-[#8b5cf6] hidden md:block" />

              <div className="space-y-12">
                {t.howItWorks.steps.map((step, i) => {
                  const mirror = MIRROR_LIST[i]
                  return (
                    <motion.div key={i} variants={fadeUp} className="flex gap-6 md:gap-8 items-start">
                      <div
                        className="relative z-10 flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center text-2xl border border-white/10"
                        style={{ backgroundColor: `${mirror.color}15`, borderColor: `${mirror.color}30` }}
                      >
                        {mirror.icon}
                      </div>
                      <div className="pt-2">
                        <h3 className="text-xl font-semibold mb-2" style={{ color: mirror.color }}>
                          {step.title}
                        </h3>
                        <p className="text-[#8b8680] leading-relaxed">{step.description}</p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── MIRRORS ─── */}
      <section id="mirrors" className="py-24 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-5">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold">{t.mirrors.title}</h2>
              <p className="mt-3 text-[#8b8680] text-lg max-w-2xl mx-auto">{t.mirrors.subtitle}</p>
            </motion.div>

            <div className="grid sm:grid-cols-2 gap-6">
              {MIRROR_LIST.map((mirror) => (
                <motion.div
                  key={mirror.slug}
                  variants={fadeUp}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="group relative rounded-2xl border border-white/5 bg-[#111113] p-8 hover:border-white/10 transition-all overflow-hidden"
                >
                  {/* Glow effect */}
                  <div
                    className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-0 group-hover:opacity-100 blur-[60px] transition-opacity duration-500"
                    style={{ backgroundColor: `${mirror.color}20` }}
                  />

                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{mirror.icon}</span>
                        <div>
                          <h3 className="text-xl font-bold" style={{ color: mirror.color }}>
                            {mirror.name}
                          </h3>
                          <span className="text-xs text-[#8b8680] uppercase tracking-wider">
                            {t.mirrors.phases[mirror.phase]}
                          </span>
                        </div>
                      </div>
                      <span
                        className="text-xs px-2.5 py-1 rounded-full font-medium"
                        style={{
                          backgroundColor: mirror.isPremium ? `${mirror.color}15` : '#10b98115',
                          color: mirror.isPremium ? mirror.color : '#10b981',
                        }}
                      >
                        {mirror.isPremium ? t.mirrors.premium : t.mirrors.free}
                      </span>
                    </div>
                    <p className="text-[#8b8680] leading-relaxed">
                      {mirror.descriptions[lang]}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section id="pricing" className="py-24 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-5">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-6">
              <h2 className="text-3xl md:text-4xl font-bold">{t.pricing.title}</h2>
              <p className="mt-3 text-[#8b8680] text-lg">{t.pricing.subtitle}</p>
            </motion.div>

            {/* Urgency */}
            <motion.div variants={fadeUp} className="text-center mb-12">
              <span className="inline-flex items-center gap-2 text-sm text-[#c9a96e]">
                <span className="text-base">🔥</span>
                {t.pricing.urgency}
              </span>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Free Plan */}
              <motion.div variants={fadeUp} className="rounded-2xl border border-white/5 bg-[#111113] p-8">
                <h3 className="text-xl font-bold mb-1">{t.pricing.free.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold">{t.pricing.free.price}</span>
                  <span className="text-[#8b8680]">{t.pricing.free.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {t.pricing.free.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm text-[#8b8680]">
                      <svg className="w-4 h-4 text-[#10b981] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className="block text-center rounded-full border border-white/10 px-6 py-3 text-sm font-medium hover:bg-white/5 transition-colors"
                >
                  {t.pricing.free.cta}
                </Link>
              </motion.div>

              {/* Premium Plan */}
              <motion.div variants={fadeUp} className="relative rounded-2xl border border-[#6366f1]/30 bg-[#111113] p-8 animate-pulse-glow">
                {/* Badge */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] px-4 py-1 text-xs font-semibold text-white">
                    {t.pricing.premium.badge}
                  </span>
                </div>

                <h3 className="text-xl font-bold mb-1">{t.pricing.premium.name}</h3>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-4xl font-bold">{t.pricing.premium.price}</span>
                  <span className="text-[#8b8680]">{t.pricing.premium.period}</span>
                  <span className="text-sm text-[#8b8680] line-through ml-2">{t.pricing.premium.oldPrice}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {t.pricing.premium.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm text-[#8b8680]">
                      <svg className="w-4 h-4 text-[#6366f1] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className="block text-center rounded-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] px-6 py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                >
                  {t.pricing.premium.cta}
                </Link>
              </motion.div>
            </div>

            <motion.p variants={fadeUp} className="text-center text-sm text-[#8b8680] mt-6">
              {t.pricing.guarantee}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" className="py-24 border-t border-white/5">
        <div className="max-w-3xl mx-auto px-5">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={stagger}>
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold text-center mb-12">
              {t.faq.title}
            </motion.h2>

            <div className="space-y-3">
              {t.faq.items.map((item, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="rounded-xl border border-white/5 bg-[#111113] overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-white/[0.02] transition-colors"
                  >
                    <span className="font-medium pr-4">{item.q}</span>
                    <svg
                      className={`w-5 h-5 text-[#8b8680] flex-shrink-0 transition-transform duration-300 ${
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
                        <div className="px-6 pb-5 text-sm text-[#8b8680] leading-relaxed">
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

      {/* ─── FINAL CTA ─── */}
      <section className="py-24 border-t border-white/5 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-[#6366f1]/6 blur-[100px]" />
        </div>

        <div className="relative max-w-3xl mx-auto px-5 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={stagger}>
            <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-bold">
              {t.finalCta.title}
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-4 text-lg text-[#8b8680]">
              {t.finalCta.subtitle}
            </motion.p>
            <motion.div variants={fadeUp} className="mt-8">
              <Link
                href="/signup"
                className="inline-block rounded-full bg-gradient-to-r from-[#10b981] to-[#6366f1] px-10 py-4 text-base font-semibold text-white hover:shadow-[0_0_30px_rgba(99,102,241,0.3)] transition-all duration-300"
              >
                {t.finalCta.button}
              </Link>
            </motion.div>
            <motion.p variants={fadeUp} className="mt-4 text-sm text-[#c9a96e]">
              {t.finalCta.urgency}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-white/5 py-12">
        <div className="max-w-6xl mx-auto px-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <span className="text-lg font-bold tracking-[0.2em]">ANIMA</span>
              <p className="mt-2 text-xs text-[#8b8680] max-w-md">{t.footer.disclaimer}</p>
            </div>
            <div className="flex items-center gap-6 text-sm text-[#8b8680]">
              <span className="hover:text-[#ede9e3] transition-colors cursor-pointer">{t.footer.privacy}</span>
              <span className="hover:text-[#ede9e3] transition-colors cursor-pointer">{t.footer.terms}</span>
            </div>
          </div>
          <div className="mt-8 text-center text-xs text-[#8b8680]/60">
            {t.footer.copyright}
          </div>
        </div>
      </footer>
    </div>
  )
}
