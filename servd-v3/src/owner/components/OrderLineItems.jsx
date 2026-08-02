// Shared line-item display for order cards (Needs Review, In Kitchen,
// Kitchen tab) — one row per dish with qty, spice level, and both unit
// and line pricing spelled out, instead of a single joined string of
// names. A server glancing at this should be able to read quantity and
// price without doing mental math against the order total.
export default function OrderLineItems({ lines }) {
  return (
    <div className="o-line-items">
      {(lines || []).map((l, i) => (
        <div className="o-line-item" key={`${l.menuItemId || l.name}-${i}`}>
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
