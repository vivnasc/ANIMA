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
              Entrar
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Começar
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight max-w-3xl mx-auto leading-tight">
          Descobre quem és através de{' '}
          <span className="bg-gradient-to-r from-[#10b981] via-[#6366f1] to-[#8b5cf6] bg-clip-text text-transparent">
            conversas profundas
          </span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          O ANIMA guia-te numa jornada estruturada de autoconhecimento com 4 espelhos de IA,
          cada um especializado numa dimensão diferente do teu crescimento pessoal.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/signup"
            className="rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Começa a Tua Jornada - Grátis
          </Link>
          <a
            href="#mirrors"
            className="rounded-xl border border-border px-6 py-3 text-sm font-medium text-foreground hover:bg-muted"
          >
            Saber Mais
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
                <span className="text-muted-foreground">&rarr;</span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Mirrors Section */}
      <section id="mirrors" className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-4">Os 4 Espelhos</h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Cada espelho representa uma fase da tua jornada. Progride ao teu ritmo,
          guiado por IA que lembra e conecta os teus insights.
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
                    Fase de {mirror.phase === 'foundation' ? 'fundação' :
                      mirror.phase === 'regulation' ? 'regulação' :
                      mirror.phase === 'expansion' ? 'expansão' : 'integração'}
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {mirror.descriptions.pt}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Como Funciona</h2>

          <div className="grid sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold mx-auto">
                1
              </div>
              <h3 className="font-semibold">Começa com o SOMA</h3>
              <p className="text-sm text-muted-foreground">
                Inicia a tua jornada explorando a relação com o teu corpo e as tuas fundações emocionais.
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold mx-auto">
                2
              </div>
              <h3 className="font-semibold">Progride Pelas Fases</h3>
              <p className="text-sm text-muted-foreground">
                Cada espelho constrói sobre o anterior. Os insights do SOMA informam o SEREN, que te prepara para o LUMA e o ECHO.
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold mx-auto">
                3
              </div>
              <h3 className="font-semibold">Vê os Teus Padrões</h3>
              <p className="text-sm text-muted-foreground">
                O teu dashboard mostra padrões identificados, breakthroughs e o teu progresso ao longo da jornada completa.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Preço Simples</h2>

        <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Free */}
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <h3 className="font-bold text-lg">Grátis</h3>
            <div className="text-3xl font-bold">&euro;0<span className="text-sm font-normal text-muted-foreground">/mês</span></div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>10 conversas/mês</li>
              <li>Espelho SOMA (fase de Fundação)</li>
              <li>Histórico de 30 dias</li>
              <li>Dashboard básico</li>
            </ul>
            <Link
              href="/signup"
              className="block text-center rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Começar Grátis
            </Link>
          </div>

          {/* Premium */}
          <div className="rounded-2xl border-2 border-indigo-500 bg-card p-6 space-y-4 relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-xs px-3 py-1 rounded-full font-medium">
              Mais Popular
            </span>
            <h3 className="font-bold text-lg">Premium</h3>
            <div className="text-3xl font-bold">&euro;19<span className="text-sm font-normal text-muted-foreground">/mês</span></div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Conversas ilimitadas</li>
              <li>Todos os 4 Espelhos</li>
              <li>Histórico ilimitado</li>
              <li>Insights cross-mirror</li>
              <li>Exportar conversas</li>
              <li>Jornadas guiadas</li>
            </ul>
            <Link
              href="/signup"
              className="block text-center rounded-lg bg-indigo-500 text-white px-4 py-2 text-sm font-medium hover:bg-indigo-600"
            >
              Começar Premium
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Começa a Tua Jornada de Autoconhecimento</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            O ANIMA não é terapia. É um companheiro estruturado para reflexão profunda,
            disponível em Português, Inglês, Francês e Espanhol.
          </p>
          <Link
            href="/signup"
            className="inline-block rounded-xl bg-primary px-8 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Começar Grátis
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ANIMA. Todos os direitos reservados.</p>
          <p className="mt-2">
            O ANIMA não substitui terapia profissional. Se precisas de ajuda, procura um profissional de saúde mental.
          </p>
        </div>
      </footer>
    </div>
  )
}
