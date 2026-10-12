import nodemailer, { type Transporter } from 'nodemailer'

// SMTP_HOST is only set by the test suite to point at Mailpit; otherwise mail goes through Gmail
export function createMailTransport (): Transporter {
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 1025),
      secure: false
    })
  }

  return nodemailer.createTransport({
    service: 'gmail',
    secure: true,
    port: 465,
    auth: {
      user: process.env.GMAIL_SERVER_USER,
      pass: process.env.GMAIL_SERVER_PASS
    }
  })
}
