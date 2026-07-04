# AetherLive

AI-native customer support platform — monorepo with a Next.js web dashboard, an embeddable widget, and a Convex backend.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16 (App Router) |
| Backend | Convex (serverless DB + realtime) |
| Auth | Clerk (JWT → Convex) |
| UI | shadcn/ui + Tailwind CSS + Radix UI |
| Monorepo | Turborepo + pnpm workspaces |
| Observability | Sentry (tunnel + Session Replay) |

## Monorepo Structure

```
AetherLive/
├── apps/
│   ├── web/              # Main dashboard app (port 3000)
│   └── widget/           # Embeddable support widget (port 3001)
├── packages/
│   ├── backend/          # Convex backend (schema, mutations, queries)
│   ├── ui/               # Shared shadcn/ui component library
│   ├── math/             # Shared utility (add/subtract)
│   ├── typescript-config/ # Shared TS configs (base, nextjs, react-library)
│   └── eslint-config/    # Shared ESLint configs (base, next-js, react-internal)
├── scripts/              # Setup automation (Sentry monitors, etc.)
├── doc/                  # Migration notes
└── turbo.json            # Turborepo pipeline config
```

## Architecture Flow

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────────┐
│   Browser       │────────▶│   Next.js (Web)  │◀───────│   Convex Backend    │
│                 │         │  Clerk + Sentry  │         │  (users table)      │
└─────────────────┘         └───────┬──────────┘         └─────────────────────┘
                                     │
                              ┌──────┴──────┐
                              │  Widget App │  (standalone client, no Clerk)
                              │  port 3001  │
                              └─────────────┘
```

## Auth Flow

The app uses **two layers of authentication**:

1. **Clerk Middleware** (`apps/web/proxy.ts`)
   - Intercepts all requests except `/sign-in`, `/sign-up`, `/api/sentry-tunnel`, `/api/health`
   - Redirects unauthenticated users to Clerk sign-in
   - Redirects authenticated users without an org to `/org-selection`

2. **AuthGuard Component** (`modules/auth/ui/components/auth-guard.tsx`)
   - Client-side guard in the dashboard layout
   - Validates Convex session alongside Clerk

3. **OrganizationGuard** (`modules/auth/ui/components/organization-guard.tsx`)
   - Ensures user has selected an organization before accessing dashboard

### Auth Routes

| Path | Purpose |
|------|---------|
| `/sign-in` | Clerk-managed sign-in (catch-all intercepting route) |
| `/sign-up` | Clerk-managed sign-up (catch-all intercepting route) |
| `/org-selection` | User picks/creates an organization |

### Organization Context

- `CLERK_JWT_ISSUER_DOMAIN` — Clerk frontend API URL (env var used by both Clerk and Convex auth config)
- Clerk JWT includes `orgId` claim, extracted in `users.add` mutation

## Backend (Convex)

### Location
`packages/backend/convex/`

### Schema (`schema.ts`)
```ts
users: {
  name: v.string()
}
```

### Public Mutations/Queries (`users.ts`)
| Function | Type | Description |
|----------|------|-------------|
| `users.getMany` | query | Returns all users from DB |
| `users.add` | mutation | Throws `"Tracking Test"` (incomplete — DB insert unreachable) |

### Auth Config (`auth.config.ts`)
- Provider: Clerk via `CLERK_JWT_ISSUER_DOMAIN` env var
- Application ID: `"convex"`

## Frontend Apps

### Web App (`apps/web`)

**Port:** 3000

| Route | Component | Notes |
|-------|-----------|-------|
| `/` | Dashboard page | `UserButton`, `OrganizationSwitcher`, test mutation |
| `/sign-in` | Sign-in view | Clerk-managed |
| `/sign-up` | Sign-up view | Clerk-managed |
| `/org-selection` | Org selection view | Post-auth flow |
| `/api/health` | Health check | Returns 200 OK |
| `/api/sentry-tunnel` | Sentry tunnel | OTLP ingestion for Next.js |

**Key features:**
- Clerk provider with Convex integration (`ConvexProviderWithClerk`)
- Resizable panel components from shared UI (`@workspace/ui/components/resizable-panels`)
- Conversations layout (`modules/dashboard/layouts/conversations-layout.tsx`) — missing `ConversationsPanel` component

### Widget App (`apps/widget`)

**Port:** 3001

- Standalone Next.js app, **no Clerk auth**
- Uses plain `ConvexProvider`
- Queries `users.getMany` and triggers `users.add` mutation
- Shares `@workspace/ui` and `@workspace/backend` packages

## Shared UI Library (`packages/ui`)

Current components:
- `Button` — CVA variants (default, destructive, outline, secondary, ghost, link) + sizes
- `Input` — styled `<input>` with form integration
- `ResizablePanelGroup`, `ResizablePanel`, `ResizableHandle` — used in dashboard layout (exported from UI package)

Utility: `cn()` from `clsx` + `tailwind-merge`

## Observability

### Sentry
- **Tunnel route:** `/api/sentry-tunnel` (server-side OTLP proxy)
- **Client init:** `instrumentation-client.ts` — includes Session Replay, `onRouterTransitionStart`
- **Server init:** `instrumentation.ts` — registers `onRequestError`
- **Setup script:** `pnpm run setup:monitors` creates Sentry uptime monitors

### Why the tunnel?
Next.js Turbopack does not automatically inject the built-in Sentry tunnel, so a manual `route.ts` handler at `/api/sentry-tunnel` is required to proxy telemetry.

## Development Setup

```bash
# Install dependencies
pnpm install

# Run all apps in dev mode
pnpm dev

# Lint
pnpm lint

# Typecheck
pnpm typecheck

# Build
pnpm build

# Create Sentry monitors
pnpm run setup:monitors
```

### Required Environment Variables

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
CLERK_JWT_ISSUER_DOMAIN=...

# Convex
NEXT_PUBLIC_CONVEX_URL=...

# Sentry
SENTRY_DSN=...
SENTRY_AUTH_TOKEN=...  # for setup:monitors script
```

## Known Issues / Gaps

| # | Issue | Location |
|---|-------|----------|
| 1 | `ConversationsPanel` component missing — imports from empty directory | `modules/dashboard/layouts/conversations-layout.tsx` |
| 2 | `dashboard/components/` and `dashboard/views/` are empty | `apps/web/modules/dashboard/` |
| 3 | `users.add` mutation throws before DB insert — non-functional | `packages/backend/convex/users.ts:25` |
| 4 | `subtract` exported in math package but `src/subtract.ts` missing | `packages/math/` |
| 5 | Auth layering (middleware + guard + page) could cause redirect loops | `proxy.ts`, `auth-guard.tsx`, `(auth)/` routes |
| 6 | Migration doc describes `/monitoring` route, but code uses `/api/sentry-tunnel` | `doc/glitchtip-to-sentry-migration.md` vs `next.config.ts` |
| 7 | `use-moblie.ts` filename typo | `apps/web/hooks/use-moblie.ts` |

## Adding UI Components

```bash
pnpm dlx shadcn@latest add button -c apps/web
```

Components are placed in `packages/ui/src/components/` and imported as:

```tsx
import { Button } from "@workspace/ui/components/button";
```
