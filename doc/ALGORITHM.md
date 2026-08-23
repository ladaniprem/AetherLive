# Algorithms & Time Complexity

## Rate Limiting

### Sliding Window Counter (Convex Backend)
- **Location:** `packages/backend/convex/lib/rateLimit.ts`, `_rateLimit.ts`
- **Mechanism:** Deterministic time window (`Math.floor(now / windowMs)`). Count per key (`action:identifier`) stored in `rateLimits` table with index `by_key_and_window`.
- **Time:** O(log n) for index lookup + O(1) increment
- **Space:** O(n) where n = active rate limit entries

### In-Memory Token Bucket (Next.js Server)
- **Location:** `apps/web/lib/rateLimit.ts`
- **Mechanism:** `Map<string, { count, resetAt }>` per IP. New window on expiry, increment on request.
- **Time:** O(1) — Map get/set
- **Space:** O(n) where n = unique IPs tracked

---

## Data Storage & Retrieval

### Cursor-Based Pagination
- **Location:** `packages/backend/convex/private/conversations.ts`, `private/files.ts`, `private/messages.ts`, `public/messages.ts`
- **Mechanism:** Convex `.paginate(paginationOpts)` with opaque cursor tokens.
- **Time:** O(log n + k) — indexed query + fetch page
- **Space:** O(k) per page

### Convex Database Indexes (B-tree)
- **Location:** `packages/backend/convex/schema.ts`
- **Mechanism:** B-tree indexes on organizationId, status, contactSessionId, token, etc.
- **Time:** O(log n) lookups, O(log n) inserts
- **Space:** O(n)

---

## Security & Authentication

### CSRF Token Generation
- **Location:** `packages/backend/convex/public/csrf.ts`, `_csrf.ts`
- **Mechanism:** `crypto.randomUUID()` (v4 UUID). TTL 5 min. Expired cleanup on insert.
- **Time:** O(e + 1) where e = expired tokens cleaned
- **Space:** O(1) per token

### CSRF Token Validation
- **Location:** `packages/backend/convex/lib/csrf.ts`
- **Mechanism:** Index lookup by token, validate org + expiry, single-use delete.
- **Time:** O(log n) index lookup
- **Space:** O(1)

### JWT Validation (Clerk)
- **Location:** `packages/backend/convex/auth.config.ts`
- **Mechanism:** Clerk-signed JWT verified by Convex (signature, expiry, audience).
- **Time:** O(1) cryptographic verification

### Clerk Middleware Route Protection
- **Location:** `apps/web/proxy.ts`
- **Mechanism:** `createRouteMatcher` regex classification + `auth.protect()` redirect.
- **Time:** O(1) regex per route

---

## Text Processing

### HTML Entity Sanitization
- **Location:** `packages/backend/convex/public/contactSessions.ts`, `public/messages.ts`
- **Mechanism:** Replace `&`, `<`, `>` with `&amp;`, `&lt;`, `&gt;`.
- **Time:** O(n) per string
- **Space:** O(n)

### Email Validation
- **Location:** `packages/backend/convex/public/contactSessions.ts`
- **Pattern:** `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- **Time:** O(n) regex matching

### String Replacement (Integration Scripts)
- **Location:** `apps/web/modules/integrations/utils.ts`
- **Mechanism:** `.replace(/{{ORGANIZATION_ID}}/g, organizationId)`
- **Time:** O(n)

### Class Name Merging (`cn()`)
- **Location:** `packages/ui/src/lib/utils.ts`
- **Mechanism:** `clsx` concatenation + `twMerge` Tailwind conflict resolution.
- **Time:** O(n) where n = class inputs
- **Space:** O(n)

---

## Subscription & Billing

### Plan Hierarchy Check
- **Location:** `packages/backend/convex/lib/subscription.ts`
- **Mechanism:** `["free", "pro", "enterprise"]` — compare `indexOf()` of current vs required plan.
- **Time:** O(1) — effectively constant (max 3 plans)
- **Space:** O(1)

### Feature Gating
- **Location:** `packages/backend/convex/lib/subscription.ts`
- **Mechanism:** `Array.includes()` on plan's features array.
- **Time:** O(f) where f = features per plan (max ~10)
- **Space:** O(1)

---

## Frontend Patterns

### Infinite Scroll (IntersectionObserver)
- **Location:** `packages/ui/src/hooks/use-infinite-scroll.ts`, `apps/web/hooks/use-infinite-scroll.ts`
- **Mechanism:** Browser-native `IntersectionObserver` watching sentinel element (threshold 10%).
- **Time:** O(1) per intersection event (no polling)
- **Space:** O(1)

### Mobile Detection
- **Location:** `packages/ui/src/hooks/use-mobile.ts`, `apps/web/hooks/use-moblie.ts`
- **Mechanism:** `window.matchMedia("(max-width: 767px)")` with change listener.
- **Time:** O(1)
- **Space:** O(1)

### Jotai State Management
- **Location:** `apps/widget/modules/widget/atoms/widget-atoms.ts`
- **Mechanism:** `atomWithStorage` — localStorage-persisted atoms with dependency graph.
- **Time:** O(1) read/write per atom

---

## AI & NLP

### OpenAI GPT-4o-mini Response Enhancement
- **Location:** `packages/backend/convex/private/messages.ts`
- **Mechanism:** POST to `/v1/chat/completions` — rate limited (10 req/60s).
- **Time:** O(n) network-bound (LLM inference proportional to prompt + response length)
- **Space:** O(n)

### Convex AI Agent
- **Location:** `packages/backend/convex/convex.config.ts`, `private/messages.ts`, `public/messages.ts`
- **Mechanism:** `@convex-dev/agent` component for message threading + AI auto-reply.
- **Time:** Managed by Convex Agent component

### Vapi Voice AI
- **Location:** `apps/widget/modules/widget/hooks/use-vapi.ts`, `packages/backend/convex/private/vapi.ts`
- **Mechanism:** `@vapi-ai/web` SDK — event-driven call lifecycle + transcript accumulation.
- **Time:** O(1) init, O(n) transcript accumulation

---

## Utility

### Dicebear Avatar Generation
- **Location:** `packages/ui/src/components/dicebear-avatar.tsx`
- **Mechanism:** `createAvatar(glass, { seed, size }).toDataUri()` — deterministic SVG.
- **Time:** O(1)

### Timezone-to-Country Lookup
- **Location:** `apps/web/lib/country-utils.ts`
- **Mechanism:** `countries-and-timezones` library — map lookup.
- **Time:** O(log n)

### Sentry Tunnel Proxy
- **Location:** `apps/web/app/api/sentry-tunnel/route.ts`
- **Mechanism:** Proxy POST to Sentry `/api/{projectId}/envelope/` with 15s timeout.
- **Time:** O(1) network proxy
- **Space:** O(n) where n = envelope body size

### Arithmetic (Add)
- **Location:** `packages/math/src/add.ts`
- **Algorithm:** `const add = (a: number, b: number) => a + b`
- **Time:** O(1)
- **Space:** O(1)

---

## Complexity Summary

| Category | Typical Time | Typical Space |
|---|---|---|
| Rate Limiting (DB) | O(log n) | O(n) |
| Rate Limiting (Memory) | O(1) | O(active IPs) |
| Pagination (Cursor) | O(log n + k) | O(k) |
| Database Index Lookup | O(log n) | O(n) |
| Plan Hierarchy | O(1) | O(1) |
| Feature Gating | O(f) | O(1) |
| HTML Sanitization | O(n) | O(n) |
| CSRF Token | O(log n) | O(1) |
| Infinite Scroll | O(1) event | O(1) |
| Mobile Detection | O(1) | O(1) |
| AI / LLM | O(n) network | O(n) |
