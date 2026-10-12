import { expect, test } from '@playwright/test'
import { authCookie, tokenFor, seedData } from '../helpers'
import { BASE_URL } from '../test-env'

// Next sends a relative Location header
const redirectTarget = (location: string): URL => new URL(location, BASE_URL)

test.describe('middleware redirects', () => {
  test('logged-out visitor to /cart is sent to sign-in', async ({ request }) => {
    const res = await request.get('/cart', { maxRedirects: 0 })
    expect(res.status()).toBe(307)
    const target = redirectTarget(res.headers().location)
    expect(target.pathname + target.search).toBe('/sign-in?origin=cart')
  })

  test('logged-in user can open /cart', async ({ request }) => {
    const token = tokenFor('buyer')
    const res = await request.get('/cart', { maxRedirects: 0, headers: authCookie(token) })
    expect(res.status()).toBe(200)
  })

  for (const path of ['/sign-in', '/sign-up']) {
    test(`logged-in user visiting ${path} is sent home`, async ({ request }) => {
      const token = tokenFor('buyer')
      const res = await request.get(path, { maxRedirects: 0, headers: authCookie(token) })
      expect(res.status()).toBe(307)
      expect(redirectTarget(res.headers().location).pathname).toBe('/')
    })
  }

  test('public pages load for logged-out visitors', async ({ request }) => {
    for (const path of ['/', '/products', '/sign-in', '/sign-up']) {
      const res = await request.get(path, { maxRedirects: 0 })
      expect(res.status(), path).toBe(200)
    }
  })
})

test.describe('uploaded media', () => {
  test('product images are served', async ({ request }) => {
    const res = await request.get(`/api/media/file/${seedData().mediaFile}`)
    expect(res.status()).toBe(200)
    expect(res.headers()['content-type']).toContain('image/')
  })

  test('product images go through the Next image optimizer', async ({ request }) => {
    const src = encodeURIComponent(`/api/media/file/${seedData().mediaFile}`)
    const res = await request.get(`/_next/image?url=${src}&w=640&q=75`)
    expect(res.status()).toBe(200)
    expect(res.headers()['content-type']).toContain('image/')
  })

  test('product image URLs with a query string go through the Next image optimizer', async ({ request }) => {
    // With Vercel Blob storage, Payload appends ?prefix=<folder> to upload URLs; a neutral param exercises the same path
    const src = encodeURIComponent(`/api/media/file/${seedData().mediaFile}?v=1`)
    const res = await request.get(`/_next/image?url=${src}&w=640&q=75`)
    expect(res.status()).toBe(200)
    expect(res.headers()['content-type']).toContain('image/')
  })
})
