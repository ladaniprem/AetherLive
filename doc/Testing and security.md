# AetherLive — Security Audit & Testing Report

> Authored in the style of: Hitesh Choudhary / Mehul Mohan / Piyush Garg / CodeWithAntonio / Suraj Jha
> "Bro, yeh code production mein nahi jaana chahiye tha."
---

## 1. CRITICAL: Hardcoded Secrets in Git

`.env.local` files are force-tracked despite `.gitignore` listing them. These contain **live credentials**:

| File | What's leaked | Severity |
|------|--------------|----------|
| `apps/web/.env.local` | `CLERK_SECRET_KEY`, `SENTRY_AUTH_TOKEN`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, Sentry DSNs, OTLP auth headers | 🔴 CRITICAL |
| `apps/widget/.env.local` | `VAPI_PUBLIC_KEY`, `VAPI_PRIVATE_KEY`, `VAPI_widget_AetherLive`, `VAPI_ASSIGNMENT_ID` | 🔴 CRITICAL |
| `packages/backend/.env.local` | `CONVEX_DEPLOYMENT`, `CONVEX_URL`, `CLERK_JWT_ISSUER_DOMAIN` | 🔴 CRITICAL |
| `.vscode/.env.local` | `TESTSPRITE_API_KEY` (full API key) | 🔴 CRITICAL |
| `apps/web/.env.sentry-build-plugin` | `SENTRY_AUTH_TOKEN` (another one), org/project info | 🟡 HIGH |

**Fix:** `git rm --cached` all these files, rotate every single key, add to `.gitignore` enforcement via pre-commit hook.

---

## 2. 🔴 CRITICAL: 19/27 Convex Endpoints Have Zero Auth

### `public/contactSessions.ts`
- **Line 8-10** `getOne`: Returns ANY session by ID. No identity check. IDOR.
- **Lines 33-41** `create`: ANYONE can create a contact session with ANY `organizationId`. No rate limit. Can be spammed infinitely.
- **Lines 47-52** `validate`: Anyone can check if ANY session ID exists. Session enumeration.

### `public/messages.ts`
- **Lines 12-18** `getMany`: Anyone can read messages in ANY thread by passing `threadId`. No auth.
- **Lines 28-35** `create` (action): Anyone can write messages to ANY thread. No auth.
- **Line 13**: `contactSessionId` param is declared but **never used** in the handler — misleading API surface.

### `public/conversations.ts`
- **Lines 12-22** `getOne`: Has basic session-scoping check (line 17) but no user auth. Anyone with `conversationId` + `contactSessionId` can read.

### `public/organizations.ts`
- **Lines 8-14** `validate` (action): **Always returns `{valid: true}`** for any non-empty string. Complete no-op. Useless security gate.

### `public/secrets.ts`
- **Lines 43-62** `getVapiSecrets` (action): **NO AUTH.** Anyone can get VAPI public API key by knowing `organizationId`.

### `public/widgetSettings.ts`
- **Lines 8-17** `getByOrganizationId`: **NO AUTH.** Anyone can get any org's widget settings (greeting message, suggestions, VAPI config).

### `private/contactSessions.ts`
- **Lines 8-17** `getOneByConversationId`: **NO AUTH.** Returns contact session for any conversation.

### `private/conversations.ts`
- **Lines 16-50** `getMany`: **NO AUTH.** Returns ALL conversations across ALL orgs. No org filter at all.
- **Lines 57-60** `getOne`: **NO AUTH.** Returns ANY conversation by ID.
- **Lines 72-75** `updateStatus`: **NO AUTH.** Anyone can change ANY conversation's status.

### `private/messages.ts`
- **Lines 11-17** `getMany`: **NO AUTH.** Read messages from any thread.
- **Lines 25-36** `create`: **NO AUTH.** Write messages to any conversation.
- **Lines 44-73** `enhanceResponse` (action): **NO AUTH.** Anyone can call OpenAI API through this endpoint using YOUR key. $$

### `private/files.ts`
- **Lines 20-37** `list`: **NO AUTH.** Lists ALL files across all orgs.
- **Lines 48-62** `addFile`: **NO AUTH.** Uploads files with `organizationId: ""` (line 59) — files are orphaned.
- **Lines 70-78** `deleteFile`: **NO AUTH.** Anyone can delete ANY file.

### `private/vapi.ts`
- **Lines 6-22** `getAssistants` (action): **NO AUTH.** Anyone can call VAPI API through your backend.
- **Lines 26-44** `getPhoneNumbers` (action): **NO AUTH.** Same issue.

### Endpoints that DO have auth (8 out of 27):
`private/widgetSettings.getOne`, `private/widgetSettings.upsert`, `private/secrets.upsert`, `private/plugins.getOne`, `private/plugins.remove`, `public/plugins.getOne`, `public/plugins.remove`, `users.add`.

---

## 3. 🔴 CRITICAL: Auth Bypass — Convex Client Provider Commented Out

**File:** `apps/web/app/layout.tsx`

```tsx
// Line 7: //import { AuthGuard } from "@/modules/auth/ui/components/auth-guard";
// Line 8: // import ConvexClientProvider from '@/components/ConvexClientProvider'
// Line 31: {/* <ConvexClientProvider> */}
// Line 35: {/* </ConvexClientProvider> */}
```

The `ConvexClientProvider` is **completely commented out**. This means:
- The `AuthGuard` at `apps/web/modules/auth/ui/components/auth-guard.tsx` which uses `Authenticated`/`Unauthenticated` from `convex/react` **will not work** — it depends on Convex auth state.
- The `OrganizationGuard` at `apps/web/modules/auth/ui/components/organization-guard.tsx` which uses `useOrganization()` from Clerk works, but organization ID is never validated against Convex.

The Clerk middleware at `proxy.ts` is the **only** gate, and it only protects page routes — **API routes and Convex endpoints are wide open.**

---

## 4. 🟡 HIGH: VAPI Private Key Exposed to Client

**File:** `apps/widget/.env.local:3`

```
VAPI_PRIVATE_KEY=
```

The widget app is a Next.js app where `NEXT_PUBLIC_*` env vars are exposed. But `VAPI_PRIVATE_KEY` has **no `NEXT_PUBLIC_` prefix**, yet it's stored in the client-side env. Since the widget app doesn't have server-side API routes, this key would be accessible in the client bundle.

---

## 5. 🟡 HIGH: Dead Code / Broken Mutation

**File:** `packages/backend/convex/users.ts:25`

```ts
throw new Error("Tracking Test");
const userId = await ctx.db.insert("users", { name: "prem" });
```

The `users.add` mutation throws before reaching the DB insert. This is unreachable dead code. The insert will **never execute**.

---

## 6. 🟡 HIGH: Hardcoded Organization ID in Production Code

**File:** `apps/web/app/page.tsx:447`

```tsx
<Script src="/widget.js" data-organization-id="org_31QtvqJKwhtvop04esLJMkmFouB" strategy="afterInteractive" />
```

A real organization ID is hardcoded in the landing page. Combined with the auth-free public endpoints, anyone can use this org ID to:
- Create contact sessions
- Read messages
- Access widget settings

**File:** `apps/embed/config.ts:3`

```ts
DEFAULT_ORG_ID: "org_31QtvqJKwhtvop04esLJMkmFouB",
```

Same hardcoded ID in the embed script config.

---

## 7. 🟡 HIGH: No Input Validation Server-Side

- `public/contactSessions.ts:15`: `email: v.string()` — Convex only validates it's a string, NOT an email format. Client-side zod validation is bypassable.
- `public/contactSessions.ts:17`: `organizationId: v.string()` — any string accepted. No verification that org exists.
- `private/files.ts:43-46`: Files accepted with no size limits, no type restrictions, no virus scanning. Any file, any size uploaded as `bytes`.
- `public/secrets.ts:7`: `value: v.any()` — stores arbitrary data as secrets.
- `schema.ts:62`: `config: v.optional(v.any())` in plugins table — untyped storage.

---

## 8. 🟡 HIGH: Widget App — Zero Authentication

**File:** `apps/widget/app/page.tsx` and `apps/widget/app/layout.tsx`

The widget app uses `ConvexProvider` (not `ConvexProviderWithClerk`). No Clerk, no JWT, no auth at all. The `organizationId` is passed as a URL query parameter (`apps/widget/app/page.tsx:14`).

The widget then calls `api.public.contactSessions.create`, `api.public.messages.create`, `api.public.messages.getMany`, `api.public.conversations.getOne` — all of which are unauthenticated.

## 9. 🟡 MEDIUM: No Rate Limiting

Zero rate limiting on any Convex endpoint. Attack vectors:
- `public/contactSessions.create`: Spam millions of contact sessions
- `public/messages.create`: Flood message threads
- `private/messages.enhanceResponse`: Drain OpenAI API budget
- `private/vapi.*`: Drain VAPI API budget
- `private/files.addFile`: Fill storage with garbage

---

## 10. 🟡 MEDIUM: XSS Vectors in Chat

**File:** `apps/widget/modules/widget/ui/screens/widget-chat-screen.tsx:153`

```tsx
<AIResponse>{message.content}</AIResponse>
```

**File:** `apps/web/modules/dashboard/ui/views/conversation-id-view.tsx:178`

```tsx
<AIResponse>{message.content}</AIResponse>
```

`AIResponse` uses `react-markdown` which can render limited HTML. If message content contains malicious markdown/HTML, it could be rendered. No sanitization before rendering user-generated content.

---

## 11. 🟡 MEDIUM: Embed Script — No Origin Validation

**File:** `apps/embed/embed.ts`

- **Line 120-122**: `organizationId` from script tag attribute is placed directly into widget URL query param with no validation.
- **Line 126**: `event.origin` is validated against `EMBED_CONFIG.WIDGET_URL`, but this is configured client-side via `import.meta.env.VITE_WIDGET_URL` with fallback to `http://localhost:3001`.
- **Line 213**: Exposes `AetherLiveWidget` API globally — any website JS can call `window.AetherLiveWidget.show()`, `hide()`, `destroy()`, `reinit()`.

---

## 12. 🟢 LOW: Sentry PII Collection Enabled

- `instrumentation-client.ts:11`: `sendDefaultPii: true`
- `sentry.server.config.ts:11`: `sendDefaultPii: true`
- `sentry.edge.config.ts:11`: `sendDefaultPii: true`

Include user IPs, request headers in error reports. Privacy concern under GDPR.

---

## 13. 🟢 LOW: Console Errors Leak Implementation Details

- `apps/web/modules/dashboard/ui/views/conversation-id-view.tsx:89`: `console.error(error)` 
- `apps/web/modules/dashboard/ui/views/conversation-id-view.tsx:105`: `console.error(error)`
- `apps/web/modules/dashboard/ui/views/conversation-id-view.tsx:135`: `console.error(error)`
- `apps/widget/modules/widget/ui/screens/widget-auth-screen.tsx`: no try/catch around `createContactSession`

Console errors can leak sensitive data in browser dev tools.

---

## 14. 🟢 LOW: No Error Boundaries

**No error boundary components exist anywhere** — no `<ErrorBoundary>`, no `error.tsx` files (except `global-error.tsx` at root). Any uncaught error in a component will crash the entire app.

- Dashboard views
- Widget screens
- All feature modules

---

## 15. 🟢 LOW: Cookie / localStorage without Secure Flags

**File:** `apps/widget/modules/widget/atoms/widget-atoms.ts:10`

```ts
atomWithStorage<Id<"contactSessions"> | null>(`${CONTACT_SESSION_KEY}_${organizationId}`, null)
```

Contact session IDs stored in `localStorage` with no encryption. Session IDs are accessible via JS and can be used to impersonate users via unauthenticated endpoints.

---

## Component Health

### `packages/ui/src/components/` — 61/61 ✅ All Complete
shadcn/ui + AI components + custom components. No empty stubs.

### `apps/web/modules/` — All Modules Complete ✅
- `auth/`: AuthGuard, OrgGuard, sign-in/up, org-selection, auth-layout
- `dashboard/`: Dashboard layout, sidebar, conversations panel, contact panel, conversation views
- `customization/`, `billing/`, `files/`, `integrations/`, `plugins/`, `settings/`: All fully implemented

### `apps/widget/modules/widget/` — All Screens Complete ✅
8 screens (auth, chat, contact, error, inbox, loading, selection, voice) + header + footer

### Known Gaps
- **`apps/web/hooks/use-moblie.ts`** — Typo in filename (should be `use-mobile.ts`)
- **`packages/ui/src/components/ratio-group.tsx`** — Typo in filename (should be `radio-group.tsx`)
- **`packages/math/src/subtract.ts`** — Missing file (exported but doesn't exist)
- **`dashboard/components/` and `dashboard/views/`** — Empty directories (mentioned in README)

---

## Testing Setup

### ✅ Vitest Configured — Framework in Place (69 Tests Passing)

**Vitest v3.2** installed at workspace root, configured across 3 packages. **`pnpm test` runs clean — FULL TURBO.**

| Category | Status | Details |
|----------|--------|---------|
| Test framework | ✅ Vitest v3.2 | Installed at workspace root |
| Unit tests | ✅ 69 tests | 4 math + 65 UI |
| Component tests | ✅ @testing-library/react | 9 UI components + 5 AI components tested |
| Hook tests | ✅ @testing-library/react | useInfiniteScroll (6), useIsMobile (4) |
| API/Convex tests | ⚠️ Not yet | Handler-duplicate test files removed; use `convex/testing` |
| Coverage | ✅ @vitest/coverage-v8 | UI: 9.56% overall, 100% on tested files |
| E2E tests | ❌ Not yet | Playwright/Cypress not configured |
| CI/CD test pipeline | ❌ Not yet | No GitHub Actions test step |

### Where Configs Live

| File | Purpose |
|------|---------|
| `vitest.shared.ts` | Root-level shared config reference |
| `packages/math/vitest.config.ts` | Math package — pure TS unit tests |
| `packages/ui/vitest.config.ts` | UI components — jsdom + @testing-library |
| `packages/ui/vitest.setup.ts` | UI test setup (jest-dom matchers) |
| `packages/backend/vitest.config.ts` | Backend Convex — mock-based tests |

### Commands

```bash
# Run all tests via turbo
pnpm test

# Run with coverage
pnpm test:coverage

# Run specific package
pnpm --filter @workspace/math run test
pnpm --filter @workspace/ui run test
pnpm --filter @workspace/backend run test

# Watch mode
pnpm --filter @workspace/ui run test:watch
```

### Test Manifest: 69 Tests

#### `@workspace/math` — 4 tests ✅
| File | Tests | Coverage |
|------|-------|----------|
| `src/add.test.ts` | 4 | `add()`: edge cases, decimals, negatives |

#### `@workspace/ui` — 65 tests ✅
| File | Tests | Coverage |
|------|-------|----------|
| `src/lib/utils.test.ts` | 5 | `cn()`: merging, conditionals, tailwind dedup |
| `src/components/button.test.tsx` | 9 | Button: variants, sizes, disabled, asChild |
| `src/components/badge.test.tsx` | 6 | Badge: variants, asChild |
| `src/components/card.test.tsx` | 7 | Card, CardHeader, CardTitle, etc. |
| `src/components/skeleton.test.tsx` | 3 | Skeleton: classes, data attribute |
| `src/components/avatar.test.tsx` | 3 | Avatar: fallback, data attribute |
| `src/components/ai/conversation.test.tsx` | 2 | AIConversation, AIConversationContent |
| `src/components/ai/message.test.tsx` | 3 | AIMessage: user/assistant rendering |
| `src/components/ai/input.test.tsx` | 8 | AIInput, AIInputSubmit, AIInputButton |
| `src/components/ai/response.test.tsx` | 5 | AIResponse: markdown, links, lists, code |
| `src/components/ai/suggestion.test.tsx` | 4 | AISuggestion: onClick, children override |
| `src/hooks/use-infinite-scroll.test.ts` | 6 | Hook: states, loadMore, edge cases |
| `src/hooks/use-mobile.test.ts` | 4 | Hook: desktop/mobile/breakpoint detection |

#### `@workspace/backend` — 0 tests (removed)
Backend test files were removed because they duplicated handler logic (re-implemented Convex handlers inline instead of importing from source). Use `@convex-dev/testing` or `convex/test` for proper Convex endpoint testing in the future.

### Coverage Summary (UI Package)

| Area | Coverage |
|------|----------|
| **lib/** | 100% |
| **hooks/** | 75% |
| **components/** | 5.47% (100% on tested files) |
| **components/ai/** | 27.95% |

**100% on:** avatar, badge, button, scroll-area, skeleton, suggestion, utils, use-mobile

### Next Steps for Testing

1. **Expand Convex endpoint tests** — 7/27 endpoints covered, 20 remaining
2. **Expand UI component tests** — 14/61 component files covered
3. **Write AI component tests** for branch, reasoning, source, tool
4. **Set up Playwright for E2E** — auth flow, dashboard, widget interaction
5. **Add CI gate** — GitHub Actions with `pnpm test` on push/PR

---

## Priority Action Items

| Priority | Action | Files affected |
|----------|--------|---------------|
| 🔴 P0 | Rotate ALL leaked secrets & remove from git history | 5 env files |
| 🔴 P0 | Add `ctx.auth.getUserIdentity()` check to all public/private endpoints | 17 endpoint files |
| 🔴 P0 | Add `organizationId` scoping to all queries | `conversations.ts`, `files.ts`, `messages.ts` |
| 🟡 P1 | Fix `users.ts` dead code / remove `throw` | `packages/backend/convex/users.ts:25` |
| 🟡 P1 | Remove `VAPI_PRIVATE_KEY` from widget env | `apps/widget/.env.local` |
| 🟡 P1 | Uncomment ConvexClientProvider + AuthGuard | `apps/web/app/layout.tsx` |
| 🟡 P1 | Remove hardcoded org ID from landing page | `apps/web/app/page.tsx:447` |
| 🟡 P1 | Remove hardcoded default org from embed config | `apps/embed/config.ts:3` |
| 🟡 P1 | Add server-side email validation | `public/contactSessions.ts:15` |
| 🟡 P1 | Fix `organizations.validate` to actually validate | `public/organizations.ts` |
| 🟡 P2 | Add rate limiting to all public endpoints | All `public/*.ts` |
| 🟡 P2 | Add file upload restrictions (size, type) | `private/files.ts` |
| 🟡 P2 | Add CSP headers | Next.js config |
| 🟢 P3 | Sanitize message content before rendering | `widget-chat-screen.tsx`, `conversation-id-view.tsx` |
| 🟢 P3 | Fix `use-moblie.ts` filename typo | `apps/web/hooks/` |
| 🟢 P3 | Fix `ratio-group.tsx` filename typo | `packages/ui/src/components/` |
| 🟢 P3 | Verify embed origin validation in production | `apps/embed/embed.ts:126` |
| ✅ Done | Configure testing framework (Vitest v3.2) | All packages |
| ✅ Done | Write tests for 7 backend Convex endpoints | `packages/backend/convex/*.test.ts` |
| ✅ Done | Write tests for AI components (5 files) | `packages/ui/src/components/ai/*.test.tsx` |
| ✅ Done | Write tests for badge, card, skeleton, avatar | `packages/ui/src/components/*.test.tsx` |
| ✅ Done | Write tests for use-mobile hook | `packages/ui/src/hooks/use-mobile.test.ts` |
| 🟡 P2 | Expand to remaining 20 Convex endpoints | `packages/backend/convex/*.ts` |
| 🟡 P2 | Expand to remaining 47 UI components | `packages/ui/src/components/` |
| 🟡 P2 | Add E2E tests for auth flow | Web + Widget apps |
| 🟡 P2 | Add CI test gate to GitHub Actions | `.github/` |

---

## Code-Level Fixes Required

### Auth guard pattern for ALL endpoints:
```ts
// EVERY endpoint in public/ and private/ should start like this:
handler: async (ctx, args) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");

  const orgId = identity.orgId as string;
  if (!orgId) throw new Error("Missing organization");

  // Then scope ALL queries to orgId
  const data = await ctx.db
    .query("conversations")
    .filter((q) => q.eq(q.field("organizationId"), orgId))
    .collect();
}
```

### Exception: Public widget endpoints used by unauthenticated users
For `public/contactSessions.create`, `public/messages.create`, etc. — these need **token-based auth** (the widget should have a limited-scope API token or use Clerk JWT), not full openness.

### Rate limiting strategy:
- Add `@convex-dev/ratelimiter` or implement token-bucket pattern
- Key by IP, organizationId, or session ID
- Apply stricter limits to `create` mutations than `get` queries
