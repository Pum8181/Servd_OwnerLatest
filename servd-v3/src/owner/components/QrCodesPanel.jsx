import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import EmptyState from "./EmptyState";
import { encodeTableParam } from "../../lib/tableToken";

// Same free, no-API-key QR image service owner-v2.html already relies
// on — real, scannable QR codes, no new dependency. color/bgcolor take
// hex triplets without the "#" and let the QR itself carry the forest/
// cream brand palette instead of a plain generic black-on-white code.
function qrImageUrl(targetUrl, { size = 320 } = {}) {
  const params = new URLSearchParams({
    size: `${size}x${size}`,
    data: targetUrl,
    color: "1A3626",
    bgcolor: "F3F1E8",
    qzone: "1",
    margin: "0",
  });
  return `https://api.qrserver.com/v1/create-qr-code/?${params.toString()}`;
}

function isValidTable(value) {
  return /^[A-Za-z0-9][A-Za-z0-9 _-]{0,19}$/.test(value);
}

const MENU_URL_KEY = "servd_qr_menu_url";
// The customer menu's actual GitHub Pages repo name (see DEPLOY.md) —
// used as the fallback guess when generating a QR from the owner
// dashboard's own (different) domain.
const CUSTOMER_REPO_NAME = "Servd_Customer_Latest";

// GitHub Pages serves each app from a repo-name subpath
// (https://<user>.github.io/<repo>/), and the owner dashboard and
// customer menu are TWO DIFFERENT repos/domains (Servd_OwnerLatest vs
// Servd_Customer_Latest — see DEPLOY.md). `window.location.origin` alone
// drops that subpath, and even with it, the dashboard's own domain is
// never the right one to point a customer QR code at. This guesses the
// customer domain when running on the owner dashboard's domain, and
// otherwise falls back to the current origin/path (correct for local
// dev, Netlify, or generating directly from the customer domain) —
// either way it's just a starting point, hence the confirm-before-use
// banner in the form below.
function defaultMenuUrl() {
  const saved = localStorage.getItem(MENU_URL_KEY);
  if (saved) return saved;
  const { origin, pathname } = window.location;
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return `${origin}/index_v3.html`;
  if (/owner/i.test(segments[0])) return `${origin}/${CUSTOMER_REPO_NAME}/`;
  return `${origin}/${segments[0]}/`;
}

function isGuessedCrossDomain() {
  return !localStorage.getItem(MENU_URL_KEY) && /owner/i.test(window.location.pathname);
}

async function downloadQr(url, filename) {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(objectUrl);
  } catch {
    // Cross-origin fetch blocked or offline — still get them the file,
    // just via a new tab they can save from manually instead of a
    // silent failure.
    window.open(url, "_blank");
  }
}

export default function QrCodesPanel() {
  const [menuUrl, setMenuUrl] = useState(defaultMenuUrl());
  const [tableInput, setTableInput] = useState("");
  const [error, setError] = useState("");
  const [generated, setGenerated] = useState([]);

  function handleMenuUrlChange(value) {
    setMenuUrl(value);
    // Remember the corrected URL for next time — this dashboard's
    // domain is never the same as the customer menu's, so re-guessing
    // wrong every visit would mean re-fixing it every visit too.
    if (value.trim()) localStorage.setItem(MENU_URL_KEY, value.trim());
    else localStorage.removeItem(MENU_URL_KEY);
  }

  const cleanMenuUrl = menuUrl.trim() || defaultMenuUrl();
  const previewUrl = useMemo(() => {
    const table = tableInput.trim();
    if (!table) return cleanMenuUrl;
    const url = new URL(cleanMenuUrl, window.location.origin);
    url.searchParams.set("table", encodeTableParam(table));
    return url.toString();
  }, [cleanMenuUrl, tableInput]);

  function handleGenerate(e) {
    e.preventDefault();
    const table = tableInput.trim();
    if (!table) { setError("Enter a table number or name first."); return; }
    if (!isValidTable(table)) { setError("Table names can only use letters, numbers, spaces, - and _ (max 20 characters)."); return; }
    setError("");
    setGenerated((prev) => [{ table, url: previewUrl, id: Date.now() }, ...prev.filter((g) => g.table !== table)]);
    setTableInput("");
  }

  function handleRemove(id) {
    setGenerated((prev) => prev.filter((g) => g.id !== id));
  }

  return (
    <div>
      <h2 style={{ marginBottom: "0.5rem" }}>QR Codes</h2>
      <p style={{ color: "var(--ink-muted)", marginBottom: "1.5rem", fontSize: "0.9375rem", maxWidth: "40rem" }}>
        Generate a branded, table-specific QR code that opens the customer menu with that table
        already selected — scan, order, done. Print one per table and tape it down.
      </p>

      <div className="o-qr-layout">
        <form onSubmit={handleGenerate} className="o-side-card o-qr-form">
          <h3>Create a QR code</h3>

          <label className="o-form-field">
            Menu page URL
            <input
              type="text"
              value={menuUrl}
              onChange={(e) => handleMenuUrlChange(e.target.value)}
              placeholder={defaultMenuUrl()}
            />
            {isGuessedCrossDomain() ? (
              <span className="o-field-hint o-field-hint--warn">
                This dashboard lives on a different domain than the customer menu — this is only a best guess.
                Confirm it matches <strong>{CUSTOMER_REPO_NAME}</strong>'s real Pages URL before generating codes (see DEPLOY.md).
              </span>
            ) : (
              <span className="o-field-hint">Defaults to this device's live menu link. Override it if you're printing codes for your real published domain.</span>
            )}
          </label>

          <label className="o-form-field">
            Table number or name
            <input
              type="text"
              value={tableInput}
              onChange={(e) => { setTableInput(e.target.value); setError(""); }}
              placeholder="e.g. 5 or Patio 2"
            />
          </label>

          {error && <p className="o-qr-error">{error}</p>}

          <button type="submit" className="o-btn-approve" style={{ width: "100%" }}>Generate QR code</button>
        </form>

        <div className="o-side-card o-qr-preview">
          <h3>Preview</h3>
          <div className="o-qr-preview-row">
            <span>Destination URL</span>
            <strong className="o-qr-preview-value">{cleanMenuUrl}</strong>
          </div>
          <div className="o-qr-preview-row">
            <span>Table</span>
            <strong className="o-qr-preview-value">{tableInput.trim() || "— not set yet —"}</strong>
          </div>
          <div className="o-qr-preview-row">
            <span>Opens when scanned</span>
            <strong className="o-qr-preview-value">
              {tableInput.trim() ? `Customer menu, pre-selected to Table ${tableInput.trim()}` : "Customer menu (no table pre-selected until you enter one)"}
            </strong>
          </div>
          <div className="o-qr-preview-row o-qr-preview-link">
            <span>Full link</span>
            <code>{previewUrl}</code>
          </div>
        </div>
      </div>

      <h3 className="o-qr-generated-title">Generated codes</h3>
      {generated.length === 0 ? (
        <EmptyState icon="▦" title="No codes generated yet" subtitle="Fill in a table above and hit Generate — each one shows up here, ready to print." />
      ) : (
        <div className="o-qr-grid">
          <AnimatePresence>
            {generated.map((g) => (
              <motion.div
                key={g.id}
                className="o-qr-card"
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
              >
                <div className="o-qr-card-brand">Servd</div>
                <div className="o-qr-card-frame">
                  <img src={qrImageUrl(g.url)} alt={`QR code for Table ${g.table}`} width={200} height={200} />
                </div>
                <div className="o-qr-card-table">Table {g.table}</div>
                <p className="o-qr-card-url">{g.url}</p>
                <div className="o-qr-card-actions">
                  <button type="button" className="o-btn-primary" onClick={() => downloadQr(qrImageUrl(g.url, { size: 900 }), `servd-qr-table-${g.table}.png`)}>
                    Download
                  </button>
                  <button type="button" className="o-btn-reject" onClick={() => handleRemove(g.id)}>Remove</button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
