import { expect, test } from '@playwright/test'
import { seedData, signInBrowser } from '../helpers'
import { PRODUCTS } from '../test-env'

// The Payload admin at /sell makes its own cookie-authenticated requests; this guards it against CSRF/auth changes
test('a seller sees their products in /sell and can save one', async ({ page, context }) => {
  await signInBrowser(context, 'seller')

  await page.goto('/sell/collections/products')
  await expect(page.getByRole('link', { name: PRODUCTS.approvedA })).toBeVisible()
  await expect(page.getByRole('link', { name: PRODUCTS.pending })).toBeVisible()

  await page.goto(`/sell/collections/products/${seedData().products.approvedB}`)
  const description = page.getByLabel('Product details')
  await expect(description).toBeVisible()
  await description.fill('Updated from the admin smoke test')
  await page.getByRole('button', { name: 'Save' }).click()
  await expect(page.getByText('Updated successfully')).toBeVisible()
})
