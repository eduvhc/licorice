import { Button, Heading, Text } from "@react-email/components"

import { EmailLayout } from "./components/email-layout"

function VerificationEmail({
  url = "https://example.com/verify-email?token=preview",
}: {
  url?: string
}) {
  return (
    <EmailLayout preview="Verify your email">
      <Heading className="text-xl font-semibold text-zinc-900">
        Verify your email
      </Heading>
      <Text className="text-sm text-zinc-600">
        Click the button below to confirm your email address and finish setting
        up your account.
      </Text>
      <Button
        href={url}
        className="mt-4 rounded-md bg-emerald-700 px-5 py-3 text-sm font-medium text-white"
      >
        Verify email
      </Button>
      <Text className="mt-6 text-xs text-zinc-400">
        Or paste this link into your browser: {url}
      </Text>
    </EmailLayout>
  )
}

export default VerificationEmail
