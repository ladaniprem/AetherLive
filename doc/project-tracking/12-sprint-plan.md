# AetherLive — 12-Sprint Jira Plan (Mapped to This Build)

> Your 12 sprints, already divided. This file mirrors them into this repo
> (`apps/web`, `apps/widget`, `apps/embed`, `packages/backend`) so every
> ticket has a code home, and every Done has a record (commit + Bitbucket PR).

Project key suggestion: `AL` (AetherLive). Type: Scrum. Cadence: 1 week/sprint.

| Sprint | Epic | Code home | Goal (Done =) |
|---|---|---|---|
| S1 | Setup & Monorepo | `package.json`, `turbo.json`, `pnpm-workspace.yaml`, `packages/*-config` | `pnpm install`, `pnpm dev`, `lint`, `typecheck`, `build`, `test` all green |
| S2 | Auth & Multi-tenancy | `apps/web/modules/auth`, `apps/web/proxy.ts`, `packages/backend/convex/lib/auth.ts` | Sign-in/up, org-selection, `getOrganizationId()` used everywhere, no orgless data |
| S3 | Backend Core | `packages/backend/convex/schema.ts`, `convex/public/contactSessions.ts`, `conversations.ts`, `messages.ts`, `convex/lib/*` | Widget can create session → conversation → message, org-scoped queries |
| S4 | Widget + Embed | `apps/widget`, `apps/embed` (port 3001) | `<script src=...embed.js>` renders widget, realtime chat works |
| S5 | Dashboard Inbox | `apps/web/modules/dashboard` | Inbox lists unresolved/resolved/escalated, human reply pushes realtime |
| S6 | AI Agent + RAG + Files | `convex/public/agent.ts`, `convex/private/files.ts`, `apps/web/modules/files` | AI answers from KB in <2s, file upload → indexed for RAG |
| S7 | Customization + Settings | `apps/web/modules/customization`, `modules/settings`, `convex/private/widgetSettings.ts` | Colors/position/greeting save without error, per-org settings |
| S8 | Integrations + Voice | `apps/web/modules/integrations`, `modules/plugins`, `convex/private/plugins.ts`, `secrets.ts`, `vapi.ts` | Plugins connect, Vapi voice via AWS Secrets Manager (5-min cache) |
| S9 | Billing + Gating | `apps/web/modules/billing`, `convex/private/subscriptions.ts`, `convex/lib/subscription.ts` | Clerk PricingTable → webhook → `subscriptions`, `requireFeature()` gates premium |
| S10 | Landing + Growth | `apps/web/components/landing/*`, `app/(landing)` | Hero, features, live-demo, pricing, FAQ, testimonials ship, SEO OK |
| S11 | Testing + Security + Observability | `convex/**/*.test.ts`, `convex/lib/rateLimit.ts`, `csrf.ts`, Sentry | Rate-limit + CSRF tuned, Sentry tunnel + replay, tests pass |
| S12 | CI/CD + Production | `.github/workflows/pipeline.yml`, `bitbucket-pipelines.yml`, `doc/*-production.md` | Convex prod + Vercel 3-project deploy (web/widget/embed), custom domains |

## Ticket list (create these in Jira — also in `jira-import.csv`)

Prefix with `AL-`. Story points are T-shirt → points: S=2, M=3, L=5.

### S1 — Setup & Monorepo
- AL-1 [Epic] Monorepo & tooling (S1) — 5pts
- AL-2 Setup pnpm + turbo + shared configs — 3pts — `package.json`, `turbo.json`
- AL-3 ESLint/Prettier/vitest shared setup — 2pts
- AL-4 `pnpm dev` runs web(3003)+widget(3001) — 2pts

### S2 — Auth & Multi-tenancy
- AL-5 [Epic] Auth & multi-tenancy (S2) — 5pts
- AL-6 Clerk sign-in/sign-up + proxy.ts guards — 3pts — `apps/web/proxy.ts`
- AL-7 AuthGuard + OrganizationGuard + org-selection — 3pts — `modules/auth`
- AL-8 `getOrganizationId()` helper everywhere — 3pts — `convex/lib/auth.ts`

### S3 — Backend Core
- AL-9 [Epic] Backend core schema + public API (S3) — 5pts
- AL-10 Schema 10 tables + indexes — 3pts — `convex/schema.ts`
- AL-11 contactSessions.create (public) — 3pts
- AL-12 conversations.create + status flow — 3pts
- AL-13 messages.create + realtime subscription — 3pts

### S4 — Widget + Embed
- AL-14 [Epic] Widget + Embed (S4) — 5pts
- AL-15 Widget chat flow (session→convo→message→AI) — 5pts — `apps/widget`
- AL-16 Embed snippet script tag — 2pts — `apps/embed`
- AL-17 Fix: widget cannot establish conversation (open issue) — 3pts

### S5 — Dashboard Inbox
- AL-18 [Epic] Dashboard inbox (S5) — 5pts
- AL-19 Inbox views (unresolved/resolved/escalated) — 3pts — `modules/dashboard`
- AL-20 Human reply + realtime push + sentiment escalate — 3pts

### S6 — AI Agent + RAG + Files
- AL-21 [Epic] AI agent + RAG + files (S6) — 5pts
- AL-22 Convex Agent RAG over KB — 5pts — `convex/public/agent.ts`
- AL-23 File upload → Convex storage → index — 3pts — `modules/files`
- AL-24 Smart ticket routing auto-categorize — 3pts

### S7 — Customization + Settings
- AL-25 [Epic] Customization + settings (S7) — 5pts
- AL-26 Widget customization save (colors/position/greeting) — 3pts — `modules/customization`
- AL-27 Fix: customization save button error (zod v3/v4) — 2pts
- AL-28 Settings page per-org — 2pts — `modules/settings`

### S8 — Integrations + Voice
- AL-29 [Epic] Integrations + voice (S8) — 5pts
- AL-30 Plugins CRUD (orgId required) — 3pts — `convex/private/plugins.ts`
- AL-31 Secrets upsert org-scoped — 2pts — `convex/private/secrets.ts`
- AL-32 Vapi voice via AWS Secrets Manager — 3pts — `convex/private/vapi.ts`

### S9 — Billing + Gating
- AL-33 [Epic] Billing + feature gating (S9) — 5pts
- AL-34 Clerk Billing PricingTable + webhook → subscriptions — 3pts — `modules/billing`
- AL-35 `requireFeature()` gating (aiCustomerSupport, knowledgeBase, etc.) — 3pts

### S10 — Landing + Growth
- AL-36 [Epic] Landing + growth (S10) — 5pts
- AL-37 Hero + features grid + live-demo — 3pts — `components/landing`
- AL-38 Pricing + testimonials + FAQ + footer — 2pts

### S11 — Testing + Security
- AL-39 [Epic] Testing + security (S11) — 5pts
- AL-40 Backend vitest (conversations, files, rateLimit, contactSessions) — 3pts
- AL-41 Rate-limit + CSRF production tuning — 3pts — `public/messages.ts`
- AL-42 Sentry tunnel + replay + remove `users.ts` throw — 2pts

### S12 — CI/CD + Production
- AL-43 [Epic] CI/CD + production (S12) — 5pts
- AL-44 GitHub pipeline lint→typecheck→test→build→deploy — 3pts — `.github/workflows/pipeline.yml`
- AL-45 Track Bitbucket + Jira links (read-only, no pipeline change) — 2pts — tracking only
- AL-46 Prod: Convex prod, Vercel 3-project, custom domains, Clerk prod — 3pts (track only, no deploy change)

Total: 46 tickets, ~140pts. All marked Done in `progress-tracker.md` (since your sprints are done) — keep the record per ticket: Jira status + Bitbucket branch/PR + commit (read-only, no git/pipeline changes).
