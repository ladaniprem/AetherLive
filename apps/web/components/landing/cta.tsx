import Link from "next/link"

export function CTA() {
  return (
    <section className="py-6 md:py-12">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-blue-500/[0.03] via-background to-blue-600/[0.03] px-6 py-16 text-center md:px-12 md:py-24">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle, rgba(59,130,246,0.12) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
            <div className="absolute -left-32 -top-32 size-[500px] animate-pulse rounded-full bg-blue-500/15 blur-3xl" style={{ animationDuration: "4s" }} />
            <div className="absolute -bottom-32 -right-32 size-[400px] animate-pulse rounded-full bg-blue-400/15 blur-3xl" style={{ animationDelay: "2s", animationDuration: "5s" }} />
          </div>
          <div className="relative z-10">
            <h2 className="mx-auto max-w-2xl text-balance text-2xl font-medium tracking-tight text-foreground md:text-4xl lg:text-5xl">
              Ready to transform your customer support?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground md:text-base">
              Join thousands of companies using AetherLive to provide instant, intelligent customer support.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/sign-up"
                className="relative inline-flex cursor-pointer items-center justify-center gap-2 rounded-md px-6 py-3 text-base font-medium transition-all duration-200 active:scale-[0.98] will-change-transform bg-linear-to-b from-blue-500 to-blue-600 text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.2)] hover:from-blue-500 hover:to-blue-600 hover:shadow-[0_1px_2px_rgba(0,0,0,0.1),0_3px_5px_rgba(30,144,255,0.5),inset_0_1px_0_rgba(255,255,255,0.25)]"
              >
                Start for free
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l14 0"></path><path d="M15 16l4 -4"></path><path d="M15 8l4 4"></path></svg>
              </Link>
              <Link
                href="#"
                className="relative inline-flex cursor-pointer items-center justify-center gap-2 rounded-md px-6 py-3 text-base font-medium transition-all duration-200 active:scale-[0.98] will-change-transform bg-card text-card-foreground ring-1 ring-border shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:bg-accent hover:ring-border"
              >
                Talk to sales
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
