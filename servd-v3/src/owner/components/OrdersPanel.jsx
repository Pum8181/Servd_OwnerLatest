import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import OrderCard from "./OrderCard";
import OrderEditModal from "./OrderEditModal";
import OrderLineItems from "./OrderLineItems";
import EmptyState from "./EmptyState";
import { approveOrder, rejectOrder, completeOrder, orderGuestName, toggleOrderLineChecked } from "../../lib/orders";

// FIX (layout): the old awkward floating "Pending Orders" box on the
// right (which looked especially broken when empty — just a bare white
// box with a line of muted text) is gone. This is now a real two-column
// Kanban: "Needs Review" (pending, full action cards) and "In Kitchen"
// (in_progress, already-approved orders on their way to the table),
// each with a proper empty state instead of a blank box.
export default function OrdersPanel({ orders, activeStaff, menuItems }) {
  const [editingOrder, setEditingOrder] = useState(null);
  const pending = orders.filter((o) => o.status === "pending");
  const inProgress = orders.filter((o) => o.status === "in_progress");

  return (
    <div className="o-kanban-2col">
      <div className="o-kanban-col">
        <div className="o-kanban-col-header">
          <h2>Needs Review</h2>
          <span className="o-kanban-count">{pending.length}</span>
        </div>
        {pending.length === 0 ? (
          <EmptyState icon="✓" title="You're all caught up" subtitle="New orders will show up here the moment a table sends one." />
        ) : (
          <AnimatePresence>
            {pending.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onApprove={(id) => approveOrder(id, activeStaff?.name)}
                onReject={rejectOrder}
                onEdit={setEditingOrder}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      <div className="o-kanban-col">
        <div className="o-kanban-col-header">
          <h2>In Kitchen</h2>
          <span className="o-kanban-count">{inProgress.length}</span>
        </div>
        {inProgress.length === 0 ? (
          <EmptyState icon="🍽" title="Nothing cooking right now" subtitle="Approved orders land here until they're marked ready." />
        ) : (
          <AnimatePresence>
            {inProgress.map((order) => {
              const lines = order.lines || [];
              const allChecked = lines.length > 0 && lines.every((l) => l.checked);
              return (
                <motion.div key={order.id} className="o-order-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="o-order-meta">
                    <strong>Table {order.table_number}</strong>
                    <span>{orderGuestName(order)}</span>
                  </div>
                  <OrderLineItems lines={lines} onToggleLine={(i) => toggleOrderLineChecked(order.id, lines, i)} />
                  <div className="o-order-total">${order.total.toFixed(2)}</div>
                  <button
                    type="button"
                    className="o-btn-primary"
                    onClick={() => completeOrder(order.id)}
                    disabled={!allChecked}
                    title={allChecked ? undefined : "Check off every item before marking this order ready"}
                  >
                    Mark Ready
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      <OrderEditModal order={editingOrder} onClose={() => setEditingOrder(null)} approvedBy={activeStaff?.name} menuItems={menuItems} />
    </div>
  );
}
