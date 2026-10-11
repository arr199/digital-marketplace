import Stripe from 'stripe'

// STRIPE_API_* are only set by the test suite to point at stripe-mock
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2023-10-16',
  typescript: true,
  ...(process.env.STRIPE_API_HOST
    ? {
        host: process.env.STRIPE_API_HOST,
        port: process.env.STRIPE_API_PORT,
        protocol: process.env.STRIPE_API_PROTOCOL as Stripe.HttpProtocol | undefined
      }
    : {})
})
