import { getPayloadClient } from '@/server/get-payload'
import type { Product } from '@/server/payload-types'
import Stripe from 'stripe'
import nodemailer from 'nodemailer'
import { ReceiptEmailHtml } from '@/components/emails/receiptEmail'

const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? ''

export async function POST (req: Request): Promise<Response> {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature') ?? ''

  let event: Stripe.Event
  try {
    event = Stripe.webhooks.constructEvent(
      body,
      signature,
      stripeWebhookSecret
    )
  } catch (err) {
    return Response.json(
      { error: `Webhook Error: ${err instanceof Error ? err.message : 'Unknown Error'}` },
      { status: 400 }
    )
  }

  const session = event.data.object as Stripe.Checkout.Session

  if (!session?.metadata?.userId || !session?.metadata?.orderId) {
    return Response.json({ error: 'No user present in metadata' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const payload = await getPayloadClient({})

    const { docs: users } = await payload.find({
      collection: 'users',
      where: {
        id: { equals: session.metadata.userId }
      }
    })

    const [user] = users
    if (!user) return Response.json({ error: 'No such user exists.' }, { status: 404 })

    const { docs: orders } = await payload.find({
      collection: 'orders',
      depth: 2,
      where: {
        id: { equals: session.metadata.orderId }
      }
    })

    const [order] = orders
    if (!order) return Response.json({ error: 'No such order exists.' }, { status: 404 })

    await payload.update({
      collection: 'orders',
      data: { isPaid: true },
      where: {
        id: { equals: session.metadata.orderId }
      }
    })

    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        secure: true,
        port: 465,
        auth: {
          user: process.env.GMAIL_SERVER_USER,
          pass: process.env.GMAIL_SERVER_PASS
        }
      })

      await transporter.sendMail({
        from: process.env.GMAIL_SERVER_USER,
        to: user.email,
        text: 'Receipt',
        html: ReceiptEmailHtml({
          date: new Date(),
          email: user.email,
          orderId: session.metadata.orderId,
          products: order.products as Product[]
        })
      })

      return Response.json({ success: true })
    } catch (error) {
      return Response.json({ error: 'Failed to send receipt' }, { status: 500 })
    }
  }

  return Response.json({ received: true })
}
