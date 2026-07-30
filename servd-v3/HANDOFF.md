# Servd v3 — Handoff

## How I built it (paste this to another AI/dev for context)

Servd is a React 19 + Vite app with three static entry points sharing one
codebase and one Firestore project (`digital-menu-7d1b3`, config in
`src/lib/firebase.js`): `index_v3.html` (customer ordering), `owner_v3.html`
(owner dashboard), and `marketing.html` (product site). All three import
shared design tokens from `src/styles/tokens.css` (forest green `#1A3626` +
cream `#F9F7F1`, Playfair Display + Inter). Firestore collections are
`menu`, `orders`, and `staff`, kept field-compatible with a pre-existing
vanilla-JS sibling app (`index-v2.html`/`owner-v2.html` one directory up) so
both can run against the same data. Animation is done with the `motion`
package (`motion/react`), not `framer-motion`. State sync between the owner
dashboard and customer app is real-time Firestore listeners
(`onSnapshot`), not localStorage or polling — when the owner tags an item
or a staff member is deleted, every open customer/owner tab updates within
about a second. Menu items carry an owner-assignable `tags` array (e.g.
`["Chef's Specials", "Trending"]`) that drives which customer-side
carousel(s) an item appears in, with a fixed priority order
(`TAG_PRIORITY` in `src/lib/menu.js`) resolving which single tag becomes
the visible badge when an item has more than one. Orders move
`pending → in_progress → completed`, with a mandatory human confirmation
step between placement and the kitchen queue (the core product
differentiator) — nothing reaches "in_progress" without a staff member
tapping Approve.

## Changed files (this pass)

| File | What changed |
|---|---|
| `src/lib/menu.js` | Added `TAG_PRIORITY`, `TAG_META`, `activeTags()` — resolves which tag is the primary badge vs. collapses into "+n". |
| `src/lib/orders.js` | `completeOrder()` now stamps `completedAt`; `subscribeOrders` maps it through — needed for auto-expiring completed orders. |
| `src/styles/tokens.css` | Added `--gold` and `--gray-muted` tokens for the Trending/Best Seller/Sold Out badge colors. |
| `src/customer/useImageFallback.js` | **New.** Shared hook: image fallback now triggers on a 4s timeout *or* `onError`, not `onError` alone — fixes hero cards getting stuck blank when a hotlinked photo hangs instead of cleanly 404ing. |
| `src/customer/components/TagBadge.jsx` | **New.** Renders the primary tag badge + a "+n" control that reveals remaining tags on tap. |
| `src/customer/components/DishCard.jsx` | Swapped the old `imgError` state + inline Sale badge for `useImageFallback` + `<TagBadge>`. |
| `src/customer/components/FeaturedCard.jsx` | Same swap, hero-card version. |
| `src/customer/customer.css` | Removed `.c-sale-badge`; added `.c-tag-badge*`/`.c-tag-more`/`.c-tag-popover` (chef/trending/discount/bestseller colors, matching the owner-side chips). |
| `src/owner/components/SettingsPanel.jsx` | Menu Management rows now show clickable tag chips (toggle without opening Edit) + a quick filter toolbar (All / each tag / Sold Out) above the list. |
| `src/owner/components/KitchenPanel.jsx` | Added a Show 10/25/All retention control and a 30-minute auto-expire sweep (`setInterval`, archives via the existing `archived` flag) for completed orders. |
| `src/owner/owner.css` | Added `.o-tag-chip*`/`.o-filter-*`/`.o-retention-*`; removed the now-unused `.o-toggle` switch (replaced by the Sold Out chip). |
| `README.md` | Rewritten: run/build/deploy instructions, Netlify notes, QR and tag-sync demo scripts. |
| `HANDOFF.md` | This file. |

### Already delivered in earlier passes (unchanged this round, listed for completeness)

- **QR generator** (`src/owner/components/QrCodesPanel.jsx`): custom
  destination URL, `?table=` param, branded forest/cream QR via
  api.qrserver.com's `color`/`bgcolor` params, live preview panel, real
  PNG download (fetch→blob→`<a download>`).
- **Staff PIN security fix** (`src/owner/components/StaffLoginOverlay.jsx`,
  `src/owner/OwnerApp.jsx`, `src/lib/staff.js`): login does a fresh
  `getDoc` at submit time (not a cached snapshot), and a live
  `subscribeStaff` listener force-logs-out an active session the instant
  the staff record is deleted or the PIN changes.
- **Marketing site** (`marketing.html` / `src/marketing/`): hero, how it
  works, feature grid, QR→table flow diagram, owner dashboard mockup,
  animated staff-approval workflow, final CTA — Motion-driven throughout.
- **Featured/Best Sellers carousels**, **image fallback base case**,
  **Kanban Live Orders layout** — from the two prior rounds; see git
  history / prior conversation for details if needed.

## Tag priority (for anyone extending this)

`TAG_PRIORITY` in `src/lib/menu.js`, highest to lowest:

1. Today's Discounts *(auto-included for any item with `discount > 0`,
   even if not manually tagged)* → badge label "Sale", terracotta
2. Chef's Specials → forest outline
3. Trending → gold
4. Best Sellers → forest fill

Sold Out is a separate, higher-priority visual state entirely — when
`available === false`, the tag badge is suppressed and only the "Sold
Out" badge shows, on both the owner chip row and the customer card.

## QA checklist

I ran the build and read through the DOM/props for each item below;
I have **not** clicked through this in a live browser this round — the
"result" column says what should happen given the code, not an observed
screenshot. Please spot-check the ⚠ items on a real device before a
client demo.

| # | Check | Result |
|---|---|---|
| 1 | Production build (`npm run build`) — all 3 entries | ✅ 474 modules, 0 errors, only the pre-existing >500kB chunk-size warning |
| 2 | Menu Management: click a tag chip toggles instantly, no modal | ✅ `toggleTag` calls `setTags()` directly on click |
| 3 | Menu Management: filter toolbar narrows the list | ✅ `matchesFilter()` + `useMemo` over `menuItems` |
| 4 | Customer card: primary badge shows highest-priority tag only | ✅ `activeTags()[0]` via `TAG_PRIORITY` |
| 5 | Customer card: 2+ tags shows "+n", tap reveals the rest | ✅ `TagBadge` popover, `stopPropagation` so it doesn't trigger Add to Cart |
| 6 | Sold Out suppresses tag badge, shows only Sold Out | ✅ `{!soldOut && <TagBadge />}` / `{soldOut && ...}` in both card types |
| 7 | Image fails to load → fork/knife fallback, never broken-image icon or placeholder text | ✅ `useImageFallback` (onError **and** 4s timeout) |
| 8 | QR: custom URL + table number → correct `?table=` link, live preview | ✅ (built prior round, unchanged) |
| 9 | Staff delete: dropdown updates instantly, deleted PIN can't log back in | ✅ (built prior round, unchanged) |
| 10 | Completed orders: capped by retention setting, Clear History works | ✅ `slice(Number(retention))` / `all` bypass, `Promise.all(archiveOrder)` |
| 11 | Completed orders auto-expire 30 min after `completedAt` | ⚠ Needs a live 30-min wait (or a manually-edited Firestore timestamp) to observe; sweep logic is a plain `setInterval`, not verified against real clock drift |
| 12 | Visual: 375 / 390 / 768 / 834 / 1024 / 1366 / 1440px widths, no horizontal scroll | ⚠ Not opened in a browser this round — the layouts reuse breakpoints already audited in prior rounds (`o-kanban-2col`, `.c-feed-grid`, `.m-*` marketing breakpoints), but the *new* chip rows and retention control are unverified at narrow widths |
| 13 | Keyboard/focus: interactive elements reachable, `aria-label`s present | ✅ spot-checked in code (chips are real `<button>`s, TagBadge popover trigger has `aria-expanded`/`aria-label`) — not tested with an actual screen reader |
| 14 | Color contrast on new badges (WCAG AA) | ⚠ Not measured with a contrast tool. Chef's Special (forest text on cream) and Sold Out (white on `--gray-muted` `#8A8F87`) are the two most likely to be borderline — worth a Lighthouse/axe pass before a client sees it |

## What's intentionally out of scope this round

- Per-item `desc` variations for hashed placeholder photos across all 19
  demo items — quality/robustness of the *loading path* was prioritized
  over swapping every photo for hand-verified stock images (would need
  visually verifying ~19 individual image URLs, out of scope for this pass).
- A literal file named `marketing_servd.html` — the marketing site was
  built as `marketing.html` inside this same Vite app (see README) rather
  than a separate static file, so it shares design tokens and Motion
  setup with the rest of the app instead of duplicating them.
