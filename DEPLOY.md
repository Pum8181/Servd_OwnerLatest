# Deploying Servd: two GitHub Pages repos + Netlify (servd.tech)

Three URLs, from this one working folder:

- **Customer app** → GitHub repo `ServdClient` → GitHub Pages: `https://<you>.github.io/ServdClient/`
- **Owner dashboard** → GitHub repo `ServdOwner` → GitHub Pages: `https://<you>.github.io/ServdOwner/`
- **Marketing site** → Netlify, on your real domain: `https://servd.tech`

Both `ServdClient` and `ServdOwner` are full mirrors of this entire
project (same commits, same files) — what makes them behave differently
is a single GitHub Actions workflow file
(`.github/workflows/deploy-pages.yml`) that checks **which repo it's
running in** and builds only that repo's page. You never have to
maintain two different codebases; every push here goes to both.

---

## 1. Push to both repos

From this folder:

```bash
git remote add servdclient https://github.com/Pum8181/ServdClient.git
git remote add servdowner  https://github.com/Pum8181/ServdOwner.git
git push servdclient main
git push servdowner main
```

(If you'd like Claude to run these for you instead of doing it by hand,
just say so.)

## 2. Turn on GitHub Pages — do this in BOTH repos

In each repo (`ServdClient` and `ServdOwner`) on github.com:

1. **Settings** → **Pages** (left sidebar).
2. Under "Build and deployment" → **Source**, choose **GitHub Actions**.
3. Go to the **Actions** tab — "Deploy to GitHub Pages" should already be
   running from the push in step 1. Once it's green (usually under a
   minute):
   - `ServdClient` → `https://<you>.github.io/ServdClient/` (customer menu)
   - `ServdOwner` → `https://<you>.github.io/ServdOwner/` (owner dashboard)
4. Every future `git push servdclient main` / `git push servdowner main`
   redeploys that one automatically.

## 3. Connect Netlify for servd.tech

Netlify only needs ONE of these two repos connected — since both are
full mirrors, either works identically for building the marketing site
(they contain the same `netlify.toml`). Pick `ServdClient` unless you'd
rather use `ServdOwner`.

1. [app.netlify.com](https://app.netlify.com) → **Add new site** →
   **Import an existing project** → connect GitHub → pick the repo.
2. Netlify detects `netlify.toml` and pre-fills: base directory
   `servd-v3`, build command `npm run build`, publish directory
   `servd-v3/dist`. Click **Deploy**.
3. Once live at a `*.netlify.app` URL: **Site configuration → Domain
   management → Add a domain** → enter `servd.tech`.
4. Netlify shows the DNS records to add. Two options:
   - **Easiest**: switch `servd.tech`'s nameservers (at whichever
     registrar you bought the domain from) to the two Netlify gives you.
   - **Keep current DNS**: add the A record (and optional `www` CNAME)
     Netlify shows instead, at your registrar.
5. HTTPS certificate is automatic once DNS points at Netlify — just wait
   for the padlock (usually within an hour of DNS propagating).

After this: `https://servd.tech` serves `marketing.html` (redirect in
`netlify.toml`), and `https://servd.tech/feature-sheet.html` serves the
printable feature sheet.

## 4. Keep the QR generator pointed at the right place

The owner dashboard's QR Codes tab defaults its "Menu page URL" to
whatever domain it's currently running on — since it now lives at
`https://<you>.github.io/ServdOwner/`, generating a QR there will
correctly default to `https://<you>.github.io/ServdClient/index_v3.html?table=...`
only if you type that in (the auto-default is based on the *current*
page's own origin, which is the owner repo's domain, not the customer
one — since they're two different domains now, always double-check the
"Menu page URL" field before generating a QR and paste in the
`ServdClient` Pages URL by hand).

## Updating the site after this initial setup

```bash
git add .
git commit -m "describe what changed"
git push servdclient main
git push servdowner main
```

Both pushes trigger their own repo's GitHub Actions run; Netlify
redeploys automatically from whichever repo you connected it to.
