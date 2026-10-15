# Fix: CI build fails — `Provided address was not an absolute URL`

## Symptom
GitHub Actions `Pipeline → build` job failed on `pnpm build`:

```
widget:build: Error occurred prerendering page "/".
widget:build: Error: Provided address was not an absolute URL.
    at new bm (.../next-themes/dist/index.mjs...)
    at module evaluation (...)
⨯ Next.js build worker exited with code: 1 and signal: null
Failed:    widget#build
```

## Root Cause
`NEXT_PUBLIC_*` values are inlined at build time, and the CI runner has no `.env.local`
(those files are gitignored). Two consumers crash when the URL is absent:

- `apps/widget/components/theme-provider.tsx` —
  `new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL || "")`. The empty string is
  parsed as a URL during prerender and throws.
- `apps/web/components/theme-provider.tsx` — module-scope
  `throw new Error("Missing NEXT_PUBLIC_CONVEX_URL in your .env file")`.

The build only passed locally because `.env.local` supplied the value.

## Fix
`.github/workflows/pipeline.yml` — the `build` step now exports the public build-time
values, using repo secrets/vars when set and placeholder fallbacks otherwise:

```yaml
- name: Build
  run: pnpm build
  env:
    NEXT_PUBLIC_CONVEX_URL: ${{ secrets.NEXT_PUBLIC_CONVEX_URL || 'https://placeholder.convex.cloud' }}
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: ${{ secrets.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 'pk_test_placeholder' }}
    NEXT_PUBLIC_WIDGET_URL: ${{ vars.NEXT_PUBLIC_WIDGET_URL || 'https://widget.aetherlive.live' }}
```

## Verified
Reproduced by hiding `apps/web/.env.local` and `apps/widget/.env.local` then running
`pnpm build` (fails as above). Re-ran with the three vars exported (CI condition) and the
build passed: `Tasks: 4 successful, 4 total`.

## Notes
- Set the real values as repo **secrets** (`NEXT_PUBLIC_CONVEX_URL`,
  `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`) and **variable** (`NEXT_PUBLIC_WIDGET_URL`) for
  production-accurate CI builds; the placeholders only keep the validation build green.
- Deploys build on Vercel with their own env, so the CI placeholders never ship.
- The `Pipeline` workflow only triggers on `master`/`main` (push or PR) — other branches
  need a PR or `workflow_dispatch`.
- `lint`, `typecheck`, and `test` (118 tests) pass in CI without any env.
