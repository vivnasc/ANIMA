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
    <div className="space-y-8">
      {/* Account */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="font-semibold">Conta</h2>
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Email</label>
          <p className="text-sm font-medium">{email}</p>
        </div>
      </div>

      {/* Language */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="font-semibold">Idioma</h2>
        <div className="flex items-center gap-3">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="pt">Português</option>
            <option value="en">English</option>
            <option value="fr">Français</option>
            <option value="es">Español</option>
          </select>
          <button
            onClick={handleSaveLanguage}
            disabled={saving}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? 'A guardar...' : saved ? 'Guardado!' : 'Guardar'}
          </button>
        </div>
      </div>

      {/* Subscription */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="font-semibold">Subscrição</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className={`text-sm px-3 py-1 rounded-full font-medium ${
              subscriptionTier === 'premium'
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                : 'bg-muted text-muted-foreground'
            }`}>
              {subscriptionTier === 'premium' ? 'Premium' : 'Free'}
            </span>
            {subscriptionTier === 'premium' && (
              <span className="text-xs text-muted-foreground">
                Status: {subscriptionStatus}
              </span>
            )}
          </div>

          {subscriptionTier === 'free' ? (
            <div className="space-y-3">
              <div className="text-sm space-y-1">
                <p className="font-medium">Upgrade para Premium - 19€/mês</p>
                <ul className="text-muted-foreground space-y-1">
                  <li>Conversas ilimitadas</li>
                  <li>Todos os 4 Espelhos (SOMA, SEREN, LUMA, ECHO)</li>
                  <li>Histórico ilimitado</li>
                  <li>Insights cross-mirror</li>
                  <li>Exportar conversas</li>
                </ul>
              </div>

              {process.env.NEXT_PUBLIC_PAYPAL_MODE && (
                <div id="paypal-button-container">
                  <PayPalButton />
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Tens acesso total a todos os espelhos e funcionalidades.
            </p>
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
      className="w-full rounded-lg bg-[#0070BA] px-4 py-3 text-sm font-medium text-white hover:bg-[#003087] disabled:opacity-50 transition-colors"
    >
      {loading ? 'A carregar...' : 'Subscrever com PayPal - 19€/mês'}
    </button>
  )
}
