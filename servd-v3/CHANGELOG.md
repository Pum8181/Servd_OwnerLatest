# CHANGELOG — marketing site premium rebuild

## New files

| File | Purpose |
|---|---|
| `src/marketing/tokens.css` | Refined 8-role palette (primary/primary-dark/secondary/accent/surface/muted/success/danger), fluid `clamp()` type scale, font-stack + variable-font notes. |
| `public/feature-sheet.html` | Standalone, printable one-page feature sheet (`window.print()` → Save as PDF). Plain static HTML, no JS framework, so it can't break independent of the React app. |
| `copy.md` | Full copy deck: hero headline (+2 alternates), how-it-works, features, benefit bullets, pricing, FAQ, social proof, CTAs — all placeholder content explicitly labeled. |
| `QA-report.md` | Honest QA pass: what was verified by reading code vs. what needs a real browser/Lighthouse/screen-reader session. |
| `CHANGELOG.md` | This file. |

## Modified files

| File | What changed |
|---|---|
| `src/marketing/marketing-main.jsx` | Now imports `./tokens.css` (new) alongside the shared app tokens. |
| `src/marketing/MarketingApp.jsx` | Rewritten: `MotionConfig` wrapper + reduced-motion toggle in the nav; hero visual replaced with a layered tablet+phone `DeviceMockup` (scroll-linked parallax); Calendly links converted to a real modal (`DemoModal`, iframe-embedded) instead of `target="_blank"` anchors; added `Pricing`, `SocialProof`, `Faq`/`FaqAccordion`, and `ContactForm` (Formspree-wired) sections/components; Footer links to the new feature sheet. |
| `src/marketing/marketing.css` | Rewritten to use the new `--m-*` tokens throughout; added styles for the device mockup, pricing cards, FAQ accordion, social-proof carousel, contact form, and the Calendly modal. |
| `marketing.html` | Added canonical link, Open Graph + Twitter card meta, and JSON-LD (`SoftwareApplication` + `FAQPage`) structured data. |

## Not changed (verified still correct, no rework needed)

- `src/lib/*`, `src/customer/*`, `src/owner/*` — this pass was scoped
  entirely to the marketing site per the request; the customer/owner
  apps are untouched.
- `vite.config.js` — no new entry point needed; `feature-sheet.html`
  lives in `public/` and is copied as a static asset, not built as a
  Vite/React route.

## How I built it (for a future maintainer or another AI)

The marketing page is a React component tree (`src/marketing/MarketingApp.jsx`)
rendered into `marketing.html`, one of three Vite entry points sharing this
codebase (the others are the customer and owner apps). It has its own
token file (`src/marketing/tokens.css`) layered on top of the shared
app tokens (`src/styles/tokens.css`) so it can carry a more refined,
marketing-specific palette (8 named roles, not just forest/cream) and a
fluid type scale without touching the in-app design system the
customer/owner dashboards depend on. All animation goes through `motion/react`'s
`MotionConfig`, so a single boolean (`reducedMotion` state, persisted to
localStorage, exposed as a toggle button in the nav) can force every
motion component on the page into a reduced-motion mode at once, on top
of respecting the OS-level `prefers-reduced-motion` setting by default.
The hero's device mockup is intentionally built from CSS/SVG shapes
rather than photography or video — there was no way to source, license,
and verify real stock photography or produce an actual video asset from
this environment, so the tasteful synthetic mockup is the honest
substitute. The Calendly "Book a Demo" CTA opens a modal with an iframe
pointed at the real scheduling link; the contact form POSTs to the same
Formspree endpoint the sibling Platr/Servd static site already uses.
Pricing tiers and the testimonial carousel are explicitly labeled
placeholder content in both the UI copy and this changelog, because no
restaurant has signed on and no pricing has actually been finalized as
of this writing — don't let either get published as if real.
