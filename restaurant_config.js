/**
 * ──────────────────────────────────────────────────────────────────────
 * RESTAURANT CONFIGURATION
 * ──────────────────────────────────────────────────────────────────────
 * This is the ONE file a new restaurant edits to re-brand this entire
 * ordering system (index.html + owner.html). No other file should need
 * to change to deploy this template for a different business.
 *
 * See README.md for a plain-language walkthrough of every field below.
 * Menu items and prices are NOT configured here — those live in
 * Firestore and are managed from owner.html's Menu Management tab.
 */
window.RESTAURANT_CONFIG = {
  // Shown in the header of both pages and in the browser tab title.
  name: "Indian Courtyard",
  tagline: "North Indian · New Westminster, BC",

  // Optional. Leave "" to show the restaurant name as text only (no logo).
  logoUrl: "",

  // Prefixed to every price shown to customers and the owner.
  currencySymbol: "$",

  // How many physical tables this location has. This is documentation
  // only (helps you know how many QR codes to print) — it is not used
  // to restrict which ?table= values are accepted. See validTables below
  // if you want to lock that down.
  tableCount: 20,

  // Optional allow-list of exact table IDs (e.g. ["1","2","3","Patio-1"]).
  // Leave null to accept any table ID that shows up in a scanned QR link.
  validTables: null,

  // Default base URL the QR Codes tab (owner.html) builds table links
  // from, e.g. "<orderingBaseUrl>?table=5". Change this if you move
  // hosting. The QR Codes tab also lets you override this live (saved in
  // your browser only) without redeploying, in case your URL changes and
  // you need new codes printed immediately.
  orderingBaseUrl: "https://pum8181.github.io/indiancourtyard/",

  // Brand colors. Any valid CSS color works (hex, rgb(), hsl()).
  theme: {
    primary: "#7A2E2E", // main brand color — buttons, headings, badges
    primaryDeep: "#4E1C1C", // darker shade — header background gradient
    accent: "#C9820A", // secondary accent — "most ordered" badges, sliders
    accentLight: "#E8A83C",
    success: "#4A6741", // "chef's special" tag, success screens
  },

  // Order status colors used throughout owner.html (status pills, kanban
  // column headers). Change these here to re-theme status colors without
  // touching any code.
  statusColors: {
    pending_confirmation: "#D9480F", // amber/orange — new orders awaiting server review
    pending: "#C9820A", // yellow/gold — confirmed, sent to kitchen
    in_progress: "#2563A8", // blue
    completed: "#2E7D32", // green
    cancelled: "#B3261E", // red
  },

  // Tax rate applied when generating printable/split bills from the
  // "Generate Bill(s)" feature on owner-v2.html's Split Bill tab (only
  // used there — the production owner.html doesn't read this field).
  // Enter as a decimal, e.g. 0.05 for 5%. Left at 0 on purpose: confirm
  // the correct combined tax rate for your province/region and item type
  // yourself (some regions tax prepared restaurant food differently from
  // alcohol or retail goods) rather than trusting a guessed default —
  // an incorrect rate here would under- or over-charge every bill.
  taxRate: 0,
};
