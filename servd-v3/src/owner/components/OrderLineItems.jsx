// Shared line-item display for order cards (Needs Review, In Kitchen,
// Kitchen tab) — one row per dish with qty, spice level, and both unit
// and line pricing spelled out, instead of a single joined string of
// names. A server glancing at this should be able to read quantity and
// price without doing mental math against the order total.
//
// `onToggleLine` (index) => void turns on the kitchen prep checkbox —
// checked lines get a cut/strikethrough line so a server can see at a
// glance what's already plated, both here and (read-only) anywhere
// else this same order shows up.
export default function OrderLineItems({ lines, onToggleLine }) {
  return (
    <div className="o-line-items">
      {(lines || []).map((l, i) => (
        <div className={`o-line-item${l.checked ? " is-checked" : ""}`} key={`${l.menuItemId || l.name}-${i}`}>
          {onToggleLine && (
            <input
              type="checkbox"
              className="o-line-item-check"
              checked={!!l.checked}
              onChange={() => onToggleLine(i)}
              aria-label={`Mark ${l.name} ready`}
            />
          )}
          <span className="o-line-item-qty">{l.qty}×</span>
          <span className="o-line-item-name">
            {l.name}
            {l.spiceLevel && <span className="o-line-item-spice">{l.spiceLevel}</span>}
          </span>
          <span className="o-line-item-price">
            ${(l.qty * l.price).toFixed(2)}
            {l.qty > 1 && <span className="o-line-item-unit"> (${l.price.toFixed(2)} ea)</span>}
          </span>
        </div>
      ))}
    </div>
  );
}
