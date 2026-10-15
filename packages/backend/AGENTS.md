<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->

## Subscription / Billing System

This project implements a feature-gated subscription system using Razorpay + Convex.

### Architecture

- **Plans**: Free (Starter), Pro (₹499/mo INR or $20/mo USD), Enterprise (Custom)
- **Storage**: Subscription status is stored in the `subscriptions` Convex table
- **Payment**: Razorpay Subscriptions. `private/razorpay.createSubscription` (action) creates the subscription via the Razorpay API and returns the public `keyId` for checkout.js; `private/razorpay.getCheckoutConfig` (query) tells the dashboard UI whether live billing is configured.
- **Activation**: ONLY via the signature-verified webhook at `/api/razorpay-webhook` (`subscription.authenticated` / `subscription.charged` → Pro, `subscription.cancelled` / `subscription.completed` → free). There is intentionally no client-callable plan mutation.
- **Enforcement**: Backend-enforced, not just UI. `requireFeature()` (queries/mutations) and `internal.entitlements.assertFeature` (actions, which have no `ctx.db`) are called in every gated function. A free org gets a **full paywall** — `free.features` is `[]`, so nothing works without Pro.

### How to Configure Razorpay

1. Create 2 plans in Razorpay Dashboard → Subscriptions → Plans: Pro INR ₹499/mo, Pro USD $20/mo
2. Set Convex deployment env vars: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_PRO_INR_PLAN_ID`, `RAZORPAY_PRO_USD_PLAN_ID`, `RAZORPAY_WEBHOOK_SECRET`
3. Add a Razorpay webhook pointing to `https://<deployment>.convex.site/api/razorpay-webhook` with the subscription events above

### How to Reset a Subscription (Dev/Testing)

Edit the org's row in the `subscriptions` table directly from the Convex dashboard
(set `plan`/`status`). Never reintroduce a client-callable `setPlan` — that was a
payment-bypass hole and was removed.

### Feature Gating

| Feature Key | Gated Functions | Required Plan |
|------------|----------------|---------------|
| `aiCustomerSupport` | private+public conversations/messages, `contactSessions.create`, `public.agent.respond` (the AI call itself) | Pro+ |
| `knowledgeBase` | files (list, upload, delete) | Pro+ |
| `widgetCustomization` | widgetSettings (get, upsert) | Pro+ |
| `integrations` | plugins, secrets (private AND public) | Pro+ |
| `aiVoiceAgent` | vapi (secret, assistants, phone numbers), `public.vapiChat.threadContext` | Pro+ |

Features are defined in `convex/lib/subscription.ts` under `SUBSCRIPTION_PLANS`.
Adding a new feature: add it to the `features` array for the required plan, then call `requireFeature()` in the backend function.

### CRITICAL: entitlements rules

1. **`resolvePlan()` gates on status too.** A `plan: "pro"` row with `status: "canceled"` / `"past_due"` resolves to `free`. Never read `subscription.plan` directly — always go through `resolvePlan` / `getOrgPlan` / `requireFeature`.
2. **`PLAN_REQUIRED:` is a contract.** Gated functions throw `PlanRequiredError`, whose message starts with `PLAN_REQUIRED:`. The widget matches that prefix to route to its paywall screen and the dashboard redirects to `/billing`. Never reword the prefix.
3. **Actions can't use `requireFeature()`** — they have no `ctx.db`. Call `internal.entitlements.assertFeature` via `ctx.runQuery` instead.
4. **Visitor-facing reads must not hard-fail.** `public.widgetSettings.getByOrganizationId` returns branding with `vapiSettings` stripped for unentitled orgs, and `public.secrets.getVapiSecrets` returns `null` — otherwise the widget crashes on boot instead of showing the paywall. `public.organizations.getAccess` is the intended way for the widget to ask "can this org chat?".
5. **Never gate PII collection past the plan check.** `public.contactSessions.create` refuses to store a name/email for a free org.
6. Tests: wrap the mocked ctx with `withSubscription()` / `withFreePlan()` / `withLapsedPro()` from `packages/backend/test-utils/subscription.ts`, or every happy-path test resolves to free and fails for the wrong reason.
<!-- subscription-end -->
