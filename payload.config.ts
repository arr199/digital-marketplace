import { buildConfig } from 'payload'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import sharp from 'sharp'
import nodemailer from 'nodemailer'
import { Users } from './src/collections/users'
import { Products } from './src/collections/products/products'
import { Media } from './src/collections/media'
import { ProductFiles } from './src/collections/productFile'
import { Orders } from './src/collections/orders'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  secure: true,
  port: 465,
  auth: {
    user: process.env.GMAIL_SERVER_USER,
    pass: process.env.GMAIL_SERVER_PASS
  }
})

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET ?? '',
  collections: [Users, Products, Media, ProductFiles, Orders],
  routes: {
    admin: '/sell'
  },
  admin: {
    user: 'users',
    meta: {
      titleSuffix: '- DigitalHippo'
    }
  },
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
    url: process.env.MONGODB_URL ?? ''
  }),
  sharp,
  typescript: {
    outputFile: path.resolve(__dirname, 'src/server/payload-types.ts')
  }
})
