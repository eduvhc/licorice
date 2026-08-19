import { render } from "@react-email/render"

import ResetPasswordEmail from "../templates/reset-password-email"
import VerificationEmail from "../templates/verification-email"
import type { EmailMessage } from "../lib/types"

export async function resetPasswordEmail(
  url: string
): Promise<Pick<EmailMessage, "subject" | "html">> {
  return {
    subject: "Reset your password",
    html: await render(ResetPasswordEmail({ url })),
  }
}

export async function verificationEmail(
  url: string
): Promise<Pick<EmailMessage, "subject" | "html">> {
  return {
    subject: "Verify your email",
    html: await render(VerificationEmail({ url })),
  }
}
