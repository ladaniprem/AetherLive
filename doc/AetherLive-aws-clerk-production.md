# AetherLive: AWS Secrets + Clerk Billing Subscriptions + Demo → Production

## Context & Decisions
- **AWS scope:** Secrets Manager only — stores Vapi **public + private keys**. No AWS hosting.
- **Subscriptions:** Keep **Clerk Billing** (already integrated end-to-end). No Stripe migration.
- **Hosting:** **Vercel** for `apps/web`, `apps/widget`, `apps/embed`. Convex Cloud for backend.

Current state (verified): `packages/backend/convex/lib/secrets.ts` already fetches Vapi secrets from Secrets Manager via `VAPI_SECRET_ARN`. Clerk Billing pricing table (`apps/web/modules/billing/`), webhook (`packages/backend/convex/http.ts` → `/api/clerk-webhook`), and plan gating (`convex/lib/subscription.ts`) exist. No deployment config anywhere.

---

## Phase 1 — AWS Secrets Manager for Vapi Keys

### 1.1 AWS console setup (manual, one-time)
1. In AWS Secrets Manager, create secret `aetherlive/prod/vapi` (and `aetherlive/dev/vapi`) as JSON:
   `{ "VAPI_PUBLIC_KEY": "...", "VAPI_PRIVATE_KEY": "..." }`
2. Create IAM policy `AetherLiveSecretsReadOnly` allowing `secretsmanager:GetSecretValue` on those two ARNs only.
3. Create IAM user/role `aetherlive-convex` with that policy attached; generate access keys.

### 1.2 Backend changes (code, small)
- Extend `packages/backend/convex/lib/secrets.ts`:
  - `getVapiSecrets()` currently reads one key — update it to parse the JSON secret and return `{ publicKey, privateKey }`.
  - Add an in-memory cache (module-level, ~5 min TTL) so every voice call doesn't hit Secrets Manager.
  - Graceful error: if fetch fails, throw a clear "voice unavailable" error instead of crashing the conversation flow.
- Callers: search for `getVapiSecrets` usages in `packages/backend/convex/` (voice/vapi functions) and switch from single-key to the new `{ publicKey, privateKey }` shape.

### 1.3 Env vars (Convex dashboard → Environment Variables)
- `AWS_REGION` (e.g. `us-east-1`), `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `VAPI_SECRET_ARN` (pointing to the prod secret).
- Keep `VAPI_API_KEY` in `.env.local` **only** as a local-dev fallback; document that prod never uses it.
- Update `AetherLive/.env.example` with the new AWS keys.

### 1.4 Rotation & hygiene
- Document key rotation: rotate in Vapi → update secret JSON → no redeploy needed (cache expires).
- Verify `packages/backend/.env.local` and all `.env*` files are in `.gitignore` (they are inputs in `turbo.json`; confirm not committed).

---

## Phase 2 — Clerk Billing Subscriptions (Production Hardening)

### 2.1 Clerk production instance (manual)
1. Create a **production** Clerk instance (dev instances have limits and `clerk.accounts.dev` domains).
2. In Clerk dashboard → Billing: create plans matching `convex/lib/subscription.ts`:
   - `free` (Starter, $0), `pro` (Pro, $20/mo), `enterprise` (custom/contact).
3. Map Clerk plan IDs → Convex plan names. Ensure the webhook handler in `packages/backend/convex/http.ts` translates Clerk's plan slug correctly for `organization.subscription.created/updated/deleted/canceled`.

### 2.2 Webhook hardening (code, small)
- `packages/backend/convex/http.ts` `/api/clerk-webhook`:
  - Verify the Svix signature using `CLERK_WEBHOOK_SECRET` (set in Convex env vars for the **prod** deployment, pointing at the prod Clerk instance's endpoint secret).
  - Return proper 400/401 on invalid signature; idempotent handling (same event delivered twice shouldn't corrupt state).
- `packages/backend/convex/private/subscriptions.ts` (`setPlan`): handle downgrade to `free` on `deleted/canceled` and store `currentPeriodEnd`.

### 2.3 Feature gating audit (code, small)
- Walk through premium features (voice/Vapi plugin, file uploads, customization) and wrap mutations/queries with existing helpers `requirePlan` / `requireFeature` from `convex/lib/subscription.ts`.
- Frontend: confirm `apps/web/modules/billing/lib/use-subscription.ts` (`useSubscription`, `useHasFeature`) + `subscription-guard.tsx` hide/lock pro features for free orgs.
- Test flow: `/billing` → Clerk `PricingTable` → checkout → `/billing/success` → webhook fires → Convex `subscriptions` row updated → feature unlocked.

### 2.4 Cleanup
- Remove the intentional test throw `"Tracking Test"` in `packages/backend/convex/users.ts:25` (`users.add` mutation) — this is demo breakage left in code.

---

## Phase 3 — Demo → Production

### 3.1 Convex production deployment
1. `cd packages/backend && npx convex deploy --prod` (or create prod deployment via Convex dashboard).
2. Set all prod env vars in the Convex prod deployment (Clerk JWT issuer domain for the **prod** instance, AWS vars, `CLERK_WEBHOOK_SECRET`, OpenAI key).
3. Point Clerk prod webhook endpoint at `https://<prod-convex-site>/api/clerk-webhook`.

### 3.2 Vercel deployment (3 projects, one per app)
For each of `apps/web`, `apps/widget`, `apps/embed`:
1. Import repo into Vercel, set root directory to the app folder, framework = Next.js.
2. Build command: use Turborepo-aware defaults (`turbo build --filter=<app>`) or Vercel's monorepo detection.
3. Env vars per app:
   - **web:** `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (prod `pk_live_...`), `CLERK_SECRET_KEY` (`sk_live_...`), `NEXT_PUBLIC_CONVEX_URL` (prod), Sentry vars (`NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`), `VITE_WIDGET_URL` → prod widget URL.
   - **widget/embed:** prod Convex URL + their public keys.
4. Custom domains, e.g.: `app.aetherlive.com` (web), `widget.aetherlive.com` (widget), `embed.aetherlive.com` (embed). Add these domains to Clerk prod allowed origins.
5. Update CORS/CSP: `apps/web/next.config.ts` CSP, widget CORS allowlist, and the widget embed snippet (`?organizationId=` script) to reference prod domains.

### 3.3 Observability & safety
- Sentry: create prod project/DSN (or environment tag `production`); confirm source-map upload works in Vercel build (`SENTRY_AUTH_TOKEN` present); tunnel route `/api/sentry-tunnel` already exists.
- Rate limiting + CSRF tables already in schema — verify limits are production-appropriate in `packages/backend/convex/public/messages.ts`.
- Error states: widget `error` screen and web error boundaries show user-friendly messages.

### 3.4 CI (GitHub Actions, new file `.github/workflows/ci.yml`)
- On PR: `pnpm install --frozen-lockfile` → `pnpm lint` → `pnpm check-types` (or `tsc`) → `pnpm test` (Vitest) → `pnpm build`.
- Vercel gives preview deployments per PR automatically; Convex stays on prod backend for previews (acceptable) or add a Convex preview deployment later.

### 3.5 Go-live checklist
- [ ] `users.ts` test throw removed
- [ ] Prod Clerk instance + plans + webhook secret configured
- [ ] AWS secret JSON (both Vapi keys) + IAM least-privilege in place; Convex prod env vars set
- [ ] `npx convex deploy` to prod; schema matches
- [ ] 3 Vercel projects live with prod env vars and custom domains
- [ ] End-to-end test: sign up org → subscribe to Pro via Clerk → webhook updates Convex → voice call works using keys from Secrets Manager → conversation appears in dashboard
- [ ] Sentry receiving events from all prod apps
- [ ] Update stale README sections (schema, ports, known issues)

---

## Files to Modify (implementation phase)
| File | Change |
|---|---|
| `packages/backend/convex/lib/secrets.ts` | JSON secret (public+private key), caching, error handling |
| `packages/backend/convex/http.ts` | Webhook signature verification + idempotency |
| `packages/backend/convex/private/subscriptions.ts` | Downgrade/cancel handling |
| `packages/backend/convex/users.ts` | Remove `"Tracking Test"` throw |
| `packages/backend/convex/lib/subscription.ts` | Verify plan IDs match Clerk prod plan slugs |
| `apps/web/next.config.ts` | Prod CSP/CORS domains |
| `AetherLive/.env.example` | Document AWS + prod keys |
| `.github/workflows/ci.yml` | New CI pipeline |
| `README.md` | Update stale docs |

## Verification
1. **Secrets:** trigger a Vapi voice call in prod; confirm keys come from Secrets Manager (temporarily revoke IAM → voice fails with clean error, chat still works).
2. **Subscription:** subscribe a test org to Pro in Clerk prod → check Convex `subscriptions` table row + unlocked feature → cancel → auto-downgrade to free at period end.
3. **Production:** run the go-live checklist above; run `pnpm build && pnpm test` clean in CI.