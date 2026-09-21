# Bug Fixes — Localhost Development

## 1. Widget Customization Not Taking Effect After Save

**Symptom:** You save greetMessage/defaultSuggestions in the dashboard customization page, but the embedded widget still shows the hardcoded "Hi there! 👋".

**Root Cause:** The `greetMessage` field from `widgetSettings` was successfully saved to the Convex database and loaded into the `widgetSettingsAtom` in the widget's boot sequence. However, **3 screen components** were rendering the hardcoded string instead of reading from the atom:

| Screen | File | Before |
|--------|------|--------|
| Auth | `widget-auth-screen.tsx` | `<p>Hi there! 👋</p>` |
| Selection | `widget-selection-screen.tsx` | `<p>Hi there! 👋</p>` |
| Loading | `widget-loading-screen.tsx` | `<p>Hi there! 👋</p>` |

Note: `defaultSuggestions` **did** work — they were already wired in `widget-chat-screen.tsx`.

**Fix:**
- Added `widgetSettingsAtom` import to `widget-auth-screen.tsx`
- Replaced hardcoded greeting with `{widgetSettings?.greetMessage || "Hi there! 👋"}` in all 3 screens

**Files changed:**
```
apps/widget/modules/widget/ui/screens/widget-auth-screen.tsx
apps/widget/modules/widget/ui/screens/widget-selection-screen.tsx
apps/widget/modules/widget/ui/screens/widget-loading-screen.tsx
```

---

## 2. Organization ID / Snippet URL Broken

**Symptom:** The embed snippet generated in the dashboard integrations page had a broken script `src` — it was `localhost:3000/widget.js` (no protocol `http://` prefix, wrong port).

**Root Cause:** The embed script is served by the Vite dev server in `apps/embed` on port **3004**, built as `widget.js`. The snippet templates in `apps/web/modules/integrations/constants.ts` pointed to `localhost:3000` with no scheme:

```js
// BROKEN
export const HTML_SCRIPT = `<script src="localhost:3000/widget.js" ...>`;
```

A browser interprets `localhost` without `http://` as a relative path from the current page's origin, which is the web dashboard itself (port 3000). The web dashboard doesn't serve `widget.js`.

Additionally, port 3000 is the **Next.js web dashboard**, not the embed server. The embed dev server runs on port 3004 per `apps/embed/vite.config.ts`.

**Fix:** Changed snippet URLs to `http://localhost:3004/widget.js`:

```js
// FIXED
export const HTML_SCRIPT = `<script src="http://localhost:3004/widget.js" ...>`;
```

**File changed:**
```
apps/web/modules/integrations/constants.ts
```

---

## 3. Live Conversation Not Establishing — Iframe Blocked by Headers

**Symptom:** The widget iframe fails to load when embedded on a demo page or client site. Browser console shows "Refused to display" or the iframe is blank.

**Root Cause:** The widget Next.js app (`apps/widget/next.config.ts`) set security headers that **contradict the entire embed architecture**:

```ts
// These two headers BLOCKED all iframe embedding
{ key: "X-Frame-Options", value: "DENY" },        // blocks ALL framing
// ... CSP: frame-src 'none'                         // blocks ALL frame loads
```

The widget app is **meant to be loaded inside an iframe** on client websites. These headers prevented that.

**Fix:**
- Changed `X-Frame-Options` from `DENY` to `ALLOWALL`
- Changed CSP `frame-src` from `'none'` to `*`

**File changed:**
```
apps/widget/next.config.ts
```

---

## 4. Clerk `<SignUp/>` Renders for Already-Authenticated Users

**Symptom:** In development, accessing `/sign-up` while already signed in shows a console error:

> "The `<SignUp/>` component cannot render when a user is already signed in unless the application allows multiple sessions"

Clerk also redirects to the `afterSignUp` URL, causing confusing redirect loops.

**Root Cause:** The SignUp and SignIn page components had **no guard** against already-authenticated users. They rendered `<SignUp/>` / `<SignIn/>` unconditionally, and Clerk rejects that:

```tsx
// BROKEN — renders SignUp even when signed in
const Page = () => <SignUp routing="hash" />
```

**Fix:** Added `useUser()` to detect authentication state and `router.replace('/dashboard')` when signed in. The component returns `null` during loading and when authenticated, preventing Clerk from rendering:

```tsx
// FIXED — redirects signed-in users
const Page = () => {
  const { isSignedIn, isLoaded } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && isSignedIn) router.replace('/dashboard')
  }, [isLoaded, isSignedIn, router])

  if (!isLoaded || isSignedIn) return null
  return <SignUp routing="hash" />
}
```

**Files changed:**
```
apps/web/app/(auth)/sign-up/[[...sign-up]]/page.tsx
apps/web/app/(auth)/sign-in/[[...sign-in]]/page.tsx
```

---

## 5. Convex Runtime Error — Query Called as Action

**Symptom:** Browser console shows:

> `[CONVEX A(public/organizations:validate)] Server Error — Trying to execute public/organizations.js:validate as Action, but it is defined as Query.`

And the widget never loads past the loading screen.

**Root Cause:** Two Convex functions were defined as **queries** in the backend but called via `useAction()` in the widget client:

| Function | Defined As | Called Via |
|----------|-----------|------------|
| `public/organizations:validate` | `query` | `useAction` |
| `public/secrets:getVapiSecrets` | `query` | `useAction` |

Convex enforces at runtime that queries and actions are separate execution contexts. Calling a query through the action channel is rejected with a server error.

The widget loading screen used an imperative `useEffect + promise` pattern with `useAction`, which can't work with queries. Queries in Convex are **reactive subscriptions**, not one-shot calls.

**Fix:** Replaced `useAction` with `useQuery` for both functions. Switched to a reactive pattern where the query fires conditionally (via `"skip"` or the right args) and the `useEffect` reacts to the query result when it becomes available:

```tsx
// FIXED — uses useQuery, reactive, no runtime error
const orgValidation = useQuery(
  api.public.organizations.validate,
  step === "org" && organizationId ? { organizationId } : "skip",
);

const vapiSecrets = useQuery(
  api.public.secrets.getVapiSecrets,
  step === "vapi" && organizationId ? { organizationId } : "skip",
);
```

**File changed:**
```
apps/widget/modules/widget/ui/screens/widget-loading-screen.tsx
```

---

## Summary of All Changed Files

```
apps/widget/modules/widget/ui/screens/widget-auth-screen.tsx        # greetMessage render
apps/widget/modules/widget/ui/screens/widget-selection-screen.tsx    # greetMessage render
apps/widget/modules/widget/ui/screens/widget-loading-screen.tsx      # greetMessage + useQuery fix
apps/widget/next.config.ts                                           # iframe headers
apps/web/modules/integrations/constants.ts                           # snippet URL
apps/web/app/(auth)/sign-up/[[...sign-up]]/page.tsx                  # Clerk guard
apps/web/app/(auth)/sign-in/[[...sign-in]]/page.tsx                  # Clerk guard
```
