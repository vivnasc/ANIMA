/**
 * Unlock a subscription tier for a specific user.
 * Usage: npx tsx scripts/unlock-premium.ts viv.saraiva@gmail.com [tier]
 * Tiers: essencial | relacional | duo | profundo
 */
import { createClient } from '@supabase/supabase-js'

const email = process.argv[2] || 'viv.saraiva@gmail.com'
const tier = process.argv[3] || 'profundo'

const validTiers = ['free', 'essencial', 'relacional', 'duo', 'profundo']
if (!validTiers.includes(tier)) {
  console.error(`Invalid tier: ${tier}. Valid tiers: ${validTiers.join(', ')}`)
  process.exit(1)
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function unlock() {
  const { data, error } = await supabase
    .from('users')
    .update({
      subscription_tier: tier,
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

  console.log(`${tier} unlocked for ${email}:`, data[0])
}

unlock()
