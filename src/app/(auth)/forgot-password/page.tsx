'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/api/auth/callback?next=/reset-password`,
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
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#ddd8cf' }}>
        <div className="w-full max-w-sm space-y-8 text-center">
          <Image src="/logos/anima-logo.png" alt="ANIMA" width={56} height={56} className="mx-auto rounded-full" />
          <h1 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', color: '#2a2520' }}>
            Verifica o teu email
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: '#5a554e' }}>
            Se o email <strong>{email}</strong> estiver registado, vais receber um link para redefinir a tua password.
          </p>
          <Link href="/login" className="inline-block text-sm font-medium hover:underline" style={{ color: '#9a7b50' }}>
            Voltar ao login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#ddd8cf' }}>
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-3">
          <Link href="/" className="inline-block">
            <Image src="/logos/anima-logo.png" alt="ANIMA" width={56} height={56} className="mx-auto rounded-full" />
          </Link>
          <h1 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', color: '#2a2520' }}>
            Recuperar password
          </h1>
          <p className="text-sm" style={{ color: '#5a554e' }}>
            Indica o teu email e enviamos-te um link de recuperação.
          </p>
        </div>

        <form onSubmit={handleReset} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium" style={{ color: '#2a2520' }}>Email</label>
            <input
              id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@exemplo.com" required autoComplete="email"
              className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none transition-all duration-200 focus:ring-2"
              style={{ backgroundColor: 'rgba(255,252,248,0.7)', border: '1px solid rgba(42,37,32,0.12)', color: '#2a2520' }}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: '#9a7b50', color: '#fff' }}>
            {loading ? 'A enviar...' : 'Enviar Link de Recuperação'}
          </button>
        </form>

        <p className="text-center text-sm" style={{ color: '#8a847a' }}>
          <Link href="/login" className="font-medium hover:underline" style={{ color: '#2a2520' }}>Voltar ao login</Link>
        </p>
      </div>
    </div>
  )
}
