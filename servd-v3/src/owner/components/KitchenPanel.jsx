import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { completeOrder, archiveOrder, orderGuestName } from "../../lib/orders";
import { friendlyFirebaseError } from "../../lib/errors";
import EmptyState from "./EmptyState";
import OrderLineItems from "./OrderLineItems";

const RETENTION_KEY = "servd_completed_retention";
const AUTO_EXPIRE_MS = 30 * 60 * 1000; // 30 minutes
const SWEEP_INTERVAL_MS = 60 * 1000;

const RETENTION_OPTIONS = [
  { value: "10", label: "10" },
  { value: "25", label: "25" },
  { value: "all", label: "All" },
];

function readRetention() {
  const stored = localStorage.getItem(RETENTION_KEY);
  return RETENTION_OPTIONS.some((o) => o.value === stored) ? stored : "10";
}

export default function KitchenPanel({ orders }) {
  const [completedOpen, setCompletedOpen] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [retention, setRetention] = useState(readRetention);
  const inProgress = orders.filter((o) => o.status === "in_progress");

  const allCompleted = orders.filter((o) => o.status === "completed" && !o.archived);
  const completedToday = retention === "all" ? allCompleted : allCompleted.slice(0, Number(retention));

  function handleRetentionChange(value) {
    setRetention(value);
    localStorage.setItem(RETENTION_KEY, value);
  }

  // FIX: completed orders used to accumulate forever with nothing but a
  // manual Clear History button. This sweep auto-archives anything that
  // finished more than 30 minutes ago — a demo simulation of real
  // server-side retention, using each order's completedAt timestamp
  // (added alongside this feature; older orders completed before this
  // shipped won't have one and are left alone rather than guessed at).
  const archivingRef = useRef(new Set());
  useEffect(() => {
    const sweep = () => {
      const now = Date.now();
      allCompleted.forEach((o) => {
        if (!o.completedAt?.toMillis) return;
        if (archivingRef.current.has(o.id)) return;
        if (now - o.completedAt.toMillis() < AUTO_EXPIRE_MS) return;
        archivingRef.current.add(o.id);
        archiveOrder(o.id).catch((err) => console.error("Auto-expire failed for order", o.id, err));
      });
    };
    sweep();
    const t = setInterval(sweep, SWEEP_INTERVAL_MS);
    return () => clearInterval(t);
  }, [allCompleted]);

  async function handleClearHistory() {
    if (completedToday.length === 0) return;
    if (!confirm(`Clear ${completedToday.length} completed order${completedToday.length === 1 ? "" : "s"} from this list? They stay in Analytics, just hidden from view here.`)) return;
    setClearing(true);
    try {
      await Promise.all(completedToday.map((o) => archiveOrder(o.id)));
    } catch (err) {
      console.error(err);
      alert(friendlyFirebaseError(err, "clear this history"));
    } finally {
      setClearing(false);
    }
  }

  return (
    <div>
      <h2 style={{ marginBottom: "1rem" }}>Being Prepared</h2>
      {inProgress.length === 0 ? (
        <EmptyState icon="🍽" title="Nothing cooking right now" subtitle="Approved orders show up here on their way to the table." />
      ) : (
        <AnimatePresence>
          {inProgress.map((order) => (
            <motion.div key={order.id} className="o-order-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="o-order-meta">
                <strong>Table {order.table_number}</strong>
                <span>{orderGuestName(order)}</span>
                {order.approved_by && (
                  <div className="o-order-badges">
                    <span className="o-badge o-badge-approved">Approved by {order.approved_by}</span>
                  </div>
                )}
              </div>
              <OrderLineItems lines={order.lines} />
              <div className="o-order-total">${order.total.toFixed(2)}</div>
              <button type="button" className="o-btn-primary" onClick={() => completeOrder(order.id)}>Mark Ready</button>
            </motion.div>
          ))}
        </AnimatePresence>
      )}

      {/* Collapsible so a busy shift doesn't bury the live kitchen queue
          under a growing list of already-done orders. */}
      <div className="o-collapse-row">
        <button
          type="button"
          className="o-collapse-toggle"
          onClick={() => setCompletedOpen((v) => !v)}
          aria-expanded={completedOpen}
        >
          <span>Recently Completed {completedToday.length > 0 ? `(${completedToday.length})` : ""}</span>
          <span className={`o-collapse-chevron${completedOpen ? " open" : ""}`} aria-hidden="true">▾</span>
        </button>
        {completedOpen && (
          <div className="o-retention-control">
            <span>Show</span>
            {RETENTION_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                className={`o-retention-pill${retention === o.value ? " active" : ""}`}
                onClick={() => handleRetentionChange(o.value)}
              >
                {o.label}
              </button>
            ))}
          </div>
        )}
        {completedOpen && completedToday.length > 0 && (
          <button type="button" className="o-clear-history-btn" onClick={handleClearHistory} disabled={clearing}>
            {clearing ? "Clearing…" : "Clear History"}
          </button>
        )}
      </div>

      {completedOpen && (
        <div style={{ marginTop: "1rem" }}>
          <p className="o-field-hint" style={{ marginBottom: "0.75rem" }}>
            Completed orders auto-clear from this list 30 minutes after they're marked ready — they always stay in Analytics.
          </p>
          {completedToday.length === 0 ? (
            <EmptyState icon="📋" title="Nothing completed yet" />
          ) : (
            completedToday.map((order) => (
              <div className="o-order-card" key={order.id} style={{ opacity: 0.7 }}>
                <div className="o-order-meta"><strong>Table {order.table_number}</strong></div>
                <OrderLineItems lines={order.lines} />
                <div className="o-order-total">${order.total.toFixed(2)}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
