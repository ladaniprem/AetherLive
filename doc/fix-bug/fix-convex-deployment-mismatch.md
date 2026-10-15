# Fix: `Could not find public function for 'public/agent:respond'`

## Symptom
Widget chat failed at runtime with:

```
[CONVEX A(public/agent:respond)] Server Error
Could not find public function for 'public/agent:respond'. Called by client
```

Conversations/messages loaded fine, but sending a message (which triggers the AI agent) crashed.

## Root Cause
The frontend apps and the backend pointed to **two different Convex deployments**:

| Location | Deployment |
|---|---|
| `packages/backend/.env.local` (`CONVEX_URL`) | `sensible-coyote-336` (new) |
| `apps/widget/.env.local` (`NEXT_PUBLIC_CONVEX_URL`) | `terrific-dodo-542` (old) |
| `apps/web/.env.local` (`NEXT_PUBLIC_CONVEX_URL`) | `terrific-dodo-542` (old) |

`convex dev` pushed `public/agent:respond` to the new deployment, but the widget and
dashboard clients kept calling the old one, where that function was never deployed.
Older functions (conversations, messages) still worked because they existed on both.

## Fix
Updated `NEXT_PUBLIC_CONVEX_URL` in:

- `apps/widget/.env.local`
- `apps/web/.env.local`

to `https://sensible-coyote-336.convex.cloud`, matching the backend deployment.

## After applying
1. Restart both Next.js dev servers (`apps/web`, `apps/widget`) — `NEXT_PUBLIC_*` env
   changes are only picked up on restart.
2. Keep `pnpm dev` (which runs `convex dev` for `packages/backend`) running so functions
   stay pushed to `dev:sensible-coyote-336`.

## Watch out
- `AI_Credits_API_KEY` in `packages/backend/.env.local` is used by `agent:respond`. If the agent now runs but replies fail, verify this key is valid for the AI Credits API.

---

# Update: AI provider switched from Gemini to AI Credits (GPT-4o)

## Change
`packages/backend/convex/public/agent.ts` no longer calls the Gemini API. It now calls
**AI Credits** (`https://api.aicredits.in/v1`), an OpenAI-compatible gateway, using the
chat-completions endpoint with model `openai/gpt-4o`.

## Details
- Env var: `AI_Credits_API_KEY` (case-sensitive) in `packages/backend/.env.local`,
  pushed to the Convex deployment via `npx convex env set AI_Credits_API_KEY <key>`.
- Request: `POST https://api.aicredits.in/v1/chat/completions` with
  `Authorization: Bearer <key>`, body `{ model, messages, max_tokens: 500, temperature: 0.7 }`.
- The old Gemini message format (`parts: [{ text }]`, `user`/`model` roles) was replaced
  with OpenAI format (`content` string, `system`/`user`/`assistant` roles). The system
  prompt is now a proper leading `system` message instead of being injected as a user message.
- To use a cheaper model, change `MODEL` in `agent.ts` to `openai/gpt-4o-mini`.

---

# Fix: `ArgumentValidationError` on `contactSessions:validate`

## Symptom
```
[CONVEX M(public/contactSessions:validate)] Server Error
ArgumentValidationError: Found ID "..." from table `conversations`,
which does not match the table name in validator `v.id("contactSessions")`.
Path: .contactSessionId
```

## Root Cause
Side effect of the deployment switch. The widget stores `contactSessionId` in browser
localStorage (`AetherLive_contact_session_<orgId>`). The stored ID was issued by the
**old** deployment — Convex document IDs embed a table number, and table numbering
differs per deployment, so the old ID decodes as a `conversations`-table ID on the new
deployment. The loading screen kept passing it to `contactSessions:validate`, which
rejected it, and the bad value stayed in storage so the error repeated on every load.

## Fix
`apps/widget/modules/widget/ui/screens/widget-loading-screen.tsx`: when session
validation fails or returns `valid: false`, the stored `contactSessionId` is now
cleared (`setContactSessionId(null)`), so the widget proceeds to the auth screen and a
fresh session is created instead of retrying the stale ID forever.

## Immediate relief for affected browsers
Clear the localStorage key `AetherLive_contact_session_<orgId>` (DevTools → Application
→ Local Storage), or just complete the auth form once — it overwrites the stale ID.

---

# Fix: WebSocket reconnect loop (code 1000), dashboard stuck on "Loading..."

## Symptom
After sign-in, `/dashboard` never renders — the browser console shows an endless loop:

```
WebSocket reconnected at t=42.3s after disconnect due to closed with code 1000
Attempting reconnect in 4203ms
...
```

`AuthGuard` stays on its full-page "Loading..." state because Convex client auth never
completes.

## Root Cause
The project's dev deployment moved back to `terrific-dodo-542`, which lives in the
**`eu-west-1` region**, so its real hostname is
`https://terrific-dodo-542.eu-west-1.convex.cloud` (see `packages/backend/.env.local`).

| Location | Pointed at | Problem |
|---|---|---|
| `apps/web/.env.local` | `https://terrific-dodo-542.convex.cloud` | Right deployment, **missing region** — WS connects, server closes it (1000), infinite reconnect loop |
| `apps/widget/.env.local` | `https://sensible-coyote-336.convex.cloud` | Entirely different (old) deployment |

## Fix
Set in both `apps/web/.env.local` and `apps/widget/.env.local`:

```
NEXT_PUBLIC_CONVEX_URL=https://terrific-dodo-542.eu-west-1.convex.cloud
```

## After applying
Restart the Next.js dev servers — `NEXT_PUBLIC_*` changes are only picked up on restart.

## Watch out
- Always copy `CONVEX_URL` from `packages/backend/.env.local` **verbatim**, including the
  regional subdomain (`.eu-west-1.`). The bare `<name>.convex.cloud` hostname is not
  equivalent for regioned deployments.
- If Convex env vars on the deployment itself ever need changing, that is managed manually
  (Convex Dashboard / `npx convex env set`) — not from app env files.

---

# Fix: `ArgumentValidationError` crash on `contactSessions:getOne` (widget selection screen)

## Symptom
Widget crashed on the selection screen with a runtime error:

```
[CONVEX Q(public/contactSessions:getOne)] Server Error
ArgumentValidationError: Found ID "..." from table `users`,
which does not match the table name in validator `v.id("contactSessions")`.
```

## Root Cause
Another side effect of the deployment switch: the widget's stored `contactSessionId`
(localStorage) was issued by the old deployment and decodes as a `users`-table ID on the
current one. Unlike `validate` (a mutation whose rejection the UI caught), `getOne` is a
**query** — the server-side validator throw propagates through `useQuery` and crashes the
render.

## Fix (permanent, backend-side)
Stale foreign-table IDs are now treated as "missing" instead of crashing, using
`ctx.db.normalizeId(...)`:

- `packages/backend/convex/public/contactSessions.ts`
  - `getOne`: arg is now `v.string()`; unnormalizable ID → returns `null`.
  - `validate`: arg is now `v.string()`; unnormalizable ID → returns `{ valid: false }`.
- `packages/backend/convex/public/conversations.ts`
  - `getOne`: both IDs are `v.string()`; either failing to normalize → returns `null`.
  - `getMany`: `v.string()`; bad/unknown session → returns empty page
    (`{ page: [], isDone: true, continueCursor: "" }`) instead of throwing.
  - `create`: `v.string()`; unnormalizable ID → throws `Invalid contact session`
    (mutations are caught by the UI).

## Fix (widget-side)
`apps/widget/modules/widget/ui/screens/widget-selection-screen.tsx`: when
`contactSessions.getOne` resolves to `null` for a stored session ID, the stale ID is
cleared (`setContactSessionId(null)`) and the user is sent to the auth screen — both via
a `useEffect` and as a guard in `handleNewConversation`.

## After applying
Backend validator changes must be pushed — keep `convex dev` running (via `pnpm dev`).
Existing affected browsers self-heal on next load (stale ID is cleared automatically).

## Tests
`contactSessions.test.ts` `makeDb` mock now includes a passthrough `normalizeId`.
All 52 backend tests pass; typecheck passes for backend, widget, and web.

---

# Fix: `Uncaught Error: CSRF token expired` on `contactSessions:create`

## Symptom
Submitting the widget auth (name/email) form failed with
`Uncaught Error: CSRF token expired` from `public/contactSessions:create`.

## Root Cause
`packages/backend/convex/public/csrf.ts` issues tokens with a **5-minute TTL**, and
`lib/csrf.ts` makes them **single-use** (deleted after validation). The widget auth
screen generated the token once in a mount-time `useEffect`, so if the form sat open
for more than 5 minutes (or a previous attempt consumed the token), the submit failed.

## Fix
`apps/widget/modules/widget/ui/screens/widget-auth-screen.tsx`: the CSRF token is now
generated **fresh at submit time** inside `onSubmit`
(`await generateCsrfToken({ organizationId })` right before `createContactSession`).
The mount-time generation effect and the stored `csrfToken` state were removed.
Backend TTL/single-use behavior is unchanged — a fresh token per submit is always
valid and unconsumed.
