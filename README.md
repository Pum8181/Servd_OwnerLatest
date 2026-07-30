# QR Ordering System — Owner Setup Guide

This is a white-label QR code ordering system: one codebase, reusable for
any restaurant. This guide is written for the restaurant owner, not a
developer — it tells you exactly which files to touch and which to leave
alone.

## What this system does

- Customers scan a QR code at their table, see your menu on their phone
  (`index.html`), and place an order — no app download needed.
- You manage everything from `owner.html`: see live orders come in, update
  their status, edit an order if something changes, mark items sold out or
  apply a daily markdown, and add/edit/remove menu items — all in real time.
- All data (menu + orders) lives in a Firebase Firestore database. Both
  pages read and write to it live, so changes show up immediately without
  anyone refreshing the page.

## Files you will actually touch

| File | What it's for | Do you edit it? |
|---|---|---|
| `restaurant_config.js` | Your restaurant's name, logo, colors, currency | **Yes — start here** |
| `owner.html` → Menu Management tab | Your menu items, prices, spice options | **Yes — no code, just the on-screen form** |
| `firebase-config.js` | Connects the site to your Firebase database | **Yes, once, when first setting up** |
| `index.html` | Customer-facing menu page | No — never edit this |
| `owner.html` (the code itself) | Dashboard logic | No — never edit this |

You should never need to open the `<script>` or `<style>` sections of
`index.html` or `owner.html` to run a different restaurant on this system.

## 1. Set up Firebase (one-time, first deployment only)

This system uses **Firebase Firestore** (Google's real-time database) so
that orders and menu changes sync instantly between the customer page and
your dashboard, and it's free at this scale.

1. Create a free project at [console.firebase.google.com](https://console.firebase.google.com).
2. Enable **Firestore Database** (test mode is fine to start).
3. In Project Settings → your web app, copy the config values into
   `firebase-config.js` (replace the placeholder `firebaseConfig` object).
4. Paste the rules from `firestore-rules.txt` into Firestore's Rules tab.
   Read the warning comment at the top of that file — the default rules
   are fine for one restaurant testing this out, but should be tightened
   (via Firebase Auth) before you're relying on this for real service.

If you skip this step, the site still works in "demo mode" — it saves
everything to your browser's local storage instead, which is fine for
testing on your own phone but won't sync between devices.

## 2. Brand it — `restaurant_config.js`

Open `restaurant_config.js`. Every field has a comment explaining it:

- `name` / `tagline` — shown in the header of both pages and the browser tab.
- `logoUrl` — optional; leave `""` to show your name as text only.
- `currencySymbol` — shown in front of every price (`$`, `£`, `₹`, etc.).
- `tableCount` — just for your own reference, to know how many QR codes to print.
- `validTables` — leave as `null` unless you want the system to silently
  ignore any `?table=` value that isn't in your list.
- `theme` — your brand colors. Change `primary` and it re-colors buttons,
  headers, and badges across both pages automatically.
- `statusColors` — the color of each order status (Pending/In Progress/
  Completed/Cancelled) on your dashboard. Defaults to yellow/blue/green/red.

Save the file. No other file needs to change for a full re-brand.

## 3. Set up your menu — owner.html, "Menu Management" tab

1. Open `owner.html`, enter your PIN (see "Changing the PIN" below).
2. Go to the **Menu Management** tab.
3. Click **+ Add new item** for each dish: name, category, description,
   price, and an optional image URL.
4. **Spice levels are optional, per item.** If a dish has spice options
   (most curries do; desserts and drinks usually don't):
   - Toggle "Has spice level options?" to **Yes**.
   - Check the levels that apply (Mild / Medium / Hot / Extra Hot).
   - If a level costs extra (e.g. a special Extra Hot sauce), type the
     extra charge in its box — leave blank for +$0.00. You can also enter
     a negative number if a level should be a discount.
   - Leave it on **No** for items with no spice options — customers won't
     see any spice selector on that item at all.
5. There's a "Load starting menu" button that seeds a small demo menu so
   you can see the system working before you've entered your own dishes.
   Delete those items once your real menu is in.

Once saved, items appear on the customer page (`index.html`) immediately —
menu data is never hardcoded into that page, so you never touch its code.

## 4. Generate your table QR codes

Each QR code just needs to encode this URL, with your own table number:

```
https://<your-site>/index.html?table=5
```

Any free QR generator (e.g. qr-code-generator.com) can turn that URL into
a printable code. Make one per table, matching your `tableCount`. The
customer never sees this parameter — it's read silently and attached to
their order so you know which table it came from.

## 5. Running a shift — the four dashboard tabs

- **🔥 Live Orders** — a kanban board of everything in progress right now,
  color-coded: 🟡 Pending (just sent to kitchen), 🔵 In Progress (being
  prepared), 🟢 Completed, 🔴 Cancelled. Tap any card to open, edit, or
  advance it.
- **📋 Orders Today** — every order placed today, in one scrollable list,
  regardless of status — useful for a end-of-shift review or if a
  customer asks about an earlier order.
- **🍽️ Menu Management** — add, edit, or delete menu items (see step 3).
- **🚫 Sold Out & Markdowns** — the fast lane during a rush: flip an item
  sold out, or slide in today's markdown %, without opening full item
  editing. You'll see a "✓ Saved" flash confirming each change went through.

### Editing a live order

Tap any order card (in Live Orders or Orders Today) to open its detail
view. From there you can:

- Increase/decrease an item's quantity, or remove it entirely
- Add another item from your menu to that order
- Change an item's spice level
- Change the order's status
- Hit **Save changes** → confirm **"Save changes?"** → done

Every save is stamped with who/when internally (`edited_by_owner` +
`last_edited_timestamp`), and a "✎ edited" note appears on that order
afterward — so there's always a record that it was changed, and when.

## 6. Changing the PIN

The 4-digit PIN gating `owner.html` is a convenience lock, not real
security — anyone with the PIN and a browser can get in. It's set near the
top of `owner.html`'s script as `OWNER_PIN`. Change the value there if you
suspect it's been shared. For multi-staff or multi-location use, upgrade
to Firebase Authentication before relying on this in production.

## Deploying updates

This system is static HTML/JS/CSS — no server to run, no build step.
Deploy by uploading `index.html`, `owner.html`, `restaurant_config.js`,
`firebase-config.js`, and `firestore-rules.txt` to whatever static host
you're using (this project is set up for GitHub Pages). **After any
change, make sure it's actually uploaded to your live site** — a change
that only exists on your own computer won't show up for customers or you.
