"use client"

import * as React from "react"

import { TooltipProvider } from "@workspace/ui/components/tooltip"

import { ThemeProvider } from "./theme-provider"

function AppProviders({ children }: React.PropsWithChildren) {
  return (
    <ThemeProvider>
      <TooltipProvider>{children}</TooltipProvider>
    </ThemeProvider>
  )
}

export { AppProviders }
