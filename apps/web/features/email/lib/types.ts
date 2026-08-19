export type EmailMessage = {
  to: string
  subject: string
  html: string
}

export interface Mailer {
  send(message: EmailMessage): Promise<void>
}
