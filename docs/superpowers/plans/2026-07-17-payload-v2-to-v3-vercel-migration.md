# Payload v2 → v3 + Vercel Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate DigitalHippo from self-hosted Express + Payload 2.x to Vercel hosting with Payload 3.x.

**Architecture:** Remove the Express server layer. Payload 3 runs natively inside Next.js App Router via a `(payload)` route group. tRPC switches from dual Express+Next.js handlers to Next.js-only. Auth moves from Express `req.user` to `payload.auth({ headers })`. Stripe webhook moves to a Next.js Route Handler.

**Tech Stack:** Next.js 16.2.6+, Payload 3.x, @payloadcms/next, @payloadcms/db-mongodb, @payloadcms/richtext-lexical, tRPC 10, Stripe, Zustand, Tailwind CSS, shadcn/ui, MongoDB.

---

## File Structure Map

| File | Action | Purpose |
|---|---|---|
| `payload.config.ts` | Create (root) | Payload 3 config — migrated from `src/server/payload.config.ts` |
| `next.config.mjs` | Rename from `.js` | ESM config with `withPayload` plugin |
| `src/app/(payload)/admin/[[...segments]]/page.tsx` | Create | Payload admin panel entry |
| `src/app/(payload)/admin/[[...segments]]/not-found.tsx` | Create | Payload admin 404 |
| `src/app/(payload)/api/[...slug]/route.ts` | Create | Payload REST API handler |
| `src/app/(payload)/layout.tsx` | Create | Payload admin root layout |
| `src/app/(payload)/custom.scss` | Create | Payload admin custom styles |
| `src/app/api/webhooks/stripe/route.ts` | Create | Stripe webhook handler (from Express) |
| `src/server/get-payload.ts` | Modify | Rewrite for Payload 3 `getPayload` API |
| `src/trpc/trpc.ts` | Modify | Change auth context from Express to headers |
| `src/trpc/auth-router.ts` | Modify | Login sets cookie manually |
| `src/app/api/trpc/[trpc]/route.ts` | Modify | Pass headers in context |
| `src/middleware.ts` | Modify | Add cart auth protection |
| `src/components/providers.tsx` | Modify | tRPC URL no longer needs server URL prefix |
| `src/collections/users.ts` | Modify | Import path changes |
| `src/collections/products/products.ts` | Modify | Import path changes |
| `src/collections/orders.ts` | Modify | Import path changes |
| `src/collections/media.ts` | Modify | Import path changes |
| `src/collections/productFile.ts` | Modify | Import path changes |
| `tsconfig.json` | Modify | Add `@payload-config` path alias |
| `package.json` | Modify | Updated deps and scripts |
| `src/server/server.ts` | Delete | No longer needed |
| `src/server/next-utils.ts` | Delete | No longer needed |
| `tsconfig.server.json` | Delete | No longer needed |
| `nodemon.json` | Delete | No longer needed |
| `Dockerfile` | Delete | No longer needed |

---

### Task 1: Initialize Git and Create Branch

- [ ] **Step 1: Initialize git repo**

Run: `git init`
Expected: Initialized empty Git repository

- [ ] **Step 2: Create .gitignore**

Create `D:\1CODING\NextJS\digital-marketplace\.gitignore` with content:

```
node_modules/
.next/
dist/
.env
.env.local
media/
products_files/
```

- [ ] **Step 3: Stage and commit everything on master**

```bash
git add .
git commit -m "initial: DigitalHippo marketplace (Payload v2 + Express self-hosted)"
```

Expected: All files committed on master.

- [ ] **Step 4: Create vercel-migration branch**

```bash
git checkout -b vercel-migration
```

Expected: Now on branch `vercel-migration`.

---

### Task 2: Upgrade and Install Packages

- [ ] **Step 1: Remove Express and Payload v2 packages**

```bash
npm uninstall express @types/express compression @types/compression @trpc/server/adapters/express body-parser @payloadcms/bundler-webpack @payloadcms/richtext-slate cross-env nodemon copyfiles dotenv
```

- [ ] **Step 2: Install Payload 3 and core dependencies**

```bash
npm install payload@latest @payloadcms/next@latest @payloadcms/db-mongodb@latest @payloadcms/richtext-lexical@latest sharp
```

- [ ] **Step 3: Upgrade Next.js to v16.2.6+**

```bash
npm install next@16.2.6 react@19 react-dom@19
```

- [ ] **Step 4: Upgrade Stripe to latest compatible version**

```bash
npm install stripe@latest
```

- [ ] **Step 5: Run npm install to resolve all peer dependencies**

```bash
npm install
```

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: upgrade to Payload 3, Next.js 16, remove Express dependencies"
```

---

### Task 3: Create Payload 3 Config at Root

- [ ] **Step 1: Create `payload.config.ts`**

Create `D:\1CODING\NextJS\digital-marketplace\payload.config.ts`:

```typescript
import { buildConfig } from 'payload'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import sharp from 'sharp'
import { Users } from './src/collections/users'
import { Products } from './src/collections/products/products'
import { Media } from './src/collections/media'
import { ProductFiles } from './src/collections/productFile'
import { Orders } from './src/collections/orders'

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET ?? '',
  collections: [Users, Products, Media, ProductFiles, Orders],
  routes: {
    admin: '/sell'
  },
  admin: {
    user: 'users',
    meta: {
      titleSuffix: '- DigitalHippo',
      favicon: '/favicon.ico',
      ogImage: '/thumbnail.jpg'
    }
  },
  rateLimit: { max: 2000 },
  editor: lexicalEditor(),
  db: mongooseAdapter({
    url: process.env.MONGODB_URL ?? ''
  }),
  sharp,
  typescript: {
    outputFile: path.resolve(__dirname, 'src/server/payload-types.ts')
  }
})
```

- [ ] **Step 2: Remove old payload.config.ts**

```bash
Remove-Item -LiteralPath "src/server/payload.config.ts"
```

- [ ] **Step 3: Commit**

```bash
git add payload.config.ts
git rm src/server/payload.config.ts
git commit -m "feat: create Payload 3 config at root, remove old config"
```

---

### Task 4: Create Payload 3 Route Group Files

- [ ] **Step 1: Create directory structure**

```bash
New-Item -ItemType Directory -Path "D:\1CODING\NextJS\digital-marketplace\src\app\(payload)\admin\[[...segments]]" -Force
New-Item -ItemType Directory -Path "D:\1CODING\NextJS\digital-marketplace\src\app\(payload)\api\[...slug]" -Force
```

- [ ] **Step 2: Create admin page**

Create `D:\1CODING\NextJS\digital-marketplace\src\app\(payload)\admin\[[...segments]]\page.tsx`:

```typescript
/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import config from '@payload-config'
import { AdminPage, generatePageMetadata } from '@payloadcms/next/views'

import type { Metadata } from 'next'

type Args = {
  params: Promise<{
    segments: string[]
  }>
  searchParams: Promise<{
    [key: string]: string | string[]
  }>
}

export const generateMetadata = ({ params, searchParams }: Args): Promise<Metadata> =>
  generatePageMetadata({ config, params, searchParams })

const Page = ({ params, searchParams }: Args) =>
  AdminPage({ config, params, searchParams })

export default Page
```

- [ ] **Step 3: Create admin not-found page**

Create `D:\1CODING\NextJS\digital-marketplace\src\app\(payload)\admin\[[...segments]]\not-found.tsx`:

```typescript
/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import config from '@payload-config'
import { NotFoundPage, generateNotFoundMetadata } from '@payloadcms/next/views'

import type { Metadata } from 'next'

type Args = {
  params: Promise<{
    segments: string[]
  }>
  searchParams: Promise<{
    [key: string]: string | string[]
  }>
}

export const generateMetadata = ({ params, searchParams }: Args): Promise<Metadata> =>
  generateNotFoundMetadata({ config, params, searchParams })

const NotFound = ({ params, searchParams }: Args) =>
  NotFoundPage({ config, params, searchParams })

export default NotFound
```

- [ ] **Step 4: Create API route handler**

Create `D:\1CODING\NextJS\digital-marketplace\src\app\(payload)\api\[...slug]\route.ts`:

```typescript
/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import config from '@payload-config'
import { REST_DELETE, REST_GET, REST_OPTIONS, REST_PATCH, REST_POST } from '@payloadcms/next/routes'

export const GET = REST_GET(config)
export const POST = REST_POST(config)
export const DELETE = REST_DELETE(config)
export const PATCH = REST_PATCH(config)
export const OPTIONS = REST_OPTIONS(config)
```

- [ ] **Step 5: Create admin layout**

Create `D:\1CODING\NextJS\digital-marketplace\src\app\(payload)\layout.tsx`:

```typescript
/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import config from '@payload-config'
import { RootLayout, handleServerFunctions } from '@payloadcms/next/layouts'
import type { ServerFunctionClient } from 'payload'
import React from 'react'

import { importMap } from './admin/importMap.js'
import './custom.scss'

type Args = {
  children: React.ReactNode
}

const serverFunction: ServerFunctionClient = async function (args) {
  'use server'
  return handleServerFunctions({
    ...args,
    config,
    importMap,
  })
}

const Layout = ({ children }: Args) => (
  <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
    {children}
  </RootLayout>
)

export default Layout
```

- [ ] **Step 6: Create custom.scss**

Create `D:\1CODING\NextJS\digital-marketplace\src\app\(payload)\custom.scss`:

```scss
/* Custom admin panel styles */
```

- [ ] **Step 7: Commit**

```bash
git add src/app/(payload)/
git commit -m "feat: add Payload 3 route group (admin, API, layout)"
```

---

### Task 5: Update next.config to ESM with withPayload

- [ ] **Step 1: Rename next.config.js to next.config.mjs**

```bash
Rename-Item -LiteralPath "next.config.js" -NewName "next.config.mjs"
```

- [ ] **Step 2: Update next.config.mjs content**

Write `D:\1CODING\NextJS\digital-marketplace\next.config.mjs`:

```javascript
import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: 'digital-marketplace.up.railway.app',
        pathname: '/**',
        port: '',
        protocol: 'https',
      },
      {
        hostname: 'localhost',
        pathname: '**',
        port: '3400',
        protocol: 'http',
      },
      {
        hostname: 'digital-marketplace-ghencuyfzq-nw.a.run.app',
        pathname: '**',
        port: '',
        protocol: 'https',
      },
    ],
  },
}

export default withPayload(nextConfig)
```

- [ ] **Step 3: Commit**

```bash
git add next.config.mjs
git rm next.config.js
git commit -m "feat: migrate next.config to ESM with withPayload plugin"
```

---

### Task 6: Update tsconfig.json

- [ ] **Step 1: Add @payload-config path alias**

Modify `D:\1CODING\NextJS\digital-marketplace\tsconfig.json`. In the `compilerOptions.paths` section, add the new alias. The existing file has:

```json
"paths": {
  "@/*": ["./src/*"]
}
```

Change it to:

```json
"paths": {
  "@/*": ["./src/*"],
  "@payload-config": ["./payload.config.ts"]
}
```

- [ ] **Step 2: Commit**

```bash
git add tsconfig.json
git commit -m "chore: add @payload-config path alias"
```

---

### Task 7: Migrate Collection Import Paths

All five collections currently import from `payload/types` and `payload/dist/*`. These need to import from `payload` directly.

- [ ] **Step 1: Fix `src/collections/users.ts`**

Change the import line from:
```typescript
import { type CollectionConfig, type Access } from 'payload/types'
```
To:
```typescript
import type { CollectionConfig, Access } from 'payload'
```

Delete the empty `.env` read import if present (the `VerifyEmail` component import stays the same).

- [ ] **Step 2: Fix `src/collections/products/products.ts`**

Change:
```typescript
import { type AfterChangeHook, type BeforeChangeHook } from 'payload/dist/globals/config/types'
import API from '../../lib/API'
import { type Access, type CollectionConfig } from 'payload/types'
import { type Product } from '@/server/payload-types'
import { stripe } from '../../lib/stripe'
```
To:
```typescript
import type { AfterChangeHook, BeforeChangeHook } from 'payload'
import API from '../../lib/API'
import type { Access, CollectionConfig } from 'payload'
import type { Product } from '@/server/payload-types'
import { stripe } from '../../lib/stripe'
```

- [ ] **Step 3: Fix `src/collections/orders.ts`**

Change:
```typescript
import { type Access, type CollectionConfig } from 'payload/types'
```
To:
```typescript
import type { Access, CollectionConfig } from 'payload'
```

- [ ] **Step 4: Fix `src/collections/media.ts`**

Change:
```typescript
import { type CollectionConfig, type Access } from 'payload/types'
```
To:
```typescript
import type { CollectionConfig, Access } from 'payload'
```

- [ ] **Step 5: Fix `src/collections/productFile.ts`**

Change:
```typescript
import { type Product } from '../server/payload-types'
import { type AccessResult } from 'payload/config'
import { type BeforeChangeHook } from 'payload/dist/collections/config/types'
import { type Access, type CollectionConfig } from 'payload/types'
```
To:
```typescript
import type { Product } from '../server/payload-types'
import type { AccessResult } from 'payload'
import type { BeforeChangeHook, Access, CollectionConfig } from 'payload'
```

- [ ] **Step 6: Commit**

```bash
git add src/collections/
git commit -m "fix: update collection imports for Payload 3"
```

---

### Task 8: Rewrite get-payload.ts for Payload 3

- [ ] **Step 1: Rewrite `src/server/get-payload.ts`**

Read the current file first, then rewrite `D:\1CODING\NextJS\digital-marketplace\src\server\get-payload.ts`:

```typescript
import { getPayload } from 'payload'
import config from '@payload-config'
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  secure: true,
  port: 465,
  auth: {
    user: process.env.GMAIL_SERVER_USER,
    pass: process.env.GMAIL_SERVER_PASS
  }
})

interface Args {
  initOptions?: {
    express?: unknown
    onInit?: (cms: unknown) => void
  }
}

export async function getPayloadClient ({ initOptions = {} }: Args = {}) {
  if (!process.env.PAYLOAD_SECRET) {
    throw new Error('PAYLOAD_SECRET is missing')
  }

  const payload = await getPayload({
    config,
    email: {
      transport: transporter,
      fromAddress: process.env.GMAIL_SERVER_USER ?? '',
      fromName: 'digital-hippo'
    }
  })

  return payload
}
```

- [ ] **Step 2: Commit**

```bash
git add src/server/get-payload.ts
git commit -m "fix: rewrite getPayloadClient for Payload 3 getPayload API"
```

---

### Task 9: Migrate tRPC Auth Context

- [ ] **Step 1: Rewrite `src/trpc/trpc.ts`**

Read the current file first, then rewrite `D:\1CODING\NextJS\digital-marketplace\src\trpc\trpc.ts`:

```typescript
import { getPayloadClient } from '@/server/get-payload'
import { TRPCError, initTRPC } from '@trpc/server'

const t = initTRPC.context<{ headers: Headers }>().create()
const middleware = t.middleware

const isAuth = middleware(async ({ ctx, next }) => {
  const payload = await getPayloadClient()
  const { headers } = ctx
  const { user } = await payload.auth({ headers })

  if (!user) throw new TRPCError({ code: 'UNAUTHORIZED' })

  return await next({
    ctx: {
      user
    }
  })
})

export const router = t.router
export const publicProcedure = t.procedure
export const privateProcedure = t.procedure.use(isAuth)
```

- [ ] **Step 2: Commit**

```bash
git add src/trpc/trpc.ts
git commit -m "fix: migrate tRPC auth from Express context to Payload 3 headers auth"
```

---

### Task 10: Migrate auth-router.ts Login

- [ ] **Step 1: Rewrite the loginUser mutation**

Read `src/trpc/auth-router.ts` first. The `loginUser` mutation currently uses Express `res` to set the cookie. In Payload 3, the Local API `login` returns a token and we set the cookie manually.

Change the `loginUser` mutation in `D:\1CODING\NextJS\digital-marketplace\src\trpc\auth-router.ts`:

```typescript
loginUser: publicProcedure
  .input(AuthCredentialsSchema)
  .mutation(async ({ input, ctx }) => {
    const { email, password } = input
    const { headers } = ctx

    try {
      const payload = await getPayloadClient({})
      const result = await payload.login({
        collection: 'users',
        data: { email, password }
      })

      if (result.token) {
        const responseHeaders = new Headers()
        responseHeaders.set(
          'Set-Cookie',
          `payload-token=${result.token}; Path=/; HttpOnly; SameSite=Lax; Secure`
        )
        return { success: true, token: result.token }
      }

      return { success: true }
    } catch (err) {
      throw new TRPCError({ code: 'UNAUTHORIZED' })
    }
  })
```

- [ ] **Step 2: Commit**

```bash
git add src/trpc/auth-router.ts
git commit -m "fix: update loginUser to use Payload 3 Local API auth"
```

---

### Task 11: Update tRPC API Route Handler

- [ ] **Step 1: Rewrite `src/app/api/trpc/[trpc]/route.ts`**

Read the current file first, then rewrite `D:\1CODING\NextJS\digital-marketplace\src\app\api\trpc\[trpc]\route.ts`:

```typescript
import { appRouter } from '@/trpc'
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'

function handler (req: Request) {
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    router: appRouter,
    req,
    createContext: () => ({
      headers: req.headers
    })
  })
}

export { handler as GET, handler as POST }
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/trpc/[trpc]/route.ts
git commit -m "fix: update tRPC route handler to pass headers in context"
```

---

### Task 12: Create Stripe Webhook Route Handler

- [ ] **Step 1: Create `src/app/api/webhooks/stripe/route.ts`**

Create `D:\1CODING\NextJS\digital-marketplace\src\app\api\webhooks\stripe\route.ts`:

```typescript
import { getPayloadClient } from '@/server/get-payload'
import type { Product } from '@/server/payload-types'
import Stripe from 'stripe'
import nodemailer from 'nodemailer'
import { ReceiptEmailHtml } from '@/components/emails/receiptEmail'

const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? ''

export async function POST (req: Request) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature') ?? ''

  let event: Stripe.Event
  try {
    event = Stripe.webhooks.constructEvent(
      body,
      signature,
      stripeWebhookSecret
    )
  } catch (err) {
    return Response.json(
      { error: `Webhook Error: ${err instanceof Error ? err.message : 'Unknown Error'}` },
      { status: 400 }
    )
  }

  const session = event.data.object as Stripe.Checkout.Session

  if (!session?.metadata?.userId || !session?.metadata?.orderId) {
    return Response.json({ error: 'No user present in metadata' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const payload = await getPayloadClient({})

    const { docs: users } = await payload.find({
      collection: 'users',
      where: {
        id: { equals: session.metadata.userId }
      }
    })

    const [user] = users
    if (!user) return Response.json({ error: 'No such user exists.' }, { status: 404 })

    const { docs: orders } = await payload.find({
      collection: 'orders',
      depth: 2,
      where: {
        id: { equals: session.metadata.orderId }
      }
    })

    const [order] = orders
    if (!order) return Response.json({ error: 'No such order exists.' }, { status: 404 })

    await payload.update({
      collection: 'orders',
      data: { isPaid: true },
      where: {
        id: { equals: session.metadata.orderId }
      }
    })

    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        secure: true,
        port: 465,
        auth: {
          user: process.env.GMAIL_SERVER_USER,
          pass: process.env.GMAIL_SERVER_PASS
        }
      })

      await transporter.sendMail({
        from: process.env.GMAIL_SERVER_USER,
        to: user.email,
        text: 'Receipt',
        html: ReceiptEmailHtml({
          date: new Date(),
          email: user.email,
          orderId: session.metadata.orderId,
          products: order.products as Product[]
        })
      })

      return Response.json({ success: true })
    } catch (error) {
      return Response.json({ error: 'Failed to send receipt' }, { status: 500 })
    }
  }

  return Response.json({ received: true })
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/webhooks/stripe/route.ts
git commit -m "feat: migrate Stripe webhook from Express to Next.js Route Handler"
```

---

### Task 13: Update Middleware for Cart Protection

- [ ] **Step 1: Rewrite `src/middleware.ts`**

Read the current file first, then rewrite `D:\1CODING\NextJS\digital-marketplace\src\middleware.ts`:

```typescript
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware (req: NextRequest) {
  const { cookies, nextUrl } = req
  const token = cookies.get('payload-token')?.value

  const protectedRoutes = ['/sign-in', '/sign-up']
  const authProtectedRoutes = ['/cart']

  if (token && protectedRoutes.includes(nextUrl.pathname)) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SERVER_URL}/`)
  }

  if (!token && authProtectedRoutes.includes(nextUrl.pathname)) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SERVER_URL}/sign-in?origin=cart`)
  }

  return NextResponse.next()
}
```

- [ ] **Step 2: Commit**

```bash
git add src/middleware.ts
git commit -m "fix: update middleware for Payload 3 cookie-based auth and cart protection"
```

---

### Task 14: Update Providers and tRPC Client

- [ ] **Step 1: Update `src/components/providers.tsx`**

The tRPC client URL should use a relative path on Vercel (same origin). Read the current file first, then rewrite `D:\1CODING\NextJS\digital-marketplace\src\components\providers.tsx`:

```typescript
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type ReactNode, useState } from 'react'
import { trpc } from '@/trpc/client'
import { httpBatchLink } from '@trpc/client'

export default function Providers ({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  const [trpcClient] = useState(() => trpc.createClient({
    links: [
      httpBatchLink({
        url: `${process.env.NEXT_PUBLIC_SERVER_URL}/api/trpc`,
        async fetch (url, options) {
          return await fetch(url, { ...options, credentials: 'include' })
        }
      })
    ]
  }))

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/providers.tsx
git commit -m "fix: update tRPC client URL handling for Vercel"
```

---

### Task 15: Clean Up Express Files

- [ ] **Step 1: Delete Express and old config files**

```bash
Remove-Item -LiteralPath "src/server/server.ts"
Remove-Item -LiteralPath "src/server/next-utils.ts"
Remove-Item -LiteralPath "tsconfig.server.json"
Remove-Item -LiteralPath "nodemon.json"
Remove-Item -LiteralPath "Dockerfile"
```

- [ ] **Step 2: Delete old Stripe webhook file**

```bash
Remove-Item -LiteralPath "src/webhooks/stripeWebHook.ts"
```

- [ ] **Step 3: Remove empty directories if any**

```bash
if (Test-Path "src/webhooks") { Remove-Item -LiteralPath "src/webhooks" -Recurse -Force }
```

- [ ] **Step 4: Commit**

```bash
git rm src/server/server.ts src/server/next-utils.ts tsconfig.server.json nodemon.json Dockerfile src/webhooks/stripeWebHook.ts
git commit -m "chore: remove Express server, old config files, and Dockerfile"
```

---

### Task 16: Update package.json Scripts

- [ ] **Step 1: Update scripts**

Read the current file first. In `D:\1CODING\NextJS\digital-marketplace\package.json`, replace the `scripts` section:

```json
"scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "generate:types": "payload generate:types",
    "lint": "next lint"
}
```

Remove the `"main": "dist/server/server.js"` line from package.json.

- [ ] **Step 2: Commit**

```bash
git add package.json
git commit -m "chore: update scripts for Vercel/Next.js native build"
```

---

### Task 17: Generate Payload Types

- [ ] **Step 1: Generate types**

```bash
npm run generate:types
```

Expected: Types generated at `src/server/payload-types.ts`.

- [ ] **Step 2: Commit**

```bash
git add src/server/payload-types.ts
git commit -m "chore: generate Payload 3 types"
```

---

### Task 18: Build Verification

- [ ] **Step 1: Run Next.js build**

```bash
npm run build
```

Expected: Build succeeds without errors. If there are import or type errors, fix them and retry.

- [ ] **Step 2: Commit any fixes**

```bash
git add .
git commit -m "fix: build fixes for Payload 3 migration"
```

---

### Task 19: Environment Variables

Update `.env` file (manually — do not commit):

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SERVER_URL` | `https://your-app.vercel.app` (or Vercel preview URL) |
| `PAYLOAD_SECRET` | keep existing |
| `MONGODB_URL` | keep existing (MongoDB Atlas URL) |
| `GMAIL_SERVER_USER` | keep existing |
| `GMAIL_SERVER_PASS` | keep existing |
| `STRIPE_SECRET_KEY` | keep existing |
| `STRIPE_WEBHOOK_SECRET` | keep existing |

Remove: `PAYLOAD_CONFIG_PATH`, `PORT`, `NEXT_BUILD`

Also add to Vercel project settings (Environment Variables) after deployment.

---

### Task 20: Deploy to Vercel and Verify

- [ ] **Step 1: Push to GitHub**

```bash
git push origin vercel-migration
```

- [ ] **Step 2: Import to Vercel**

Import the repository into Vercel. Set environment variables in Vercel dashboard. Deploy.

- [ ] **Step 3: Update Stripe webhook endpoint**

In Stripe Dashboard, update webhook URL to: `https://your-app.vercel.app/api/webhooks/stripe`

- [ ] **Step 4: Verify**

- Admin panel loads at `/sell`
- Product listing works
- Sign-up/sign-in/verification works
- Cart add/remove works
- Stripe checkout works
- Webhook marks orders as paid
- Download links work
- Receipt emails send
