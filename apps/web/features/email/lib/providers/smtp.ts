import nodemailer from "nodemailer"

import { env } from "@/lib/env"

import type { Mailer } from "../types"

function createTransport() {
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT ?? 587,
    secure: env.SMTP_PORT === 465,
    auth:
      env.SMTP_USER && env.SMTP_PASS
        ? { user: env.SMTP_USER, pass: env.SMTP_PASS }
        : undefined,
  })
}

export const smtpMailer: Mailer = {
  async send(message) {
    const transport = createTransport()
    await transport.sendMail({
      from: env.EMAIL_FROM,
      to: message.to,
      subject: message.subject,
      html: message.html,
    })
  },
}
