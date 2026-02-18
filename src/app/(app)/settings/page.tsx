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
    <div className="container max-w-2xl py-8 px-4 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and subscription</p>
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
