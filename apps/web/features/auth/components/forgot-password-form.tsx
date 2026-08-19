"use client"

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
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"

import { Link } from "@/i18n/navigation"

import { forgotPasswordAction } from "../server/actions"

function ForgotPasswordForm({ sent }: { sent: boolean }) {
  const t = useTranslations("auth")

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">{t("forgotPassword.title")}</CardTitle>
        <CardDescription>
          {sent
            ? t("forgotPassword.sentDescription")
            : t("forgotPassword.description")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sent ? (
          <FieldDescription className="text-center">
            <Link href="/login">{t("forgotPassword.backToLogin")}</Link>
          </FieldDescription>
        ) : (
          <form action={forgotPasswordAction}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">{t("fields.email")}</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder={t("fields.emailPlaceholder")}
                  autoFocus
                  required
                />
              </Field>
              <Field>
                <Button type="submit">{t("forgotPassword.submit")}</Button>
                <FieldDescription className="text-center">
                  <Link href="/login">{t("forgotPassword.backToLogin")}</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        )}
      </CardContent>
    </Card>
  )
}

export { ForgotPasswordForm }
