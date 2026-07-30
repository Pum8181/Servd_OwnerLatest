import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

// Each GitHub Pages repo (ServdClient, ServdOwner) publishes just ONE
// of these pages, not all three — set via BUILD_TARGET so the same
// vite.config.js works for local dev, Netlify (all three), and both
// single-page GitHub Pages builds without duplicating this file.
const ALL_ENTRIES = {
  customer: resolve(__dirname, 'index_v3.html'),
  owner: resolve(__dirname, 'owner_v3.html'),
  marketing: resolve(__dirname, 'marketing.html'),
}

const target = process.env.BUILD_TARGET; // "customer" | "owner" | unset (= build all three)
const entryInput = target && ALL_ENTRIES[target]
  ? { [target]: ALL_ENTRIES[target] }
  : ALL_ENTRIES;

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages project sites are served from
  // https://<user>.github.io/<repo>/ — a subpath, not the domain root —
  // so every asset URL needs that "/<repo>/" prefix or the page loads
  // with 404'd JS/CSS. Netlify (marketing.html at servd.tech) serves
  // from the real domain root, so it must NOT get that prefix. Rather
  // than hardcode a repo name here, the GitHub Actions workflow
  // (.github/workflows/deploy-pages.yml) sets BASE_PATH at build time;
  // Netlify's build never sets it, so it falls back to "/".
  base: process.env.BASE_PATH || '/',
  build: {
    rollupOptions: {
      input: entryInput,
    },
  },
})
