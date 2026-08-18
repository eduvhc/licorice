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

import {
  signInWithEmailAction,
  signInWithSocialAction,
  signUpWithEmailAction,
} from "../server/actions"
import type { EnabledAuthProviders, SocialProvider } from "../lib/auth-providers"

const visibleSocialProviders: SocialProvider[] = [
  "github",
  "google",
]

function GitHubIcon() {
  return (
    <svg aria-hidden="true" className="size-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.59 2 12.25c0 4.528 2.865 8.37 6.839 9.726.5.095.682-.223.682-.496 0-.244-.008-.89-.013-1.747-2.782.621-3.369-1.397-3.369-1.397-.455-1.19-1.11-1.507-1.11-1.507-.908-.636.068-.623.068-.623 1.004.072 1.532 1.058 1.532 1.058.892 1.565 2.341 1.113 2.91.851.091-.664.349-1.113.635-1.369-2.22-.259-4.555-1.139-4.555-5.07 0-1.12.39-2.036 1.03-2.753-.103-.26-.447-1.305.098-2.72 0 0 .84-.277 2.75 1.052A9.32 9.32 0 0 1 12 6.84a9.3 9.3 0 0 1 2.504.349c1.909-1.329 2.748-1.052 2.748-1.052.547 1.415.203 2.46.1 2.72.64.717 1.028 1.633 1.028 2.753 0 3.94-2.339 4.808-4.566 5.062.359.32.678.95.678 1.915 0 1.382-.012 2.497-.012 2.837 0 .276.18.596.688.494C19.138 20.616 22 16.776 22 12.25 22 6.59 17.523 2 12 2Z" />
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg aria-hidden="true" className="size-4" viewBox="0 0 24 24">
      <path d="M21.805 12.223c0-.764-.068-1.498-.195-2.205H12v4.17h5.496a4.7 4.7 0 0 1-2.039 3.086v2.565h3.3c1.93-1.807 3.048-4.47 3.048-7.616Z" fill="#4285F4" />
      <path d="M12 22c2.76 0 5.074-.93 6.766-2.52l-3.3-2.565c-.915.626-2.086.996-3.466.996-2.662 0-4.917-1.823-5.723-4.277H2.87v2.646A10.01 10.01 0 0 0 12 22Z" fill="#34A853" />
      <path d="M6.277 13.634A6.07 6.07 0 0 1 5.957 12c0-.567.11-1.114.32-1.634V7.72H2.87A10.135 10.135 0 0 0 2 12c0 1.627.383 3.163 1.07 4.28l3.207-2.646Z" fill="#FBBC05" />
      <path d="M12 6.09c1.5 0 2.847.526 3.91 1.56l2.935-2.999C17.069 2.965 14.755 2 12 2A10.01 10.01 0 0 0 2.87 7.72l3.407 2.646C7.083 7.913 9.338 6.09 12 6.09Z" fill="#EA4335" />
    </svg>
  )
}

function getSocialIcon(provider: SocialProvider) {
  switch (provider) {
    case "github":
      return <GitHubIcon />
    case "google":
      return <GoogleIcon />
    default:
      return null
  }
}

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

  const providerEntries = visibleSocialProviders
    .filter((provider) => providers[provider])
    .map((provider) => [provider, true] as const)

  const formAction = mode === "sign-up" ? signUpWithEmailAction : signInWithEmailAction

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
                    <form key={provider} action={signInWithSocialAction.bind(null, provider)}>
                      <Button variant="outline" type="submit">
                        {getSocialIcon(provider)}
                        {t("social.continueWith")} {t(`social.providers.${provider}`)}
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
                    <Input id="name" name="name" placeholder={t("fields.namePlaceholder")} required />
                  </Field>
                ) : null}
                <Field>
                  <FieldLabel htmlFor="email">{t("fields.email")}</FieldLabel>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder={t("fields.emailPlaceholder")}
                    autoFocus={mode === "sign-in" && providerEntries.length === 0}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="password">{t("fields.password")}</FieldLabel>
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
                      aria-label={showPassword ? t("fields.hidePassword") : t("fields.showPassword")}
                      className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground transition hover:text-foreground"
                      onClick={() => setShowPassword((value) => !value)}
                    >
                      {showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
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
                    <Link href={mode === "sign-up" ? "/login" : "/sign-up"}>{t(`${modeKey}.switchCta`)}</Link>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </form>
          </FieldGroup>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        {t("legal.prefix")}{" "}
        <Link href="/terms">{t("legal.terms")}</Link> {t("legal.conjunction")}{" "}
        <Link href="/privacy">{t("legal.privacy")}</Link>.
      </FieldDescription>
    </div>
  )
}

export { AuthForm }
