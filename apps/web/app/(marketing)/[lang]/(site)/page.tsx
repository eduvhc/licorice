import { getOptionalSession } from "@/features/auth/server/session"
import { LandingPage } from "@/features/landing/components/landing-page"

export default async function Page() {
  const session = await getOptionalSession()

  return <LandingPage session={session} />
}
