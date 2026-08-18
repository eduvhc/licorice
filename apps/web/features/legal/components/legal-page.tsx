import { getTranslations } from "next-intl/server"

import { Badge } from "@workspace/ui/components/badge"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

import { Link } from "@/i18n/navigation"

type LegalPageProps = {
  page: "terms" | "privacy"
}

async function LegalPage({ page }: LegalPageProps) {
  const t = await getTranslations("legal")
  const content = {
    title: t(`${page}.title`),
    description: t(`${page}.description`),
    sections: t.raw(`${page}.sections`) as {
      title: string
      body: string
    }[],
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 md:px-6 md:py-16">
      <div className="space-y-4">
        <Badge variant="outline" className="text-xs text-muted-foreground">
          {t("badge")}
        </Badge>
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tighter text-balance md:text-5xl">
            {content.title}
          </h1>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground">
            {content.description}
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex text-sm text-muted-foreground underline-offset-4 transition hover:text-foreground hover:underline"
        >
          {t("back")}
        </Link>
      </div>

      <div className="mt-8 grid gap-4">
        {content.sections.map((section) => (
          <Card key={section.title}>
            <CardHeader>
              <CardTitle className="text-lg">{section.title}</CardTitle>
              <CardDescription className="leading-7">
                {section.body}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}

export { LegalPage }
