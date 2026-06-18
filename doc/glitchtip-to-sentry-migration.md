# GlitchTip → Sentry Migration Record

> **Date:** 2026-06-18  
> **Author:** Antigravity (AI assistant)  
> **Project:** AetherLive (AI-Customer-Support)

---

## Why We Migrated

The project was originally wired to **GlitchTip** (an open-source Sentry-compatible error tracker hosted at `app.glitchtip.com`).  
We migrated to **Sentry.io** (the official SaaS platform) because GlitchTip and Sentry share the exact same SDK — only the DSN host and `sentryUrl` differ, making the switch a clean, low-risk change.

---

## What the Old GlitchTip Setup Looked Like

### DSN (hard-coded)
```
https://02cb8f8361b24d65a90ce7749a7665a3@app.glitchtip.com/24553
```

### Files That Referenced GlitchTip

| File | What it did |
|---|---|
| `apps/web/instrumentation-client.ts` | Initialised Sentry SDK on the browser with hard-coded GlitchTip DSN |
| `apps/web/sentry.server.config.ts` | Initialised Sentry SDK on the Next.js server with hard-coded GlitchTip DSN |
| `apps/web/sentry.edge.config.ts` | Initialised Sentry SDK for Edge runtime with hard-coded GlitchTip DSN |
| `apps/web/next.config.ts` | Used `sentryUrl: "https://app.glitchtip.com"` to upload source maps to GlitchTip |
| `apps/web/proxy.ts` | Whitelisted `/api/glitchtip-tunnel` as a public Clerk route |
| `apps/web/app/api/glitchtip-tunnel/route.ts` | Tunnel endpoint that proxied Sentry SDK envelopes to GlitchTip |
| `apps/web/app/api/health/route.ts` | Health check endpoint (comments referenced GlitchTip) |
| `scripts/setup-glitchtip-monitors.mjs` | Script to create uptime monitors in GlitchTip |
| `package.json` | `setup:monitors` script pointed to `setup-glitchtip-monitors.mjs` |
| `.env.sentry-build-plugin` | Comments and URL references pointed to `app.glitchtip.com` |
| `.env.local` | Had old/stale SENTRY_AUTH_TOKEN comment block |

---

## Original GlitchTip Code Snapshots

### `instrumentation-client.ts` (original)
```typescript
// GlitchTip uses the Sentry SDK — see: https://glitchtip.com/documentation
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://02cb8f8361b24d65a90ce7749a7665a3@app.glitchtip.com/24553",
  tracesSampleRate: 0.01,
  tunnel: "/api/glitchtip-tunnel",
});
```

### `sentry.server.config.ts` (original)
```typescript
// GlitchTip uses the Sentry SDK — see: https://glitchtip.com/documentation
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://02cb8f8361b24d65a90ce7749a7665a3@app.glitchtip.com/24553",
  tracesSampleRate: 0.01,
});
```

### `sentry.edge.config.ts` (original)
```typescript
// GlitchTip uses the Sentry SDK — see: https://glitchtip.com/documentation
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://02cb8f8361b24d65a90ce7749a7665a3@app.glitchtip.com/24553",
  tracesSampleRate: 0.01,
});
```

### `next.config.ts` (original)
```typescript
export default withSentryConfig(nextConfig, {
  // GlitchTip source map upload configuration
  authToken: process.env.SENTRY_AUTH_TOKEN,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  sentryUrl: "https://app.glitchtip.com",   // ← REMOVED in migration
  silent: !process.env.CI,
});
```

### `app/api/glitchtip-tunnel/route.ts` (original full file)
```typescript
import { NextRequest, NextResponse } from "next/server";

const DSN = "https://02cb8f8361b24d65a90ce7749a7665a3@app.glitchtip.com/24553";

/**
 * GlitchTip tunnel route — proxies Sentry SDK envelope requests through
 * this server to avoid ad-blockers blocking direct calls to app.glitchtip.com.
 *
 * Referenced in instrumentation-client.ts via `tunnel: "/api/glitchtip-tunnel"`.
 */
export async function POST(req: NextRequest) {
  const dsn = new URL(DSN);
  const sentryKey = dsn.username;
  const projectId = dsn.pathname.replace("/", "");
  const upstreamUrl = `${dsn.protocol}//${dsn.host}/api/${projectId}/envelope/`;

  const body = await req.text();

  const sentryAuth = [
    "Sentry sentry_version=7",
    `sentry_key=${sentryKey}`,
    "sentry_client=sentry-tunnel/1.0",
  ].join(", ");

  const response = await fetch(upstreamUrl, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=UTF-8",
      "X-Sentry-Auth": sentryAuth,
    },
    body,
  });

  const responseText = await response.text();

  if (!response.ok) {
    const envelopeFirstLine = body.split("\n")[0];
    console.error(`[glitchtip-tunnel] GlitchTip returned ${response.status}: ${responseText}`);
    console.error(`[glitchtip-tunnel] Envelope header: ${envelopeFirstLine}`);
    console.error(`[glitchtip-tunnel] Upstream URL: ${upstreamUrl}`);
  }

  return NextResponse.json(
    { status: response.ok ? "ok" : responseText },
    { status: response.status },
  );
}
```

### `scripts/setup-glitchtip-monitors.mjs` (key parts, original)
```javascript
const GLITCHTIP_URL = "https://app.glitchtip.com";
// API endpoint: `${GLITCHTIP_URL}/api/0/organizations/${ORG}/monitors/`
// Console message: "Visit https://app.glitchtip.com to see your monitors."
```

---

## What Changed After Migration

| What changed | Old (GlitchTip) | New (Sentry) |
|---|---|---|
| DSN value | Hard-coded `app.glitchtip.com` URL | `process.env.NEXT_PUBLIC_SENTRY_DSN` / `SENTRY_DSN` |
| Tunnel route URL | `/api/glitchtip-tunnel` | `/api/sentry-tunnel` |
| Tunnel route file | `app/api/glitchtip-tunnel/route.ts` | `app/api/sentry-tunnel/route.ts` (new) |
| `sentryUrl` in next.config | `"https://app.glitchtip.com"` | Removed (SDK default is `sentry.io`) |
| Monitors script | `scripts/setup-glitchtip-monitors.mjs` | `scripts/setup-sentry-monitors.mjs` (new) |
| `package.json` script | `node scripts/setup-glitchtip-monitors.mjs` | `node scripts/setup-sentry-monitors.mjs` |
| Public Clerk route | `/api/glitchtip-tunnel` | `/api/sentry-tunnel` |
| Env vars added | — | `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_DSN` |

> **Note:** The old `app/api/glitchtip-tunnel/route.ts` and `scripts/setup-glitchtip-monitors.mjs` files are **kept** in the repo for reference but are no longer used.

---

## New Environment Variables Required

Add these to your `.env.local` (and your Vercel / hosting environment):

```env
# Sentry — get your DSN from https://sentry.io → Project Settings → Client Keys
NEXT_PUBLIC_SENTRY_DSN=https://<key>@<org>.ingest.sentry.io/<project-id>
SENTRY_DSN=https://<key>@<org>.ingest.sentry.io/<project-id>

# Auth token for source map uploads (already existed)
SENTRY_AUTH_TOKEN=<your-token>
SENTRY_ORG=aetherlive
SENTRY_PROJECT=AI-Customer-Support
```

---

## Post-Migration Checklist

- [x] Create a project in [Sentry.io](https://sentry.io) (Next.js platform)
- [x] Copy the DSN from **Project Settings → Client Keys (DSN)**
- [x] Set `NEXT_PUBLIC_SENTRY_DSN` and `SENTRY_DSN` in `.env.local`
- [x] Set the same vars in Vercel / deployment environment
- [x] Create a new Sentry Auth Token at https://sentry.io/settings/auth-tokens/
- [x] Update `SENTRY_AUTH_TOKEN` in `.env.sentry-build-plugin` and Vercel
- [ ] Run `pnpm run setup:monitors` with a public `APP_URL` to create uptime monitors
- [x] Verify errors appear in the Sentry dashboard — **Issue #128856984 confirmed** ✅
- [x] Delete the temporary `app/api/sentry-test/` folder ✅


---

## Architecture Notes

- Both GlitchTip and Sentry use **exactly the same `@sentry/nextjs` SDK** — the only difference is the DSN host and the `sentryUrl` used for source map uploads.
- The tunnel mechanism (`/api/sentry-tunnel`) works identically — it parses the DSN dynamically so no hard-coded URL is baked into the code anymore.
- `NEXT_PUBLIC_SENTRY_DSN` is exposed to the browser (needed by the client-side SDK). `SENTRY_DSN` is server-only.

---

## Phase 2 — Sentry SKILL.md Upgrades (2026-06-18)

After migrating from GlitchTip, we followed the official [Sentry Next.js SDK SKILL.md](https://skills.sentry.dev/sentry-nextjs-sdk/SKILL.md) to bring the config up to full production standards.

### Features Enabled

| Feature | Where |
|---|---|
| **Error Monitoring** | `global-error.tsx` (already existed ✅), `onRequestError` export added to `instrumentation.ts` |
| **Tracing** | Dynamic `tracesSampleRate` (100% dev / 10% prod) across all 3 runtimes |
| **Session Replay** | `replayIntegration()` + `replaysSessionSampleRate: 0.1` + `replaysOnErrorSampleRate: 1.0` |
| **Logging** | `enableLogs: true` on all 3 runtimes |
| **PII** | `sendDefaultPii: true` on all 3 runtimes |
| **Local Variables** | `includeLocalVariables: true` on server (attaches variable values to stack frames) |
| **App Router navigation** | `onRouterTransitionStart = Sentry.captureRouterTransitionStart` |
| **Wider source maps** | `widenClientFileUpload: true` in `withSentryConfig` |
| **Built-in tunnel** | `tunnelRoute: "/monitoring"` — replaces manual `/api/sentry-tunnel` route |

### What the Built-in `tunnelRoute` Means

Previously we had a hand-rolled `/api/sentry-tunnel/route.ts` file.
`tunnelRoute: "/monitoring"` in `next.config.ts` tells `withSentryConfig` to **auto-generate** the tunnel API route at `/monitoring` during `next build`. The manual `app/api/sentry-tunnel/route.ts` file is now redundant (kept for reference).

### Files Changed in Phase 2

| File | Change |
|---|---|
| `instrumentation-client.ts` | Added `sendDefaultPii`, dynamic rate, Session Replay, `enableLogs`, `onRouterTransitionStart`; removed manual `tunnel` |
| `sentry.server.config.ts` | Added `sendDefaultPii`, dynamic rate, `includeLocalVariables`, `enableLogs` |
| `sentry.edge.config.ts` | Added `sendDefaultPii`, dynamic rate, `enableLogs` |
| `instrumentation.ts` | Added `export { onRequestError } from "@sentry/nextjs"` |
| `next.config.ts` | Added `widenClientFileUpload: true`, `tunnelRoute: "/monitoring"` |
| `proxy.ts` | Replaced `/api/sentry-tunnel` → `/monitoring` in public routes & matcher |
