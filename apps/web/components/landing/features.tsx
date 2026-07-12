export function Features() {
  return (
    <section id="product" className="py-6 md:py-12">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-balance text-2xl font-medium tracking-tight text-foreground md:text-4xl lg:text-5xl">
            AI customer support features
          </h2>
          <p className="mt-2 text-sm text-muted-foreground md:text-base lg:text-lg">
            From first response to resolution, autonomously.
          </p>
        </div>

        <div className="mx-auto mt-8 grid grid-cols-1 gap-4 md:mt-12 md:grid-cols-3 md:grid-rows-2">

          <div className="relative overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10 md:row-span-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
            <div className="pointer-events-none absolute inset-0 z-30">
              <div className="absolute inset-x-0 top-0 h-px" style={{ background: "linear-gradient(to right, var(--color-border), var(--color-border) 50%, transparent 0, transparent)", backgroundSize: "5px 1px", animation: "border-scan 3s linear infinite" }}></div>
              <div className="absolute inset-x-0 bottom-0 h-px" style={{ background: "linear-gradient(to right, var(--color-border), var(--color-border) 50%, transparent 0, transparent)", backgroundSize: "5px 1px", animation: "border-scan 3s linear infinite" }}></div>
              <div className="absolute inset-y-0 left-0 w-px" style={{ background: "linear-gradient(to bottom, var(--color-border), var(--color-border) 50%, transparent 0, transparent)", backgroundSize: "1px 5px", animation: "border-scan 3s linear infinite" }}></div>
              <div className="absolute inset-y-0 right-0 w-px" style={{ background: "linear-gradient(to bottom, var(--color-border), var(--color-border) 50%, transparent 0, transparent)", backgroundSize: "1px 5px", animation: "border-scan 3s linear infinite" }}></div>
            </div>
            <div className="flex h-full flex-col">
              <div className="flex flex-col gap-2 p-6">
                <h3 className="text-sm font-semibold text-card-foreground">Smart ticket routing</h3>
                <p className="text-sm text-balance text-muted-foreground">AI automatically categorizes and routes tickets to the right team or agent. No manual triage needed.</p>
              </div>
              <div className="mt-auto flex flex-1 items-center justify-center overflow-hidden pt-4">
                <div className="h-full w-full p-4 md:p-8" style={{ maskImage: "linear-gradient(to bottom, black 50%, transparent 90%)" }}>
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex w-full flex-col gap-3 max-w-[220px]">
                      <div className="flex items-center gap-2 rounded-lg border bg-card p-2">
                        <div className="size-2 rounded-full bg-blue-500"></div>
                        <div className="flex-1">
                          <div className="h-2 w-20 rounded bg-muted-foreground/20"></div>
                          <div className="mt-1 h-1.5 w-32 rounded bg-muted-foreground/10"></div>
                        </div>
                        <span className="text-[8px] text-muted-foreground">Billing</span>
                      </div>
                      <div className="flex items-center gap-2 rounded-lg border bg-card p-2">
                        <div className="size-2 rounded-full bg-green-500"></div>
                        <div className="flex-1">
                          <div className="h-2 w-24 rounded bg-muted-foreground/20"></div>
                          <div className="mt-1 h-1.5 w-28 rounded bg-muted-foreground/10"></div>
                        </div>
                        <span className="text-[8px] text-muted-foreground">Support</span>
                      </div>
                      <div className="flex items-center gap-2 rounded-lg border bg-card p-2">
                        <div className="size-2 rounded-full bg-yellow-500"></div>
                        <div className="flex-1">
                          <div className="h-2 w-16 rounded bg-muted-foreground/20"></div>
                          <div className="mt-1 h-1.5 w-36 rounded bg-muted-foreground/10"></div>
                        </div>
                        <span className="text-[8px] text-muted-foreground">Sales</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-card shadow-sm ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
            <div className="flex h-full flex-col">
              <div className="flex flex-col gap-2 p-6">
                <h3 className="text-sm font-semibold text-card-foreground">24/7 AI responses</h3>
                <p className="text-sm text-balance text-muted-foreground">Instant answers to common questions. Your AI agents handle inquiries while your team sleeps.</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-card shadow-sm ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
            <div className="flex h-full flex-col">
              <div className="flex flex-col gap-2 p-6">
                <h3 className="text-sm font-semibold text-card-foreground">Knowledge base sync</h3>
                <p className="text-sm text-balance text-muted-foreground">Connect your docs, FAQs, and help center. AI finds the right answer every time.</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-card shadow-sm ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
            <div className="flex h-full flex-col">
              <div className="flex flex-col gap-2 p-6">
                <h3 className="text-sm font-semibold text-card-foreground">Sentiment analysis</h3>
                <p className="text-sm text-balance text-muted-foreground">Detect customer frustration and escalate urgently. Keep satisfaction scores high.</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-card shadow-sm ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
            <div className="flex h-full flex-col">
              <div className="flex flex-col gap-2 p-6">
                <h3 className="text-sm font-semibold text-card-foreground">Multi-channel inbox</h3>
                <p className="text-sm text-balance text-muted-foreground">Email, chat, social, and phone — all conversations in one unified dashboard.</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-card shadow-sm ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
            <div className="flex h-full flex-col">
              <div className="flex flex-col gap-2 p-6">
                <h3 className="text-sm font-semibold text-card-foreground">Analytics & reports</h3>
                <p className="text-sm text-balance text-muted-foreground">Track response times, resolution rates, and customer satisfaction in real-time.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
