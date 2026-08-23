<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AetherLive — Agent Memory

> Read this first. Accumulated knowledge to avoid re-exploration. Keep it updated.

## Project
AI customer support SaaS. pnpm + turbo monorepo.
- `apps/web` — Next.js dashboard (Clerk auth, Convex). Modules pattern: `modules/<feature>/ui/{views,components}`.
- `apps/widget` — customer chat widget. `apps/embed` — embed snippet.
- `packages/backend` — Convex backend (`convex/public` = unauthenticated/widget-facing, `convex/private` = authed dashboard, `convex/lib` = shared helpers).
- `packages/ui` — shadcn components (`@workspace/ui/components/*`).
- State: no redux/zustand; Convex live queries + jotai (widget).
- Production roadmap doc: `doc/AetherLive-aws-clerk-production.md` (AWS Secrets Manager for Vapi keys, Clerk Billing, Vercel).

## CRITICAL: Clerk org claim root cause (fixed 2026-08-08)
`identity.orgId` is ALWAYS undefined — Clerk session tokens never include camelCase `orgId` by default. Token v1 has `org_id`; token v2 has compact `o` object (`o.id`). `orgId` only exists if manually mapped in Clerk Dashboard → Sessions → Claims.
- Symptom was: org-scoped queries silently return empty data (orgless fallbacks), `secrets.upsert` saved without org, `plugins.upsert` threw "Missing organization" → Vapi connect appeared dead.
- Fix: `convex/lib/auth.ts` → `getOrganizationId(identity)` = `orgId ?? org_id ?? o?.id`. Used across all backend files. **Always use this helper for org extraction.**

## Gotchas learned
- `<Toaster />` (sonner) was never mounted → all toasts invisible. Fixed in `apps/web/app/layout.tsx`. If toasts "don't work" in another app, check Toaster is mounted.
- Frontend Convex provider lives in `apps/web/components/theme-provider.tsx` (ConvexProviderWithClerk) — not a dedicated providers file.
- No `middleware.ts` in apps/web; dashboard guards: `AuthGuard` + `OrganizationGuard` (modules/auth/ui/components).
- `users.ts` `add` mutation has intentional `throw new Error("Tracking Test")` — demo breakage, remove before go-live (listed in production doc).
- Pre-existing typecheck errors in apps/web (zod ^4.4.3 vs @hookform/resolvers ^5.4.0 type mismatch in form files, resizable `direction` prop, etc.). Backend (`packages/backend` `pnpm typecheck`) is clean. Don't confuse these with new breakage.
- Env: dev Clerk instance `witty-dassie` (pk_test keys), Convex dev deployment `terrific-dodo-54`. `CLERK_JWT_ISSUER_DOMAIN` set in packages/backend/.env.local.

## Schema notes
- `plugins.organizationId` required; `secrets.organizationId` optional (legacy); `widgetSettings.organizationId` optional.
- Conversations link to org only via `contactSessions.organizationId`.

## Open issues (investigating)
1. Widget: cannot establish conversation — tracing widget chat flow (contactSessions.create → conversations.create → messages.create → AI response action).
2. Customization save button error — suspect zodResolver zod v3/v4 mismatch at runtime, or mutation validation.
