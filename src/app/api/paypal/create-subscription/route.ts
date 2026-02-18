import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function getPayPalAccessToken(): Promise<string> {
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString('base64')

  const baseUrl = process.env.NEXT_PUBLIC_PAYPAL_MODE === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com'

  const res = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  const data = await res.json()
  return data.access_token
}

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const accessToken = await getPayPalAccessToken()
    const baseUrl = process.env.NEXT_PUBLIC_PAYPAL_MODE === 'live'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com'

    const res = await fetch(`${baseUrl}/v1/billing/subscriptions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        plan_id: process.env.PAYPAL_PREMIUM_PLAN_ID,
        custom_id: user.id,
        application_context: {
          brand_name: 'ANIMA',
          return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?subscription=success`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?subscription=cancelled`,
          user_action: 'SUBSCRIBE_NOW',
        },
      }),
    })

    const subscription = await res.json()

    const approvalLink = subscription.links?.find(
      (link: { rel: string; href: string }) => link.rel === 'approve'
    )

    if (!approvalLink) {
      return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 })
    }

    return NextResponse.json({ approvalUrl: approvalLink.href })
  } catch (error) {
    console.error('PayPal subscription creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
