# AGENTS.md

Context for AI coding agents working in this repository.

## Rules

- **Never commit.** Make changes, stop, and let the user review. No `git commit`, `git push`, amend or rebase unless the user explicitly asks. The user commits themselves.
- **Anything outside the project folder must be reported to the user.** Work happens inside the repository folder (the directory containing `AGENTS.md`). Changes outside it are allowed, but every one of them must be explicitly reported to the user: what changed, where, and how to undo it. "Outside" means the home directory, global pnpm/npm config and global packages, the machine's Node install, environment variables, the MongoDB Atlas cluster's settings, the Stripe dashboard, the Vercel project, other drives and system locations. This includes side effects of tools (e.g. pnpm creating a package store on another drive, the agent writing to its own memory folder). Never hide or skip mentioning one.
- **Never touch unrelated code.** Only modify code the current task requires. Do not refactor, clean up, reformat or "improve" anything unrelated to it.
- **Never commit secrets.** No API keys, tokens, passwords or connection strings in code, config, logs or commit messages. Real values live only in the gitignored `.env` / `.env.production` files (and Vercel env vars). This covers `PAYLOAD_SECRET`, `MONGODB_URL`, Stripe keys, the webhook secret and the Gmail app password. Read them via `process.env`. Never print, echo or copy their values. Check diffs for credentials before handing work back.
- **Test-first, always.** Write the failing test BEFORE the implementation. Bug fixes include a regression test that reproduces the bug. The repo has no test runner yet. Before the first test-first task, propose a setup (e.g. Playwright for E2E against `pnpm dev`, Vitest for pure logic) and get the user's OK before adding it.
- **Testing philosophy (behavior over implementation).** Favor integration/E2E tests over unit tests; a test must survive a refactor. Tests assert the observable behavior of the real system: pages and redirects, tRPC procedures, Payload REST endpoints and access control, the Stripe webhook's effect on orders, rendered UI. Never assert implementation details. Never test mock behavior in place of app behavior. Mocks are only acceptable at true boundaries (Stripe API, SMTP).
- **Review before done.** After completing a feature (not one-line fixes), run a code-review pass: dispatch a fresh code-review subagent to check the actual diff against the task requirements. Address or explicitly flag every finding before reporting completion.
- Use **pnpm** (version pinned by `packageManager` in `package.json`). Never use `npm install` or `yarn`.
- Don't edit generated files by hand: `src/server/payload-types.ts` (run `pnpm generate:types`) and `src/app/(payload)/sell/importMap.js`.
- `dist/` and `build/` are gitignored leftovers from the old Express/Payload 2 setup. Ignore them.

## Stack

- **Next.js 16** (App Router, Turbopack) + **React 19**
- **Payload CMS 3**, embedded in the Next app, with MongoDB (`@payloadcms/db-mongodb`) and the Lexical editor
- **tRPC 10** + **TanStack Query 4** for the storefront API
- **Stripe** Checkout + webhook for payments
- **Tailwind CSS 3** + shadcn/ui (Radix) components, `sonner` toasts
- **zustand** cart persisted in `localStorage` (`cart-storage`)
- **nodemailer** (Gmail) + `@react-email/components` for verification and receipt emails
- Deployment target: **Vercel** (branch `vercel-migration`, migrating away from Railway/Cloud Run with an Express server)

## Commands

```bash
pnpm dev              # dev server (http://localhost:3000)
pnpm build            # production build
pnpm lint             # eslint (standard-with-typescript + next)
pnpm generate:types   # regenerate src/server/payload-types.ts from collections
```

There is no test suite yet (see the test-first rule above).

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
src/middleware.ts            Redirects: /cart needs auth; signed-in users are kept out of /sign-in, /sign-up
src/components/              UI; shadcn primitives in components/ui
src/hooks/                   useCart (zustand), useAuth, useOnClickOutside
```

The two route groups each render their own `<html>`/`<body>` so Tailwind never reaches the Payload admin. Keep it that way.

## Domain notes

- **Auth**: Payload auth on `users`, with email verification. The session is the `payload-token` cookie. tRPC `auth.loginUser` sets it. `privateProcedure` calls `payload.auth({ headers })`.
- **Roles**: `users.role` is `admin` | `user`. Sellers manage their own products in `/sell`. Admin-only fields and collections are hidden or locked by role in collection `access`/`admin.hidden`.
- **Products** only show in the store when `approvedForSale === 'approved'` (set by an admin).
- **Checkout flow**: cart page → `payment.createSession` (creates an Order, returns a Stripe Checkout URL) → Stripe → `/thank-you?orderId=...`. That page polls `payment.pollOrderStatus` until the webhook sets `isPaid`.
- **Uploads** use local disk: `staticDir` is `src/server/media` and `src/server/products_files`. Payload resolves these from the process cwd (project root). This won't persist on Vercel, so a storage adapter (e.g. Vercel Blob) is still needed.
- `payload.config.ts` overrides DNS servers (`1.1.1.1`, `8.8.8.8`) so MongoDB Atlas SRV lookups work on the dev machine.
- `NextResponse.redirect` in middleware needs absolute URLs: `new URL(path, req.url)`.

## Environment variables (`.env`)

`PAYLOAD_SECRET`, `MONGODB_URL`, `NEXT_PUBLIC_SERVER_URL`, `PORT`, `GMAIL_SERVER_USER`, `GMAIL_SERVER_PASS`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`. Never print or commit their values (see "Never commit secrets" above).

## Code style

- TypeScript, ESLint `standard-with-typescript` + `next/core-web-vitals`. Most files have no semicolons, use single quotes, and put a space before function parens (`function Page ()`). Match the file you're editing.
- Path alias `@/*` → `src/*`.
- Async request APIs follow Next 15+ rules: `await cookies()`, and `searchParams`/`params` are Promises.
