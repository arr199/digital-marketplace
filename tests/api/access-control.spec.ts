import { expect, test } from '@playwright/test'
import { authCookie, authHeader, createVerifiedUser, expectSignedInAs, tokenFor, seedData, trpcMutation, trpcQuery, uniqueEmail } from '../helpers'
import { BASE_URL } from '../test-env'

const ownerId = (rel: string | { id: string }): string => (typeof rel === 'string' ? rel : rel.id)

test.describe('orders', () => {
  test('anonymous visitors cannot list orders', async ({ request }) => {
    const res = await request.get('/api/orders')
    expect(res.status()).toBe(403)
  })

  test('a buyer only sees their own orders, without the admin-only isPaid field', async ({ request }) => {
    const { users, paidOrder } = seedData()
    const token = tokenFor('buyer')
    const res = await request.get('/api/orders?depth=0&limit=100', { headers: authHeader(token) })
    expect(res.status()).toBe(200)
    const { docs } = await res.json()

    expect(docs.map((o: any) => o.id)).toContain(paidOrder)
    for (const order of docs) {
      expect(ownerId(order.user)).toBe(users.buyer)
      expect(order).not.toHaveProperty('isPaid')
    }
  })

  test('the seller cannot see the buyer\'s orders', async ({ request }) => {
    await expectSignedInAs(request, 'seller')
    const res = await request.get(`/api/orders/${seedData().paidOrder}`, { headers: authHeader(tokenFor('seller')) })
    expect(res.status()).toBe(404)
  })

  test('an admin sees isPaid', async ({ request }) => {
    const token = tokenFor('admin')
    const res = await request.get(`/api/orders/${seedData().paidOrder}?depth=0`, { headers: authHeader(token) })
    expect(res.status()).toBe(200)
    expect((await res.json()).isPaid).toBe(true)
  })

  test('a buyer cannot mark an order as paid', async ({ request }) => {
    await expectSignedInAs(request, 'buyer')
    const token = tokenFor('buyer')
    const res = await request.patch(`/api/orders/${seedData().paidOrder}`, { headers: authHeader(token), data: { isPaid: false } })
    expect(res.status()).toBe(403)
  })
})

test.describe('products', () => {
  test('a seller sees exactly their own products, including unapproved ones', async ({ request }) => {
    const { products } = seedData()
    const token = tokenFor('seller')
    const { docs } = await (await request.get('/api/products?depth=0&limit=100', { headers: authHeader(token) })).json()
    expect(docs.map((p: any) => p.id).sort()).toEqual(Object.values(products).sort())
  })

  test('another user cannot see the seller\'s products through the API', async ({ request }) => {
    const token = tokenFor('buyer')
    const { docs } = await (await request.get('/api/products?depth=0', { headers: authHeader(token) })).json()
    expect(docs).toEqual([])
  })

  test('a seller cannot approve their own product', async ({ request }) => {
    const { products } = seedData()
    const token = tokenFor('seller')
    await request.patch(`/api/products/${products.pending}`, { headers: authHeader(token), data: { approvedForSale: 'approved' } })

    const adminToken = tokenFor('admin')
    const product = await (await request.get(`/api/products/${products.pending}?depth=0`, { headers: authHeader(adminToken) })).json()
    expect(product.approvedForSale).toBe('pending')
  })
})

test.describe('users', () => {
  test('a user can only read their own account', async ({ request }) => {
    const { users } = seedData()
    const token = tokenFor('buyer')
    const { docs } = await (await request.get('/api/users?depth=0', { headers: authHeader(token) })).json()
    expect(docs.map((u: any) => u.id)).toEqual([users.buyer])
  })

  test('public sign-up through the REST API cannot choose the admin role', async ({ request }) => {
    const email = uniqueEmail('escalate')
    const res = await request.post('/api/users', { data: { email, password: 'password-123', role: 'admin' } })
    expect(res.status()).toBe(201)

    const adminToken = tokenFor('admin')
    const { docs } = await (await request.get(`/api/users?where[email][equals]=${encodeURIComponent(email)}`, { headers: authHeader(adminToken) })).json()
    expect(docs[0].role).toBe('user')
  })
})

// Read-only procedure, so these never create orders that other tests could pick up
test.describe('CSRF', () => {
  test('a cookie-authenticated request from another site is rejected', async ({ request }) => {
    const { status } = await trpcQuery(
      request,
      'payment.pollOrderStatus',
      { orderId: seedData().paidOrder },
      { Cookie: `payload-token=${tokenFor('buyer')}`, Origin: 'https://evil.example' }
    )
    expect(status).toBe(401)
  })

  test('the same request from the app\x27s own origin is accepted', async ({ request }) => {
    const { status, body } = await trpcQuery(
      request,
      'payment.pollOrderStatus',
      { orderId: seedData().paidOrder },
      { Cookie: `payload-token=${tokenFor('buyer')}`, Origin: BASE_URL }
    )
    expect(status).toBe(200)
    expect(body.result.data).toEqual({ isPaid: true })
  })
})

test.describe('paid product files', () => {
  test('a buyer can download the file of a product they paid for', async ({ request }) => {
    const res = await request.get(`/api/product_files/file/${seedData().productFile}`, { headers: authHeader(tokenFor('buyer')) })
    expect(res.status()).toBe(200)
  })

  test('downloaded paid files are not stored by shared caches', async ({ request }) => {
    const res = await request.get(`/api/product_files/file/${seedData().productFile}`, { headers: authHeader(tokenFor('buyer')) })
    expect(res.status()).toBe(200)
    expect(res.headers()['cache-control']).toMatch(/private/)
    expect(res.headers()['cache-control']).toMatch(/no-store/)
  })

  test('starting a checkout without paying does not unlock the product file', async ({ request }) => {
    const credentials = await createVerifiedUser(request, 'unpaid')
    const { token } = await (await request.post('/api/users/login', { data: credentials })).json()

    const checkout = await trpcMutation(request, 'payment.createSession', { productIds: [seedData().products.approvedA] }, authCookie(token))
    expect(checkout.status).toBe(200) // an unpaid order now exists for this user

    const res = await request.get(`/api/product_files/file/${seedData().productFile}`, { headers: authHeader(token) })
    expect(res.status()).toBe(403)
  })
})
