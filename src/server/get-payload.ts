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

  return await getPayload({
    config,
    email: {
      transport: transporter,
      fromAddress: process.env.GMAIL_SERVER_USER ?? '',
      fromName: 'digital-hippo'
    }
  })
}
