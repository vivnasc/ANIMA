'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (password.length < 6) {
      setError('A password deve ter pelo menos 6 caracteres.')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('As passwords não coincidem.')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setTimeout(() => router.push('/dashboard'), 2000)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#ddd8cf' }}>
        <div className="w-full max-w-sm space-y-6 text-center">
          <Image src="/logos/anima-logo.png" alt="ANIMA" width={56} height={56} className="mx-auto rounded-full" />
          <h1 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', color: '#2a2520' }}>
            Password atualizada
          </h1>
          <p className="text-sm" style={{ color: '#5a554e' }}>
            A redirecionar para o dashboard...
          </p>
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
            Nova password
          </h1>
          <p className="text-sm" style={{ color: '#5a554e' }}>
            Escolhe a tua nova password.
          </p>
        </div>

        <form onSubmit={handleReset} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium" style={{ color: '#2a2520' }}>Nova password</label>
            <div className="relative">
              <input
                id="password" type={showPassword ? 'text' : 'password'} value={password}
                onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 caracteres"
                required minLength={6} autoComplete="new-password"
                className="w-full rounded-lg px-3.5 py-2.5 pr-10 text-sm outline-none transition-all duration-200 focus:ring-2"
                style={{ backgroundColor: 'rgba(255,252,248,0.7)', border: '1px solid rgba(42,37,32,0.12)', color: '#2a2520' }}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors" style={{ color: '#8a847a' }} tabIndex={-1}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  {showPassword ? (
                    <><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></>
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="confirm" className="text-sm font-medium" style={{ color: '#2a2520' }}>Confirmar password</label>
            <input
              id="confirm" type={showPassword ? 'text' : 'password'} value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repete a password"
              required minLength={6} autoComplete="new-password"
              className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none transition-all duration-200 focus:ring-2"
              style={{ backgroundColor: 'rgba(255,252,248,0.7)', border: '1px solid rgba(42,37,32,0.12)', color: '#2a2520' }}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: '#9a7b50', color: '#fff' }}>
            {loading ? 'A guardar...' : 'Guardar Nova Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
