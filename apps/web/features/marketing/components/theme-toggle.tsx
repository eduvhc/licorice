"use client"

import * as React from "react"

import { Button } from "@workspace/ui/components/button"
import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"

function ThemeToggle({ label }: { label: string }) {
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
  const { resolvedTheme, setTheme } = useTheme()

  if (!mounted) {
    return <div className="h-8 w-8 rounded-2xl border border-border/60 bg-background/70" />
  }

  const isDark = resolvedTheme === "dark"

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className="rounded-2xl border-border/60 bg-background/70 backdrop-blur"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />}
      <span className="sr-only">{label}</span>
    </Button>
  )
}

export { ThemeToggle }
