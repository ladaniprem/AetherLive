# Fix: Excessive Loading on /dashboard After Sign-In

## Issue

After signing in, reaching `http://localhost:3003/dashboard` involved a long multi-stage loading sequence with several full page loads.

## Root Causes

1. **Org selection redirected to the landing page** — `org-selection-view.tsx` used `afterSelectOrganizationUrl="/"` and `afterCreateOrganizationUrl="/"`, so after picking/creating an org the user was sent to the marketing homepage, then had to navigate back to `/dashboard` (a full extra page load cycle).
2. **Client-side redirect hop on the sign-in page** — `app/(auth)/sign-in/[[...sign-in]]/page.tsx` was a client component that waited for Clerk JS to load, then called `router.replace('/dashboard')` in a `useEffect`. Signed-in users hit a blank page (`return null`) while this resolved.
3. **Duplicated Clerk components on /dashboard** — `UserButton` and `OrganizationSwitcher` were rendered both in `dashboard/page.tsx` and in `dashboard-sidebar.tsx`, doubling Clerk's client-side data fetches after hydration.

## Changes

### `apps/web/modules/auth/ui/views/org-selection-view.tsx`
- `afterCreateOrganizationUrl` and `afterSelectOrganizationUrl` changed from `"/"` to `"/dashboard"` — org selection now lands directly on the dashboard.

### `apps/web/app/(auth)/sign-in/[[...sign-in]]/page.tsx`
- Converted to an **async server component**: `await auth()` redirects already-signed-in users to `/dashboard` server-side (no blank page, no client JS round-trip).
- The `<SignIn>` component now uses `fallbackRedirectUrl="/dashboard"` so Clerk handles the post-sign-in redirect natively instead of a `useEffect` + `router.replace` hop.

### `apps/web/app/(dashboard)/dashboard/page.tsx`
- Removed the duplicated `<UserButton />` and `<OrganizationSwitcher />` (both remain in the dashboard sidebar).

## Resulting flow

Sign in → Clerk redirects to `/dashboard` (one hop). If no org: middleware → `/org-selection` → select org → `/dashboard`. The detour through the landing page is gone.

## Verification

- `pnpm --filter web typecheck` passes.

## Remaining known bottlenecks (not addressed — higher risk)

- **Client-only auth chain**: `AuthGuard` (`modules/auth/ui/components/auth-guard.tsx`) renders a full-page "Loading..." until Clerk's `getToken({ template: "convex" })` round-trip and the Convex WebSocket handshake complete, because `ConvexProviderWithClerk` is mounted client-side in `components/theme-provider.tsx`. The proper fix is server-side auth via `ConvexAuthNextjsServerProvider` so the dashboard shell streams immediately.
- `/conversations` routes: N+1 in `private/conversations.getMany`, subscription overlay gates content while loading, missing `contactSessions.by_conversationId` index, and `subscriptions.by_organizationId` index bypassed by `.filter()`.
- The sign-up page uses the same client-side redirect pattern the sign-in page had; apply the same server-redirect treatment if needed.
