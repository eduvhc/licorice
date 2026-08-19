import { logger } from "@/lib/logger"

import type { Mailer } from "../types"

export const consoleMailer: Mailer = {
  async send(message) {
    logger.info(
      { to: message.to, subject: message.subject, html: message.html },
      "email sent (console)"
    )
  },
}
