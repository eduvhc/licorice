import { AuthPage } from "@/features/auth/components/auth-page"

type SignUpRouteProps = {
  searchParams: Promise<{
    error?: string
  }>
}

export default async function SignUpPage({ searchParams }: SignUpRouteProps) {
  const { error } = await searchParams

  return <AuthPage error={error} mode="sign-up" />
}
