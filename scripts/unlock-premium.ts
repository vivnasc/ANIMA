/**
 * Unlock premium for a specific user.
 * Usage: npx tsx scripts/unlock-premium.ts viv-saraiva@gmail.com
 */
import { createClient } from '@supabase/supabase-js'

const email = process.argv[2] || 'viv-saraiva@gmail.com'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function unlock() {
  const { data, error } = await supabase
    .from('users')
    .update({
      subscription_tier: 'premium',
      subscription_status: 'active',
    })
    .eq('email', email)
    .select('id, email, subscription_tier')

  if (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }

  if (!data || data.length === 0) {
    console.log(`No user found with email: ${email}`)
    console.log('Make sure the user has signed up first.')
    process.exit(1)
  }

  console.log(`Premium unlocked for ${email}:`, data[0])
}

unlock()
