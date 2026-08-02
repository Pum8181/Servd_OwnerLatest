import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { resolveRequest, markInProgress, deleteRequest } from "../../lib/serverRequests";
import EmptyState from "./EmptyState";

function timeAgo(timestamp) {
  if (!timestamp?.toMillis) return "";
  const ms = Date.now() - timestamp.toMillis();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return "just now";
  if (mins === 1) return "1 min ago";
  return `${mins} min ago`;
}

export default function ServerRequestsPanel({ requests }) {
  const [clearing, setClearing] = useState(false);
  const open = requests.filter((r) => r.status === "open" || r.status === "in_progress");
  const recentResolved = requests.filter((r) => r.status === "resolved").slice(0, 10);

  async function handleClearAll() {
    if (recentResolved.length === 0) return;
    if (!confirm(`Delete all ${recentResolved.length} resolved request${recentResolved.length === 1 ? "" : "s"} from this list?`)) return;
    setClearing(true);
    try {
      await Promise.all(recentResolved.map((r) => deleteRequest(r.id)));
    } catch (err) {
      console.error(err);
    } finally {
      setClearing(false);
    }
  }

  return (
    <div>
      <h2 style={{ marginBottom: "0.5rem" }}>Server Requests</h2>
      <p style={{ color: "var(--ink-muted)", marginBottom: "1.5rem", fontSize: "0.9375rem" }}>
        A table taps "Request server" on the customer menu and it shows up here instantly. Mark it
        handled once someone's been by — the guest's button clears the moment you do.
      </p>

      {open.length === 0 ? (
        <EmptyState icon="🔔" title="No open requests" subtitle="A table's server request will show up here the moment they ask for help." />
      ) : (
        <div className="o-request-grid">
          <AnimatePresence>
            {open.map((r) => (
              <motion.div
                key={r.id}
                className={`o-request-card${r.status === "in_progress" ? " is-in-progress" : ""}`}
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
              >
                <div className="o-request-card-head">
                  <span className="o-request-table">Table {r.table_number}</span>
                  <span className={`o-request-status-pill${r.status === "in_progress" ? " is-in-progress" : ""}`}>
                    {r.status === "in_progress" ? "In Progress" : "Open"}
                  </span>
                </div>
                <span className="o-request-time">Requested {timeAgo(r.requestedAt)}</span>
                <div className="o-request-actions">
                  {r.status === "open" && (
                    <button type="button" className="o-btn-reject" onClick={() => markInProgress(r.id)}>On my way</button>
                  )}
                  <button type="button" className="o-btn-approve" onClick={() => resolveRequest(r.id)}>Mark Resolved</button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {recentResolved.length > 0 && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "2rem 0 0.75rem" }}>
            <h3 style={{ fontSize: "0.9375rem", color: "var(--ink-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Recently Resolved
            </h3>
            <button type="button" className="o-clear-history-btn" onClick={handleClearAll} disabled={clearing}>
              {clearing ? "Clearing…" : "Clear All"}
            </button>
          </div>
          <div className="o-request-history">
            <AnimatePresence>
              {recentResolved.map((r) => (
                <motion.div className="o-request-history-row" key={r.id} initial={{ opacity: 1 }} exit={{ opacity: 0, height: 0 }}>
                  <span>Table {r.table_number}</span>
                  <span>Requested {timeAgo(r.requestedAt)}</span>
                  <button type="button" className="o-request-history-close" onClick={() => deleteRequest(r.id)} aria-label="Dismiss">
                    ×
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  );
}
