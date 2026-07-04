"use client"

import Link from "next/link"
import Script from "next/script"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import {
  MessageSquareText, Bot, BarChart3, Shield, Globe, Zap, Network,
  Headphones, ArrowRight, Sparkles, ChevronRight, Check,
  ArrowUpRight, Server, Database, Users, Clock, Activity, X, Menu
} from "lucide-react"

const NAV_ITEMS = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Why AetherLive", href: "#comparison" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Pricing", href: "#" },
  { label: "Documentation", href: "#" },
]

const STEPS = [
  {
    num: "01",
    title: "Connect",
    desc: "Integrate AetherLive with your existing stack in minutes. Connect your knowledge base, CRM, and support channels.",
    items: ["Slack, Intercom, Zendesk, and more", "One-line embed or API integration", "Native SDK for React, Vue, Angular"],
  },
  {
    num: "02",
    title: "Understand",
    desc: "Our AI ingests your docs, past tickets, and product data to understand your business context and customer intent.",
    items: ["Knowledge base ingestion", "Ticket history learning", "Intent & sentiment detection"],
  },
  {
    num: "03",
    title: "Resolve",
    desc: "AI agents handle repetitive questions instantly. Complex issues escalate to humans with full context attached.",
    items: ["Instant AI responses (<100ms)", "Seamless human handoff", "Multi-channel support"],
  },
  {
    num: "04",
    title: "Improve",
    desc: "Analyze every interaction to identify gaps, trends, and opportunities. Continuously improve your support quality.",
    items: ["Conversation analytics", "CSAT & sentiment tracking", "Auto-generated knowledge articles"],
  },
]

const FEATURES = [
  { icon: Globe, title: "Multilingual support", desc: "Support customers in 100+ languages out of the box. Automatic language detection with accent-sensitive understanding." },
  { icon: Zap, title: "Lightning-fast AI", desc: "Sub-100ms response times powered by purpose-built models. No more waiting — resolutions in real time." },
  { icon: BarChart3, title: "Built-in analytics", desc: "Track resolution rates, CSAT scores, and conversation trends without extra tooling. Insights delivered daily." },
  { icon: Shield, title: "Enterprise security", desc: "SOC 2 Type II, GDPR, HIPAA, and ISO 27001 compliant. Data never trains our models." },
  { icon: Network, title: "Ship in hours", desc: "One-line embed, official SDKs, and pre-built integrations. Go from signup to production in under 4 hours." },
  { icon: Bot, title: "Intelligent escalation", desc: "AI knows when to hand off. Complex issues reach the right human with full conversation history and context attached." },
]

const COMPARISON_ROWS = [
  { feature: "AI agent (out-of-box)", values: [true, true, false, false, false] },
  { feature: "Real-time handoff", values: [true, true, true, true, false] },
  { feature: "Multilingual (100+)", values: [true, false, false, true, false] },
  { feature: "Knowledge base auto-learning", values: [true, false, true, false, false] },
  { feature: "Intent & sentiment analysis", values: [true, true, false, false, false] },
  { feature: "Custom AI training", values: [true, false, false, false, false] },
  { feature: "Multi-channel inbox", values: [true, true, true, true, true] },
  { feature: "CSAT tracking", values: [true, true, true, true, false] },
  { feature: "SOC 2 / GDPR / HIPAA", values: [true, true, true, true, false] },
  { feature: "Avg integration time", values: [null, null, null, null, null], labels: ["<4 hours", "1-2 days", "2-3 days", "1-2 days", "<1 day"] },
  { feature: "EU & US hosting", values: [true, true, true, false, false] },
]

const COMPARISON_HEADERS = ["AetherLive", "Intercom", "Zendesk", "Freshdesk", "Crisp"]

const TESTIMONIALS = [
  { quote: "The AI agents cut our first-response time by 90%. Our customers get answers in seconds, and our team focuses on what actually needs human attention.", initials: "SK", name: "Sarah Kim", title: "Head of Support, Linear", badge: "SaaS" },
  { quote: "The multilingual support was a game-changer for our European expansion. We're now supporting customers in 12 languages without hiring additional staff.", initials: "ML", name: "Marcus Larsen", title: "VP Customer Experience, Pleo", badge: "Fintech" },
  { quote: "We went from signup to production in under 3 hours. The documentation is fantastic, and the Slack support helped us tune the AI for our specific use case immediately.", initials: "AJ", name: "Alex Johnson", title: "CTO, Raycast", badge: "Developer Tools" },
  { quote: "AetherLive's analytics showed us we were losing customers on a specific workflow. We fixed it in a week and saw CSAT jump 25 points.", initials: "EP", name: "Elena Petrova", title: "Director of Support, Deel", badge: "HR Tech" },
  { quote: "The intelligent escalation is incredible. Our AI handles 70% of tickets end-to-end, and the 30% that reaches humans comes with full context. No more repeating information.", initials: "DW", name: "David Wang", title: "Engineering Lead, Supabase", badge: "Infrastructure" },
  { quote: "Having tried multiple support platforms, I can confidently say: AetherLive's AI outshines them all. The accuracy, speed, and context awareness are unmatched.", initials: "RN", name: "Rachel Nguyen", title: "Co-Founder, Cal.com", badge: "Productivity" },
]

const LOGOS = ["Shopify", "Notion", "Figma", "Linear", "Vercel", "Ramp", "Brex", "Loom"]

const FOOTER_COLS = [
  {
    title: "Product",
    links: ["AI Agent", "Real-time handoff", "Analytics", "Integrations", "Pricing"],
  },
  {
    title: "Developers",
    links: ["Documentation", "API reference", "SDKs", "Status", "Changelog"],
  },
  {
    title: "Company",
    links: ["About us", "Blog", "Careers", "Press", "Partners"],
  },
  {
    title: "Legal",
    links: ["Privacy Policy", "Terms of Service", "Cookie Policy", "Security", "Compliance"],
  },
]

function GlassCard({ children, className, glow = false, ...props }: { children: React.ReactNode; className?: string; glow?: boolean } & React.ComponentProps<"div">) {
  return (
    <div
      className={`group relative overflow-hidden rounded-xl border border-border/50 bg-background/50 p-6 shadow-xl backdrop-blur-xl transition-all duration-300 hover:border-border/80 hover:bg-background/70 hover:shadow-2xl ${className ?? ""}`}
      {...props}
    >
      {glow && (
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          <div className="from-primary/20 to-primary/0 absolute left-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 scale-[2.5] rounded-[50%] bg-radial from-10% to-60%" />
          <div className="from-primary/10 to-primary-foreground/0 absolute left-1/2 top-1/2 h-1/2 w-2/5 -translate-x-1/2 -translate-y-1/2 scale-200 rounded-[50%] bg-radial from-10% to-60%" />
        </div>
      )}
      <div className="absolute top-4 right-4 z-10 rounded-full bg-accent/50 p-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <ArrowUpRight className="size-4" />
      </div>
      {children}
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 inline-block rounded-full border border-primary/15 bg-primary/8 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.05em] text-primary/80">
      {children}
    </div>
  )
}

function SectionHeader({ label, title, desc }: { label: string; title: React.ReactNode; desc: string }) {
  return (
    <div className="mb-16 text-center">
      <SectionLabel>{label}</SectionLabel>
      <h2 className="mb-4 text-4xl font-bold tracking-[-0.02em] text-balance">{title}</h2>
      <p className="mx-auto max-w-[560px] text-base text-muted-foreground">{desc}</p>
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/30 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5 text-xl font-bold">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-[#a855f7] text-sm text-primary-foreground">
              A
            </div>
            AetherLive
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            {NAV_ITEMS.map((item) => (
              <Link key={item.label} href={item.href} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                {item.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/sign-in" className="rounded-lg px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground">
              Sign in
            </Link>
            <Link href="/sign-up" className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-[0px_0px_12px_var(--primary),0px_0px_24px_var(--primary-foreground)]">
              Get started
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden px-6 pb-20 pt-40 text-center">
        <div className="pointer-events-none absolute top-1/2 left-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2">
          <div className="from-primary/20 to-primary/0 absolute inset-0 rounded-full bg-radial from-10% to-60%" />
          <div className="from-primary/10 to-primary-foreground/0 absolute left-1/3 top-1/3 h-1/2 w-1/2 rounded-full bg-radial from-10% to-60%" />
        </div>
        <div className="relative mx-auto max-w-[1200px]">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/15 px-4 py-1.5 text-sm font-medium text-primary/80">
            <Sparkles className="h-3.5 w-3.5" />
            AI-Native Customer Support
          </div>
          <h1 className="mx-auto mb-6 max-w-4xl text-5xl font-extrabold leading-[1.1] tracking-[-0.02em] text-balance md:text-7xl">
            Turn every customer conversation into<br />
            your <span className="bg-gradient-to-r from-primary to-[#a855f7] bg-clip-text text-transparent">strongest advantage</span>
          </h1>
          <p className="mx-auto mb-10 max-w-[640px] text-lg text-muted-foreground text-balance">
            AetherLive is the AI customer support platform that resolves issues instantly with intelligent agents, real-time insights, and seamless human escalation — all through a single integration.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/sign-up" className="inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-base font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-[0px_0px_12px_var(--primary)]">
              Get started free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="#how-it-works" className="glass-card inline-flex items-center gap-2 rounded-xl border border-border px-7 py-3.5 text-base font-semibold text-foreground backdrop-blur-xl transition-all hover:border-muted-foreground hover:bg-background/70">
              See how it works
            </Link>
          </div>

          {/* Mockup Browser */}
          <div className="relative mx-auto mt-20 max-w-5xl">
            <div className="relative z-10 overflow-hidden rounded-[12px] border border-border/70 shadow-2xl">
              <div className="relative flex h-10 items-center gap-2 border-b border-border/70 bg-muted/50 px-4 py-2 dark:border-b-0">
                <div className="flex gap-2">
                  <div className="size-3 rounded-full bg-primary dark:bg-foreground/10" />
                  <div className="size-3 rounded-full bg-primary dark:bg-foreground/10" />
                  <div className="size-3 rounded-full bg-primary dark:bg-foreground/10" />
                </div>
                <div className="from-foreground/5 to-foreground/2 dark:from-foreground/10 dark:to-foreground/5 text-muted-foreground border-border/10 absolute top-1.5 left-1/2 flex min-w-[240px] -translate-x-1/2 items-center justify-center gap-2 rounded-md border-b bg-linear-to-t px-3 py-1.5 text-center text-xs">
                  <Server className="size-3" />
                  <p>app.aetherlive.ai</p>
                </div>
              </div>
              <Image
                src="/dashboard-dark.png"
                alt="AetherLive dashboard screenshot"
                width={1340}
                height={820}
                className="block w-full"
                priority
              />
            </div>
            <div className="from-primary/20 to-primary-foreground/0 absolute -bottom-12 left-1/2 h-[256px] w-[60%] -translate-x-1/2 scale-[2.5] rounded-[50%] bg-radial from-10% to-60% opacity-30 sm:h-[512px]" />
          </div>

          <div className="mt-20 flex justify-center gap-12">
            {[
              { value: "10M+", label: "Conversations resolved" },
              { value: "50K+", label: "Active businesses" },
              { value: "99.9%", label: "Uptime SLA" },
              { value: "<100ms", label: "Response time" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-4xl font-bold">{stat.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border/30 px-6 py-16 text-center">
        <div className="mx-auto max-w-[1200px]">
          <p className="mb-8 text-sm font-medium uppercase tracking-[0.05em] text-muted-foreground">Trusted by leading companies worldwide</p>
          <div className="flex flex-wrap items-center justify-center gap-12 opacity-60">
            {LOGOS.map((name) => (
              <span key={name} className="text-xl font-semibold text-muted-foreground">{name}</span>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="px-6 py-24">
        <div className="mx-auto max-w-[1200px]">
          <SectionHeader
            label="How it works"
            title={<>The foundation of every<br />support operation</>}
            desc="Bad support doesn't just frustrate customers — it erodes trust. We make every interaction count."
          />
          <div className="grid gap-6 md:grid-cols-4">
            {STEPS.map((step) => (
              <GlassCard key={step.num} glow className="flex flex-col">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/15 text-base font-bold text-primary/80">
                  {step.num}
                </div>
                <h3 className="mb-3 text-lg font-semibold">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
                <ul className="mt-4 space-y-1.5">
                  {step.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-xs text-muted-foreground/70">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary opacity-50" />
                      {item}
                    </li>
                  ))}
                </ul>
              </GlassCard>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link href="/sign-up" className="mr-4 inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-base font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-[0px_0px_12px_var(--primary)]">
              Start building
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="#" className="glass-card inline-flex items-center gap-2 rounded-xl border border-border px-7 py-3.5 text-base font-semibold text-foreground backdrop-blur-xl transition-all hover:border-muted-foreground hover:bg-background/70">
              View docs
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section id="features" className="relative overflow-hidden px-6 py-24">
        <div className="pointer-events-none absolute top-1/2 right-0 h-[600px] w-[600px] translate-x-1/3">
          <div className="from-primary/10 to-primary/0 absolute inset-0 rounded-full bg-radial from-10% to-60%" />
        </div>
        <div className="relative mx-auto max-w-[1200px]">
          <SectionHeader
            label="Why AetherLive"
            title={<>Built for modern<br />support teams</>}
            desc="Intelligent, scalable, and developer-friendly. Designed for teams that ship fast and care deeply about customer experience."
          />
          <div className="grid gap-6 md:grid-cols-3">
            {FEATURES.map((feature) => {
              const Icon = feature.icon
              return (
                <GlassCard key={feature.title} glow className="flex flex-col">
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/15">
                    <Icon className="size-5 text-primary/80" />
                  </div>
                  <h3 className="mb-3 text-lg font-semibold">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{feature.desc}</p>
                </GlassCard>
              )
            })}
          </div>
        </div>
      </section>

      <section id="comparison" className="px-6 py-24">
        <div className="mx-auto max-w-[1200px]">
          <SectionHeader
            label="Comparison"
            title={<>See the difference,<br />at a glance</>}
            desc="Compare AetherLive across the capabilities that actually matter in production."
          />
          <div className="overflow-x-auto rounded-2xl border border-border shadow-xl">
            <table className="w-full border-separate border-spacing-0 text-sm">
              <thead>
                <tr>
                  <th className="min-w-[200px] border-b border-border bg-card/50 px-5 py-4 text-left text-xs font-semibold text-muted-foreground">Feature</th>
                  {COMPARISON_HEADERS.map((name) => (
                    <th key={name} className="border-b border-border bg-card/50 px-5 py-4 text-center text-xs font-semibold text-muted-foreground">
                      <span className="mt-1 block text-sm font-bold text-foreground">{name}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row) => (
                  <tr key={row.feature} className="transition-colors hover:bg-primary/3">
                    <td className="border-b border-border/50 px-5 py-3.5 font-medium text-foreground">{row.feature}</td>
                    {row.values.map((val, i) => (
                      <td key={i} className="border-b border-border/50 px-5 py-3.5 text-center text-muted-foreground">
                        {row.labels ? (
                          row.labels[i]
                        ) : val === true ? (
                          <Check className="mx-auto h-4 w-4 text-green-500" />
                        ) : (
                          <span className="text-muted-foreground/50">&mdash;</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-8 text-center">
            <Link href="#" className="text-sm font-medium text-primary/80 transition-colors hover:underline">
              See our benchmarks &rsaquo;
            </Link>
          </div>
        </div>
      </section>

      <section id="testimonials" className="px-6 py-24">
        <div className="mx-auto max-w-[1200px]">
          <SectionHeader
            label="Testimonials"
            title={<>Voices that shape<br />our story</>}
            desc="We power support for millions of users worldwide. Here's how teams feel about working with us."
          />
          <div className="grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <GlassCard key={t.name} className="flex flex-col">
                <p className="mb-6 text-sm leading-relaxed text-muted-foreground italic">&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-auto flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-[#a855f7] text-sm font-semibold text-primary-foreground">
                    {t.initials}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{t.name}</div>
                    <div className="text-xs text-muted-foreground/70">{t.title}</div>
                  </div>
                </div>
                <div className="mt-4 inline-block rounded-full border border-primary/15 bg-primary/8 px-2.5 py-0.5 text-[10px] font-semibold text-primary/80">
                  {t.badge}
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-24">
        <div className="mx-auto max-w-[1200px]">
          <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card to-card/50 px-12 py-20 text-center shadow-xl md:px-24">
            <div className="pointer-events-none absolute top-0 right-0 h-full w-1/2">
              <div className="from-primary/15 to-primary/0 absolute inset-0 bg-radial from-10% to-60%" />
            </div>
            <div className="relative">
              <h2 className="mb-4 text-4xl font-bold tracking-[-0.02em] text-balance">The future of support<br />is AI-native</h2>
              <p className="mx-auto mb-8 max-w-[480px] text-base text-muted-foreground">Start for free. No credit card required. Go from signup to first resolution in under 10 minutes.</p>
              <div className="flex items-center justify-center gap-3">
                <Link href="/sign-up" className="inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-base font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-[0px_0px_12px_var(--primary)]">
                  Start building
                </Link>
                <Link href="/demo-request" className="glass-card inline-flex items-center gap-2 rounded-xl border border-border px-7 py-3.5 text-base font-semibold text-foreground backdrop-blur-xl transition-all hover:border-muted-foreground hover:bg-background/70">
                  Talk to sales
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/30 px-6 pb-8 pt-16">
        <div className="mx-auto max-w-[1200px]">
          <div className="mb-12 grid gap-12 md:grid-cols-[2fr_repeat(4,1fr)]">
            <div>
              <Link href="/" className="mb-4 flex items-center gap-2.5 text-xl font-bold">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-[#a855f7] text-sm text-primary-foreground">
                  A
                </div>
                AetherLive
              </Link>
              <p className="mt-4 max-w-[320px] text-sm leading-relaxed text-muted-foreground">AI-native customer support platform. Resolve faster, understand deeper, and scale effortlessly.</p>
            </div>
            {FOOTER_COLS.map((col) => (
              <div key={col.title}>
                <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.05em] text-foreground">{col.title}</h4>
                {col.links.map((link) => (
                  <a key={link} href="#" className="block py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">{link}</a>
                ))}
              </div>
            ))}
          </div>
          <div className="flex flex-col items-center justify-between gap-4 border-t border-border/30 pt-6 md:flex-row">
            <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} AetherLive. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="text-xs text-muted-foreground transition-colors hover:text-foreground">Privacy</a>
              <a href="#" className="text-xs text-muted-foreground transition-colors hover:text-foreground">Terms</a>
              <a href="#" className="text-xs text-muted-foreground transition-colors hover:text-foreground">Cookies</a>
            </div>
          </div>
        </div>
      </footer>

      <Script src="/widget.js" data-organization-id="org_31QtvqJKwhtvop04esLJMkmFouB" strategy="afterInteractive" />
    </div>
  )
}
