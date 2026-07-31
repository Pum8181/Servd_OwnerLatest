import { motion, AnimatePresence } from "motion/react";

export default function ServerRequestModal({ open, view, table, submitting, remainingLabel, onClose, onChooseServer, onChooseOnline }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="c-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <div className="c-modal-shell">
            <motion.div
              className="c-modal c-request-modal"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              role="dialog" aria-modal="true"
            >
              {view === "choice" && (
                <>
                  <span className="c-request-icon" aria-hidden="true">🔔</span>
                  <h2 style={{ fontSize: "1.25rem", marginBottom: "0.35rem" }}>How would you like to order or get help?</h2>
                  <p style={{ fontSize: "0.8125rem", color: "var(--ink-muted)", marginBottom: "1.1rem" }}>
                    Table {table}
                  </p>
                  <button type="button" className="c-split-option" onClick={onChooseServer} disabled={submitting}>
                    <strong>Server</strong>
                    <span>Flag a staff member to come by the table</span>
                  </button>
                  <button type="button" className="c-split-option" onClick={onChooseOnline}>
                    <strong>Online</strong>
                    <span>I'll keep browsing and order from the menu myself</span>
                  </button>
                  <button type="button" className="c-skip-link" onClick={onClose}>Cancel</button>
                </>
              )}

              {view === "cooldown" && (
                <>
                  <span className="c-request-icon" aria-hidden="true">🔔</span>
                  <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>You already asked for help</h2>
                  <p style={{ fontSize: "0.875rem", color: "var(--ink-muted)", marginBottom: "1.25rem" }}>
                    You recently requested a server for Table {table}. Please wait about {remainingLabel} before asking
                    again — someone will be with you soon.
                  </p>
                  <button type="button" className="c-btn-primary" onClick={onClose}>Got it</button>
                </>
              )}

              {view === "confirmed" && (
                <>
                  <span className="c-request-icon is-confirmed" aria-hidden="true">✓</span>
                  <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>A server has been notified</h2>
                  <p style={{ fontSize: "0.875rem", color: "var(--ink-muted)", marginBottom: "1.25rem" }}>
                    Table {table} — please wait, someone will be with you soon.
                  </p>
                  <button type="button" className="c-btn-secondary" onClick={onClose}>Close</button>
                </>
              )}

              {view === "resolved" && (
                <>
                  <span className="c-request-icon is-confirmed" aria-hidden="true">✓</span>
                  <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>You're all set!</h2>
                  <p style={{ fontSize: "0.875rem", color: "var(--ink-muted)" }}>A staff member has been by Table {table}.</p>
                </>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
