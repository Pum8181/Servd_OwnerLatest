import { motion, AnimatePresence } from "motion/react";

const SPLIT_LABELS = {
  one_bill: "One bill for the table",
  split_equal: "Split equally",
  split_items: "Split by what each person ordered",
};

// Groups cart lines by whoever ordered them, so "Split by item" actually
// shows each person's own subtotal instead of just the table total —
// previously the split choice was saved to the order but never reflected
// anywhere in the checkout screen, which is why it read as "not working."
function groupByGuest(cart) {
  const groups = new Map();
  Object.values(cart).forEach((line) => {
    const guest = line.guestIdentifier || "Guest";
    if (!groups.has(guest)) groups.set(guest, []);
    groups.get(guest).push(line);
  });
  return Array.from(groups.entries());
}

export default function CartSheet({ open, cart, total, splitPreference, onChangeSplit, onClose, onConfirm, submitting }) {
  const showPerGuest = splitPreference === "split_items";
  const guestGroups = showPerGuest ? groupByGuest(cart) : null;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="c-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            className="c-sheet"
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            role="dialog" aria-modal="true"
          >
            <h2>Your order</h2>

            <div className="c-sheet-split-row">
              <span>Billing: <strong>{SPLIT_LABELS[splitPreference] || SPLIT_LABELS.one_bill}</strong></span>
              <button type="button" className="c-sheet-split-change" onClick={onChangeSplit}>Change</button>
            </div>

            {showPerGuest ? (
              guestGroups.map(([guest, lines]) => {
                const guestTotal = lines.reduce((sum, l) => sum + l.qty * l.price, 0);
                return (
                  <div className="c-sheet-guest-group" key={guest}>
                    <div className="c-sheet-guest-name">{guest} <span>${guestTotal.toFixed(2)}</span></div>
                    {lines.map((line) => (
                      <div className="c-sheet-line" key={line.menuItemId + (line.spiceLevel || "")}>
                        <span>{line.qty}× {line.name}{line.spiceLevel ? ` (${line.spiceLevel})` : ""}</span>
                        <span>${(line.qty * line.price).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                );
              })
            ) : (
              Object.values(cart).map((line) => (
                <div className="c-sheet-line" key={line.menuItemId + (line.spiceLevel || "")}>
                  <span>{line.qty}× {line.name}{line.spiceLevel ? ` (${line.spiceLevel})` : ""}</span>
                  <span>${(line.qty * line.price).toFixed(2)}</span>
                </div>
              ))
            )}

            <div className="c-sheet-total"><span>Total</span><span>${total.toFixed(2)}</span></div>
            <button type="button" className="c-btn-primary" onClick={onConfirm} disabled={submitting}>
              {submitting ? "Sending…" : "Send to kitchen"}
            </button>
            <button type="button" className="c-btn-secondary" onClick={onClose}>Keep browsing</button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
