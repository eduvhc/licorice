import { AuthPage } from "@/features/auth/components/auth-page"

type LoginRouteProps = {
  searchParams: Promise<{
    error?: string
  }>
}

export default async function LoginPage({ searchParams }: LoginRouteProps) {
  const { error } = await searchParams

  return <AuthPage error={error} mode="sign-in" />
}
