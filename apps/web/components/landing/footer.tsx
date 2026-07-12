import Link from "next/link"

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t bg-background">
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">

        <div className="relative mt-20 mb-10 h-[calc(clamp(3rem,18vw,20rem)*0.75)] w-full overflow-hidden">
          <p
            className="group absolute inset-x-0 top-0 w-full text-center leading-none font-bold text-transparent"
            style={{ fontSize: "clamp(3rem, 18vw, 20rem)", letterSpacing: "-0.02em" }}
          >
            <span
              className="dark:hidden transition-all duration-300 hover:text-blue-500"
              style={{ WebkitTextStroke: "1px var(--color-border, #e5e7eb)" }}
            >
              AetherLive
            </span>
            <span
              className="hidden dark:inline transition-all duration-300 hover:text-blue-500"
              style={{ WebkitTextStroke: "1px var(--color-border, #404040)" }}
            >
              AetherLive
            </span>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:gap-12">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="text-base font-semibold transition-colors hover:text-primary">
              AetherLive
            </Link>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              Build, deploy, and orchestrate intelligent AI agents that automate complex workflows, make decisions, and execute tasks autonomously.
            </p>
            <div className="mt-4 text-xs text-muted-foreground">
              &copy; copyright AetherLive {new Date().getFullYear()}. All rights reserved.
            </div>
          </div>
          <div className="flex flex-col justify-center gap-4">
            <p className="text-sm font-bold text-foreground transition-colors hover:text-foreground">
              Pages
            </p>
            <ul className="flex list-none flex-col gap-3">
              <li>
                <Link href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Products
                </Link>
              </li>
              <li>
                <Link href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Integrations
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Blog
                </Link>
              </li>
            </ul>
          </div>
          <div className="flex flex-col justify-center gap-4">
            <p className="text-sm font-bold text-foreground transition-colors hover:text-foreground">
              Socials
            </p>
            <ul className="flex list-none flex-col gap-3">
              <li>
                <Link href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Twitter
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  LinkedIn
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  GitHub
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Discord
                </Link>
              </li>
            </ul>
          </div>
          <div className="flex flex-col justify-center gap-4">
            <p className="text-sm font-bold text-foreground transition-colors hover:text-foreground">
              Legal
            </p>
            <ul className="flex list-none flex-col gap-3">
              <li>
                <Link href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}
