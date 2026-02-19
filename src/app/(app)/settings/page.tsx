import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SettingsForm } from '@/components/settings/settings-form'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 md:px-8 space-y-8">
      <div className="pt-8 md:pt-0">
        <h1 className="text-2xl md:text-3xl font-heading font-semibold" style={{ color: '#2a2520' }}>Definições</h1>
        <p style={{ color: '#7a746b' }}>Gere a tua conta e subscrição</p>
      </div>

      <SettingsForm
        email={user.email || ''}
        language={userData?.language_preference || 'pt'}
        subscriptionTier={userData?.subscription_tier || 'free'}
        subscriptionStatus={userData?.subscription_status || 'inactive'}
      />
    </div>
  )
}
