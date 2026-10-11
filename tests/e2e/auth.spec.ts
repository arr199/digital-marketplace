import { expect, test } from '@playwright/test'
import { uniqueEmail, verificationLink, waitForEmail } from '../helpers'
import { USERS } from '../test-env'

test('a new user signs up, verifies their email and signs in', async ({ page, request }) => {
  const email = uniqueEmail('e2e-signup')
  const password = 'password-123'

  await page.goto('/sign-up')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: 'Sign up' }).click()
  await expect(page).toHaveURL(/\/verify-email/)
  await expect(page.getByText('Check your email')).toBeVisible()

  const link = verificationLink((await waitForEmail(request, email)).html)
  await page.goto(link)
  await expect(page.getByText('You\'re all set!')).toBeVisible()

  await page.goto('/sign-in')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page).toHaveURL(/\/$/)
  await expect(page.getByRole('button', { name: 'My account' })).toBeVisible()
})

test('signing in with a wrong password keeps the user on the sign-in page', async ({ page }) => {
  await page.goto('/sign-in')
  await page.getByLabel('Email').fill(USERS.shopper.email)
  await page.getByLabel('Password').fill('wrong-password')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page.getByText('UNAUTHORIZED')).toBeVisible()
  await expect(page).toHaveURL(/\/sign-in/)
})
