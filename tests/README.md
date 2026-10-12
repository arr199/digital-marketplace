# Tests

Playwright tests that run against a real production build of the app (`next build && next start` on port 3100).
External services are replaced by Docker containers, so the tests never touch the real Atlas database, Stripe account or Gmail.

| Service    | Container                   | Port(s)        | Replaces          |
| ---------- | --------------------------- | -------------- | ----------------- |
| MongoDB    | `mongo:7` (in-memory tmpfs) | 27018          | MongoDB Atlas     |
| Stripe API | `stripe/stripe-mock`        | 12111          | api.stripe.com    |
| Email      | `axllent/mailpit`           | 1025 / 8025 UI | Gmail SMTP        |

## Running

```bash
pnpm test:services          # start the containers (Docker must be running)
pnpm test                   # build + start the app, seed, run everything
pnpm test:api               # API tests only
pnpm test:e2e               # browser tests only
pnpm exec playwright test --ui   # interactive runner
pnpm exec playwright show-report # last HTML report
pnpm test:services:down     # stop the containers
```

First time on a machine: `pnpm exec playwright install chromium`.

Locally, Playwright reuses a server already listening on port 3100, so you can keep one running between runs.
It must be started with the test env (see `test-env.ts`); otherwise just let Playwright start it.
Mailpit's inbox is browsable at http://localhost:8025.

## How it fits together

- `test-env.ts` holds every env var the app reads. They are passed to the server explicitly, and variables already in the
  process take priority over `.env` / `.env.production`, so real secrets never apply. `assertSafeTestEnv` refuses to run
  against anything but the local containers.
- `global-setup.ts` checks the containers are up, runs `seed.ts` and empties the Mailpit inbox.
- `seed.ts` (run with tsx) drops the test database and `.test-uploads/`, then creates through Payload's Local API:
  an admin, a seller, a buyer and a shopper (all verified), two approved products and one pending, and one paid order
  for the buyer. It logs each user in once and writes ids and tokens to `tests/.auth/seed.json`.
- Tests authenticate with those seeded tokens (`tokenFor(role)`). Don't log the seeded users in from tests in parallel:
  Payload stores sessions on the user document and concurrent logins overwrite each other's sessions. For cookie auth
  use `authCookie(token)`, which also sends `Origin`: Payload's CSRF check rejects cookie-authenticated requests without
  one of the app's own origins.
- Uploads go to local disk: `test-env.ts` forces `BLOB_READ_WRITE_TOKEN` empty, overriding any value in `.env*`. The
  Vercel Blob path is checked on a preview deployment (see `docs/deploy-vercel.md`).
- `api/` tests use Playwright's HTTP client against tRPC (`/api/trpc/...`), Payload REST (`/api/...`), the Stripe webhook
  and proxy (ex-middleware) redirects. `e2e/` tests drive Chromium through the real UI. Stripe's hosted checkout page is stubbed
  with `page.route`; everything else is the real app.
- The app has three test-only switches, all unset in production: `STRIPE_API_HOST/PORT/PROTOCOL` (`src/lib/stripe.ts`),
  `SMTP_HOST/PORT` (`src/lib/mailer.ts`) and `UPLOADS_DIR` (media and product-file collections).

## Known bugs

None open. To document a defect without fixing it, name the test `KNOWN BUG: ...` and assert the current, buggy
behaviour, so it passes while the defect exists and any unrelated failure still shows up. Fixing the bug makes it
fail: flip the assertion to the correct behaviour and drop "KNOWN BUG" from the name.

## CI

`.github/workflows/ci.yml` runs the suite on every pull request into `master` and every push to `master` (GitHub flow), with
the same containers as GitHub Actions services. CI builds in its own step (`tests/build-with-test-env.ts`), then
Playwright only starts the server. On failure the HTML report is uploaded as an artifact.

The workflow alone does not stop Vercel from deploying: Vercel deploys on push regardless of GitHub checks. To gate
deploys, require the `CI / playwright` check in GitHub branch protection and/or enable Vercel Deployment Checks.

## Gotchas

- `pnpm test` builds into `.next` with the test env baked in (`NEXT_PUBLIC_SERVER_URL=http://localhost:3100`).
  Run `pnpm build` again before using `pnpm start` for anything else. `pnpm dev` is unaffected.
- Pass Playwright flags with `pnpm exec playwright test ...`: pnpm 12 treats flags like `--reporter` as its own.
- If a server is already listening on port 3100, Playwright reuses it locally. Global setup checks that it accepts a token
  minted by the seed (same secret, same DB) and aborts otherwise, so a server running with the real `.env` is never used.
