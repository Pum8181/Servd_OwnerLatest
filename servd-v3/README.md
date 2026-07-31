# Servd — React rebuild (servd-v3)

Premium ordering system for independent restaurants: a customer-facing QR
menu, an owner dashboard with a human confirmation step before orders hit
the kitchen, and a marketing site — all one Vite + React app, three
entry points.

For the full list of what changed in the most recent pass and a QA
checklist, see [HANDOFF.md](./HANDOFF.md). For the marketing site's
premium rebuild specifically, see [copy.md](./copy.md) (copy deck),
[QA-report.md](./QA-report.md), and [CHANGELOG.md](./CHANGELOG.md).

## Pages

| Entry file | Purpose | Route in dev/build |
|---|---|---|
| `index_v3.html` | Customer menu / ordering | `/index_v3.html` |
| `owner_v3.html` | Owner dashboard | `/owner_v3.html` |
| `marketing.html` | Marketing / demo-booking site | `/marketing.html` |
| `public/feature-sheet.html` | Printable one-page feature sheet (static, not a React route) | `/feature-sheet.html` |

## Backend

Real Firebase project (Firestore + Storage), the same one used by the
legacy `index-v2.html` / `owner-v2.html` pages one directory up — config
lives in `src/lib/firebase.js`. There is no separate demo/mock mode: this
app always talks to the live project.

**Firestore rules**: see `../firestore-rules.txt` at the repo root — paste
that into Firebase Console → Firestore Database → Rules → Publish before
first use, or `staff`/`menu`/`orders` writes will fail with
permission-denied errors.

## Local run

```bash
npm install
npm run dev -- --host   # --host exposes it on your LAN for phone/tablet testing
```

Vite will print a `Local` and `Network` URL. On the same Wi-Fi, open the
`Network` URL from a phone to test the customer menu and QR flow for real.

```bash
npm run build      # outputs dist/index_v3.html, dist/owner_v3.html, dist/marketing.html
npm run preview    # serve the production build locally
```

## Deployment: three URLs from one working folder

`marketing.html` goes to **Netlify** at the real domain (servd.tech).
`index_v3.html` and `owner_v3.html` each go to their own **GitHub
Pages** repo (`Servd_Customer_Latest` and `Servd_OwnerLatest`), free. See
[DEPLOY.md](../DEPLOY.md) at the repo root for the full step-by-step
(push to both repos, enable Pages in each, connect Netlify, add the
custom domain, DNS) — this section is just the reference summary.

- **GitHub Pages** is pre-configured via
  `../.github/workflows/deploy-pages.yml` — the *same* workflow file is
  pushed to both `Servd_Customer_Latest` and `Servd_OwnerLatest`; it detects which repo
  it's running in (by name) and builds only that repo's page, with
  `BASE_PATH` set to `/<repo-name>/` (GitHub Pages project sites serve
  from a subpath, not the domain root) via `vite.config.js`'s
  `BUILD_TARGET`/`BASE_PATH` env vars. Runs automatically on every push
  to `main` once Pages is enabled in each repo's Settings (see DEPLOY.md).
- **Netlify** is pre-configured via `../netlify.toml`: base directory
  `servd-v3`, build command `npm run build`, publish directory
  `servd-v3/dist`, and a redirect so `servd.tech/` serves `marketing.html`
  instead of a 404. Connect either repo to Netlify (they're mirrors) —
  it picks this up automatically, nothing to type in by hand.
- The QR generator (owner dashboard → QR Codes tab) defaults to
  `window.location.origin + "/index_v3.html"` — once deployed, that
  automatically becomes the real GitHub Pages URL. You can also type a
  custom URL there before generating, if you ever move the app to a
  custom domain too.

## Demoing the QR → table flow locally

1. Run the dev server with `--host` (see above) so it's reachable from a
   phone on the same network.
2. Open `owner_v3.html` on your laptop → QR Codes tab → enter a table
   number → Generate.
3. Either scan the generated code with a phone camera, or just open the
   printed URL directly — it'll be `.../index_v3.html?table=5` (or
   whatever table you entered).
4. The customer menu opens with that table pre-attached; place an order.
5. Back in the owner dashboard's Live Orders tab, the order appears in
   **Needs Review** — approve it and watch it move to **In Kitchen**.

## Demoing owner ↔ customer tag sync

1. Owner dashboard → Menu Management → click any tag chip (Chef's
   Specials, Trending, Today's Discounts, Best Sellers) on an item to
   toggle it — this writes straight to Firestore, no save button needed.
2. Open the customer menu in another tab/window — the Featured or Best
   Sellers carousel updates within a second or two (live Firestore
   listener, not a page reload).

## Known limitations (demo-grade, documented on purpose)

- Staff PINs are stored and compared in plain text — fine for a single
  pilot restaurant behind a private link, not for real multi-tenant auth.
  See the comment in `src/lib/staff.js`.
- Firestore security rules are currently `allow read, write: if true` —
  a convenience gate for one restaurant's pilot, not real access control.
- Demo menu photos are real stock photography (LoremFlickr, keyword-
  matched), not photos of the actual dishes — swap them any time via
  Menu Management's photo upload.
- `marketing.html`'s Open Graph tags point at `/og-image.png`, which
  doesn't exist yet — add a real 1200×630 share-card image to `public/`
  before relying on link previews on social/Slack/iMessage.
- The marketing page's Pricing and testimonial sections are explicitly
  labeled placeholder content (see `copy.md`) — no pricing is finalized
  and no restaurant has signed on as of this writing.
