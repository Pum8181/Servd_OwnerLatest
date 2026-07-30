import { motion, AnimatePresence } from "motion/react";

const OPTIONS = [
  { id: "one_bill", title: "One bill for the table", desc: "Everyone's order combined into one total." },
  { id: "split_equal", title: "Split equally", desc: "The total divided evenly among everyone at the table." },
  { id: "split_items", title: "Split by what I ordered", desc: "Each guest pays only for their own items." },
];

export default function SplitModal({ open, onResolve }) {
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
              <h2 style={{ fontSize: "1.25rem", marginBottom: "0.35rem" }}>How would you like the bill handled?</h2>
              <p style={{ fontSize: "0.8125rem", color: "var(--ink-muted)", marginBottom: "1.1rem" }}>
                This applies to your whole table — whoever orders next here today sees this same choice automatically.
              </p>
              {OPTIONS.map((opt) => (
                <button key={opt.id} type="button" className="c-split-option" onClick={() => onResolve(opt.id)}>
                  <strong>{opt.title}</strong>
                  <span>{opt.desc}</span>
                </button>
              ))}
              <button type="button" className="c-skip-link" onClick={() => onResolve("one_bill")}>
                Skip — use one bill for the table
              </button>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
