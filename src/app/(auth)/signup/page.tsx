'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm space-y-6 text-center">
          <div className="text-4xl">✉️</div>
          <h1 className="text-2xl font-bold">Verifica o teu email</h1>
          <p className="text-muted-foreground">
            Enviámos um magic link para <strong>{email}</strong>.
            Clica no link para criar a tua conta e começar a tua jornada.
          </p>
          <button
            onClick={() => setSent(false)}
            className="text-sm text-muted-foreground hover:text-foreground underline"
          >
            Usar outro email
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">ANIMA</h1>
          <p className="text-muted-foreground">
            Começa a tua jornada de autoconhecimento
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? 'A enviar...' : 'Criar Conta'}
          </button>
        </form>

        <div className="space-y-3">
          <div className="text-center text-xs text-muted-foreground space-y-1">
            <p>Grátis: 10 conversas/mês com SOMA</p>
            <p>Premium: Ilimitado com os 4 Espelhos</p>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Já tens conta?{' '}
          <Link href="/login" className="font-medium text-foreground hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
