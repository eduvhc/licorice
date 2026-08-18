"use server"

import { headers } from "next/headers"
import { redirect as nextRedirect } from "next/navigation"
import { getLocale, getTranslations } from "next-intl/server"

import { auth } from "@/lib/auth"
import { redirect } from "@/i18n/navigation"

import type { SocialProvider } from "../lib/auth-providers"

async function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message
  }

  const t = await getTranslations("auth")
  return t("genericError")
}

async function authFailure(error: string) {
  redirect({ href: { pathname: "/login", query: { error } }, locale: await getLocale() })
}

export async function signInWithEmailAction(formData: FormData) {
  const email = String(formData.get("email") ?? "")
  const password = String(formData.get("password") ?? "")

  try {
    await auth.api.signInEmail({
      body: {
        email,
        password,
        callbackURL: "/dashboard",
      },
    })
  } catch (error) {
    authFailure(await getErrorMessage(error))
  }

  redirect({ href: "/dashboard", locale: await getLocale() })
}

export async function signUpWithEmailAction(formData: FormData) {
  const name = String(formData.get("name") ?? "")
  const email = String(formData.get("email") ?? "")
  const password = String(formData.get("password") ?? "")

  try {
    await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
        callbackURL: "/dashboard",
      },
    })
  } catch (error) {
    authFailure(await getErrorMessage(error))
  }

  redirect({ href: "/dashboard", locale: await getLocale() })
}

export async function signInWithSocialAction(provider: SocialProvider, formData: FormData) {
  void formData

  let url: string | null = null

  try {
    const result = await auth.api.signInSocial({
      body: {
        provider,
        callbackURL: "/dashboard",
      },
    })

    if ("url" in result && result.url) {
      url = result.url
    }
  } catch (error) {
    authFailure(await getErrorMessage(error))
  }

  if (url) {
    nextRedirect(url)
  }

  redirect({ href: "/login", locale: await getLocale() })
}

export async function signOutAction() {
  try {
    await auth.api.signOut({
      headers: await headers(),
    })
  } catch (error) {
    const message = await getErrorMessage(error)
    redirect({ href: { pathname: "/account", query: { error: message } }, locale: await getLocale() })
  }

  redirect({ href: "/", locale: await getLocale() })
}
