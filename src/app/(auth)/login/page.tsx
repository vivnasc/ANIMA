'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function LoginPage() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const urlError = searchParams.get('error')
    if (urlError) {
      setError('Não foi possível autenticar. Tenta novamente.')
    }
  }, [searchParams])

  const handleLogin = async (e: React.FormEvent) => {
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
            Clica no link no email para entrar.
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
            A tua jornada de autoconhecimento começa aqui
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
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
            {loading ? 'A enviar...' : 'Entrar com Magic Link'}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Ainda não tens conta?{' '}
          <Link href="/signup" className="font-medium text-foreground hover:underline">
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  )
}
