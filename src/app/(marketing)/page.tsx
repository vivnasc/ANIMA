import Link from 'next/link'
import { MIRRORS } from '@/lib/ai/mirrors'

export default function LandingPage() {
  const mirrors = Object.values(MIRRORS).sort((a, b) => a.order - b.order)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <span className="text-xl font-bold tracking-tight">ANIMA</span>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight max-w-3xl mx-auto leading-tight">
          Discover who you are through{' '}
          <span className="bg-gradient-to-r from-[#10b981] via-[#6366f1] to-[#8b5cf6] bg-clip-text text-transparent">
            deep conversations
          </span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          ANIMA guides you through a structured journey of self-discovery with 4 AI mirrors,
          each specialized in a different dimension of personal growth.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/signup"
            className="rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Start Your Journey - Free
          </Link>
          <a
            href="#mirrors"
            className="rounded-xl border border-border px-6 py-3 text-sm font-medium text-foreground hover:bg-muted"
          >
            Learn More
          </a>
        </div>
      </section>

      {/* Journey Flow */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center gap-2 sm:gap-4 text-sm flex-wrap">
          {mirrors.map((mirror, i) => (
            <div key={mirror.slug} className="flex items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-1.5">
                <span className="text-xl">{mirror.icon}</span>
                <span className="font-semibold" style={{ color: mirror.color }}>
                  {mirror.name}
                </span>
              </div>
              {i < mirrors.length - 1 && (
                <span className="text-muted-foreground">→</span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Mirrors Section */}
      <section id="mirrors" className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-4">The 4 Mirrors</h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Each mirror represents a phase of your journey. Progress through them at your own pace,
          guided by AI that remembers and connects your insights.
        </p>

        <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {mirrors.map((mirror) => (
            <div
              key={mirror.slug}
              className="rounded-2xl border border-border bg-card p-6 hover:shadow-lg transition-shadow"
              style={{ borderTopWidth: '4px', borderTopColor: mirror.color }}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{mirror.icon}</span>
                <div>
                  <h3 className="font-bold text-lg" style={{ color: mirror.color }}>
                    {mirror.name}
                  </h3>
                  <span className="text-xs text-muted-foreground capitalize">
                    {mirror.phase} phase
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {mirror.descriptions.en}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>

          <div className="grid sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold mx-auto">
                1
              </div>
              <h3 className="font-semibold">Start with SOMA</h3>
              <p className="text-sm text-muted-foreground">
                Begin your journey by exploring your relationship with your body and emotional foundations.
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold mx-auto">
                2
              </div>
              <h3 className="font-semibold">Progress Through Phases</h3>
              <p className="text-sm text-muted-foreground">
                Each mirror builds on the last. Insights from SOMA inform SEREN, which prepares you for LUMA and ECHO.
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold mx-auto">
                3
              </div>
              <h3 className="font-semibold">See Your Patterns</h3>
              <p className="text-sm text-muted-foreground">
                Your dashboard shows identified patterns, breakthroughs, and your progress through the complete journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Simple Pricing</h2>

        <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Free */}
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <h3 className="font-bold text-lg">Free</h3>
            <div className="text-3xl font-bold">€0<span className="text-sm font-normal text-muted-foreground">/month</span></div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• 10 conversations/month</li>
              <li>• SOMA mirror (Foundation phase)</li>
              <li>• 30-day history</li>
              <li>• Basic dashboard</li>
            </ul>
            <Link
              href="/signup"
              className="block text-center rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Get Started
            </Link>
          </div>

          {/* Premium */}
          <div className="rounded-2xl border-2 border-indigo-500 bg-card p-6 space-y-4 relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-xs px-3 py-1 rounded-full font-medium">
              Most Popular
            </span>
            <h3 className="font-bold text-lg">Premium</h3>
            <div className="text-3xl font-bold">€19<span className="text-sm font-normal text-muted-foreground">/month</span></div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Unlimited conversations</li>
              <li>• All 4 Mirrors</li>
              <li>• Unlimited history</li>
              <li>• Cross-mirror insights</li>
              <li>• Export conversations</li>
              <li>• Guided journeys</li>
            </ul>
            <Link
              href="/signup"
              className="block text-center rounded-lg bg-indigo-500 text-white px-4 py-2 text-sm font-medium hover:bg-indigo-600"
            >
              Start Premium
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Begin Your Journey of Self-Discovery</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            ANIMA is not therapy. It&apos;s a structured companion for deep self-reflection,
            available in Portuguese, English, French, and Spanish.
          </p>
          <Link
            href="/signup"
            className="inline-block rounded-xl bg-primary px-8 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Start Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} ANIMA. All rights reserved.</p>
          <p className="mt-2">
            ANIMA does not replace professional therapy. If you need help, please reach out to a mental health professional.
          </p>
        </div>
      </footer>
    </div>
  )
}
