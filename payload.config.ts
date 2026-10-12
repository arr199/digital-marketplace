import { setServers } from 'node:dns/promises'

// Works around the dev machine's DNS failing MongoDB Atlas SRV lookups; not needed on Vercel
if (!process.env.VERCEL) {
  setServers(['1.1.1.1', '8.8.8.8'])
}

import { buildConfig } from 'payload'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import path from 'path'
import sharp from 'sharp'
import { Users } from './src/collections/users'
import { Products } from './src/collections/products/products'
import { Media } from './src/collections/media'
import { ProductFiles } from './src/collections/productFile'
import { Orders } from './src/collections/orders'
import { createMailTransport } from './src/lib/mailer'
import { getTrustedOrigins } from './src/lib/server-url'

const transporter = createMailTransport()

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET ?? '',
  collections: [Users, Products, Media, ProductFiles, Orders],
  // Cookie-authenticated requests must come from one of our own origins. serverURL is left unset on
  // purpose: setting it makes upload URLs absolute, which next/image would then need remotePatterns for.
  csrf: getTrustedOrigins(),
  routes: {
    admin: '/sell'
  },
  admin: {
    user: 'users',
    meta: {
      titleSuffix: '- DigitalHippo'
    }
  },
  plugins: [
    // Uploads go to Vercel Blob when BLOB_READ_WRITE_TOKEN is set (Vercel), and to local disk otherwise
    // (dev, tests, CI). Files are still served through Payload's access-checked /api/<collection>/file/ routes.
    vercelBlobStorage({
      enabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      token: process.env.BLOB_READ_WRITE_TOKEN,
      collections: {
        // prefixes keep the two collections apart: they contain files with the same names
        media: { prefix: 'media' },
        product_files: { prefix: 'product_files' }
      },
      // browser uploads straight to Blob, bypassing Vercel's 4.5 MB request body limit
      clientUploads: true
    })
  ],
  email: ({ payload }) => ({
    defaultFromAddress: process.env.GMAIL_SERVER_USER ?? '',
    defaultFromName: 'digital-hippo',
    name: 'nodemailer',
    sendEmail: async (message) => {
      return await transporter.sendMail(message)
    }
  }),
  editor: lexicalEditor(),
  db: mongooseAdapter({
    url: process.env.MONGODB_URL ?? '',
    transactionOptions: false as const
  }),
  sharp,
  typescript: {
    outputFile: path.resolve(__dirname, 'src/server/payload-types.ts')
  }
})
