import { expect, test } from '@playwright/test'
import { createVerifiedUser, trpcMutation, trpcQuery, uniqueEmail, verificationLink, waitForEmail } from '../helpers'
import { USERS } from '../test-env'

test.describe('sign-up (auth.createPayloadUser)', () => {
  test('creates the account and emails a verification link', async ({ request }) => {
    const email = uniqueEmail('signup')
    const { status, body } = await trpcMutation(request, 'auth.createPayloadUser', { email, password: 'password-123' })
    expect(status).toBe(200)
    expect(body.result.data).toEqual({ success: true, sentToEmail: email })

    const mail = await waitForEmail(request, email)
    expect(verificationLink(mail.html)).toContain('/verify-email?token=')
  })

  test('rejects an email that is already registered', async ({ request }) => {
    const { status, body } = await trpcMutation(request, 'auth.createPayloadUser', { email: USERS.buyer.email, password: 'password-123' })
    expect(status).toBe(409)
    expect(body.error.data.code).toBe('CONFLICT')
  })

  test('rejects a password shorter than 8 characters', async ({ request }) => {
    const { status } = await trpcMutation(request, 'auth.createPayloadUser', { email: uniqueEmail('short'), password: 'short' })
    expect(status).toBe(400)
  })

  test('an unverified account cannot log in until the email link is used', async ({ request }) => {
    const email = uniqueEmail('verify')
    const password = 'password-123'
    await trpcMutation(request, 'auth.createPayloadUser', { email, password })

    expect((await trpcMutation(request, 'auth.loginUser', { email, password })).status).toBe(401)

    const token = new URL(verificationLink((await waitForEmail(request, email)).html)).searchParams.get('token')
    const verified = await trpcQuery(request, 'auth.verifyEmail', { token })
    expect(verified.body.result.data).toEqual({ success: true })

    expect((await trpcMutation(request, 'auth.loginUser', { email, password })).status).toBe(200)
  })

  test('a bogus verification token is rejected', async ({ request }) => {
    const { status, body } = await trpcQuery(request, 'auth.verifyEmail', { token: 'not-a-real-token' })
    expect(status).toBeGreaterThanOrEqual(400)
    expect(body.result).toBeUndefined()
    expect(body.error).toBeDefined()
  })
})

test.describe('sign-in (auth.loginUser)', () => {
  test('valid credentials set an httpOnly payload-token cookie', async ({ request }) => {
    // a fresh user: logging in a seeded user from a test can race with other tests on its sessions
    const credentials = await createVerifiedUser(request, 'login')
    const res = await request.post('/api/trpc/auth.loginUser', { data: credentials })
    expect(res.status()).toBe(200)
    const cookie = res.headersArray().find((h) => h.name.toLowerCase() === 'set-cookie' && h.value.startsWith('payload-token='))
    expect(cookie?.value).toMatch(/HttpOnly/i)
  })

  test('a wrong password is rejected', async ({ request }) => {
    const { status, body } = await trpcMutation(request, 'auth.loginUser', { email: USERS.buyer.email, password: 'wrong-password' })
    expect(status).toBe(401)
    expect(body.error.data.code).toBe('UNAUTHORIZED')
  })
})
