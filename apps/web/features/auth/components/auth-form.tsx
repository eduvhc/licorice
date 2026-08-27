"use client"

import * as React from "react"
import { useTranslations } from "next-intl"

import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { cn } from "@workspace/ui/lib/utils"
import { EyeIcon, EyeOffIcon } from "lucide-react"

import { Link } from "@/i18n/navigation"

import { getSocialIcon } from "./provider-icons"
import {
  signInWithEmailAction,
  signInWithSocialAction,
  signUpWithEmailAction,
} from "../server/actions"
import {
  VISIBLE_SOCIAL_PROVIDERS,
  type EnabledAuthProviders,
} from "../lib/social-providers"

function AuthForm({
  className,
  error,
  mode,
  providers,
  ...props
}: React.ComponentProps<"div"> & {
  error?: string
  mode: "sign-in" | "sign-up"
  providers: EnabledAuthProviders
}) {
  const t = useTranslations("auth")
  const [showPassword, setShowPassword] = React.useState(false)
  const modeKey = mode === "sign-up" ? "signUp" : "signIn"

  const providerEntries = VISIBLE_SOCIAL_PROVIDERS.filter(
    (provider) => providers[provider]
  ).map((provider) => [provider, true] as const)

  const formAction =
    mode === "sign-up" ? signUpWithEmailAction : signInWithEmailAction

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{t(`${modeKey}.title`)}</CardTitle>
          <CardDescription>
            {providerEntries.length > 0
              ? t("social.providerOrEmail")
              : t(`${modeKey}.emailDescription`)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            {providerEntries.length > 0 ? (
              <>
                <Field>
                  {providerEntries.map(([provider]) => (
                    <form
                      key={provider}
                      action={signInWithSocialAction.bind(null, provider)}
                    >
                      <Button variant="outline" type="submit">
                        {getSocialIcon(provider)}
                        {t("social.continueWith")}{" "}
                        {t(`social.providers.${provider}`)}
                      </Button>
                    </form>
                  ))}
                </Field>
                <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                  {t("social.divider")}
                </FieldSeparator>
              </>
            ) : null}
            <form action={formAction}>
              <FieldGroup>
                {mode === "sign-up" ? (
                  <Field>
                    <FieldLabel htmlFor="name">{t("fields.name")}</FieldLabel>
                    <Input
                      id="name"
                      name="name"
                      placeholder={t("fields.namePlaceholder")}
                      required
                    />
                  </Field>
                ) : null}
                <Field>
                  <FieldLabel htmlFor="email">{t("fields.email")}</FieldLabel>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder={t("fields.emailPlaceholder")}
                    autoFocus={
                      mode === "sign-in" && providerEntries.length === 0
                    }
                    required
                  />
                </Field>
                <Field>
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor="password">
                      {t("fields.password")}
                    </FieldLabel>
                    {mode === "sign-in" ? (
                      <Link
                        href="/forgot-password"
                        className="text-sm text-muted-foreground hover:text-foreground"
                      >
                        {t("signIn.forgotPassword")}
                      </Link>
                    ) : null}
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      aria-label={
                        showPassword
                          ? t("fields.hidePassword")
                          : t("fields.showPassword")
                      }
                      className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground transition hover:text-foreground"
                      onClick={() => setShowPassword((value) => !value)}
                    >
                      {showPassword ? (
                        <EyeOffIcon className="size-4" />
                      ) : (
                        <EyeIcon className="size-4" />
                      )}
                    </button>
                  </div>
                </Field>
                {error ? (
                  <FieldDescription className="text-center text-destructive">
                    {error}
                  </FieldDescription>
                ) : null}
                <Field>
                  <Button type="submit">{t(`${modeKey}.submit`)}</Button>
                  <FieldDescription className="text-center">
                    {t(`${modeKey}.switchPrompt`)}{" "}
                    <Link href={mode === "sign-up" ? "/login" : "/sign-up"}>
                      {t(`${modeKey}.switchCta`)}
                    </Link>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </form>
          </FieldGroup>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        {t("legal.prefix")} <Link href="/terms">{t("legal.terms")}</Link>{" "}
        {t("legal.conjunction")}{" "}
        <Link href="/privacy">{t("legal.privacy")}</Link>.
      </FieldDescription>
    </div>
  )
}

export { AuthForm }
