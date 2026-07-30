import { motion, AnimatePresence } from "motion/react";

export default function CartSheet({ open, cart, total, onClose, onConfirm, submitting }) {
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
            {Object.values(cart).map((line) => (
              <div className="c-sheet-line" key={line.menuItemId + (line.spiceLevel || "")}>
                <span>{line.qty}× {line.name}{line.spiceLevel ? ` (${line.spiceLevel})` : ""}</span>
                <span>${(line.qty * line.price).toFixed(2)}</span>
              </div>
            ))}
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
