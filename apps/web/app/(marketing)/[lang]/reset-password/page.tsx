import { ResetPasswordPage } from "@/features/auth/components/reset-password-page"

type ResetPasswordRouteProps = {
  searchParams: Promise<{
    token?: string
    error?: string
  }>
}

export default async function Page({ searchParams }: ResetPasswordRouteProps) {
  const { token, error } = await searchParams

  return <ResetPasswordPage error={error} token={token ?? ""} />
}
