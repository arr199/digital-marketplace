// Every env var the app reads, set explicitly for tests. Variables already in the process
// take priority over .env / .env.production, so the real secrets in those files never apply.
export const TEST_PORT = 3100
export const BASE_URL = `http://localhost:${TEST_PORT}`
export const MAILPIT_URL = 'http://localhost:8025'

export const testEnv = {
  PAYLOAD_SECRET: 'test-payload-secret',
  MONGODB_URL: 'mongodb://localhost:27018/digital-marketplace-test',
  NEXT_PUBLIC_SERVER_URL: BASE_URL,
  PORT: String(TEST_PORT),
  GMAIL_SERVER_USER: 'shop@test.local',
  GMAIL_SERVER_PASS: 'unused',
  SMTP_HOST: 'localhost',
  SMTP_PORT: '1025',
  STRIPE_SECRET_KEY: 'sk_test_mock',
  STRIPE_WEBHOOK_SECRET: 'whsec_test_secret',
  STRIPE_API_HOST: 'localhost',
  STRIPE_API_PORT: '12111',
  STRIPE_API_PROTOCOL: 'http',
  UPLOADS_DIR: '.test-uploads',
  NEXT_TELEMETRY_DISABLED: '1'
}

// Refuse to run against anything that isn't the local test services
export function assertSafeTestEnv (env: Record<string, string | undefined>): void {
  const problems: string[] = []
  if (!env.MONGODB_URL?.startsWith('mongodb://localhost:27018/')) problems.push(`MONGODB_URL=${env.MONGODB_URL ?? '(unset)'}`)
  if (env.STRIPE_SECRET_KEY !== 'sk_test_mock') problems.push('STRIPE_SECRET_KEY is not the stripe-mock key')
  if (env.STRIPE_API_HOST !== 'localhost') problems.push('STRIPE_API_HOST is not localhost')
  if (env.SMTP_HOST !== 'localhost') problems.push('SMTP_HOST is not localhost')
  if (env.UPLOADS_DIR !== '.test-uploads') problems.push('UPLOADS_DIR is not .test-uploads') // the seed deletes this folder
  if (problems.length > 0) {
    throw new Error(`Refusing to run tests against non-test services:\n  ${problems.join('\n  ')}`)
  }
}

export const USERS = {
  admin: { email: 'admin@test.local', password: 'admin-password-123' },
  seller: { email: 'seller@test.local', password: 'seller-password-123' },
  buyer: { email: 'buyer@test.local', password: 'buyer-password-123' },
  shopper: { email: 'shopper@test.local', password: 'shopper-password-123' } // browser tests only
} as const

export const PRODUCTS = {
  approvedA: 'Test UI Kit Alpha',
  approvedB: 'Test Icon Pack Beta',
  pending: 'Test Pending Gamma'
} as const
