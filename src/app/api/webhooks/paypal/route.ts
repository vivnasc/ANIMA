import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function verifyPayPalWebhook(req: Request, body: Record<string, unknown>): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID
  if (!webhookId) return false

  const transmissionId = req.headers.get('paypal-transmission-id')
  const transmissionTime = req.headers.get('paypal-transmission-time')
  const certUrl = req.headers.get('paypal-cert-url')
  const transmissionSig = req.headers.get('paypal-transmission-sig')
  const authAlgo = req.headers.get('paypal-auth-algo')

  if (!transmissionId || !transmissionTime || !certUrl || !transmissionSig || !authAlgo) {
    return false
  }

  try {
    const mode = process.env.NEXT_PUBLIC_PAYPAL_MODE === 'live' ? 'api-m' : 'api-m.sandbox'
    const clientId = process.env.PAYPAL_CLIENT_ID!
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET!

    // Get access token
    const tokenRes = await fetch(`https://${mode}.paypal.com/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    })
    const tokenData = await tokenRes.json()

    // Verify webhook signature
    const verifyRes = await fetch(`https://${mode}.paypal.com/v1/notifications/verify-webhook-signature`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        auth_algo: authAlgo,
        cert_url: certUrl,
        transmission_id: transmissionId,
        transmission_sig: transmissionSig,
        transmission_time: transmissionTime,
        webhook_id: webhookId,
        webhook_event: body
      })
    })

    const verifyData = await verifyRes.json()
    return verifyData.verification_status === 'SUCCESS'
  } catch (error) {
    console.error('PayPal webhook verification failed:', error)
    return false
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    // Verify webhook signature in production
    if (process.env.NODE_ENV === 'production') {
      const isValid = await verifyPayPalWebhook(req, body)
      if (!isValid) {
        console.error('Invalid PayPal webhook signature')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

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
          // Determine tier from plan ID (set in PayPal dashboard)
          const planTierMap: Record<string, string> = {
            [process.env.PAYPAL_ESSENCIAL_PLAN_ID || '']: 'essencial',
            [process.env.PAYPAL_RELACIONAL_PLAN_ID || '']: 'relacional',
            [process.env.PAYPAL_DUO_PLAN_ID || '']: 'duo',
            [process.env.PAYPAL_PROFUNDO_PLAN_ID || '']: 'profundo',
            [process.env.PAYPAL_PREMIUM_PLAN_ID || '']: 'essencial', // backward compat
          }
          const tier = planTierMap[resource.plan_id] || 'essencial'

          await supabase
            .from('users')
            .update({
              subscription_tier: tier,
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
        // Renewal successful - ensure user stays active
        const subscriptionId = resource.billing_agreement_id
        if (subscriptionId) {
          await supabase
            .from('users')
            .update({
              subscription_status: 'active',
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
