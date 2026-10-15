<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AetherLive — Agent Memory

> Read this first. Accumulated knowledge to avoid re-exploration. Keep it updated.

## Project
AI customer support SaaS. pnpm + turbo monorepo.
- `apps/web` — Next.js dashboard (Clerk auth, Convex). Modules pattern: `modules/<feature>/ui/{views,components}`. Dev port **3003**.
- `apps/widget` — customer chat widget. Dev port **3001**. `apps/embed` — embed snippet.
- `packages/backend` — Convex backend (`convex/public` = unauthenticated/widget-facing, `convex/private` = authed dashboard, `convex/lib` = shared helpers).
- `packages/ui` — shadcn components (`@workspace/ui/components/*`, `@workspace/ui/lib/*`, `@workspace/ui/hooks/*`).
- State: no redux/zustand; Convex live queries + jotai (widget).
- Realtime chat works via Convex subscriptions (dashboard ↔ widget update instantly).

## Environments (2026-09-24)
- Convex DEV deployment: `terrific-dodo-542` (`https://terrific-dodo-542.eu-west-1.convex.site`). Both apps' `.env.local` point here.
- Dev Clerk instance `witty-dassie` (pk_test keys). `CLERK_JWT_ISSUER_DOMAIN` in packages/backend/.env.local.
- Convex env (dev) has: AI_Credits_API_KEY, GEMINI_API_KEY, CLERK keys, AWS keys, SEED_SECRET=`demo-seed-aether-2026`. NO `OPENAI_API_KEY` — do not use api.openai.com; use AI Credits (`https://api.aicredits.in/v1`, model `openai/...`).
- Two Clerk orgs in data:
  - `org_31QtvqJKwhtvop04esLJMkmFouB` — legacy org holding most conversations. NO LONGER a code fallback (removed 2026-09-28): embed script errors without `data-organization-id`, widget page shows a missing-org message, `demo.html` uses a `YOUR_ORGANIZATION_ID` placeholder.
  - `org_3Eu2OIpgr4GfOVQyPlwz5TWFQER` — user's real configured org (Vapi wired, Pro). Demo seeded here too.
- Vapi (150 test credits): public `33fe3467-...`, private `6006a882-...`, assistant `4881db93-...` (see apps/widget/.env.local). Wired into DB secrets + widgetSettings for BOTH orgs via temp seed route.
- `@vapi-ai/web` **2.7.1** in web + widget (2.5.2 bundled retired daily-js 0.85.0 — do not downgrade).

## CRITICAL: Clerk org claim root cause (fixed 2026-08-08)
`identity.orgId` is ALWAYS undefined — Clerk session tokens never include camelCase `orgId` by default. Token v1 has `org_id`; token v2 has compact `o` object (`o.id`). `orgId` only exists if manually mapped in Clerk Dashboard → Sessions → Claims.
- Symptom was: org-scoped queries silently return empty data (orgless fallbacks), `secrets.upsert` saved without org, `plugins.upsert` threw "Missing organization" → Vapi connect appeared dead.
- Fix: `convex/lib/auth.ts` → `getOrganizationId(identity)` = `orgId ?? org_id ?? o?.id`. Used across all backend files. **Always use this helper for org extraction.**

## CRITICAL: message-shape root cause (fixed 2026-09-24)
`toUIMessages()` returns `UIMessage` objects with `.text` + `.parts` — there is NO `.content` field.
`listMessages()` returns `MessageDocs` with role at `.message.role` and plain text at `.text` — NO top-level `.role`, and `.content` is a structured array.
- Symptom was: dashboard bubbles rendered EMPTY; AI got wrong roles (all `user`) + JSON blobs as history.
- Fix: `getMessageText()` helper (`.text` → `.parts` text join) in `conversation-id-view.tsx` + `widget-chat-screen.tsx`; `agent.ts` maps `m.message?.role` + `m.text`. **Never read `.content` off a UIMessage or `.role` off a MessageDoc.**

## Gotchas learned
- `<Toaster />` (sonner) was never mounted → all toasts invisible. Fixed in `apps/web/app/layout.tsx`. If toasts "don't work" in another app, check Toaster is mounted.
- Frontend Convex provider lives in `apps/web/components/theme-provider.tsx` (ConvexProviderWithClerk) — not a dedicated providers file.
- No `middleware.ts` in apps/web; dashboard guards: `AuthGuard` + `OrganizationGuard` (modules/auth/ui/components).
- `users.ts` `add` mutation had intentional `throw new Error("Tracking Test")` — REMOVED 2026-09-24.
- Env: dev Clerk instance `witty-dassie` (pk_test keys), Convex dev deployment `terrific-dodo-54`. `CLERK_JWT_ISSUER_DOMAIN` set in packages/backend/.env.local.
- Conversations page is behind `SubscriptionGuard(feature="aiCustomerSupport")` — free plan sees a Premium overlay, NOT the list. Seed orgs were temp-activated to Pro for testing.
- `formatDistanceToNow` (date-fns v4) needs `new Date(ts)` — raw numbers crash the list render.
- `react-resizable-panels` v4 API: `orientation` (not `direction`), `id` (no `autoSaveId`/`order`). Old props are silently ignored (files had @ts-nocheck hiding it).
- CSP headers live in each app's `next.config.ts` — voice needs `api.vapi.ai` + `*.daily.co`/`wss://*.daily.co` (connect), `*.daily.co` (media), `*.krisp.ai` (connect) + `blob:` (script-src, Krisp worklet). CSP applies only after dev-server restart.
- Stale dev bundles caused many "still broken" rounds: after code changes, restart dev server + hard-refresh (`Ctrl+Shift+R`) before trusting the browser. Cleared `apps/web/.next` when Turbopack served deleted code (`autoSaveId` ghost error).
- Vapi transcript events sometimes arrive with role but NO text — hooks filter to text-bearing user/assistant lines; `saveTranscript` accepts optional text + skips empties.
- Vapi **text chat** (`POST /chat`) returns **402 payment_method_missing** until a card is on file in Vapi dashboard. Widget handles it: Vapi-first, agent fallback, then 24h localStorage block per org (`aetherlive_vapi_blocked_<orgId>`) with daily auto-retry. Voice calls unaffected (use the 150 credits).

## Embed build & serving (clean 2026-09-28)
- `apps/embed/vite.config.ts` outputs the loader to `apps/widget/public/embed/widget.js` (served at `<widget-origin>/embed/widget.js`; prod `https://widget.aetherlive.live/embed/widget.js`). `WIDGET_URL` defaults to prod; override locally via `VITE_WIDGET_URL`.
- No hardcoded org anywhere: `embed.ts` errors when `data-organization-id` is missing; `demo.html` uses a `YOUR_ORGANIZATION_ID` placeholder with an empty input. Never reintroduce a default org.
- No stale artifacts: deleted `apps/widget/public/widget.js` (old root bundle) and `apps/embed/dist/`. Rebuild with `pnpm --filter embed build`.
- Dashboard snippets (`apps/web/modules/integrations/constants.ts`) already point at `/embed/widget.js` with per-org `{{ORGANIZATION_ID}}`; origin overridable via `NEXT_PUBLIC_WIDGET_URL`.

## Conversation layout (fixed flexbox — do NOT reintroduce resizable)
- `conversations-layout.tsx` + `conversation-id-layout.tsx` use FIXED columns (list 300px / chat flex / contact 300px). Resizable reintroduced 2026-09-24 then reverted same day (v4 prop mismatch collapsed panels; collapsible broken). Mobile: list/chat swap full-screen via `usePathname` + back button in chat header.
- Chat list scrolls via `min-h-0 flex-1 overflow-y-auto` (never `calc(100vh-…)`); bubbles clamp with `min-w-0 overflow-hidden`; `AIResponse` scrolls `pre`/`table` internally.

## Voice (widget + dashboard, same Vapi assistant)
- Hooks: `apps/widget/.../hooks/use-vapi.ts`, `apps/web/modules/dashboard/hooks/use-vapi.ts` (same logic; dashboard reads org keys via public queries + Clerk org id).
- Dashboard voice panel in `conversation-id-view.tsx` (header Voice-call button + status + Start/End/Cancel + transcript bubbles).
- Call-end transcript auto-files into the thread (`public/messages.saveTranscript`, role-correct) in BOTH apps. Widget reuses/creates the visitor's conversation.
- Text chat via Vapi: `public/vapiChat.respond` (+`greeting` mode for empty chats) with `previousChatId` chaining (`conversations.vapiChatId`). Widget greeting effect fires once per thread; human-request keywords (`wantsHuman`) auto-escalate via `public/conversations.escalate`.
- Clear messages (fresh thread, keeps chat): `public/private conversations.clearMessages` — dashboard Eraser btn + widget chat Eraser btn. Delete entire chat: `remove` both sides — dashboard Trash btn (redirects to list) + widget inbox Trash btn.
- Widget typing indicator while AI responds (`isResponding` + 90s timeout).

## Paywall: free plan = full preview, everything else is Pro (2026-09-28)
- **Free plan is a hard paywall.** `SUBSCRIPTION_PLANS.free.features` is `[]` — a free org can do nothing. Gating is enforced in the BACKEND (`requireFeature` in queries/mutations, `internal.entitlements.assertFeature` in actions), not just by UI overlays. The old `requireFeature`/`requirePlan` helpers existed but had ZERO call sites; every private + public Convex function is now wired.
- **Status-aware.** `resolvePlan()` downgrades a `plan:"pro"` row to free when status is `canceled`/`past_due`. A lapsed sub no longer keeps Pro entitlements. Never read `subscription.plan` directly.
- **`PLAN_REQUIRED:` error prefix is a contract** (`PlanRequiredError` in `convex/lib/subscription.ts`). Widget matches it → `paywall` screen; dashboard conversation view → `router.push("/billing")`. Never reword the prefix.
- **Widget flow**: boot → `public.organizations.getAccess` (new) → `canChat === false` ⇒ paywall screen; otherwise normal. PLAN_REQUIRED mid-chat routes to paywall too (plan can lapse with the tab open). `widgetSettings` is returned to unentitled orgs with `vapiSettings` stripped so the paywall header still renders; `getVapiSecrets` returns null instead of throwing.
- **AI calls are gated too**: `public.agent.respond` asserts `aiCustomerSupport` BEFORE spending an AI Credits token, and has its own rate limit (`agentRespond`, 60/min per org — previously the AI path had no rate limit at all).
- **PII**: `public.contactSessions.create` refuses to store name/email for a free org.
- **`useFeature()` returns `boolean | null`** — `null` = plan still loading. `PremiumFeatureOverlay` renders a spinner for `null`; the old code returned `false` during load and flashed the paywall at paying customers. `useSubscription` now uses `"skip"` until Clerk's active org resolves.
- Tests use `packages/backend/test-utils/subscription.ts` → `withSubscription()` / `withFreePlan()` / `withLapsedPro()`.
- Docs: gating table + 6 "CRITICAL entitlements rules" in `packages/backend/AGENTS.md`.

## AI replies: root causes fixed (2026-09-28)
Three separate bugs made replies look broken. All fixed:
1. **Reversed history.** `listMessages()` returns newest-first; `agent.ts` mapped the array in that order, so the model saw the conversation backwards with the *oldest* turn last. Now reversed to chronological before hitting chat/completions.
2. **Dead greeting on the fallback path.** The greeting effect only tried Vapi and swallowed the error — on an empty thread `agent.respond` had no turn to answer, so the fallback agent stayed silent forever. The widget now uses the same Vapi-first/agent-fallback ladder as `onSubmit`, and `agent.respond` takes `greeting: true` for a brand-new thread.
3. **Silent failures.** `agent.respond` returned quietly on missing key / non-OK response / empty completion — the typing indicator just spun for 90s. Now throws `AI_NOT_CONFIGURED` / `AI_REQUEST_FAILED: <status>` / `AI_EMPTY_RESPONSE`; the widget catches, clears the indicator and shows the error. Also `triggerAgent` on line ~250 was fire-and-forget (unhandled rejection) — now awaited.
- Model `openai/gpt-4o` → `openai/gpt-4o-mini` (verified working against the AI Credits API, much cheaper per call). Rate limit `agentRespond` 60/min per org; `vapiChatRespond` too.
- Message-shape note (still true): role is at `m.message.role`, text at `m.text`; there is NO top-level `.role` and `.content` is a structured array.

## Widget: "Missing organizationId" dead end (2026-09-28)
`apps/widget/app/page.tsx` only read `?organizationId`, so opening the widget URL directly (debugging, shared link) hit a dead end telling you to copy the snippet. It now remembers the last working org in `localStorage` (`AetherLive_last_organization_id`, set on every successful load) and falls back to it. Still never hardcodes a default org. `demo.html` prefills its org input from the same key; the embed script's console error now shows the expected `data-organization-id` markup.

## Billing: Razorpay (live; Stripe fully removed 2026-09-27)
- Payment methods: checkout.js natively offers UPI/cards/netbanking/wallets/EMI for INR and international cards for USD — no extra code needed; copy states this per currency (checkout card + premium overlay + landing pricing).
- Pricing copy is accurate to `SUBSCRIPTION_PLANS` (Free: 1 agent/100 convos, no premium features; Pro: 15 agents/10k convos + aiCustomerSupport, aiVoiceAgent, phoneSystem, knowledgeBase, teamAccess, widgetCustomization, integrations). Never list "API Access"/"Advanced analytics" — they don't exist.
- Backend `convex/private/razorpay.ts`: `createSubscription` action (creates sub via Razorpay API, returns public `keyId` for checkout.js) + `getCheckoutConfig` query (UI knows if live billing is configured — shows setup hint instead of failing mid-click) + `/api/razorpay-webhook` (HMAC via WebCrypto, activates Pro). Schema: subscriptions has razorpay* fields + currency only (stripeSubscriptionId GONE).
- Frontend `razorpay-checkout.tsx` (INR/USD toggle) rendered by `pricing-table.tsx`; landing `pricing.tsx` has its own INR/USD toggle (₹499 / $20).
- Needed in Convex env: RAZORPAY_KEY_ID/SECRET, RAZORPAY_PRO_INR_PLAN_ID, RAZORPAY_PRO_USD_PLAN_ID, RAZORPAY_WEBHOOK_SECRET. Plans created in Razorpay dashboard. **Not yet set in dev deployment — user sets them (never `npx convex env set` from agent).**
- Pro activation path is webhook-ONLY. The client-callable `setPlan` mutation was a payment-bypass (any authed user could self-grant Pro) — REMOVED with the `/api/clerk-webhook` (Clerk Billing/Stripe) route, billing-view "Activate Pro (Demo)"/"Reset to Free" buttons, premium-overlay free-activate button (now links to /billing), and the legacy `/billing/success` page.
- User docs live at `/docs` (apps/web): embed snippet, Vapi connect steps, plans & billing. Footer links Documentation there.
- Quotas are METERED, not blocked (2026-09-28): `private/subscriptions.getMonthlyUsage` counts this month's conversations per org (via `by_organizationId_and_status` index + `_creationTime`); BillingView shows X / quota meter. Visitor chats are never refused — hard caps need a product decision on over-quota visitor UX first. `maxAgents` is still display-only (no agents entity exists). NOTE: this is separate from plan gating — a *free* org is blocked entirely; an *entitled* org is only metered.

## Messages/transcripts stored RAW (fixed 2026-09-27)
- `public/messages.ts` (saveTranscript + create) and `public/contactSessions.ts` used to HTML-escape at write time (`'` → `&#x27;`) — bubbles literally showed entities. React escapes on render + `AIResponse` uses rehypeSanitize, so at-rest escaping was double-encoding. Removed; keep length caps only. Never reintroduce storage-time escaping.

## Themes & backgrounds (2026-09-24)
- Presets in `packages/ui/src/lib/appearance.ts`: aether (default blue), emerald, violet (+ `CHAT_BACKGROUNDS`: default/dots/grid/lines/aurora/sunset). CSS overrides in `packages/ui/src/styles/globals.css` via `[data-color-theme]`.
- Dashboard: per-user localStorage (`use-color-theme.ts` hook); Settings → Appearance swatches. NO hardcoded `#0b63f3` gradients left in dashboard/widget (sidebar active, bubbles, widget header are solid theme vars). Landing keeps fixed brand blue.
- Widget: `themeColor`+`chatBackground` in widgetSettings schema + upsert + zod; brand-color UI REMOVED from customization form (dashboard-only now); widget root sets `data-color-theme`, chat area paints background. Dashboard conversation ALSO paints org's saved background.
- Settings page cleaned: removed Bio/Language/Timezone, Marketing/Weekly-digest toggles, Connected-Accounts dead button, duplicate theme switch. Kept: name, mode+presets, email+conversation notifications, Clerk email row.

## Schema notes
- `plugins.organizationId` required; `secrets.organizationId` optional (legacy); `widgetSettings.organizationId` optional.
- Conversations link to org only via `contactSessions.organizationId` (+ own optional `organizationId`, `vapiChatId`).
- Subscriptions: razorpay fields only (all optional) + currency.

## Demo infra — REMOVED 2026-09-27
- Deleted: `convex/private/seed.ts`, `/api/seed-demo` route in `http.ts`, billing-view demo Pro buttons, `/billing/success` page+view.
- STILL TODO on the deployment (user): wipe demo rows (demo visitors/conversations on both orgs, temp Pro on legacy org `org_31QtvqJKwhtvop04esLJMkmFouB`) via Convex dashboard, and remove the now-unused `SEED_SECRET` env var.

## Pending / known
1. Vapi dashboard: add card to unlock text-chat API (until then agent fallback answers).
2. Demo data wipe on deployment + remove SEED_SECRET env (code already removed 2026-09-27).
3. Prod go-live NOT done: Vercel projects (web→aetherlive.live, widget→widget.aetherlive.live), `convex deploy`, Razorpay prod plans + webhook. Legal pages are self-hosted (`/privacy` + `/terms` in apps/web, footer wired) — link these in Clerk appearance instead of Termly.
4. Customization save-button error (older issue): suspect zodResolver zod v3/v4 mismatch — not yet reproduced.
