import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const supabase = await createClient()

    const eventType = body.event_type
    const resource = body.resource

    // Log the event
    if (resource?.custom_id) {
      await supabase.from('subscription_events').insert({
        user_id: resource.custom_id,
        event_type: eventType,
        paypal_event_id: body.id,
        metadata: body
      })
    }

    switch (eventType) {
      case 'BILLING.SUBSCRIPTION.ACTIVATED': {
        const userId = resource.custom_id
        if (userId) {
          await supabase
            .from('users')
            .update({
              subscription_tier: 'premium',
              subscription_status: 'active',
              paypal_subscription_id: resource.id
            })
            .eq('id', userId)
        }
        break
      }

      case 'BILLING.SUBSCRIPTION.CANCELLED':
      case 'BILLING.SUBSCRIPTION.EXPIRED':
      case 'BILLING.SUBSCRIPTION.SUSPENDED': {
        const subscriptionId = resource.id
        if (subscriptionId) {
          await supabase
            .from('users')
            .update({
              subscription_status: 'cancelled',
              subscription_tier: 'free'
            })
            .eq('paypal_subscription_id', subscriptionId)
        }
        break
      }

      case 'PAYMENT.SALE.COMPLETED': {
        // Renewal successful - ensure user stays premium
        const subscriptionId = resource.billing_agreement_id
        if (subscriptionId) {
          await supabase
            .from('users')
            .update({
              subscription_status: 'active',
              subscription_tier: 'premium'
            })
            .eq('paypal_subscription_id', subscriptionId)
        }
        break
      }

      case 'BILLING.SUBSCRIPTION.PAYMENT.FAILED': {
        const subscriptionId = resource.id
        if (subscriptionId) {
          await supabase
            .from('users')
            .update({ subscription_status: 'inactive' })
            .eq('paypal_subscription_id', subscriptionId)
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('PayPal webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
