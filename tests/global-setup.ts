import { execSync } from 'child_process'
import fs from 'fs'
import net from 'net'
import path from 'path'
import { assertSafeTestEnv, BASE_URL, MAILPIT_URL, testEnv, USERS } from './test-env'

async function assertPortOpen (name: string, port: number): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const socket = net.connect(port, 'localhost')
    socket.once('connect', () => { socket.end(); resolve() })
    socket.once('error', () => {
      reject(new Error(`${name} is not reachable on localhost:${port}. Start the test services with: pnpm test:services`))
    })
  })
}

// Locally Playwright may reuse a server already on the test port, which could be running with the real .env.
// A server that accepts a token minted by the seed shares its PAYLOAD_SECRET and database, so it's the test server.
async function assertServerUsesTestEnv (): Promise<void> {
  const { tokens } = JSON.parse(fs.readFileSync(path.resolve(__dirname, '.auth/seed.json'), 'utf8'))
  const res = await fetch(`${BASE_URL}/api/users/me`, { headers: { Authorization: `JWT ${tokens.admin}` } })
  const { user } = await res.json()
  if (user?.email !== USERS.admin.email) {
    throw new Error(`The server on ${BASE_URL} is not using the test environment. Stop it and let Playwright start its own.`)
  }
}

export default async function globalSetup (): Promise<void> {
  assertSafeTestEnv(testEnv)

  await assertPortOpen('MongoDB', 27018)
  await assertPortOpen('stripe-mock', 12111)
  await assertPortOpen('Mailpit SMTP', 1025)
  await assertPortOpen('Mailpit API', 8025)

  execSync('pnpm exec tsx tests/seed.ts', { env: { ...process.env, ...testEnv }, stdio: 'inherit' })
  await fetch(`${MAILPIT_URL}/api/v1/messages`, { method: 'DELETE' })

  // Playwright starts the webServer before globalSetup, so the server is up by now
  await assertServerUsesTestEnv()
}
