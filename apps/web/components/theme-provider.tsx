"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { ConvexProvider, ConvexReactClient } from "convex/react"

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL || "");

export function ThemeProvider({ children }: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="light" enableSystem themes={["light", "dark"]}>
      <ConvexProvider client={convex}>
        {children}
      </ConvexProvider>
    </NextThemesProvider>
  )
}
