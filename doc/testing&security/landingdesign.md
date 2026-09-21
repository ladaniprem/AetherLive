# AetherLive Landing Page — Design & Brand Specification

## Design Philosophy

This landing page is not about flash — it's about **presence**. Every element should feel like it belongs to a mature, well-funded product that has been in the market for years. The goal is not to impress with visuals but to build **instant credibility** and **emotional trust**.

**The core principle:** When a visitor lands, they should think "this is a serious product" — not "this looks cool." The difference is subtle but everything.

### What Makes a Product Feel "Polished & Professional"

| Quality | How We Achieve It |
|---------|-------------------|
| **Restraint** | Less is more. Fewer animations, fewer colors, fewer font sizes. Every addition must justify its existence. |
| **Consistency** | Spacing, alignment, color usage, and tone are identical across all sections. No surprises. |
| **Precision** | Every pixel is intentional. Hover states, shadows, transitions — they all happen with purpose. |
| **Confidence** | The page never shouts. Strong typography, generous whitespace, muted authority. No exclamation marks in copy. No fake urgency. |
| **Subtlety** | Interactions are felt, not noticed. A 200ms fade, a 1px shadow change — things you don't consciously see but register as "smooth." |

### Why People Will Remember This Product

1. **The typography.** Geist is clean, modern, and slightly technical — it signals this is a developer-oriented product.
2. **The single accent color.** One blue gradient, used sparingly. It becomes a visual anchor.
3. **The product screenshot.** Real UI, not an illustration. People remember actual products.
4. **The comparison table.** Honest, detailed, specific. Shows we respect competitors enough to compare fairly.
5. **The rhythm.** Every section has the same padding, the same width, the same breathing room. It creates a predictable, comfortable scroll.

---

## Page Structure (Top to Bottom)

### 1. Navigation Bar

**Purpose:** Disappear into the background. The nav should be felt, not noticed.

- Fixed top, `h-16`, `bg-background/80 backdrop-blur-xl border-b border-border/30`
- **Left:** Logo mark — gradient blue-to-purple square with letter "A" + "AetherLive" wordmark
- **Center:** Nav links: "How it works", "Features", "Why AetherLive", "Testimonials", "Pricing", "Documentation"
- **Right:** "Sign in" (text, muted) + "Get started" button (`bg-primary`, hover glow shadow)
- **Behavior:** On scroll, backdrop-blur activates. Clean, invisible, functional.

### 2. Hero Section

**Purpose:** In 3 seconds, answer: what is this, and why should I care?

- `pt-40 pb-20 px-6 text-center`, max-width `1200px` centered
- **Background:** Subtle radial orbs, CSS-only `from-primary/20 to-transparent`
- **Pill badge:** "AI-Native Customer Support" — `Sparkles` icon, subtle border, muted text
- **Headline:**
  - "Turn every customer conversation into"
  - Gradient span: "your strongest advantage" — blue-to-purple, used exactly once on the page
- **Subtext:**
  - "AetherLive is the AI customer support platform that resolves issues instantly with intelligent agents, real-time insights, and seamless human escalation — all through a single integration."
  - `max-w-[640px] text-lg text-muted-foreground text-balance`
- **CTAs:**
  - Primary: "Get started free" with `ArrowRight`
  - Secondary: "See how it works" — glass style, `border border-border backdrop-blur-xl`
- **Product mockup:**
  - Browser chrome frame (traffic lights + URL bar "app.aetherlive.ai")
  - `/dashboard-dark.png` — real product screenshot, 1340×820, `priority`
  - Below: soft radial glow fading down
- **Stats row:** 4 metrics side-by-side
  - "10M+ Conversations resolved"
  - "50K+ Active businesses"
  - "99.9% Uptime SLA"
  - "<100ms Response time"

**Why this works:** The headline states a benefit. The subtext explains the product in one sentence. The screenshot proves it exists. The stats prove it works. No scrolling required.

### 3. Social Proof Section

**Purpose:** Silent credibility signal. Not a shout, just a nod.

- `border-b border-border/30 py-16 text-center`
- Heading: "Trusted by leading companies worldwide" — `text-sm font-medium uppercase tracking-[0.05em] text-muted-foreground`
- Company names: `text-xl font-semibold text-muted-foreground opacity-60`
  - Shopify, Notion, Figma, Linear, Vercel, Ramp, Brex, Loom
  - Flex-wrap, `gap-12`, centered

**Why this works:** The low opacity communicates "we don't need to prove this — we just are." Subtle confidence.

### 4. How It Works (Process Section)

**Purpose:** Explain the customer journey in 4 logical steps. Turning confusion into clarity.

- `py-24 px-6`, `max-w-[1200px] mx-auto`
- **Section header:** "How it works" pill → "The foundation of every support operation" → "Bad support doesn't just frustrate customers — it erodes trust. We make every interaction count."
- **4-column grid** (`md:grid-cols-4 gap-6`):
  1. **01 — Connect** — Integrate with your stack. Slack, Intercom, Zendesk. One embed. Native SDKs.
  2. **02 — Understand** — AI ingests docs, tickets, product data. Intent & sentiment detection.
  3. **03 — Resolve** — Instant AI responses (<100ms). Escalate with full context when needed.
  4. **04 — Improve** — Analytics, CSAT, auto-generated knowledge from real conversations.
- Each card: `GlassCard` with numbered badge, title, description, 3 bullet items
- Below: "Start building" (primary) + "View docs" (secondary)

**Why this works:** The 4 steps map to a real workflow, not generic marketing steps. Each one is concrete and believable.

### 5. Features Grid

**Purpose:** Specific, measurable capabilities. Not "we're great" — "here's exactly what we do."

- `py-24 px-6`, right-side radial glow ambient background
- **Section header:** "Why AetherLive" → "Built for modern support teams" → "Intelligent, scalable, and developer-friendly."
- **3-column grid** (`md:grid-cols-3 gap-6`):
  1. `Globe` — **Multilingual support** — 100+ languages, automatic detection
  2. `Zap` — **Lightning-fast AI** — Sub-100ms response times
  3. `BarChart3` — **Built-in analytics** — Resolution rates, CSAT, trends
  4. `Shield` — **Enterprise security** — SOC 2, GDPR, HIPAA compliant
  5. `Network` — **Ship in hours** — One embed, SDKs, pre-built integrations
  6. `Bot` — **Intelligent escalation** — AI knows when to hand off

**Why this works:** Each feature starts with a concrete title, not a vague promise. "Sub-100ms" vs "really fast." "SOC 2 compliant" vs "secure."

### 6. Comparison Table

**Purpose:** The knockout punch. Eliminate every competitor objection with facts.

- `py-24 px-6`
- **Section header:** "Comparison" → "See the difference, at a glance" → "Compare AetherLive across the capabilities that actually matter in production."
- Table: `rounded-2xl border border-border shadow-xl`
  - Columns: Feature | AetherLive | Intercom | Zendesk | Freshdesk | Crisp
  - 11 rows covering every meaningful capability
  - `Check` icon (green) or `&mdash;` dash
  - Integration time row: text labels ("<4 hours", "1-2 days")
  - Hover state: row highlight `hover:bg-primary/3`
- Below: "See our benchmarks ›"

**Why this works:** Shows confidence. No competitor bashing — just facts. The honesty of showing competitors with green checks too makes the whole table more trustworthy.

### 7. Testimonials

**Purpose:** Real people, real results, real companies. Not stock quotes.

- `py-24 px-6`
- **Section header:** "Testimonials" → "Voices that shape our story" → "We power support for millions of users worldwide."
- **3-column grid** (`md:grid-cols-3 gap-6`):
  - Each card: Quote (italic, `&ldquo;...&rdquo;`) + author avatar (gradient circle, initials) + name + title + industry badge
- **6 testimonials:**
  - Sarah Kim, Head of Support @ Linear — "AI cut first-response time by 90%"
  - Marcus Larsen, VP CX @ Pleo — "12 languages without extra staff"
  - Alex Johnson, CTO @ Raycast — "Production in under 3 hours"
  - Elena Petrova, Director of Support @ Deel — "CSAT jumped 25 points"
  - David Wang, Engineering Lead @ Supabase — "AI handles 70% end-to-end"
  - Rachel Nguyen, Co-Founder @ Cal.com — "Unmatched accuracy and speed"

**Why this works:** Specific names, specific companies, specific numbers. Each quote tells a mini-story about a real use case.

### 8. Final CTA Banner

**Purpose:** Low-friction commitment. No pressure, just invitation.

- `py-24 px-6`
- Banner card: `rounded-2xl border border-border/50 bg-gradient-to-br from-card to-card/50 px-12 py-20 md:px-24 text-center shadow-xl`
  - Right-side radial glow decorator
  - Headline: "The future of support is AI-native"
  - Subtext: "Start for free. No credit card required. Go from signup to first resolution in under 10 minutes."
  - CTAs: "Start building" (primary) + "Talk to sales" (secondary glass)

**Why this works:** No countdown, no "limited offer," no social proof barrage. Just a clean, confident ask.

### 9. Footer

**Purpose:** Complete without being overwhelming.

- `border-t border-border/30 pt-16 pb-8 px-6`, `max-w-[1200px] mx-auto`
- Grid: `md:grid-cols-[2fr_repeat(4,1fr)] gap-12`
  - Logo + tagline
  - Product, Developers, Company, Legal — each 4-5 links
- Bottom bar: Copyright + Privacy / Terms / Cookies

---

## Core Components

### GlassCard
```
rounded-xl border border-border/50 bg-background/50 p-6 shadow-xl backdrop-blur-xl
Hover: border-border/80 bg-background/70 shadow-2xl
Optional glow prop: radial gradient revealed on hover
Top-right ArrowUpRight icon fades in on hover
```

### SectionLabel
```
Pill badge:
rounded-full border border-primary/15 bg-primary/8 px-3.5 py-1
text-xs font-semibold uppercase tracking-[0.05em] text-primary/80
```

### SectionHeader
```
Centered block, mb-16:
- SectionLabel
- h2: text-4xl font-bold tracking-[-0.02em] text-balance
- p: mx-auto max-w-[560px] text-base text-muted-foreground
```

---

## Design System Invariants

| Rule | Why |
|------|-----|
| One font family (Geist) | Consistency. No decorative fonts. |
| One accent color (blue-purple) | Visual anchor. Used <5 times per page. |
| `max-w-[1200px]` on all sections | Comfortable reading width. |
| No illustrations or 3D renders | Real product imagery only. |
| No auto-play video | User control, performance. |
| No particle/WebGL effects | Distraction-free. |
| No stock photography | Nothing fake. |
| No exclamation points in copy | Confident tone. |
| No countdown timers | No manufactured urgency. |
| Same padding (py-24) across sections | Predictable rhythm. |

---

## Micro-interactions (The "Smooth" Factor)

These are not features. They are **felt, not noticed.**

| Element | Interaction | Timing |
|---------|-------------|--------|
| GlassCard hover | Border brightens, glow fades in, arrow icon appears | 300ms ease |
| Nav background | backdrop-blur activates on scroll | 200ms |
| CTA button hover | Shadow glow appears, background lightens | 200ms |
| Table row hover | Subtle highlight tint | 150ms |
| Link hover | Color transitions from muted to foreground | 200ms |
| Comparison check icons | Stop animating — they are static. Animating trust signals undermines trust. | N/A |

---

## Copy Voice & Tone

**Voice:** Confident, direct, specific. The copy of a company that has shipped real software to real customers.

| ✅ Do | ❌ Don't |
|-------|----------|
| "Sub-100ms response times" | "Lightning fast performance" |
| "SOC 2, GDPR, HIPAA compliant" | "Enterprise-grade security" |
| "10M+ conversations resolved" | "Thousands of happy customers" |
| "AI handles 70% of tickets end-to-end" | "AI automates your support" |
| "Go from signup to production in under 4 hours" | "Start scaling today" |

---

## What to Generate

A single `page.tsx` file (`"use client"`) that implements this complete landing page for a Next.js 16 App Router project. Use `next/link`, `next/image` (for `/dashboard-dark.png`), `lucide-react` icons. Inline `GlassCard`, `SectionLabel`, and `SectionHeader` as components within the file. Dark/light mode support via CSS class theming (already configured — no additional setup needed).
