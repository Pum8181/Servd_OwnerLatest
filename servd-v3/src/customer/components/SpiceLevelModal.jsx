import { motion, AnimatePresence } from "motion/react";

export default function SpiceLevelModal({ open, itemName, levels, onResolve }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="c-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <div className="c-modal-shell">
            <motion.div
              className="c-modal"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              role="dialog" aria-modal="true"
            >
              <h2 style={{ fontSize: "1.25rem", marginBottom: "0.35rem" }}>How spicy?</h2>
              <p style={{ fontSize: "0.8125rem", color: "var(--ink-muted)", marginBottom: "1.1rem" }}>
                Pick a spice level for {itemName}.
              </p>
              {levels.map((level) => (
                <button key={level} type="button" className="c-split-option" onClick={() => onResolve(level)}>
                  <strong>{level}</strong>
                </button>
              ))}
              <button type="button" className="c-skip-link" onClick={() => onResolve(null)}>
                Skip — no preference
              </button>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
