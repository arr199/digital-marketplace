import { getPayloadClient } from '../server/get-payload'
import { type Product } from '../server/payload-types'
import { type WebHookRequest } from '../server/server'
import type express from 'express'
import stripe from 'stripe'
import type Stripe from 'stripe'
import nodemailer from 'nodemailer'
import { receiptEmailHtml } from '../components/emails/receiptEmail'

export async function stripeWebHookHandler (
  req: express.Request,
  res: express.Response
): Promise<express.Response> {
  console.log('REQUEST TO THIS ENDPOINT', req.path)
  const webhookRequest = req as any as WebHookRequest
  const body = webhookRequest.rawBody
  const signature = req.headers['stripe-signature'] ?? ''
  console.log('THIS IS THE SIGNATURE', signature)

  console.log('STRIPE SECRET : ', process.env.STRIPE_WEBHOOK_SECRET)
  let event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET ?? ''
    )
  } catch (err) {
    return res
      .status(400)
      .send(
      `Webhook Error: ${err instanceof Error ? err.message : 'Unknown Error'}`
      )
  }

  const session = event.data.object as Stripe.Checkout.Session

  if (!session?.metadata?.userId || !session?.metadata?.orderId) {
    return res.status(400).send('Webhook Error: No user present in metadata')
  }
  console.log('EVENT-TYPE')
  if (event.type === 'checkout.session.completed') {
    const payload = await getPayloadClient({})

    const { docs: users } = await payload.find({
      collection: 'users',
      where: {
        id: {
          equals: session.metadata.userId
        }
      }
    })

    const [user] = users
    console.log('USER DOESNT EXIST')
    if (!user) return res.status(404).json({ error: 'No such user exists.' })

    const { docs: orders } = await payload.find({
      collection: 'orders',
      depth: 2,
      where: {
        id: {
          equals: session.metadata.orderId
        }
      }
    })

    const [order] = orders
    console.log('ORDER DOESNT EXIST')
    if (!order) return res.status(404).json({ error: 'No such order exists.' })
    console.log('UPDATE ORDER')
    await payload.update({
      collection: 'orders',
      data: {
        isPaid: true
      },
      where: {
        id: {
          equals: session.metadata.orderId
        }
      }
    })

    // send receipt
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
      const data = await transporter.sendMail({
        from: process.env.GMAIL_SERVER_USER, // sender address
        to: user.email, // list of receivers
        text: 'Hello world?', // plain text body
        html: receiptEmailHtml({
          date: new Date(),
          email: user.email,
          orderId: session.metadata.orderId,
          products: order.products as Product[]
        })
      })

      res.status(200).json({ data })
    } catch (error) {
      res.status(500).json({ error })
    }
  }

  return res.status(200).send()
}
