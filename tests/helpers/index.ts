import fs from 'fs'
import path from 'path'
import Stripe from 'stripe'
import { expect, type APIRequestContext, type BrowserContext } from '@playwright/test'
import { BASE_URL, MAILPIT_URL, testEnv, USERS } from '../test-env'

export interface SeedData {
  tokens: Record<Role, string>
  users: { admin: string, seller: string, buyer: string, shopper: string }
  products: { approvedA: string, approvedB: string, pending: string }
  paidOrder: string
  mediaFile: string
}

export function seedData (): SeedData {
  return JSON.parse(fs.readFileSync(path.resolve(__dirname, '../.auth/seed.json'), 'utf8'))
}

export type Role = keyof typeof USERS

// JWT for a seeded user (the payload-token cookie value). Created once by the seed, see tests/seed.ts.
export function tokenFor (role: Role): string {
  return seedData().tokens[role]
}

export const authCookie = (token: string): Record<string, string> => ({ Cookie: `payload-token=${token}` })
export const authHeader = (token: string): Record<string, string> => ({ Authorization: `JWT ${token}` })

// Positive control for negative-access tests: proves the token is accepted, so a 403 means "forbidden", not "anonymous"
export async function expectSignedInAs (request: APIRequestContext, role: Role): Promise<void> {
  const res = await request.get('/api/users/me', { headers: authHeader(tokenFor(role)) })
  expect((await res.json()).user?.email, `token for ${role}`).toBe(USERS[role].email)
}

export async function signInBrowser (context: BrowserContext, role: Role): Promise<void> {
  await context.addCookies([{ name: 'payload-token', value: tokenFor(role), url: BASE_URL, httpOnly: true }])
}

// tRPC v10 over plain HTTP (no transformer, no batching)
export async function trpcMutation (request: APIRequestContext, procedure: string, input: unknown, headers: Record<string, string> = {}): Promise<{ status: number, body: any }> {
  const res = await request.post(`/api/trpc/${procedure}`, { data: input, headers })
  return { status: res.status(), body: await res.json() }
}

export async function trpcQuery (request: APIRequestContext, procedure: string, input: unknown, headers: Record<string, string> = {}): Promise<{ status: number, body: any }> {
  const res = await request.get(`/api/trpc/${procedure}?input=${encodeURIComponent(JSON.stringify(input))}`, { headers })
  return { status: res.status(), body: await res.json() }
}

export function uniqueEmail (prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@test.local`
}

// Waits for an email to `to` in Mailpit and returns its HTML body
export async function waitForEmail (request: APIRequestContext, to: string): Promise<{ subject: string, html: string }> {
  let message: { ID: string, Subject: string } | undefined
  await expect.poll(async () => {
    const res = await request.get(`${MAILPIT_URL}/api/v1/search?query=${encodeURIComponent(`to:"${to}"`)}`)
    const { messages } = await res.json()
    message = messages[0]
    return message
  }, { message: `email to ${to}`, timeout: 15_000 }).toBeTruthy()

  const res = await request.get(`${MAILPIT_URL}/api/v1/message/${message!.ID}`)
  const { Subject, HTML } = await res.json()
  return { subject: Subject, html: HTML }
}

export function verificationLink (html: string): string {
  const match = html.match(/href="([^"]*\/verify-email\?token=[^"]+)"/)
  if (!match) throw new Error('No verification link in email')
  return match[1].replace(/&amp;/g, '&')
}

// Signs up a brand-new user and verifies them through the emailed link (for tests that must not log in seeded users)
export async function createVerifiedUser (request: APIRequestContext, prefix: string): Promise<{ email: string, password: string }> {
  const email = uniqueEmail(prefix)
  const password = 'password-123'
  const signup = await trpcMutation(request, 'auth.createPayloadUser', { email, password })
  expect(signup.status).toBe(200)
  const token = new URL(verificationLink((await waitForEmail(request, email)).html)).searchParams.get('token')
  const verified = await trpcQuery(request, 'auth.verifyEmail', { token })
  expect(verified.status).toBe(200)
  return { email, password }
}

export function signedStripeEvent (event: Record<string, unknown>): { body: string, signature: string } {
  const body = JSON.stringify(event)
  const signature = Stripe.webhooks.generateTestHeaderString({ payload: body, secret: testEnv.STRIPE_WEBHOOK_SECRET })
  return { body, signature }
}
