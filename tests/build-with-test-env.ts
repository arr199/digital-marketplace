// Production build with the test env (NEXT_PUBLIC_* values are baked in at build time). Used by CI before `pnpm test`.
import { execSync } from 'child_process'
import { assertSafeTestEnv, testEnv } from './test-env'

assertSafeTestEnv(testEnv)
execSync('pnpm build', { env: { ...process.env, ...testEnv }, stdio: 'inherit' })
