import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { orderGuestName } from "../../lib/orders";
import OrderLineItems from "./OrderLineItems";

const SPLIT_LABEL = { one_bill: "One bill", split_equal: "Split equally", split_items: "Split by item" };

// Fresh (just placed) orders get a highlighted "New" badge and glow for
// a couple of minutes so a busy floor can spot the newest arrival at a
// glance, on top of the chime — a flag by itself doesn't set an alarm,
// but re-renders naturally on the surrounding list's own live updates.
const NEW_ORDER_WINDOW_MS = 2 * 60 * 1000;

function timeAgo(createdAt) {
  if (!createdAt?.toDate) return "";
  const mins = Math.max(0, Math.round((Date.now() - createdAt.toDate().getTime()) / 60000));
  return mins === 0 ? "just now" : `${mins} min ago`;
}

function isNew(createdAt) {
  if (!createdAt?.toMillis) return false;
  return Date.now() - createdAt.toMillis() < NEW_ORDER_WINDOW_MS;
}

export default function OrderCard({ order, onApprove, onReject, onOpen, onEdit }) {
  const [fresh, setFresh] = useState(() => isNew(order.createdAt));

  // Clears itself on a timer instead of relying on some unrelated
  // re-render to happen to land after the window — otherwise a quiet
  // order could keep showing "New" indefinitely.
  useEffect(() => {
    if (!fresh || !order.createdAt?.toMillis) return undefined;
    const remaining = NEW_ORDER_WINDOW_MS - (Date.now() - order.createdAt.toMillis());
    const t = setTimeout(() => setFresh(false), Math.max(0, remaining));
    return () => clearTimeout(t);
  }, [fresh, order.createdAt]);

  return (
    <motion.div
      className={`o-order-card${fresh ? " is-new-order" : ""}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.25 }}
    >
      <div className="o-order-meta">
        <strong>Table {order.table_number}</strong>
        <span>{timeAgo(order.createdAt)} · {orderGuestName(order)}</span>
        <div className="o-order-badges">
          {fresh && <span className="o-badge o-badge-new">🔔 New Order</span>}
          <span className="o-badge">{SPLIT_LABEL[order.split_preference] || "One bill"}</span>
          {order.approved_by && <span className="o-badge o-badge-approved">Approved by {order.approved_by}</span>}
        </div>
      </div>
      <div onClick={() => onOpen?.(order)} style={{ cursor: onOpen ? "pointer" : "default" }}>
        <OrderLineItems lines={order.lines} />
      </div>
      <div className="o-order-total">${order.total.toFixed(2)}</div>
      {order.status === "pending" && (
        <div className="o-order-actions">
          <button type="button" className="o-btn-reject" onClick={() => onEdit(order)}>Edit Order</button>
          <button type="button" className="o-btn-approve" onClick={() => onApprove(order.id)}>Approve</button>
          <button type="button" className="o-btn-reject" onClick={() => onReject(order.id)}>Reject</button>
        </div>
      )}
    </motion.div>
  );
}
