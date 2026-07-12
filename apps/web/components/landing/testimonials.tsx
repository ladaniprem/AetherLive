"use client"

import { useEffect, useRef, useState } from "react"

const testimonials = [
  {
    quote: "Supercharged our workflow",
    text: "We integrated AI agents into every part of our operation. They work while we sleep and deliver results by morning.",
    name: "Aisha Mohammed",
    avatar: "https://assets.aceternity.com/avatars/12.webp",
  },
  {
    quote: "An engineer's dream platform",
    text: "Building autonomous AI workflows feels intuitive. The agents are powerful enough to handle any task we throw at them.",
    name: "Chris Anderson",
    avatar: "https://assets.aceternity.com/avatars/11.webp",
  },
  {
    quote: "Best in class AI automation",
    text: "After trying every automation platform, this is the one that delivers. The intelligent agents handle complexity effortlessly.",
    name: "Olivia Martinez",
    avatar: "https://assets.aceternity.com/avatars/10.webp",
  },
  {
    quote: "Clients love the results",
    text: "Every workflow we automate delivers consistent, intelligent results. The AI agents have elevated our entire operation.",
    name: "Robert Kim",
    avatar: "https://assets.aceternity.com/avatars/9.webp",
  },
  {
    quote: "Perfect for scaling operations",
    text: "We went from manual workflows to fully autonomous AI agents in days.",
    name: "Nina Kowalski",
    avatar: "https://assets.aceternity.com/avatars/8.webp",
  },
  {
    quote: "The automation is seamless",
    text: "Our AI agents make decisions and execute tasks while we focus on strategy.",
    name: "Alex Turner",
    avatar: "https://assets.aceternity.com/avatars/7.webp",
  },
  {
    quote: "Saved us months of work",
    text: "We automated complex decision-making workflows that we thought would require a dedicated team.",
    name: "Priya Patel",
    avatar: "https://assets.aceternity.com/avatars/6.webp",
  },
  {
    quote: "Incredible developer experience",
    text: "Deploy, orchestrate, automate. The platform makes building intelligent AI agents straightforward.",
    name: "James Wilson",
    avatar: "https://assets.aceternity.com/avatars/5.webp",
  },
  {
    quote: "Our secret weapon",
    text: "The autonomous AI workflows give us a competitive edge. Tasks that took hours are now executed automatically.",
    name: "Lisa Thompson",
    avatar: "https://assets.aceternity.com/avatars/4.webp",
  },
  {
    quote: "Worth every penny",
    text: "Building and deploying AI agents is incredibly simple. Our automation runs 24/7.",
    name: "David Park",
    avatar: "https://assets.aceternity.com/avatars/3.webp",
  },
  {
    quote: "Game changer for our team",
    text: "Orchestrating intelligent workflows used to take weeks of manual work.",
    name: "Emily Rodriguez",
    avatar: "https://assets.aceternity.com/avatars/2.webp",
  },
  {
    quote: "Exceeded all expectations",
    text: "The AI agents handle complex decisions while we sleep. Productivity increased tenfold.",
    name: "Marcus Johnson",
    avatar: "https://assets.aceternity.com/avatars/1.webp",
  },
  {
    quote: "Best investment for our startup",
    text: "We deployed AI agents that automated our entire workflow overnight.",
    name: "Sarah Chen",
    avatar: "https://assets.aceternity.com/avatars/manu.webp",
  },
]

function TestimonialCard({ t }: { t: (typeof testimonials)[0] }) {
  return (
    <div className="flex h-full w-[340px] shrink-0 flex-col justify-between rounded-xl bg-card p-5 shadow-lg ring-1 ring-border">
      <div>
        <p className="text-base leading-snug font-semibold text-card-foreground">
          &ldquo;{t.quote}&rdquo;
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {t.text}
        </p>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <img
          alt={t.name}
          loading="lazy"
          width="50"
          height="50"
          className="size-8 rounded-full object-cover"
          src={t.avatar}
          style={{ color: "transparent" }}
        />
        <span className="text-sm font-medium text-card-foreground">
          {t.name}
        </span>
      </div>
    </div>
  )
}

export function Testimonials() {
  const [active, setActive] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    if (active) {
      timerRef.current = setTimeout(() => setActive(false), 8000)
    }
    return () => clearTimeout(timerRef.current)
  }, [active])

  return (
    <section className="relative isolate min-h-screen w-full overflow-hidden bg-muted/50 py-6 md:py-12">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(128,128,128,0.12) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {active && (
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0 z-10"
            style={{
              background: "linear-gradient(to right, var(--color-background) 0%, transparent 15%, transparent 85%, var(--color-background) 100%)",
            }}
          />
          <div className="flex h-full flex-col justify-center gap-8">
            <div className="flex gap-6 opacity-20" style={{ animation: "scroll-left 35s linear infinite" }}>
              {[...testimonials.slice(0, 4), ...testimonials.slice(0, 4)].map((t, i) => (
                <TestimonialCard key={i} t={t} />
              ))}
            </div>
            <div className="flex gap-5" style={{ animation: "scroll-left 25s linear infinite" }}>
              {[...testimonials, ...testimonials, ...testimonials].map((t, i) => (
                <TestimonialCard key={i} t={t} />
              ))}
            </div>
            <div className="flex gap-6 opacity-20" style={{ animation: "scroll-right 35s linear infinite" }}>
              {[...testimonials.slice(5, 9), ...testimonials.slice(5, 9)].reverse().map((t, i) => (
                <TestimonialCard key={i} t={t} />
              ))}
            </div>
            <div className="flex gap-5" style={{ animation: "scroll-right 30s linear infinite" }}>
              {[...testimonials, ...testimonials, ...testimonials].reverse().map((t, i) => (
                <TestimonialCard key={i} t={t} />
              ))}
            </div>
            <div className="flex gap-6 opacity-15" style={{ animation: "scroll-left 40s linear infinite" }}>
              {[...testimonials.slice(10, 13), ...testimonials.slice(10, 13)].map((t, i) => (
                <TestimonialCard key={i} t={t} />
              ))}
            </div>
          </div>
        </div>
      )}

      {active && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-end justify-center pb-8">
          <div className="pointer-events-auto">
            <button
              type="button"
              onClick={() => setActive(false)}
              className="relative inline-flex cursor-pointer items-center justify-center gap-2 rounded-md px-5 py-2 text-sm font-medium transition-all duration-200 active:scale-[0.98] will-change-transform bg-card text-card-foreground ring-1 ring-border shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:bg-accent hover:ring-border"
            >
              Hide reviews
            </button>
          </div>
        </div>
      )}

      {!active && (
        <div className="pointer-events-none absolute inset-0 flex flex-wrap items-center justify-center gap-4 p-8 opacity-20">
          {testimonials.slice(0, 8).map((t, i) => (
            <TestimonialCard key={i} t={t} />
          ))}
        </div>
      )}

      {!active && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <div className="pointer-events-auto max-w-2xl px-4 text-center">
            <h2 className="text-balance text-2xl tracking-tight text-foreground md:text-4xl lg:text-5xl">
              Loved by thousands <br /> of happy customers
            </h2>
            <p className="mx-auto mt-4 max-w-md text-base text-muted-foreground md:text-lg">
              Hear from our community of builders and creators who trust AetherLive to power their customer support.
            </p>
            <button
              type="button"
              onClick={() => setActive(true)}
              className="relative mt-8 inline-flex cursor-pointer items-center justify-center gap-2 rounded-md px-6 py-3 text-base font-medium transition-all duration-200 active:scale-[0.98] will-change-transform bg-linear-to-b from-blue-500 to-blue-600 text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.2)] hover:from-blue-500 hover:to-blue-600 hover:shadow-[0_1px_2px_rgba(0,0,0,0.1),0_3px_5px_rgba(30,144,255,0.5),inset_0_1px_0_rgba(255,255,255,0.25)]"
            >
              Read all reviews
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="size-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes scroll-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </section>
  )
}
