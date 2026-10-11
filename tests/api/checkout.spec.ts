import { expect, test, type APIRequestContext } from '@playwright/test'
import { authCookie, authHeader, tokenFor, seedData, signedStripeEvent, trpcMutation, trpcQuery, waitForEmail } from '../helpers'
import { PRODUCTS, USERS } from '../test-env'

// Creates a checkout session as the buyer and returns the new (unpaid) order
async function createOrder (request: APIRequestContext): Promise<{ id: string, url: string }> {
  const { users, products } = seedData()
  const token = tokenFor('buyer')
  const { status, body } = await trpcMutation(request, 'payment.createSession', { productIds: [products.approvedA, products.approvedB] }, authCookie(token))
  expect(status).toBe(200)

  const adminToken = tokenFor('admin')
  const { docs } = await (await request.get(`/api/orders?where[user][equals]=${users.buyer}&sort=-createdAt&limit=1&depth=0`, { headers: authHeader(adminToken) })).json()
  return { id: docs[0].id, url: body.result.data.url }
}

async function orderIsPaid (request: APIRequestContext, orderId: string): Promise<boolean> {
  const adminToken = tokenFor('admin')
  return (await (await request.get(`/api/orders/${orderId}?depth=0`, { headers: authHeader(adminToken) })).json()).isPaid
}

test.describe('checkout (payment.createSession)', () => {
  test('requires a logged-in user', async ({ request }) => {
    const { status } = await trpcMutation(request, 'payment.createSession', { productIds: [seedData().products.approvedA] })
    expect(status).toBe(401)
  })

  test('rejects an empty cart', async ({ request }) => {
    const token = tokenFor('buyer')
    const { status } = await trpcMutation(request, 'payment.createSession', { productIds: [] }, authCookie(token))
    expect(status).toBe(400)
  })

  test('creates an unpaid order and returns a Stripe Checkout URL', async ({ request }) => {
    const { products } = seedData()
    const order = await createOrder(request)

    expect(order.url).toMatch(/^https:\/\/checkout\.stripe\.com\//)
    expect(await orderIsPaid(request, order.id)).toBe(false)

    const adminToken = tokenFor('admin')
    const saved = await (await request.get(`/api/orders/${order.id}?depth=0`, { headers: authHeader(adminToken) })).json()
    expect(saved.products.sort()).toEqual([products.approvedA, products.approvedB].sort())
  })

  test('the buyer can poll their order status', async ({ request }) => {
    const token = tokenFor('buyer')
    const { body } = await trpcQuery(request, 'payment.pollOrderStatus', { orderId: seedData().paidOrder }, authCookie(token))
    expect(body.result.data).toEqual({ isPaid: true })
  })
})

test.describe('Stripe webhook', () => {
  test('rejects a request with an invalid signature', async ({ request }) => {
    const res = await request.post('/api/webhooks/stripe', {
      data: JSON.stringify({ type: 'checkout.session.completed' }),
      headers: { 'stripe-signature': 't=1,v1=bogus', 'content-type': 'application/json' }
    })
    expect(res.status()).toBe(400)
  })

  test('checkout.session.completed marks the order paid and emails a receipt', async ({ request }) => {
    const { users } = seedData()
    const order = await createOrder(request)

    const { body, signature } = signedStripeEvent({
      id: 'evt_test_checkout',
      object: 'event',
      type: 'checkout.session.completed',
      data: { object: { id: 'cs_test_checkout', object: 'checkout.session', metadata: { userId: users.buyer, orderId: order.id } } }
    })
    const res = await request.post('/api/webhooks/stripe', { data: body, headers: { 'stripe-signature': signature, 'content-type': 'application/json' } })
    expect(res.status()).toBe(200)

    expect(await orderIsPaid(request, order.id)).toBe(true)
    const receipt = await waitForEmail(request, USERS.buyer.email)
    expect(receipt.html).toContain(order.id)
    expect(receipt.html).toContain(PRODUCTS.approvedA)
  })
})
