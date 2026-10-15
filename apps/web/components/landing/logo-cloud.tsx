export function LogoCloud() {
  // Honest stack slider — real logos of services AetherLive actually uses,
  // same aceternity-style slider (grayscale icons + name).
  const logos = [
    { name: "OpenAI", domain: "openai.com" },
    { name: "Clerk", domain: "clerk.com" },
    { name: "Convex", domain: "convex.dev" },
    { name: "Vapi", domain: "vapi.ai" },
    { name: "Razorpay", domain: "razorpay.com" },
    { name: "Vercel", domain: "vercel.com" },
    { name: "Next.js", domain: "nextjs.org" },
    { name: "Sentry", domain: "sentry.io" },
  ];

  return (
    <section className="pb-6 pt-0 md:pb-10 md:pt-0">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <h2 className="mx-auto max-w-2xl text-center text-sm font-medium text-muted-foreground">
          Powered by the services we actually use
        </h2>
        <div className="relative mt-10 overflow-hidden">
          <div className="flex animate-x-slider gap-8">
            {[...logos, ...logos].map((logo, i) => (
              <div key={`${logo.name}-${i}`} className="flex shrink-0 items-center justify-center gap-2.5">
                <img
                  alt={logo.name}
                  height={32}
                  loading="lazy"
                  width={32}
                  className="size-8 object-contain opacity-40 grayscale transition-all hover:opacity-70 hover:grayscale-0 dark:invert dark:filter"
                  src={`https://www.google.com/s2/favicons?domain=${logo.domain}&sz=128`}
                />
                <span className="text-sm font-semibold text-muted-foreground">
                  {logo.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
