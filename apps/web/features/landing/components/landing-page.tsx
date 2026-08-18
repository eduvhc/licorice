import { getTranslations } from "next-intl/server"

import { Badge } from "@workspace/ui/components/badge"
import { buttonVariants } from "@workspace/ui/components/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"
import {
  ArrowRightIcon,
  BotIcon,
  CheckCircle2Icon,
  KeyRoundIcon,
  MailIcon,
  ShieldCheckIcon,
  UsersIcon,
} from "lucide-react"

import { Link } from "@/i18n/navigation"

type LandingPageProps = {
  session: {
    user: {
      name: string
    }
  } | null
}

async function LandingPage({ session }: LandingPageProps) {
  const t = await getTranslations("landing")
  const principles = t.raw("principles") as {
    title: string
    description: string
  }[]
  const previewCards = t.raw("preview.cards") as {
    eyebrow: string
    title: string
    description: string
  }[]
  const previewSignals = t.raw("preview.signals") as {
    label: string
    value: string
  }[]
  const whyCards = t.raw("sections.why.cards") as {
    title: string
    description: string
  }[]
  const builtInItems = t.raw("sections.builtIns.items") as {
    title: string
    description: string
  }[]
  const runbook = t.raw("sections.agents.runbook") as string[]
  const primaryHref = session ? "/dashboard" : "/sign-up"
  const primaryLabel = session ? t("hero.primary.user") : t("hero.primary.guest")

  return (
    <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
      <section className="space-y-6 py-16 text-center md:py-24">
        <Badge
          variant="outline"
          className="gap-2 px-3 py-1 text-xs text-muted-foreground"
        >
          <span className="size-1.5 rounded-full bg-emerald-500" />
          {t("badge")}
        </Badge>
        <h1 className="mx-auto max-w-3xl text-4xl font-semibold tracking-tighter text-balance sm:text-5xl md:text-6xl">
          {t("hero.title")}
        </h1>
        <p className="mx-auto max-w-2xl text-balance text-base text-muted-foreground md:text-lg">
          {t("hero.description")}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            className={cn(buttonVariants({ size: "lg" }), "group")}
            href={primaryHref}
          >
            {primaryLabel}
            <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            className={buttonVariants({ variant: "outline", size: "lg" })}
            href="/dashboard"
          >
            {t("hero.secondary")}
          </Link>
        </div>
      </section>

      <section className="pb-16 md:pb-24">
        <div className="grid gap-4 md:grid-cols-3">
          {previewCards.map((item, index) => {
            const icons = [ShieldCheckIcon, UsersIcon, MailIcon]
            const Icon = icons[index] ?? ShieldCheckIcon

            return (
              <Card key={item.title} className="gap-4">
                <CardHeader>
                  <div className="flex size-10 items-center justify-center rounded-lg border bg-muted/40">
                    <Icon className="size-4 text-muted-foreground" />
                  </div>
                  <Badge variant="secondary" className="w-fit text-xs">
                    {item.eyebrow}
                  </Badge>
                  <CardTitle className="text-base leading-6 text-balance">
                    {item.title}
                  </CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
              </Card>
            )
          })}
        </div>
      </section>

      <section className="grid gap-6 pb-16 sm:grid-cols-3 md:pb-24">
        {principles.map((item, index) => {
          const icons = [ShieldCheckIcon, BotIcon, CheckCircle2Icon]
          const Icon = icons[index] ?? CheckCircle2Icon

          return (
            <div key={item.title} className="space-y-2">
              <div className="flex size-9 items-center justify-center rounded-lg border bg-muted/40">
                <Icon className="size-4 text-muted-foreground" />
              </div>
              <h3 className="text-sm font-medium">{item.title}</h3>
              <p className="text-sm leading-6 text-muted-foreground">
                {item.description}
              </p>
            </div>
          )
        })}
      </section>

      <section className="mb-16 overflow-hidden rounded-2xl border md:mb-24">
        <div className="grid grid-cols-2 divide-y divide-border md:grid-cols-4 md:divide-x md:divide-y-0">
          {previewSignals.map((signal) => (
            <div key={signal.label} className="space-y-1 p-6 text-center md:p-8">
              <div className="text-2xl font-semibold tracking-tight md:text-3xl">
                {signal.value}
              </div>
              <div className="text-sm text-muted-foreground">{signal.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="why" className="scroll-mt-20 space-y-8 py-16 md:py-24">
        <div className="max-w-2xl space-y-3">
          <Badge variant="outline" className="text-xs text-muted-foreground">
            {t("sections.why.badge")}
          </Badge>
          <h2 className="text-3xl font-semibold tracking-tighter text-balance md:text-4xl">
            {t("sections.why.title")}
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {whyCards.map((item, index) => {
            const Icon = index === 0 ? UsersIcon : BotIcon

            return (
              <Card key={item.title} className="gap-4">
                <CardHeader>
                  <div className="flex size-10 items-center justify-center rounded-lg border bg-muted/40">
                    <Icon className="size-4 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                  <CardDescription className="md:text-base">
                    {item.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            )
          })}
        </div>
      </section>

      <section id="systems" className="scroll-mt-20 space-y-8 pb-16 md:pb-24">
        <div className="max-w-2xl space-y-3">
          <Badge variant="outline" className="text-xs text-muted-foreground">
            {t("sections.builtIns.badge")}
          </Badge>
          <h2 className="text-3xl font-semibold tracking-tighter text-balance md:text-4xl">
            {t("sections.builtIns.title")}
          </h2>
          <p className="text-base text-muted-foreground md:text-lg">
            {t("sections.builtIns.description")}
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {builtInItems.map((item, index) => {
            const icons = [KeyRoundIcon, UsersIcon, MailIcon]
            const Icon = icons[index] ?? KeyRoundIcon

            return (
              <Card key={item.title} className="gap-4">
                <CardHeader>
                  <div className="flex size-10 items-center justify-center rounded-lg border bg-muted/40">
                    <Icon className="size-4 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
              </Card>
            )
          })}
        </div>
      </section>

      <section id="agents" className="scroll-mt-20 pb-16 md:pb-24">
        <Card className="overflow-hidden">
          <div className="grid gap-8 p-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:p-8">
            <div className="space-y-4">
              <Badge variant="outline" className="text-xs text-muted-foreground">
                {t("sections.agents.badge")}
              </Badge>
              <h2 className="text-3xl font-semibold tracking-tighter text-balance md:text-4xl">
                {t("sections.agents.title")}
              </h2>
              <p className="text-base leading-7 text-muted-foreground">
                {t("sections.agents.description")}
              </p>
            </div>

            <div className="rounded-xl border bg-muted/40 p-4">
              <div className="flex items-center justify-between border-b pb-3 font-mono text-xs text-muted-foreground">
                <span>{t("sections.agents.file")}</span>
                <span>{t("sections.agents.destination")}</span>
              </div>
              <div className="grid gap-0 pt-1 text-sm text-muted-foreground">
                {runbook.map((line, index) => (
                  <div
                    key={line}
                    className="flex items-start gap-3 border-b py-3 last:border-b-0"
                  >
                    <span className="font-mono text-xs text-muted-foreground/60">
                      0{index + 1}
                    </span>
                    <p className="leading-6">{line}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </section>
    </div>
  )
}

export { LandingPage }
