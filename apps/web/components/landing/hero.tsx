import Link from "next/link"
import { DotGrid } from "./dot-grid"
import { ContainerTextFlip } from "@/components/ui/container-text-flip"

export function Hero() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-background to-muted/30">
      <DotGrid />
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-32">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <span className="size-1.5 rounded-full bg-blue-500" />
            Introducing AI-powered customer support
          </span>
        </div>

        <h1 className="mt-6 max-w-3xl text-4xl font-bold tracking-tight text-foreground md:text-7xl">
          Customer support that feels <ContainerTextFlip words={["effortless.", "instant.", "seamless.", "intelligent."]} />
        </h1>

        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-xl">
          AetherLive connects your knowledge, AI agents, and support team so every customer gets a useful, instant answer.
        </p>

        <div className="mt-8 flex items-center gap-4">
          <Link
            href="/sign-up"
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-500 px-6 py-3 text-base font-medium text-white shadow-sm transition-all hover:bg-blue-600 hover:shadow-md active:scale-[0.98]"
          >
            Get Started
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l14 0"></path><path d="M15 16l4 -4"></path><path d="M15 8l4 4"></path></svg>
          </Link>
          <Link
            href="#features"
            className="inline-flex cursor-pointer items-center justify-center rounded-xl border bg-card px-6 py-3 text-base font-medium text-card-foreground shadow-sm transition-all hover:bg-accent hover:shadow-md active:scale-[0.98]"
          >
            Learn More
          </Link>
        </div>

        <div className="mt-16 md:mt-24">
          <div className="relative mx-auto max-w-full">
            <div className="overflow-hidden rounded-2xl border bg-card shadow-lg">
              <div className="flex items-center gap-2 border-b px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <div className="size-3 rounded-full bg-red-500"></div>
                  <div className="size-3 rounded-full bg-yellow-500"></div>
                  <div className="size-3 rounded-full bg-green-500"></div>
                </div>
                <div className="flex-1 text-center">
                  <span className="text-xs text-muted-foreground/60">app.aetherlive.ai</span>
                </div>
                <div className="w-12"></div>
              </div>
              <div className="relative w-full" style={{ aspectRatio: "1919/974" }}>
                <img
                  alt="Dashboard Preview"
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-contain dark:hidden"
                  src="/landing/hero-dashboard-light.png"
                />
                <img
                  alt=""
                  aria-hidden
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 hidden h-full w-full object-contain dark:block"
                  src="/landing/hero-dashboard.png"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
