import { defineConfig, devices } from '@playwright/test'
import { BASE_URL, TEST_PORT, testEnv } from './tests/test-env'

// Needs the Docker services first: pnpm test:services
export default defineConfig({
  testDir: './tests',
  globalSetup: './tests/global-setup.ts',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure'
  },
  projects: [
    { name: 'api', testMatch: 'api/**/*.spec.ts' },
    { name: 'e2e', testMatch: 'e2e/**/*.spec.ts', use: { ...devices['Desktop Chrome'] } }
  ],
  webServer: {
    // CI builds in a separate workflow step (tests/build-with-test-env.ts)
    command: process.env.CI ? `pnpm start -p ${TEST_PORT}` : `pnpm build && pnpm start -p ${TEST_PORT}`,
    url: BASE_URL,
    env: testEnv,
    timeout: 5 * 60 * 1000,
    reuseExistingServer: !process.env.CI,
    stdout: 'ignore',
    stderr: 'pipe'
  }
})
