import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components"
import type * as React from "react"

const brand = "Alambique"

function EmailLayout({
  preview,
  children,
}: {
  preview: string
  children: React.ReactNode
}) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Tailwind>
        <Body className="bg-zinc-100 py-10 font-sans">
          <Container className="mx-auto max-w-md rounded-lg bg-white p-8 shadow-sm">
            <Text className="mb-6 text-lg font-semibold text-zinc-900">
              {brand}
            </Text>
            <Section>{children}</Section>
            <Hr className="my-6 border-zinc-200" />
            <Text className="text-xs text-zinc-400">
              If you didn&apos;t request this email, you can safely ignore it.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

export { EmailLayout }
