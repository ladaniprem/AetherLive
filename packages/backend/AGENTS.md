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

This project implements a feature-gated subscription system using Clerk Subscriptions + Convex.

### Architecture

- **Plans**: Free (Starter), Pro ($20/mo), Enterprise (Custom)
- **Storage**: Subscription status is stored in the `subscriptions` Convex table
- **Payment**: Clerk Subscriptions handles Stripe integration and the PricingTable UI
- **Enforcement**: Backend checks via `requireFeature()` in every private Convex function

### How to Configure Clerk Subscriptions

1. Go to [Clerk Dashboard](https://dashboard.clerk.com) → your app → "Organizations" → "Plans"
2. Create plans: "Starter" (free), "Pro" ($20/month), "Enterprise" (custom)
3. Configure Stripe integration in Clerk Dashboard
4. Enable the PricingTable component for organizations
5. Set the success redirect URL to: `https://your-domain.com/billing/success?plan={plan}&status=active&session_id={subscription_id}`
6. (Optional) Configure a Clerk webhook pointing to `https://your-domain.convex.site/api/clerk-webhook` for subscription events

### How to Reset a Subscription (Dev/Testing)

Call the `setPlan` mutation from the Convex dashboard:
```ts
ctx.runMutation(api.private.subscriptions.setPlan, {
  plan: "pro",
  status: "active",
})
```

### Feature Gating

| Feature Key | Gated Functions | Required Plan |
|------------|----------------|---------------|
| `aiCustomerSupport` | conversations, messages | Pro+ |
| `knowledgeBase` | files (list, upload, delete) | Pro+ |
| `widgetCustomization` | widgetSettings (get, upsert) | Pro+ |
| `integrations` | plugins, secrets | Pro+ |
| `aiVoiceAgent` | vapi (assistants, phone numbers) | Pro+ |

Features are defined in `convex/lib/subscription.ts` under `SUBSCRIPTION_PLANS`.
Adding a new feature: add it to the `features` array for the required plan, then call `requireFeature()` in the backend function.
<!-- subscription-end -->
