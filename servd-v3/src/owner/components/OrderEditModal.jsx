import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { updateOrderLines, approveOrder } from "../../lib/orders";
import { friendlyFirebaseError } from "../../lib/errors";

export default function OrderEditModal({ order, onClose, approvedBy }) {
  const [lines, setLines] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (order) setLines((order.lines || []).map((l) => ({ ...l })));
  }, [order]);

  if (!order) return null;

  const total = lines.reduce((sum, l) => sum + l.qty * l.price, 0);

  function changeQty(idx, delta) {
    setLines((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], qty: Math.max(0, next[idx].qty + delta) };
      return next.filter((l) => l.qty > 0);
    });
  }

  function removeLine(idx) {
    setLines((prev) => prev.filter((_, i) => i !== idx));
  }

  async function save(alsoApprove) {
    setSaving(true);
    try {
      await updateOrderLines(order.id, lines, total);
      if (alsoApprove) await approveOrder(order.id, approvedBy);
      onClose();
    } catch (err) {
      console.error(err);
      alert(friendlyFirebaseError(err, "save changes"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <AnimatePresence>
      <motion.div className="c-overlay" style={{ zIndex: 120 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <div className="o-modal-shell">
      <motion.div
        className="o-edit-modal"
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        role="dialog" aria-modal="true"
      >
        <h2 style={{ marginBottom: "0.25rem" }}>Edit Order — Table {order.table_number}</h2>
        <p style={{ color: "var(--ink-muted)", fontSize: "0.875rem", marginBottom: "1.25rem" }}>
          Remove an item the kitchen is out of, or adjust quantities, before approving.
        </p>

        {lines.length === 0 && <p style={{ color: "var(--ink-muted)" }}>No items left — remove this order instead of approving an empty one.</p>}

        {lines.map((line, idx) => (
          <div className="o-edit-line" key={line.menuItemId + idx}>
            <div className="o-edit-line-info">
              <strong>{line.name}</strong>
              <span>${line.price.toFixed(2)} each</span>
            </div>
            <div className="o-qty-control">
              <button type="button" onClick={() => changeQty(idx, -1)} aria-label="Decrease quantity">−</button>
              <span>{line.qty}</span>
              <button type="button" onClick={() => changeQty(idx, 1)} aria-label="Increase quantity">+</button>
            </div>
            <button type="button" className="o-edit-line-remove" onClick={() => removeLine(idx)} aria-label="Remove item">🗑</button>
          </div>
        ))}

        <div className="o-edit-total">Total: ${total.toFixed(2)}</div>

        <div className="o-edit-actions">
          <button type="button" className="o-btn-reject" onClick={onClose} disabled={saving}>Cancel</button>
          <button type="button" className="o-btn-reject" onClick={() => save(false)} disabled={saving || lines.length === 0}>Save Only</button>
          <button type="button" className="o-btn-approve" onClick={() => save(true)} disabled={saving || lines.length === 0}>Save &amp; Approve</button>
        </div>
      </motion.div>
      </div>
    </AnimatePresence>
  );
}
