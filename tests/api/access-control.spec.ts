import { expect, test } from '@playwright/test'
import { authHeader, expectSignedInAs, tokenFor, seedData, uniqueEmail } from '../helpers'

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

  test('KNOWN BUG: public sign-up through the REST API can choose the admin role', async ({ request }) => {
    // users.role restricts `update` to admins but has no `create` rule, so anyone can register as admin.
    // This asserts the CURRENT (buggy) behaviour so any other failure is real. When fixing the bug,
    // change the last assertion to expect 'user' (or the request to be rejected) and drop "KNOWN BUG".

    const email = uniqueEmail('escalate')
    const res = await request.post('/api/users', { data: { email, password: 'password-123', role: 'admin' } })
    expect(res.status()).toBe(201)

    const adminToken = tokenFor('admin')
    const { docs } = await (await request.get(`/api/users?where[email][equals]=${encodeURIComponent(email)}`, { headers: authHeader(adminToken) })).json()
    expect(docs[0].role).toBe('admin')
  })
})
