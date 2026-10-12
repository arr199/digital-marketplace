# AGENTS.md

Context for AI coding agents working in this repository.

## Rules

- **Never commit.** Make changes, stop, and let the user review. No `git commit`, `git push`, amend or rebase unless the user explicitly asks. The user commits themselves.
- **Anything outside the project folder must be reported to the user.** Work happens inside the repository folder (the directory containing `AGENTS.md`). Changes outside it are allowed, but every one of them must be explicitly reported to the user: what changed, where, and how to undo it. "Outside" means the home directory, global pnpm/npm config and global packages, the machine's Node install, environment variables, the MongoDB Atlas cluster's settings, the Stripe dashboard, the Vercel project, other drives and system locations. This includes side effects of tools (e.g. pnpm creating a package store on another drive, the agent writing to its own memory folder). Never hide or skip mentioning one.
- **Never touch unrelated code.** Only modify code the current task requires. Do not refactor, clean up, reformat or "improve" anything unrelated to it.
- **Never commit secrets.** No API keys, tokens, passwords or connection strings in code, config, logs or commit messages. Real values live only in the gitignored `.env` / `.env.production` files (and Vercel env vars). This covers `PAYLOAD_SECRET`, `MONGODB_URL`, Stripe keys, the webhook secret and the Gmail app password. Read them via `process.env`. Never print, echo or copy their values. Check diffs for credentials before handing work back.
- **Test-first, always.** Write the failing test BEFORE the implementation. Bug fixes include a regression test that reproduces the bug. Tests are Playwright, in `tests/` (see `tests/README.md`): `tests/api/` for HTTP-level tests, `tests/e2e/` for browser flows.
- **Testing philosophy (behavior over implementation).** Favor integration/E2E tests over unit tests; a test must survive a refactor. Tests assert the observable behavior of the real system: pages and redirects, tRPC procedures, Payload REST endpoints and access control, the Stripe webhook's effect on orders, rendered UI. Never assert implementation details. Never test mock behavior in place of app behavior. Mocks are only acceptable at true boundaries (Stripe API, SMTP).
- **Review before done.** After completing a feature (not one-line fixes), run a code-review pass: dispatch a fresh code-review subagent to check the actual diff against the task requirements. Address or explicitly flag every finding before reporting completion.
- Use **pnpm** (version pinned by `packageManager` in `package.json`). Never use `npm install` or `yarn`.
- Don't edit generated files by hand: `src/server/payload-types.ts` and `src/app/(payload)/sell/importMap.js`. The Payload CLI (`pnpm generate:types`, `payload generate:importmap`) currently fails to load the config (Lexical uses top-level await in this CommonJS project); `pnpm dev` regenerates the import map on start, or call Payload's `generateImportMap(config)` from a tsx script.
- `dist/` and `build/` are gitignored leftovers from the old Express/Payload 2 setup. Ignore them.

## Stack

- **Next.js 16** (App Router, Turbopack) + **React 19**
- **Payload CMS 3**, embedded in the Next app, with MongoDB (`@payloadcms/db-mongodb`) and the Lexical editor
- **tRPC 10** + **TanStack Query 4** for the storefront API
- **Stripe** Checkout + webhook for payments
- **Tailwind CSS 3** + shadcn/ui (Radix) components, `sonner` toasts
- **zustand** cart persisted in `localStorage` (`cart-storage`)
- **nodemailer** (Gmail) + `@react-email/components` for verification and receipt emails
- Deployed on **Vercel** from `master` at https://www.digital.marketplace.abielrodriguez.dev (the bare domain redirects to `www`). Migrated from Railway/Cloud Run + Express in October 2026; uploads in Vercel Blob

## Commands

```bash
pnpm dev              # dev server (http://localhost:3000)
pnpm build            # production build
pnpm exec eslint src --ext .ts,.tsx   # lint (`pnpm lint` runs `next lint`, which Next 16 removed)
pnpm test:services    # start test containers (Mongo, stripe-mock, Mailpit); needs Docker
pnpm test             # Playwright: builds the app, seeds a test DB, runs tests/api + tests/e2e
pnpm test:api         # API tests only
pnpm test:e2e         # browser tests only
```

Tests never use `.env` values: `tests/test-env.ts` sets every variable and refuses to run against non-local services. CI (GitHub flow) runs the same suite on every PR into `master` and every push to `master` (`.github/workflows/ci.yml`, check name `CI / playwright`). Pass Playwright flags through `pnpm exec playwright test ...`, because pnpm 12 swallows flags like `--reporter`.

## Layout

```
payload.config.ts            Payload config (project root; alias @payload-config)
src/app/layout.tsx           Bare root layout (metadata only, renders children)
src/app/(frontend)/          Storefront: own <html>, Tailwind (global.css), Navbar, Providers
  (auth)/sign-in|sign-up|verify-email
  products/ product/[productId]/ cart/ thank-you/
  api/trpc/[trpc]/route.ts   tRPC fetch handler
  api/webhooks/stripe/       Stripe webhook: marks order paid, sends receipt
src/app/(payload)/           Payload admin + REST: own <html>, Payload CSS (no Tailwind)
  sell/[[...segments]]/      Admin panel, served at /sell
  api/[...slug]/route.ts     Payload REST API (/api/users, /api/media/file/..., etc.)
src/collections/             Users, Products, Media, ProductFiles, Orders
src/trpc/                    appRouter (index.ts), auth-router, payment-router, trpc.ts (public/private procedures)
src/server/get-payload.ts    getPayloadClient() — use this for the Local API on the server
src/lib/payload.utils.ts     getServerSideUser(cookies) — current user in server components
src/lib/mailer.ts            createMailTransport() — Gmail, or SMTP_HOST (Mailpit) in tests
src/lib/stripe.ts            Stripe client; STRIPE_API_HOST/PORT/PROTOCOL point it at stripe-mock in tests
src/lib/server-url.ts        getServerUrl() for links (emails, Stripe redirects), getTrustedOrigins() for Payload csrf
src/lib/public-product.ts    PUBLIC_PRODUCT_SELECT / PublicProduct: what public product queries may return
scripts/                     migrate-uploads-to-blob.ts (one-off: legacy disk uploads → Blob, one random folder per doc; already run against production on 2026-10-12)
docs/deploy-vercel.md        How the Vercel deployment is set up (env vars, domain, Blob, Atlas, Stripe webhook)
tests/                       Playwright suite (api/, e2e/, seed.ts, test-env.ts); see tests/README.md
src/proxy.ts                 Next 16 proxy (ex-middleware): /cart needs auth; signed-in users are kept out of /sign-in, /sign-up
src/components/              UI; shadcn primitives in components/ui
src/hooks/                   useCart (zustand), useAuth, useOnClickOutside
```

The two route groups each render their own `<html>`/`<body>` so Tailwind never reaches the Payload admin. Keep it that way.

## Domain notes

- **Auth**: Payload auth on `users`, with email verification. The session is the `payload-token` cookie. tRPC `auth.loginUser` sets it. `privateProcedure` calls `payload.auth({ headers })`. Payload `csrf` lists the app's own origins (`getTrustedOrigins()`), so cookie auth needs a same-origin `Origin`/`Sec-Fetch-Site` header; server-side lookups (`getServerSideUser`) send the token as `Authorization: JWT <token>` instead. Don't set Payload `serverURL`: it makes upload URLs absolute.
- **Roles**: `users.role` is `admin` | `user`. Sellers manage their own products in `/sell`. Admin-only fields and collections are hidden or locked by role in collection `access`/`admin.hidden`.
- **One database, Stripe test mode.** Local dev (`.env`) and production use the same MongoDB database and Stripe test keys, so local actions change live data. Files uploaded on Vercel live in Blob and show as broken images in local dev (it reads from disk).
- **Products** only show in the store when `approvedForSale === 'approved'` (set by an admin).
- **Checkout flow**: cart page → `payment.createSession` (creates an Order, returns a Stripe Checkout URL) → Stripe → `/thank-you?orderId=...`. That page polls `payment.pollOrderStatus` until the webhook sets `isPaid`.
- **Uploads**: with `BLOB_READ_WRITE_TOKEN` set (Vercel) they go to Vercel Blob under `media/` and `product_files/` (`vercelBlobStorage` in `payload.config.ts`, client uploads on); otherwise to local disk, `staticDir` `src/server/media` and `src/server/products_files` (`UPLOADS_DIR` overrides the `src/server` part; tests use `.test-uploads`). Either way files are served through Payload's access-checked `/api/<collection>/file/...` routes; with Blob, Payload appends `?prefix=<folder>` to upload URLs, which `images.localPatterns` in `next.config.mjs` allows for `/api/media/file/**`.
- **Paid files** (`product_files`): readable by their seller, admins, and users with a **paid** order containing the product (`isPaid`; orders exist from checkout start). Served with `Cache-Control: private, no-store`.
- **Public product data**: storefront queries use `PUBLIC_PRODUCT_SELECT` and depth 1 so paid `product_files` and the seller's account never reach the browser.
- `payload.config.ts` overrides DNS servers (`1.1.1.1`, `8.8.8.8`) so MongoDB Atlas SRV lookups work on the dev machine; skipped on Vercel (`process.env.VERCEL`).
- `NextResponse.redirect` in the proxy needs absolute URLs: `new URL(path, req.url)`.

## Environment variables (`.env`)

Local `.env` is needed for `pnpm dev` only; Vercel has its own copies (Settings → Environment Variables) and tests set their own (`tests/test-env.ts`).

`PAYLOAD_SECRET`, `MONGODB_URL`, `NEXT_PUBLIC_SERVER_URL`, `PORT`, `GMAIL_SERVER_USER`, `GMAIL_SERVER_PASS`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, optional `STRIPE_TRANSACTION_FEE_PRICE_ID`, and on Vercel `BLOB_READ_WRITE_TOKEN` (see `docs/deploy-vercel.md`). Never print or commit their values (see "Never commit secrets" above).

## Code style

- TypeScript, ESLint `standard-with-typescript` + `next/core-web-vitals`. Most files have no semicolons, use single quotes, and put a space before function parens (`function Page ()`). Match the file you're editing.
- Path alias `@/*` → `src/*`.
- Async request APIs follow Next 15+ rules: `await cookies()`, and `searchParams`/`params` are Promises.
