export function LogoCloud() {
  const logos = [
    { name: "OpenAI", url: "https://assets.aceternity.com/logos/openai.png" },
    { name: "Granola", url: "https://assets.aceternity.com/logos/granola.png" },
    { name: "Character AI", url: "https://assets.aceternity.com/logos/characterai.png" },
    { name: "Oracle", url: "https://assets.aceternity.com/logos/oracle.png" },
    { name: "Bloomberg", url: "https://assets.aceternity.com/logos/bloomberg.png" },
    { name: "Forbes", url: "https://assets.aceternity.com/logos/forbes.png" },
    { name: "SoftBank", url: "https://assets.aceternity.com/logos/softbank.png" },
    { name: "Netflix", url: "https://assets.aceternity.com/logos/netflix.webp" },
    { name: "Spotify", url: "https://assets.aceternity.com/logos/spotify.webp" },
    { name: "Twitch", url: "https://assets.aceternity.com/logos/twitch.webp" },
    { name: "Raycast", url: "https://assets.aceternity.com/logos/raycast.webp" },
    { name: "Wired", url: "https://assets.aceternity.com/logos/wired.png" },
  ]

  return (
    <section className="pb-6 pt-0 md:pb-10 md:pt-0">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <h2 className="mx-auto max-w-2xl text-center text-sm font-medium text-muted-foreground">
          Trusted by teams building the future of AI customer support with AetherLive.
        </h2>
        <div className="relative mt-10 overflow-hidden">
          <div className="flex animate-x-slider gap-8">
            {[...logos, ...logos].map((logo, i) => (
              <div key={`${logo.name}-${i}`} className="flex shrink-0 items-center justify-center">
                <img
                  alt={logo.name}
                  loading="lazy"
                  className="h-8 w-24 object-contain opacity-40 grayscale transition-all hover:opacity-70 hover:grayscale-0 dark:invert dark:filter"
                  src={logo.url}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
