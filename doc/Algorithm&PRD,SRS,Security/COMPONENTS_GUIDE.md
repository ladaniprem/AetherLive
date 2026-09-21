# UI Components — Complete Guide

> **ALL files in `packages/ui/src/components/`** — shadcn/ui style wrappers around Radix, Recharts, and other libraries.

---

## Table of Contents
1. [Common Patterns (MUST READ)](#1-common-patterns-must-read)
2. [Layout Components](#2-layout-components)
3. [Navigation Components](#3-navigation-components)
4. [Form / Input Components](#4-form--input-components)
5. [Data Display Components](#5-data-display-components)
6. [Feedback / Overlay Components](#6-feedback--overlay-components)
7. [AI Chat Components](#7-ai-chat-components)
8. [Utility Components](#8-utility-components)

---

## 1. Common Patterns (MUST READ)

### `cn()` utility
Used in EVERY component. Merges Tailwind classes conditionally:
```ts
import { cn } from "@workspace/ui/lib/utils"
cn("base-classes", condition && "conditional-classes", className)
```

Bases classes always come first, user's `className` last (so user can override).

### `"use client"` Directive
- **Interactive components** (Radix wrappers, React context, event handlers) = `"use client"`
- **Pure presentational** (badge, card, skeleton, table, input, textarea, pagination) = NO `"use client"` — they are Server Components

### `data-slot="..."` Attribute
Every component adds a stable CSS selector for Tailwind targeting:
```tsx
<div data-slot="accordion-trigger" />
```
This allows consumers to style with `[data-slot=accordion-trigger] {...}` without relying on fragile class names.

### `React.ComponentProps<typeof X>` — Type Pattern
All Radix wrappers use this for props typing:
```ts
// Don't manually type Radix props
// Just use:
function Accordion({ ...props }: React.ComponentProps<typeof AccordionPrimitive.Root>)
```
This auto-picks up all props from the underlying Radix primitive.

### CVA (`class-variance-authority`) — Variant Pattern
Used for components with visual variants (`button`, `badge`, `alert`, `toggle`, `navigation-menu`, `sidebar`):
```ts
const buttonVariants = cva("base-classes", {
  variants: {
    variant: { default: "...", outline: "...", ghost: "..." },
    size: { default: "...", sm: "...", lg: "..." },
  },
})
```
Export the `cva` object so other components can reuse it (e.g., `button.tsx` exports `buttonVariants`).

### Lucide Icons
Nearly every component uses icons from `lucide-react`:
```tsx
import { ChevronDownIcon, XIcon, CheckIcon } from "lucide-react"
```

### Tailwind Data-Attribute Selectors
Radix components extensively use `data-[state=*]` attributes. This project uses Tailwind's square bracket syntax:
```css
[&[data-state=open]>svg]:rotate-180    /* Child rotation when open */
data-[state=active]:bg-background       /* Active state styling */
data-[state=closed]:animate-out         /* Exit animations */
```

### Group / Peer Selectors
Used for parent-child state communication:
```css
group-data-[collapsible=icon]:size-8     /* Parent group state → child */
peer-disabled:cursor-not-allowed         /* Sibling disabled state */
group-[.is-user]:bg-primary              /* CSS class group selector */
```

### `@container` Queries
Used in `card.tsx` for responsive layout:
```css
@container/card-header                  /* Named container */
has-data-[slot=card-action]:grid-cols-[1fr_auto]  /* Child-aware grid */
```

---

## 2. Layout Components

---

### `accordion.tsx`
- **Library**: `@radix-ui/react-accordion`
- **Exports**: `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent`

```tsx
<Accordion type="single" collapsible>
  <AccordionItem value="1">
    <AccordionTrigger>Section 1</AccordionTrigger>
    <AccordionContent>Content</AccordionContent>
  </AccordionItem>
</Accordion>
```
- `type="single"` = one open at a time; `type="multiple"` = many open
- `collapsible` allows closing the open item
- Chevron rotates via `[&[data-state=open]>svg]:rotate-180`

---

### `card.tsx`
- **Library**: Native `<div>`
- **Exports**: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardAction`, `CardContent`, `CardFooter`
- **Pattern**: `CardAction` goes inside `CardHeader`. When present, header becomes a 2-column grid via `has-data-[slot=card-action]:grid-cols-[1fr_auto]`

---

### `resizable.tsx`
- **Library**: `react-resizable-panels`
- **Exports**: `ResizablePanelGroup`, `ResizablePanel`, `ResizableHandle`
- **API note**: `ResizablePrimitive.Group` and `ResizablePrimitive.Separator` (not `PanelGroup` / `PanelResizeHandle`)
- `withHandle` prop on `ResizableHandle` shows a grip icon
- Uses `::after` pseudo-element to create a wider invisible hit area for drag

---

### `scroll-area.tsx`
- **Library**: `@radix-ui/react-scroll-area`
- **Exports**: `ScrollArea`, `ScrollBar`
- `ScrollBar` accepts `orientation="vertical"` (default) or `"horizontal"`

---

### `sheet.tsx`
- **Library**: `@radix-ui/react-dialog` (same as Dialog!)
- **Exports**: `Sheet`, `SheetTrigger`, `SheetClose`, `SheetPortal`, `SheetOverlay`, `SheetContent`, `SheetHeader`, `SheetFooter`, `SheetTitle`, `SheetDescription`
- `side` prop on `SheetContent`: `"top" | "right" | "bottom" | "left"` (default `"right"`)
- Different slide animations per side: `data-[state=open]:slide-in-from-right`, etc.
- Different animation durations: close=300ms, open=500ms

---

### `sidebar.tsx`
- **Library**: Custom (composes Sheet, Tooltip, Button, etc.)
- **Exports**: `SidebarProvider`, `Sidebar`, `SidebarTrigger`, `SidebarRail`, `SidebarInset`, `SidebarInput`, `SidebarHeader`, `SidebarFooter`, `SidebarContent`, `SidebarGroup`, `SidebarGroupLabel`, `SidebarGroupAction`, `SidebarGroupContent`, `SidebarMenu`, `SidebarMenuItem`, `SidebarMenuButton`, `SidebarMenuAction`, `SidebarMenuBadge`, `SidebarMenuSkeleton`, `SidebarMenuSub`, `SidebarMenuSubItem`, `SidebarMenuSubButton`, `SidebarSeparator`, `useSidebar`
- **Most complex component in the system**
- **Modes**: `variant="sidebar" | "floating" | "inset"`, `collapsible="offcanvas" | "icon" | "none"`
- CSS variables: `--sidebar-width: 16rem`, `--sidebar-width-icon: 3rem`
- Keyboard shortcut: `Ctrl/Cmd + B`
- Persists state in a cookie (`sidebar_state`)
- `SidebarMenuButton` shows a Tooltip when collapsed to icon mode

---

### `separator.tsx`
- **Library**: `@radix-ui/react-separator`
- **Exports**: `Separator`
- Props: `orientation="horizontal" | "vertical"`, `decorative`

---

### `table.tsx`
- **Library**: Native HTML table
- **Exports**: `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableRow`, `TableHead`, `TableCell`, `TableCaption`
- `Table` wraps in a scrollable `<div>` for overflow
- `TableRow` supports `data-[state=selected]:bg-muted`
- Not a client component

---

### `tabs.tsx`
- **Library**: `@radix-ui/react-tabs`
- **Exports**: `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`

---

## 3. Navigation Components

---

### `navigation-menu.tsx`
- **Library**: `@radix-ui/react-navigation-menu`
- **Exports**: `NavigationMenu`, `NavigationMenuList`, `NavigationMenuItem`, `NavigationMenuContent`, `NavigationMenuTrigger`, `NavigationMenuLink`, `NavigationMenuIndicator`, `NavigationMenuViewport`, `navigationMenuTriggerStyle`
- `viewport` prop (default `true`): when `false`, content renders inline without a floating viewport
- Exports `navigationMenuTriggerStyle()` CVA for reuse

---

### `breadcrumb.tsx`
- **Library**: Native HTML + `@radix-ui/react-slot`
- **Exports**: `Breadcrumb`, `BreadcrumbList`, `BreadcrumbItem`, `BreadcrumbLink`, `BreadcrumbPage`, `BreadcrumbSeparator`, `BreadcrumbEllipsis`
- `BreadcrumbLink` has `asChild` for polymorphic routing (Next.js Link)
- Default separator is `<ChevronRight />`
- `aria-current="page"` on `BreadcrumbPage`

---

### `pagination.tsx`
- **Library**: Native + `buttonVariants`
- **Exports**: `Pagination`, `PaginationContent`, `PaginationLink`, `PaginationItem`, `PaginationPrevious`, `PaginationNext`, `PaginationEllipsis`
- Not a client component
- `PaginationLink` uses `buttonVariants` with conditional `outline`/`ghost`

---

### `menubar.tsx`
- **Library**: `@radix-ui/react-menubar`
- **Exports**: `Menubar`, `MenubarPortal`, `MenubarMenu`, `MenubarTrigger`, `MenubarContent`, `MenubarGroup`, `MenubarSeparator`, `MenubarLabel`, `MenubarItem`, `MenubarShortcut`, `MenubarCheckboxItem`, `MenubarRadioGroup`, `MenubarRadioItem`, `MenubarSub`, `MenubarSubTrigger`, `MenubarSubContent`
- Same pattern as `dropdown-menu.tsx` and `context-menu.tsx`

---

### `context-menu.tsx`
- **Library**: `@radix-ui/react-context-menu`
- **Exports**: Same structure as menubar + `ContextMenuCheckboxItem`, `ContextMenuRadioItem`
- `inset` prop on items for indentation
- `variant="destructive"` on items for red styling

---

### `dropdown-menu.tsx`
- **Library**: `@radix-ui/react-dropdown-menu`
- **Exports**: Same structure as context-menu
- `DropdownMenuContent` uses `sideOffset` (default 4)
- `inline` vs `destructive` variants (via CSS `data-[variant=destructive]`)

---

## 4. Form / Input Components

---

### `button.tsx`
- **Library**: `@radix-ui/react-slot` (polymorphic `asChild`)
- **Exports**: `Button`, `buttonVariants` (CVA object — IMPORTANT: reused by other components)
- **Variants**: `"default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "transparent" | "tertiary" | "warning"`
- **Sizes**: `"default" | "sm" | "lg" | "icon"`
- `asChild` prop: renders as child element instead of `<button>` (for Next.js Link, etc.)
- `has-[>svg]:px-3` — auto-adjusts padding when only an icon is inside
- Not a client component (pure presentational)

---

### `input.tsx`
- **Library**: Native `<input>`
- **Exports**: `Input`
- Not a client component
- Key classes: `field-sizing-content` (modern CSS auto-width), `file:text-foreground` (file input styling), `aria-invalid:ring-destructive/20` (validation error)
- `md:text-sm` — responsive font sizing

---

### `textarea.tsx`
- **Library**: Native `<textarea>`
- **Exports**: `Textarea`
- Not a client component
- `field-sizing-content` — auto-height resizes as you type! (modern CSS)

---

### `input-otp.tsx`
- **Library**: `input-otp`
- **Exports**: `InputOTP`, `InputOTPGroup`, `InputOTPSlot`, `InputOTPSeparator`
- **Pattern**: Uses `OTPInputContext` from the library to read slot state (`char`, `hasFakeCaret`, `isActive`)
- Fake caret animation via `animate-caret-blink` CSS class
- `InputOTPSlot` requires `index` prop

---

### `select.tsx`
- **Library**: `@radix-ui/react-select`
- **Exports**: `Select`, `SelectContent`, `SelectGroup`, `SelectItem`, `SelectLabel`, `SelectScrollDownButton`, `SelectScrollUpButton`, `SelectSeparator`, `SelectTrigger`, `SelectValue`
- `SelectTrigger` accepts `size="sm" | "default"` (default `"default"`)
- `SelectContent` accepts `position="popper"` (aligns to trigger) — default is normal dropdown
- `data-[placeholder]:text-muted-foreground` styles the placeholder differently

---

### `checkbox.tsx`
- **Library**: `@radix-ui/react-checkbox`
- **Exports**: `Checkbox`
- Indicator uses `<CheckIcon />` from lucide

---

### `switch.tsx`
- **Library**: `@radix-ui/react-switch`
- **Exports**: `Switch`
- Thumb translates via `data-[state=checked]:translate-x-[calc(100%-2px)]`

---

### `radio-group.tsx` (file named `ratio-group.tsx` — note the typo)
- **Library**: `@radix-ui/react-radio-group`
- **Exports**: `RadioGroup`, `RadioGroupItem`
- Uses `<CircleIcon />` for the radio indicator

---

### `slider.tsx`
- **Library**: `@radix-ui/react-slider`
- **Exports**: `Slider`
- Supports vertical orientation via `data-[orientation=vertical]`
- Dynamically renders thumbs based on value count

---

### `dropzone.tsx`
- **Library**: `react-dropzone`
- **Exports**: `Dropzone`, `DropzoneContent`, `DropzoneEmptyState`, `type DropzoneProps`
- Uses React Context to share dropzone state
- Auto-generates file type labels with `Intl.ListFormat`
- `DropzoneEmptyState` adapts based on `accept`, `minSize`, `maxSize`, `maxFiles`

---

### `form.tsx`
- **Library**: `react-hook-form` + `@radix-ui/react-label` + `@radix-ui/react-slot`
- **Exports**: `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormDescription`, `FormMessage`, `useFormField`
- **Pattern**: Nested React Contexts (`FormFieldContext`, `FormItemContext`) for auto-generated `aria-*` IDs
- `FormControl` uses `Slot` for polymorphic rendering (works with any input)
- `FormMessage` auto-reads error from react-hook-form state
- `FormLabel` gets `data-[error=true]:text-destructive` when field has error

```tsx
<FormField
  control={form.control}
  name="email"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Email</FormLabel>
      <FormControl>
        <Input placeholder="Email" {...field} />
      </FormControl>
      <FormDescription>Your email address.</FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>
```

---

### `label.tsx`
- **Library**: `@radix-ui/react-label`
- **Exports**: `Label`
- Handles both `peer-disabled` and `group-data-[disabled]` states

---

### `toggle.tsx`
- **Library**: `@radix-ui/react-toggle`
- **Exports**: `Toggle`, `toggleVariants` (CVA exported for reuse in ToggleGroup)
- `variant="default" | "outline"`, `size="default" | "sm" | "lg"`

---

### `toggle-group.tsx`
- **Library**: `@radix-ui/react-toggle-group`
- **Exports**: `ToggleGroup`, `ToggleGroupItem`
- Uses React Context to pass variant/size from group to items
- Border merging via `data-[variant=outline]:border-l-0 data-[variant=outline]:first:border-l`

---

## 5. Data Display Components

---

### `badge.tsx`
- **Library**: `@radix-ui/react-slot`
- **Exports**: `Badge`, `badgeVariants`
- Variants: `"default" | "secondary" | "destructive" | "outline"`
- Has `asChild` for polymorphic rendering
- Not a client component

---

### `avatar.tsx`
- **Library**: `@radix-ui/react-avatar`
- **Exports**: `Avatar`, `AvatarImage`, `AvatarFallback`

---

### `skeleton.tsx`
- **Library**: Native `<div>`
- **Exports**: `Skeleton`
- Classes: `bg-accent animate-pulse rounded-md`
- Not a client component

---

### `progress.tsx`
- **Library**: `@radix-ui/react-progress`
- **Exports**: `Progress`
- Uses inline `style={{ transform: `translateX(-${100 - (value || 0)}%)` }}` for indicator position

---

### `calendar.tsx`
- **Library**: `react-day-picker` (v10)
- **Exports**: `Calendar`, `CalendarDayButton`
- Custom `buttonVariant` prop passed to the Button component for day styling
- Uses `react-day-picker` v10's `getDefaultClassNames()` for default styles
- `month_grid` key for table styling (not `table`)
- Supports RTL via `String.raw` CSS strings
- Used with range mode: `data-[range-start]`, `data-[range-end]`, etc.

---

### `chart.tsx`
- **Library**: `recharts` (v3)
- **Exports**: `ChartContainer`, `ChartTooltip`, `ChartTooltipContent`, `ChartLegend`, `ChartLegendContent`, `ChartStyle`, `type ChartConfig`
- **Context pattern**: `ChartContext` stores config, consumed by tooltip/legend content components
- **Dynamic theme CSS**: `ChartStyle` generates a `<style>` tag with CSS custom properties per theme (light/dark)
- **ChartConfig type**: `{ [key: string]: { label, icon? } & ({ color? } | { theme: { light: string, dark: string } }) }`
- `indicator` prop: `"dot" | "line" | "dashed"`
- Tooltip type: Use `RechartsPrimitive.TooltipContentProps` (not `React.ComponentProps<typeof RechartsPrimitive.Tooltip>`)
- Legend type: Use `RechartsPrimitive.DefaultLegendContentProps`

```tsx
const config = {
  desktop: { label: "Desktop", color: "#2563eb" },
  mobile:  { label: "Mobile",  color: "#60a5fa" },
} satisfies ChartConfig

<ChartContainer config={config}>
  <BarChart data={data}>
    <XAxis dataKey="month" />
    <ChartTooltip content={<ChartTooltipContent />} />
    <Bar dataKey="desktop" fill="var(--color-desktop)" />
  </BarChart>
</ChartContainer>
```

---

### `carousel.tsx`
- **Library**: `embla-carousel-react`
- **Exports**: `Carousel`, `CarouselContent`, `CarouselItem`, `CarouselPrevious`, `CarouselNext`, `CarouselApi` (type)
- **Context pattern**: `CarouselContext` with `useCarousel()` hook
- Props: `opts` (Embla options), `plugins`, `orientation`, `setApi`
- Keyboard navigation: ArrowLeft / ArrowRight
- `aria-roledescription="carousel"` for accessibility

---

### `command.tsx`
- **Library**: `cmdk`
- **Exports**: `Command`, `CommandDialog`, `CommandInput`, `CommandList`, `CommandEmpty`, `CommandGroup`, `CommandItem`, `CommandShortcut`, `CommandSeparator`
- `CommandDialog` wraps in `Dialog` for a modal command palette
- Uses `[cmdk-*]` data attribute selectors for styling

---

### `sonner.tsx`
- **Library**: `sonner` + `next-themes`
- **Exports**: `Toaster`
- Reads theme from `next-themes` and sets CSS custom properties for light/dark
- Used once in the root layout, then call `toast()` from `sonner` anywhere

---

## 6. Feedback / Overlay Components

---

### `alert.tsx`
- **Library**: Native `<div>` + `cva`
- **Exports**: `Alert`, `AlertTitle`, `AlertDescription`
- Variants: `"default" | "destructive"`
- `role="alert"` for accessibility
- Icon-aware grid via `has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr]`

---

### `alert-dialog.tsx`
- **Library**: `@radix-ui/react-alert-dialog`
- **Exports**: `AlertDialog`, `AlertDialogPortal`, `AlertDialogOverlay`, `AlertDialogTrigger`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogFooter`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogAction`, `AlertDialogCancel`
- `AlertDialogAction` uses `buttonVariants()`, `AlertDialogCancel` uses `buttonVariants({ variant: "outline" })`
- Full screen overlay with centered content: `fixed inset-0 top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]`

---

### `dialog.tsx`
- **Library**: `@radix-ui/react-dialog`
- **Exports**: `Dialog`, `DialogTrigger`, `DialogPortal`, `DialogClose`, `DialogOverlay`, `DialogContent`, `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription`
- `showCloseButton` prop on `DialogContent` (default `true`)
- Responsive max-width: `sm:max-w-lg`

---

### `drawer.tsx`
- **Library**: `vaul`
- **Exports**: `Drawer`, `DrawerTrigger`, `DrawerPortal`, `DrawerClose`, `DrawerOverlay`, `DrawerContent`, `DrawerHeader`, `DrawerFooter`, `DrawerTitle`, `DrawerDescription`
- Vaul handles drag direction natively (no `side` prop needed)
- Drag handle shown only for bottom direction via `group-data-[vaul-drawer-direction=bottom]/drawer-content:block`
- Right drawer: `data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=right]:border-l data-[vaul-drawer-direction=right]:sm:max-w-sm`

---

### `hover-card.tsx`
- **Library**: `@radix-ui/react-hover-card`
- **Exports**: `HoverCard`, `HoverCardTrigger`, `HoverCardContent`
- Default width: `w-64`

---

### `popover.tsx`
- **Library**: `@radix-ui/react-popover`
- **Exports**: `Popover`, `PopoverTrigger`, `PopoverContent`, `PopoverAnchor`
- Default width: `w-72`

---

### `tooltip.tsx`
- **Library**: `@radix-ui/react-tooltip`
- **Exports**: `TooltipProvider`, `Tooltip`, `TooltipTrigger`, `TooltipContent`
- `TooltipProvider` sets default `delayDuration={0}` (instant show)
- `TooltipContent` includes an Arrow (`TooltipPrimitive.Arrow`)
- Animation: `animate-in fade-in-0 zoom-in-95`

```tsx
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button>Hover me</Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>Tooltip text</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

---

### `collapsible.tsx`
- **Library**: `@radix-ui/react-collapsible`
- **Exports**: `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent`
- Minimal pass-through wrapper

---

### `aspect-ratio.tsx`
- **Library**: `@radix-ui/react-aspect-ratio`
- **Exports**: `AspectRatio`
- Minimal pass-through (adds only `data-slot="aspect-ratio"`)

---

### `hint.tsx`
- **Library**: Composes `tooltip.tsx`
- **Exports**: `Hint`
- Props: `text` (required), `side` (default `"top"`), `align` (default `"center"`)
- Just a convenience wrapper around Tooltip:
```tsx
<Hint text="Help text">
  <InfoIcon />
</Hint>
```

---

## 7. AI Chat Components

---

### `ai/message.tsx`
- **Exports**: `AIMessage`, `AIMessageContent`, `AIMessageAvatar`
- `from="user" | "assistant"` — switches styling via CSS class `.is-user` / `.is-assistant`
- User messages: gradient background `from-primary to-[#0b63f3]`
- Not a client component

---

### `ai/conversation.tsx`
- **Library**: `use-stick-to-bottom`
- **Exports**: `AIConversation`, `AIConversationContent`, `AIConversationScrollButton`
- Auto-scrolls to bottom on new messages
- `AIConversationScrollButton` floats at bottom, appears when not at bottom
- `role="log"` for accessibility
- **Example**: `use-stick-to-bottom` hook auto-detects when user scrolls up and stops auto-scroll

---

### `ai/input.tsx`
- **Exports**: `AIInput`, `AIInputTextarea`, `AIInputToolbar`, `AIInputTools`, `AIInputButton`, `AIInputSubmit`, `AIInputModelSelect`, etc.
- Custom `useAutoResizeTextarea` hook adjusts height by `scrollHeight`
- Cmd/Ctrl+Enter submits
- `AIInputSubmit` shows different icons by status: SendIcon / Loader2Icon / SquareIcon / XIcon

---

### `ai/response.tsx`
- **Library**: `react-markdown` + `remark-gfm`
- **Exports**: `AIResponse`
- Custom markdown components for `ol`, `li`, `ul`, `strong`, `a`, `h1`-`h6`
- Memoized to avoid re-rendering on sibling changes

---

### `ai/tool.tsx`
- **Exports**: `AITool`, `AIToolHeader`, `AIToolContent`, `AIToolParameters`, `AIToolResult`
- Status: `"pending" | "running" | "completed" | "error"` — drives icon/color
- Collapsible for expand/collapse

---

### `ai/suggestion.tsx`
- **Exports**: `AISuggestions`, `AISuggestion`
- Horizontal scroll (pill-shaped buttons in a ScrollArea)
- `AISuggestion.onClick` receives the suggestion string

---

### `ai/reasoning.tsx`
- **Library**: `@radix-ui/react-use-controllable-state`
- **Exports**: `AIReasoning`, `AIReasoningTrigger`, `AIReasoningContent`
- Auto-opens when streaming starts, auto-closes 1s after streaming ends (one-time)
- Tracks duration with `useEffect` interval
- Composes `AIResponse` for markdown rendering of reasoning

---

### `ai/branch.tsx`
- **Exports**: `AIBranch`, `AIBranchMessages`, `AIBranchSelector`, `AIBranchPrevious`, `AIBranchNext`, `AIBranchPage`
- Circular navigation (wraps around from last to first)
- Registers branches via `useEffect` in `AIBranchMessages`
- `AIBranchSelector.from="user" | "assistant"` to distinguish message roles

---

### `ai/source.tsx`
- **Exports**: `AISources`, `AISourcesTrigger`, `AISourcesContent`, `AISource`
- Collapsible that shows "Used {count} sources"
- `AISource` is an anchor with `BookIcon`

---

## 8. Utility Components

---

### `conversation-status-icon.tsx`
- **Exports**: `ConversationStatusIcon`
- Props: `status: "unresolved" | "escalated" | "resolved"`, `className?`
- Maps status to icon + color: resolved=green, unresolved=red, escalated=yellow
- Not a client component

---

### `infinite-scroll-trigger.tsx`
- **Exports**: `InfiniteScrollTrigger`
- Props: `canLoadMore`, `isLoadingMore`, `onLoadMore`, `loadMoreText?`, `noMoreText?`
- Not a client component
- Simple conditional Button: disabled when loading or no more items

---

### `dicbear-avatar.tsx`
- **Library**: `@dicebear/core` + `@dicebear/collection`
- **Exports**: `DicebearAvatar`
- Props: `seed` (required), `size` (default 32), `imageUrl?` (override), `badgeImageUrl?`
- Uses `useMemo` to generate avatar as data URI
- `createAvatar(glass, { seed, size }).toDataUri()`

---

## Quick Reference: Most Repeated Tailwind Classes

| Pattern | Meaning | Used in |
|---------|---------|---------|
| `data-[state=open/closed]:animate-in/out` | Radix mount/unmount animations | dialog, sheet, dropdown, popover, tooltip, etc. |
| `focus-visible:ring-ring/50 focus-visible:ring-[3px]` | Focus ring style | button, input, slider, toggle, etc. |
| `bg-background text-foreground border-border` | Theme-aware defaults | Nearly every component |
| `hover:bg-muted hover:text-muted-foreground` | Hover state | button variants, menu items |
| `data-[disabled]:opacity-50` | Disabled state | many Radix wrappers |
| `has-[>svg]:px-3` / `has-[>svg]:grid-cols-[...]` | Child-aware styling | button, alert, card |
| `peer-disabled:cursor-not-allowed peer-disabled:opacity-50` | Label for disabled input | label |
| `group-data-[...]:property` | Parent-group-aware styling | sidebar, drawer |
| `data-[orientation=vertical/horizontal]:property` | Orientation-aware styling | separator, slider, scroll-area, resizable |
| `[&_svg:not([class*='size-'])]:size-4` | Default SVG size (unless already sized) | button, breadcrumb |
| `md:text-sm` | Smaller text on desktop | input, textarea |
| `tabular-nums` | Monospaced numbers (for tables/charts) | chart, badge |
| `data-[variant=destructive]:text-destructive` | Destructive variant | menu items, alert |
