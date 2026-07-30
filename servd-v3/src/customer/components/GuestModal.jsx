import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export default function GuestModal({ open, onResolve }) {
  const [name, setName] = useState("");

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
              <h2 style={{ fontSize: "1.25rem", marginBottom: "0.35rem" }}>What's your name?</h2>
              <p style={{ fontSize: "0.8125rem", color: "var(--ink-muted)" }}>
                So the kitchen and your server know whose order this is at the table.
              </p>
              <input
                type="text" maxLength={24} placeholder="e.g. Priya" value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") onResolve(name.trim().slice(0, 24) || "Guest 1"); }}
              />
              <button type="button" className="c-btn-primary" onClick={() => onResolve(name.trim().slice(0, 24) || "Guest 1")}>
                Continue
              </button>
              <button type="button" className="c-skip-link" style={{ marginTop: "0.75rem" }} onClick={() => onResolve("Guest 1")}>
                Skip — order as a guest
              </button>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
