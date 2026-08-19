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

import { resetPasswordAction } from "../server/actions"

function ResetPasswordForm({
  error,
  token,
}: {
  error?: string
  token: string
}) {
  const t = useTranslations("auth")

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">{t("resetPassword.title")}</CardTitle>
        <CardDescription>{t("resetPassword.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={resetPasswordAction}>
          <FieldGroup>
            <input type="hidden" name="token" value={token} />
            <Field>
              <FieldLabel htmlFor="password">
                {t("resetPassword.newPassword")}
              </FieldLabel>
              <Input
                id="password"
                name="password"
                type="password"
                required
                autoFocus
              />
            </Field>
            {error ? (
              <FieldDescription className="text-center text-destructive">
                {error}
              </FieldDescription>
            ) : null}
            <Field>
              <Button type="submit" disabled={!token}>
                {t("resetPassword.submit")}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}

export { ResetPasswordForm }
