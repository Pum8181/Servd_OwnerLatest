# Deploying Servd: two GitHub Pages repos + Netlify (servd.tech)

Three URLs, from this one working folder:

- **Customer app** → GitHub repo `Servd-Customer` → GitHub Pages: `https://<you>.github.io/Servd-Customer/`
- **Owner dashboard** → GitHub repo `Servd-Main` → GitHub Pages: `https://<you>.github.io/Servd-Main/`
- **Marketing site** → Netlify, on your real domain: `https://servd.tech`

Both `Servd-Customer` and `Servd-Main` are full mirrors of this entire
project (same commits, same files) — what makes them behave differently
is a single GitHub Actions workflow file
(`.github/workflows/deploy-pages.yml`) that checks **which repo it's
running in** and builds only that repo's page. You never have to
maintain two different codebases; every push here goes to both.

The workflow publishes to a `gh-pages` branch (the classic, most
reliable GitHub Pages method) rather than GitHub's newer "Actions-native"
Pages integration — that one repeatedly got stuck serving the raw repo
tree instead of the actual build, which is what caused the earlier
`ServdClient`/`ServdOwner` repos to keep showing the wrong content.
Publishing to a real branch and pointing Pages at "Deploy from a branch"
sidesteps that entirely.

---

## 1. Push to both repos

Already done as of this setup — both remotes are configured
(`servdcustomer`, `servdmain`) and pushed. For future reference:

```bash
git remote add servdcustomer https://github.com/Pum8181/Servd-Customer.git
git remote add servdmain     https://github.com/Pum8181/Servd-Main.git
git push servdcustomer main
git push servdmain main
```

## 2. Turn on GitHub Pages — do this in BOTH repos

The first push already triggered the workflow, which creates a
`gh-pages` branch in each repo (containing only the built site, not the
source code). Once that first run finishes (check the **Actions** tab —
"Deploy to GitHub Pages" should show green):

In each repo (`Servd-Customer` and `Servd-Main`) on github.com:

1. **Settings** → **Pages** (left sidebar).
2. Under "Build and deployment" → **Source**, choose **"Deploy from a
   branch"** (NOT "GitHub Actions" this time).
3. **Branch**: select `gh-pages`, folder `/ (root)` → **Save**.
4. Wait a minute, then:
   - `Servd-Customer` → `https://<you>.github.io/Servd-Customer/` (customer menu)
   - `Servd-Main` → `https://<you>.github.io/Servd-Main/` (owner dashboard)
5. Every future `git push servdcustomer main` / `git push servdmain main`
   rebuilds `gh-pages` automatically, and Pages picks up the change
   within a minute or two — no need to touch the Source setting again.

## 3. Connect Netlify for servd.tech

Netlify only needs ONE of these two repos connected — since both are
full mirrors, either works identically for building the marketing site
(they contain the same `netlify.toml`). Pick `Servd-Customer` unless
you'd rather use `Servd-Main`.

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

## 4. Get found on Google (do this once servd.tech is live)

Technical SEO (meta tags, `robots.txt`, `sitemap.xml`, structured data)
is already built into `marketing.html` and `public/` — nothing more to
code. What's left needs your own Google account, so I can't do it:

1. **[Google Search Console](https://search.google.com/search-console)**
   → Add property → `servd.tech` → verify via the DNS TXT record method
   (Netlify's domain settings let you add custom DNS records for this).
   Once verified, submit `https://servd.tech/sitemap.xml` under
   Sitemaps — this is what actually gets you indexed quickly instead of
   waiting for Google to stumble onto the site on its own.
2. **[Google Business Profile](https://business.google.com)** — if
   Servd itself (not a restaurant) has a business address/contact, a
   profile here helps it show up for local/brand searches and is one of
   the fastest ways a brand-new domain gets any search visibility at all.
3. **Bing Webmaster Tools** (bing.com/webmasters) — same idea as Search
   Console, takes five minutes, and Bing can actually import your
   Google Search Console verification directly.
4. **Realistic expectation**: a brand-new domain with no backlinks will
   NOT rank on page 1 for broad terms like "restaurant software" or
   "QR ordering" — those are owned by Toast, Square, and TouchBistro,
   who've had years and thousands of backlinks. What this setup does get
   you: properly indexed within days instead of weeks, correct rich
   results (the FAQ can show expandable Q&As directly in Google search
   results), and a real shot at ranking for specific/long-tail searches
   ("QR ordering with order confirmation," "restaurant ordering no
   commission," or just "Servd") — which is realistically how someone
   finds a brand-new product anyway.

## 5. Keep the QR generator pointed at the right place

The owner dashboard's QR Codes tab defaults its "Menu page URL" to
whatever domain it's currently running on — since it now lives at
`https://<you>.github.io/Servd-Main/`, generating a QR there will
default to that domain, not the customer app's. Since they're two
different domains, always double-check the "Menu page URL" field before
generating a QR and paste in the `Servd-Customer` Pages URL by hand
(`https://<you>.github.io/Servd-Customer/index_v3.html`).

## Updating the site after this initial setup

```bash
git add .
git commit -m "describe what changed"
git push servdcustomer main
git push servdmain main
```

Both pushes trigger their own repo's GitHub Actions run, which updates
that repo's `gh-pages` branch automatically; Netlify redeploys
automatically from whichever repo you connected it to.
