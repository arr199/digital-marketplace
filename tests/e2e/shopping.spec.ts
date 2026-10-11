import { expect, test } from '@playwright/test'
import { seedData, signInBrowser } from '../helpers'
import { PRODUCTS } from '../test-env'

test('the products page shows approved products only', async ({ page }) => {
  await page.goto('/products')
  await expect(page.getByText(PRODUCTS.approvedA)).toBeVisible()
  await expect(page.getByText(PRODUCTS.approvedB)).toBeVisible()
  await expect(page.getByText(PRODUCTS.pending)).toHaveCount(0)
})

test('an unapproved product has no public page', async ({ page }) => {
  const res = await page.goto(`/product/${seedData().products.pending}`)
  expect(res?.status()).toBe(404)
})

test('a logged-out visitor opening the cart is sent to sign in', async ({ page }) => {
  await page.goto('/cart')
  await expect(page).toHaveURL(/\/sign-in\?origin=cart/)
})

test('a shopper adds a product to the cart and checks out with Stripe', async ({ page, context }) => {
  await signInBrowser(context, 'shopper')
  // Stripe's hosted checkout is outside the app: stub it and just assert we were sent there
  await page.route('https://checkout.stripe.com/**', (route) => route.fulfill({ status: 200, contentType: 'text/html', body: '<h1>Stripe Checkout (stub)</h1>' }))

  await page.goto(`/product/${seedData().products.approvedA}`)
  await expect(page.getByRole('heading', { name: PRODUCTS.approvedA })).toBeVisible()
  await page.getByRole('button', { name: 'Add to Cart' }).click()
  await expect(page.getByRole('button', { name: 'Added!' })).toBeVisible()

  await page.goto('/cart')
  await expect(page.getByRole('link', { name: PRODUCTS.approvedA })).toBeVisible()
  await page.getByRole('button', { name: 'Checkout' }).click()

  await expect(page).toHaveURL(/^https:\/\/checkout\.stripe\.com\//)
  await expect(page.getByText('Stripe Checkout (stub)')).toBeVisible()
})

test('the buyer sees their paid order with download links on the thank-you page', async ({ page, context }) => {
  await signInBrowser(context, 'buyer')
  await page.goto(`/thank-you?orderId=${seedData().paidOrder}`)
  await expect(page.getByText('Thank you for ordering!')).toBeVisible()
  await expect(page.getByText(PRODUCTS.approvedA)).toBeVisible()
  await expect(page.getByRole('link', { name: 'Download Asset' })).toBeVisible()
})

test('another user cannot open someone else\'s thank-you page', async ({ page, context }) => {
  await signInBrowser(context, 'shopper')
  await page.goto(`/thank-you?orderId=${seedData().paidOrder}`)
  // the page redirects to /sign-in, and the middleware then sends a logged-in user home
  await expect(page).not.toHaveURL(/\/thank-you/)
  await expect(page.getByRole('button', { name: 'My account' })).toBeVisible() // still signed in, so not an auth failure
  await expect(page.getByText('Thank you for ordering!')).toHaveCount(0)
})
