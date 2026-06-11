import { Geist, Geist_Mono } from "next/font/google"

import "@workspace/ui/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@workspace/ui/lib/utils";
import { ClerkProvider } from '@clerk/nextjs'
//import { AuthGuard } from "@/modules/auth/ui/components/auth-guard";
// import ConvexClientProvider from '@/components/ConvexClientProvider'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  preload: false,
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", geist.variable)}
    >
      <body suppressHydrationWarning>
        <ClerkProvider>
          {/* <ConvexClientProvider> */}
          <ThemeProvider>
            {children}
          </ThemeProvider>
          {/* </ConvexClientProvider> */}
        </ClerkProvider>
      </body>
    </html>
  )
}
