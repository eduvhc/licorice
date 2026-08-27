"use server"

import { headers } from "next/headers"
import { redirect as nextRedirect } from "next/navigation"
import type { Locale } from "next-intl"
import { getLocale, getTranslations } from "next-intl/server"

import { auth } from "@/lib/auth"
import { redirect } from "@/i18n/navigation"

import type { SocialProvider } from "../lib/social-providers"

async function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message
  }

  const t = await getTranslations("auth")
  return t("genericError")
}

/** Locale-prefixed redirect to `pathname` carrying `?error=` (and any extra query). */
async function redirectWithError(
  pathname: string,
  message: string,
  extra?: Record<string, string>
) {
  redirect({
    href: { pathname, query: { ...extra, error: message } },
    locale: await getLocale(),
  })
}

const authFailure = (message: string) => redirectWithError("/login", message)

/** Run an email auth call, then land on the dashboard (or back on /login with the error). */
async function completeEmailAuth(call: Promise<unknown>, locale: Locale) {
  try {
    await call
  } catch (error) {
    await authFailure(await getErrorMessage(error))
  }
  redirect({ href: "/dashboard", locale })
}

/**
 * Better Auth's signInSocial / linkSocialAccount both return `{ url }` — the
 * provider's authorize URL — and expect the caller to redirect there; if none
 * comes back we fall back to a locale-prefixed path.
 */
async function redirectToProvider(
  call: Promise<unknown>,
  locale: Locale,
  onError: (message: string) => Promise<void>,
  fallbackPath: string
) {
  let url: string | undefined

  try {
    const result = await call
    const value =
      result && typeof result === "object" && "url" in result
        ? (result as { url?: unknown }).url
        : undefined
    if (typeof value === "string") url = value
  } catch (error) {
    await onError(await getErrorMessage(error))
  }

  if (url) nextRedirect(url)
  redirect({ href: fallbackPath, locale })
}

export async function signInWithEmailAction(formData: FormData) {
  await completeEmailAuth(
    auth.api.signInEmail({
      body: {
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
        callbackURL: "/dashboard",
      },
    }),
    await getLocale()
  )
}

export async function signUpWithEmailAction(formData: FormData) {
  await completeEmailAuth(
    auth.api.signUpEmail({
      body: {
        name: String(formData.get("name") ?? ""),
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
        callbackURL: "/dashboard",
      },
    }),
    await getLocale()
  )
}

export async function signInWithSocialAction(
  provider: SocialProvider,
  formData: FormData
) {
  void formData
  const locale = await getLocale()

  await redirectToProvider(
    auth.api.signInSocial({
      body: {
        provider,
        // Better Auth performs these redirects itself on the OAuth callback
        // request, so they must carry the locale prefix — there is no
        // middleware to add it after the fact. On failure it appends
        // `?error=<code>` to errorCallbackURL.
        callbackURL: `/${locale}/dashboard`,
        newUserCallbackURL: `/${locale}/dashboard`,
        errorCallbackURL: `/${locale}/login`,
      },
    }),
    locale,
    authFailure,
    "/login"
  )
}

export async function linkSocialAction(
  provider: SocialProvider,
  formData: FormData
) {
  void formData
  const locale = await getLocale()

  await redirectToProvider(
    auth.api.linkSocialAccount({
      headers: await headers(),
      body: {
        provider,
        callbackURL: `/${locale}/account?linked=${provider}`,
        errorCallbackURL: `/${locale}/account`,
      },
    }),
    locale,
    (message) => redirectWithError("/account", message),
    "/account"
  )
}

export async function unlinkAccountAction(accountId: string) {
  try {
    await auth.api.unlinkAccount({
      headers: await headers(),
      body: { accountId },
    })
  } catch (error) {
    await redirectWithError("/account", await getErrorMessage(error))
  }

  redirect({ href: "/account", locale: await getLocale() })
}

export async function forgotPasswordAction(formData: FormData) {
  const email = String(formData.get("email") ?? "")

  try {
    await auth.api.requestPasswordReset({
      body: { email, redirectTo: "/reset-password" },
    })
  } catch {
    // Intentionally ignored: don't leak whether the email exists.
  }

  redirect({
    href: { pathname: "/forgot-password", query: { sent: "1" } },
    locale: await getLocale(),
  })
}

export async function resetPasswordAction(formData: FormData) {
  const token = String(formData.get("token") ?? "")
  const newPassword = String(formData.get("password") ?? "")

  try {
    await auth.api.resetPassword({
      body: { newPassword, token },
    })
  } catch (error) {
    await redirectWithError("/reset-password", await getErrorMessage(error), {
      token,
    })
  }

  redirect({
    href: { pathname: "/login", query: { reset: "1" } },
    locale: await getLocale(),
  })
}

export async function resendVerificationEmailAction(formData: FormData) {
  const email = String(formData.get("email") ?? "")

  try {
    await auth.api.sendVerificationEmail({
      body: { email, callbackURL: "/dashboard" },
    })
  } catch {
    // Intentionally ignored: don't leak whether the email exists.
  }
}

export async function signOutAction() {
  try {
    await auth.api.signOut({
      headers: await headers(),
    })
  } catch (error) {
    await redirectWithError("/account", await getErrorMessage(error))
  }

  redirect({ href: "/", locale: await getLocale() })
}
