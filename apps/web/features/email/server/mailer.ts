import { env } from "@/lib/env"

import { consoleMailer } from "../lib/providers/console"
import { smtpMailer } from "../lib/providers/smtp"
import type { EmailMessage, Mailer } from "../lib/types"

function getMailer(): Mailer {
  return env.SMTP_HOST ? smtpMailer : consoleMailer
}

export async function sendEmail(message: EmailMessage) {
  await getMailer().send(message)
}
