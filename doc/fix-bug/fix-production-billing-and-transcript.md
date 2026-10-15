# Fix: Production Billing (Razorpay bridge, Stripe removal) + Voice Transcript Mangling + Demo Cleanup

Date: 2026-09-27

## Issues

1. **Razorpay "key does not come through"** — `RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET`/plan IDs were never set in the Convex deployment env, so `createSubscription` threw "Razorpay not configured" and checkout could never open. There was also no way for the UI to know billing was unconfigured before the user clicked Buy.
2. **Stripe/Clerk Billing leftovers** — `subscriptions.stripeSubscriptionId` in schema, a `/api/clerk-webhook` route writing Stripe subscription IDs, and `setPlan` args referencing Stripe, all dead after the Razorpay migration.
3. **Payment bypass (demo payment)** — the client-callable `setPlan` mutation let ANY authenticated user grant their own org Pro for free. It was wired to an "Activate Pro (Demo)" button in `billing-view.tsx`, an "Activate Pro" button in `premium-feature-overlay.tsx`, a `?synced=true` auto-grant effect, and the legacy `/billing/success` page.
4. **Voice-call transcripts (and visitor messages) stored mangled** — `public/messages.ts` (`saveTranscript`, `create`) and `public/contactSessions.ts` HTML-escaped text at write time (`don't` → `don&#x27;t`, `&` → `&amp;`). React escapes on render and `AIResponse` uses `rehypeSanitize`, so the stored entities rendered literally — transcripts looked garbled in both dashboard and widget.
5. **Demo seed infra still live** — `convex/private/seed.ts` + `/api/seed-demo` route (seed/demo-say/activate-pro/wire-vapi) were temporary testing tools.

## Changes

### Razorpay bridge
- `packages/backend/convex/private/razorpay.ts` — added `getCheckoutConfig` query: returns `{ configured, keyId, plans: { INR, USD } }` from Convex env. `key_id` is public-safe (checkout.js requires it client-side); the secret stays server-side.
- `apps/web/modules/billing/ui/components/razorpay-checkout.tsx` — reads `getCheckoutConfig`; shows a "live payments not configured" setup hint instead of a dead button, and falls back to `config.keyId` for the checkout modal.

### Stripe removal
- `packages/backend/convex/schema.ts` — dropped `subscriptions.stripeSubscriptionId`.
- `packages/backend/convex/http.ts` — deleted the `/api/clerk-webhook` route (Clerk Billing = Stripe-only) and unused `api`/`internal` imports.
- `packages/backend/convex/private/subscriptions.ts` — deleted the `setPlan` mutation (payment bypass). Pro is now activated ONLY by the signature-verified Razorpay webhook (`activateFromWebhook` / `cancelFromWebhook`).
- `.env.example`, `README.md`, `packages/backend/AGENTS.md` — updated to Razorpay-only billing.

### Transcript / message text fix
- `packages/backend/convex/public/messages.ts` — removed the `sanitize()` HTML-escaping from `saveTranscript` and `create`; text is stored raw with the same length caps (2000/10000 chars). XSS protection remains at render time (React escaping + `rehypeSanitize`).
- `packages/backend/convex/public/contactSessions.ts` — same: names/emails/URLs stored raw; format + length validation kept.

### Demo → production
- Deleted `packages/backend/convex/private/seed.ts` and the `/api/seed-demo` route.
- `apps/web/modules/billing/ui/views/billing-view.tsx` — removed "Activate Pro (Demo)" / "Reset to Free" buttons and the `?synced=true` self-grant effect.
- `apps/web/modules/billing/ui/components/premium-feature-overlay.tsx` — "Activate Pro" free-grant replaced by an "Upgrade to Pro" link to `/billing` (Razorpay checkout).
- Deleted `subscription-success-view.tsx` + `app/(dashboard)/billing/success/page.tsx` (legacy Clerk Billing success page, unreferenced).

## Still required from the user (deployment state)

- Set in Convex dashboard env: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_PRO_INR_PLAN_ID`, `RAZORPAY_PRO_USD_PLAN_ID`, `RAZORPAY_WEBHOOK_SECRET` (use `rzp_live_…` keys for production).
- Razorpay Dashboard → Webhooks → `https://<deployment>.convex.site/api/razorpay-webhook`, events: `subscription.authenticated`, `subscription.charged`, `subscription.cancelled`, `subscription.completed`.
- Wipe demo rows (seeded visitors/conversations, temp Pro on `org_31QtvqJKwhtvop04esLJMkmFouB`) and remove the unused `SEED_SECRET` env var.

## Verification

- `npx convex codegen` regenerates without `seed`/`setPlan` references.
- Typecheck passes for backend + web app.
