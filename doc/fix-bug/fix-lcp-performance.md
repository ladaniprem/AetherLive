# Fix: Poor Largest Contentful Paint (LCP 5.73s) on Landing Page

## Issue

Lighthouse reported a poor local LCP of **5.73s** on the landing page (`apps/web`), with the LCP element being the hero description `<p>`.

## Root Causes

1. **Hero section was a client component** (`"use client"` in `components/landing/hero.tsx`). The LCP `<p>` and the whole hero were gated behind hydration, and the dashboard image only rendered after a `mounted` state flip plus `useTheme()` resolution — adding main-thread work during the critical load window.
2. **DotGrid canvas animation started immediately on mount** — a perpetual `requestAnimationFrame` loop drawing hundreds of dots, competing with the initial paint.

## Changes

### `apps/web/components/landing/hero.tsx`
- Converted to a **server component** — removed `"use client"`, `useTheme`, and the `mounted` state. The hero text (including the LCP `<p>`) now renders directly in the server HTML with zero hydration dependency.
- Theme-aware dashboard image is now handled with CSS instead of JS: both light and dark images render server-side, toggled via `dark:hidden` / `hidden dark:block` (dark mode is class-based via next-themes). Both use `absolute inset-0` inside the aspect-ratio container; the dark variant is `aria-hidden` with empty alt. Added `decoding="async"`.

### `apps/web/components/landing/dot-grid.tsx`
- Animation start is deferred with `requestIdleCallback` (`setTimeout` fallback) so the canvas rAF loop no longer competes with the LCP paint. Cleanup cancels the idle callback/timeout as well.

## Verification

- `pnpm --filter web typecheck` passes.
- Re-run Lighthouse on the landing page; LCP should drop significantly. Remaining potential wins (not done, higher risk): moving `ClerkProvider` out of the root layout or using Clerk dynamic loading, and auditing the render-blocking `@workspace/ui/globals.css` size.
