/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { TRPCError } from '@trpc/server'
import { privateProcedure, router } from './trpc'
import { z } from 'zod'
import { getPayloadClient } from '../server/get-payload'
import { stripe } from '../lib/stripe'
import type Stripe from 'stripe'

export const paymentRouter = router({
  createSession: privateProcedure
    .input(z.object({ productIds: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx
      const { productIds } = input

      if (productIds.length <= 0) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }

      const payload = await getPayloadClient({})
      const { docs: products } = await payload.find({
        collection: 'products',
        where: {
          id: { in: productIds }
        }
      })
      // GET ONLY PRODUCTS THAT HAS A STRIPE_ID
      const validProducts = products.filter(product => Boolean(product.priceId))
      // CREATING AN ORDER IN OUR DATABASE
      const order = await payload.create({
        collection: 'orders',
        data: {
          isPaid: false,
          products: validProducts.map((prod) => prod.id),
          user: user.id

        }
      })
      // CREATING OUR LINE ITEMS TO PUSH TO STRIPE
      const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = []
      lineItems.push({
        price: 'price_1ORDGjL4C9n3JIf87Kswue7f',
        quantity: 1,
        adjustable_quantity: {
          enabled: false
        }
      })
      validProducts.forEach((product) => {
        lineItems.push({

          price: product.priceId!,
          quantity: 1
        })
      })
      // CONNECTING TO STRIPE
      try {
        const stripeSession = await stripe.checkout.sessions.create({
          success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/thank-you?orderId=${order.id}`,
          cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/cart`,
          payment_method_types: ['card', 'paypal'],
          mode: 'payment',
          metadata: {
            userId: user.id,
            orderId: order.id
          },
          line_items: lineItems
        })

        return { url: stripeSession.url }
      } catch (error) {
        return { url: null }
      }
    }),
  pollOrderStatus: privateProcedure
    .input(z.object({
      orderId: z.string()
    }))
    .query(async ({ input }) => {
      const { orderId } = input
      const payload = await getPayloadClient({})
      const { docs: orders } = await payload.find({
        collection: 'orders',
        where: { id: { equals: orderId } }
      })
      if (!orders.length) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }
      const [order] = orders
      return { isPaid: order.isPaid }
    })

})
