"use client"

import Image from "next/image"
import Link from "next/link"
import { ThemeToggle } from "@workspace/ui/components/theme-toggle"
import { Button } from "@workspace/ui/components/button"
import { Menu, X, ChevronDown } from "lucide-react"
import { useState } from "react"

const resources = [
  { title: "Blog", desc: "Latest news and articles", href: "#" },
  { title: "Documentation", desc: "Guides and API references", href: "#" },
  { title: "Help Center", desc: "Get support and FAQs", href: "#" },
  { title: "Changelog", desc: "See what's new", href: "#" },
  { title: "Tutorials", desc: "Learn with video guides", href: "#" },
]

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [resourcesOpen, setResourcesOpen] = useState(false)

  return (
    <header className="fixed inset-x-0 top-0 z-50 mx-auto w-full border-b border-border/40 bg-background/70 backdrop-blur-lg">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:h-16 md:px-8">
        <Link href="/" className="flex items-center gap-2">
          <Image alt="AetherLive" width={28} height={28} src="/logo.svg" className="size-7" />
          <span className="text-base font-semibold sm:text-lg">AetherLive</span>
        </Link>

        <div className="hidden items-center gap-6 lg:flex lg:gap-8">
          <Link href="#product" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Product
          </Link>
          <Link href="#pricing" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Pricing
          </Link>
          <Link href="#faq" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            FAQ
          </Link>
          <Link href="#" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Contact
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-3 lg:flex lg:gap-4">
            <Link href="/login" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Login
            </Link>
            <Link
              href="/sign-up"
              className="relative inline-flex cursor-pointer items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 active:scale-[0.98] bg-linear-to-b from-blue-500 to-blue-600 text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.2)] hover:from-blue-500 hover:to-blue-600 hover:shadow-[0_1px_2px_rgba(0,0,0,0.1),0_3px_5px_rgba(30,144,255,0.5),inset_0_1px_0_rgba(255,255,255,0.25)]"
            >
              Try for free
            </Link>
          </div>
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden size-10"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 top-14 z-40 flex flex-col bg-background sm:top-16 lg:hidden">
          <div className="flex flex-1 flex-col overflow-y-auto px-6 py-6">
            <div className="flex flex-col gap-2">
              <Link href="#product" className="rounded-xl px-4 py-3.5 text-base font-medium transition-colors hover:bg-accent" onClick={() => setMobileOpen(false)}>
                Product
              </Link>
              <Link href="#pricing" className="rounded-xl px-4 py-3.5 text-base font-medium transition-colors hover:bg-accent" onClick={() => setMobileOpen(false)}>
                Pricing
              </Link>
              <Link href="#faq" className="rounded-xl px-4 py-3.5 text-base font-medium transition-colors hover:bg-accent" onClick={() => setMobileOpen(false)}>
                FAQ
              </Link>
              <div>
                <button
                  className="flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-base font-medium transition-colors hover:bg-accent"
                  onClick={() => setResourcesOpen(!resourcesOpen)}
                >
                  Resources
                  <ChevronDown className={`size-5 transition-transform duration-200 ${resourcesOpen ? "rotate-180" : ""}`} />
                </button>
                {resourcesOpen && (
                  <div className="mt-1 ml-4 flex flex-col gap-1 border-l-2 py-2 pl-4">
                    {resources.map((r) => (
                      <Link key={r.title} href={r.href} className="flex flex-col rounded-lg px-4 py-3 transition-colors hover:bg-accent" onClick={() => setMobileOpen(false)}>
                        <span className="text-base font-medium">{r.title}</span>
                        <span className="mt-0.5 text-sm text-muted-foreground">{r.desc}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              <Link href="#" className="rounded-xl px-4 py-3.5 text-base font-medium transition-colors hover:bg-accent" onClick={() => setMobileOpen(false)}>
                Contact
              </Link>
            </div>
            <div className="mt-auto pt-6">
              <div className="mb-6 h-px w-full bg-border" />
              <Link
                href="/login"
                className="block w-full rounded-xl border px-4 py-3.5 text-center text-base font-medium transition-colors hover:bg-accent"
                onClick={() => setMobileOpen(false)}
              >
                Login
              </Link>
              <Link
                href="/sign-up"
                onClick={() => setMobileOpen(false)}
                className="mt-3 relative inline-flex cursor-pointer items-center justify-center rounded-xl px-4 py-3.5 text-base font-medium transition-all duration-200 active:scale-[0.98] bg-linear-to-b from-blue-500 to-blue-600 text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.2)] hover:from-blue-500 hover:to-blue-600 hover:shadow-[0_1px_2px_rgba(0,0,0,0.1),0_3px_5px_rgba(30,144,255,0.5),inset_0_1px_0_rgba(255,255,255,0.25)]"
              >
                Try for free
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
