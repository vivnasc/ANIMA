'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Language, SubscriptionTier, SubscriptionStatus } from '@/types/database'

interface SettingsFormProps {
  email: string
  language: Language
  subscriptionTier: SubscriptionTier
  subscriptionStatus: SubscriptionStatus
}

export function SettingsForm({
  email,
  language: initialLanguage,
  subscriptionTier,
  subscriptionStatus
}: SettingsFormProps) {
  const [language, setLanguage] = useState(initialLanguage)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSaveLanguage = async () => {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      await supabase
        .from('users')
        .update({ language_preference: language })
        .eq('id', user.id)
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Account */}
      <div className="rounded-2xl p-6 space-y-4" style={{ backgroundColor: '#f0ece6', border: '1px solid #ccc7bc' }}>
        <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#9a7b50' }}>Conta</h2>
        <div className="space-y-1">
          <label className="text-sm" style={{ color: '#7a746b' }}>Email</label>
          <p className="text-sm font-medium" style={{ color: '#2a2520' }}>{email}</p>
        </div>
      </div>

      {/* Language */}
      <div className="rounded-2xl p-6 space-y-4" style={{ backgroundColor: '#f0ece6', border: '1px solid #ccc7bc' }}>
        <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#9a7b50' }}>Idioma</h2>
        <div className="flex items-center gap-3">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
            style={{ backgroundColor: '#fffcf8', border: '1px solid #ccc7bc', color: '#2a2520' }}
          >
            <option value="pt">Portugues</option>
            <option value="en">English</option>
            <option value="fr">Francais</option>
            <option value="es">Espanol</option>
          </select>
          <button
            onClick={handleSaveLanguage}
            disabled={saving}
            className="rounded-xl px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50 transition-all hover:opacity-90"
            style={{ backgroundColor: '#9a7b50' }}
          >
            {saving ? 'A guardar...' : saved ? 'Guardado!' : 'Guardar'}
          </button>
        </div>
      </div>

      {/* Subscription */}
      <div className="rounded-2xl p-6 space-y-4" style={{ backgroundColor: '#f0ece6', border: '1px solid #ccc7bc' }}>
        <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#9a7b50' }}>Subscricao</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span
              className="text-sm px-3 py-1 rounded-full font-medium"
              style={
                subscriptionTier !== 'free'
                  ? { backgroundColor: '#9a7b5020', color: '#9a7b50' }
                  : { backgroundColor: '#e8e3da', color: '#7a746b' }
              }
            >
              {subscriptionTier === 'free' ? 'Free' : subscriptionTier.charAt(0).toUpperCase() + subscriptionTier.slice(1)}
            </span>
            {subscriptionTier !== 'free' && (
              <span className="text-xs" style={{ color: '#7a746b' }}>
                Status: {subscriptionStatus}
              </span>
            )}
          </div>

          {subscriptionTier === 'free' ? (
            <div className="space-y-4">
              <div className="text-sm space-y-2">
                <p className="font-medium" style={{ color: '#2a2520' }}>Upgrade para Essencial — 19EUR/mes</p>
                <ul className="space-y-1" style={{ color: '#5a554e' }}>
                  <li>Conversas ilimitadas</li>
                  <li>Todos os 4 Espelhos (SOMA, SEREN, LUMA, ECHO)</li>
                  <li>28 sessoes guiadas com rituais</li>
                  <li>Deteccao de padroes por AI</li>
                  <li>Diario exportavel</li>
                </ul>
              </div>

              {process.env.NEXT_PUBLIC_PAYPAL_MODE && (
                <div id="paypal-button-container">
                  <PayPalButton />
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm space-y-2" style={{ color: '#7a746b' }}>
              <p>Tens acesso a todos os espelhos e funcionalidades do teu plano.</p>
              {subscriptionTier === 'essencial' && (
                <p style={{ color: '#5a554e' }}>Faz upgrade para <strong>Relacional (29EUR)</strong> para desbloquear o NEXUS.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function PayPalButton() {
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/paypal/create-subscription', { method: 'POST' })
      const data = await res.json()
      if (data.approvalUrl) {
        window.location.href = data.approvalUrl
      }
    } catch (err) {
      console.error('PayPal error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleSubscribe}
      disabled={loading}
      className="w-full rounded-xl px-5 py-3 text-sm font-medium text-white disabled:opacity-50 transition-all hover:opacity-90"
      style={{ backgroundColor: '#9a7b50' }}
    >
      {loading ? 'A carregar...' : 'Subscrever — 19EUR/mes'}
    </button>
  )
}
