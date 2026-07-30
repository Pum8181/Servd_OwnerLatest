import { motion } from "motion/react";
import { orderGuestName } from "../../lib/orders";

const SPLIT_LABEL = { one_bill: "One bill", split_equal: "Split equally", split_items: "Split by item" };

function timeAgo(createdAt) {
  if (!createdAt?.toDate) return "";
  const mins = Math.max(0, Math.round((Date.now() - createdAt.toDate().getTime()) / 60000));
  return mins === 0 ? "just now" : `${mins} min ago`;
}

export default function OrderCard({ order, onApprove, onReject, onOpen, onEdit }) {
  const linesText = (order.lines || []).map((l) => `${l.name} × ${l.qty}`);
  return (
    <motion.div
      className="o-order-card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.25 }}
    >
      <div className="o-order-meta">
        <strong>Table {order.table_number}</strong>
        <span>{timeAgo(order.createdAt)} · {orderGuestName(order)}</span>
        <div className="o-order-badges">
          <span className="o-badge">{SPLIT_LABEL[order.split_preference] || "One bill"}</span>
          {order.approved_by && <span className="o-badge o-badge-approved">Approved by {order.approved_by}</span>}
        </div>
      </div>
      <div className="o-order-lines" onClick={() => onOpen?.(order)} style={{ cursor: onOpen ? "pointer" : "default" }}>
        {linesText.join(", ")}
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
