# Fix: Copy-Button Feedback & Dashboard Microinteractions

## Issue

In "Integrate with your website" (Setup & Integrations), copy buttons gave no visual
feedback — clicking "Copy" only fired a toast, so it didn't feel like anything was
copied. A dashboard-wide scan found more missing microinteractions and dead UI.

## Changes

### New shared hook: `packages/ui/src/hooks/use-copy-to-clipboard.ts`
`useCopyToClipboard(resetDelay?)` returns `{ copied, copy }`. `copy(text)` writes to the
clipboard, flips `copied` to `true`, auto-resets after `resetDelay` ms (default 2000),
and returns success/failure. Exported via `@workspace/ui/hooks/use-copy-to-clipboard`.

### `apps/web/modules/integrations/ui/views/integrations-view.tsx`
- **Organization ID copy button**: icon swaps `CopyIcon → CheckIcon` (zoom-in animation),
  label changes to "Copied", button turns green-outlined for 2s; subtle press scale
  (`active:scale-[0.97]`). Redundant success toast removed; error toast kept.
- **Snippet copy button in the dialog**: same `CopyIcon → CheckIcon` swap, turns solid
  green while copied. Also fixed discoverability — the button was `opacity-0` until
  hover, making it invisible on touch devices; it is now always visible on small screens
  and hover/focus-revealed on `sm:` and up, and stays visible while in the copied state.
- **Integration cards (HTML/JS/Next.js/React)**: added `cursor-pointer`, `transition-all`,
  `hover:shadow-sm`, and `active:scale-[0.97]` press feedback.

### `apps/web/modules/dashboard/ui/components/conversation-status-button.tsx`
- Added optional `loading` prop: shows a spinning `Loader2Icon` in place of the status
  icon while the status mutation is in flight (previously the button just froze with no
  pending indication).

### `apps/web/modules/dashboard/ui/views/conversation-id-view.tsx`
- Removed the dead `MoreHorizontalIcon` button in the conversation header (no `onClick`,
  no menu — clicking did nothing). Header is now `justify-end` with the status button.
- Passes `loading={isUpdatingStatus}` to `ConversationStatusButton`.

### `apps/web/modules/dashboard/ui/components/contact-panel.tsx`
- `AccordionTrigger`s: added `cursor-pointer` + `hover:bg-accent/60` + `active:bg-accent/40`
  (previously a static `bg-accent` with no hover affordance).

## Notes
- `apps/widget/.../widget-contact-screen.tsx` already had a hand-rolled copied state —
  left as-is; it can migrate to the shared hook later.
- Verified: `tsc --noEmit` passes for `apps/web` and `packages/ui`; eslint shows only
  pre-existing warnings in `conversation-id-view.tsx` (`@ts-nocheck`, `any` types).
