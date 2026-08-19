import { Button, Heading, Text } from "@react-email/components"

import { EmailLayout } from "./components/email-layout"

function ResetPasswordEmail({
  url = "https://example.com/reset-password?token=preview",
}: {
  url?: string
}) {
  return (
    <EmailLayout preview="Reset your password">
      <Heading className="text-xl font-semibold text-zinc-900">
        Reset your password
      </Heading>
      <Text className="text-sm text-zinc-600">
        Click the button below to choose a new password. This link expires soon.
      </Text>
      <Button
        href={url}
        className="mt-4 rounded-md bg-emerald-700 px-5 py-3 text-sm font-medium text-white"
      >
        Reset password
      </Button>
      <Text className="mt-6 text-xs text-zinc-400">
        Or paste this link into your browser: {url}
      </Text>
    </EmailLayout>
  )
}

export default ResetPasswordEmail
