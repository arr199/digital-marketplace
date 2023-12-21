import * as dotenv from 'dotenv'
import path from 'path'
import { type InitOptions } from 'payload/config'
import payload, { type Payload } from 'payload'
import nodemailer from 'nodemailer'

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

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
  initOptions?: Partial<InitOptions>
}
let cached = (global as any).payload

if (!cached) {
  cached = (global as any).payload = {
    client: null,
    promise: null
  }
}

export async function getPayloadClient ({ initOptions = {} }: Args): Promise<Payload> {
  if (!process.env.PAYLOAD_SECRET) {
    throw new Error('PAYLOAD_SECRET is missing')
  }
  if (cached.client) {
    return cached.client
  }

  if (!cached.promise) {
    return await payload.init({
      email: {
        transport: transporter,
        fromAddress: process.env.GMAIL_SERVER_USER ?? '',
        fromName: 'digital-hippo'

      },
      secret: process.env.PAYLOAD_SECRET,
      local: !initOptions?.express,
      ...(initOptions || {})
    })
  }
  try {
    cached.client = await cached.promise
  } catch (err) {
    cached.promise = null
    throw err
  }
  return cached.client
}
