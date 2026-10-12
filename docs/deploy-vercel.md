# Deploying to Vercel

1. **Create the project.** In Vercel: Add New → Project → import this repo.

2. **Add your domain.** Settings → Domains → add `digital.marketplace.abielrodriguez.dev`. Vercel shows a **CNAME**
   record (name `digital.marketplace`, value like `cname.vercel-dns.com`): add it in the DNS settings of
   `abielrodriguez.dev` at your registrar, replacing the record that points at the old Docker server.

3. **Add environment variables** (Settings → Environment Variables). Copy these from your `.env`:

   `PAYLOAD_SECRET`, `MONGODB_URL`, `GMAIL_SERVER_USER`, `GMAIL_SERVER_PASS`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`

   And add two new ones:
   - `NEXT_PUBLIC_SERVER_URL` = `https://digital.marketplace.abielrodriguez.dev`
   - `ENABLE_EXPERIMENTAL_COREPACK` = `1` (makes Vercel use the project's pnpm version)

4. **Create the Blob storage.** Storage → Create → Blob → connect it to the project. Vercel adds
   `BLOB_READ_WRITE_TOKEN` for you. Uploaded images and files are stored there.

5. **Deploy**, then:
   - **MongoDB Atlas:** Network Access → allow `0.0.0.0/0` (Vercel has no fixed IP).
   - **Stripe (test mode):** Developers → Webhooks → open your existing endpoint (it points at the old Docker
     server's URL) → change its URL to `https://digital.marketplace.abielrodriguez.dev/api/webhooks/stripe`. The signing secret stays the
     same, so `STRIPE_WEBHOOK_SECRET` doesn't change. Stripe uses this URL to tell the app an order was paid.
     To buy something, use the test card `4242 4242 4242 4242`, any future date and any CVC.

6. **Copy your existing images to Blob (once).** Your current product images are on disk, not in Blob. In PowerShell:

   ```powershell
   $env:BLOB_READ_WRITE_TOKEN = "<token from Vercel → Storage → your Blob store>"
   pnpm exec tsx scripts/migrate-uploads-to-blob.ts          # preview: shows what it will do
   pnpm exec tsx scripts/migrate-uploads-to-blob.ts --apply  # does it
   ```

   It uses the `MONGODB_URL` from your `.env`. Don't put the Blob token in `.env`.

Always open the site at `https://digital.marketplace.abielrodriguez.dev`. Logging in through other addresses Vercel gives the project (like
`<project>.vercel.app`) won't work, because the app only accepts logins from its own domain.
