import { ForgotPasswordPage } from "@/features/auth/components/forgot-password-page"

type ForgotPasswordRouteProps = {
  searchParams: Promise<{
    sent?: string
  }>
}

export default async function Page({ searchParams }: ForgotPasswordRouteProps) {
  const { sent } = await searchParams

  return <ForgotPasswordPage sent={sent === "1"} />
}
