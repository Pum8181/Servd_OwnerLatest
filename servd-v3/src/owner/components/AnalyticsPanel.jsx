import { useMemo } from "react";
import EmptyState from "./EmptyState";

const SPLIT_LABELS = {
  one_bill: "One bill for the table",
  split_equal: "Split equally",
  split_by_items: "Split by what I ordered",
};

function Bars({ rows, valueLabel = (v) => v }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div className="o-bar-list">
      {rows.map((r) => (
        <div className="o-bar-row" key={r.label}>
          <span className="o-bar-label">{r.label}</span>
          <div className="o-bar-track">
            <div className="o-bar-fill" style={{ width: `${(r.value / max) * 100}%` }} />
          </div>
          <span className="o-bar-value">{valueLabel(r.value)}</span>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsPanel({ orders, menuItems }) {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const ordersToday = useMemo(
    () => orders.filter((o) => o.createdAt?.toDate && o.createdAt.toDate() >= todayStart),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [orders]
  );
  const activeOrdersToday = useMemo(() => ordersToday.filter((o) => o.status !== "cancelled"), [ordersToday]);

  const liveKitchen = orders.filter((o) => o.status === "pending" || o.status === "in_progress").length;
  const soldOut = menuItems.filter((i) => !i.available).length;
  const markdown = menuItems.filter((i) => (i.discount || 0) > 0).length;
  const revenueToday = activeOrdersToday.reduce((s, o) => s + o.total, 0);
  const cancelledToday = ordersToday.filter((o) => o.status === "cancelled").length;
  const avgOrderValue = activeOrdersToday.length ? revenueToday / activeOrdersToday.length : 0;

  // Distinct (table, guest) pairs today — a rough "covers served" count,
  // since a table often has multiple guest_identifiers ordering
  // separately under a split bill.
  const guestsToday = useMemo(() => {
    const set = new Set(activeOrdersToday.map((o) => `${o.table_number}::${o.guest_identifier}`));
    return set.size;
  }, [activeOrdersToday]);

  // Kitchen turnaround: createdAt -> completedAt, only for orders that
  // actually have both timestamps (older/edited orders may be missing
  // completedAt from before that field existed).
  const avgPrepMinutes = useMemo(() => {
    const timed = activeOrdersToday.filter((o) => o.status === "completed" && o.createdAt?.toMillis && o.completedAt?.toMillis);
    if (!timed.length) return null;
    const totalMs = timed.reduce((s, o) => s + (o.completedAt.toMillis() - o.createdAt.toMillis()), 0);
    return totalMs / timed.length / 60000;
  }, [activeOrdersToday]);

  const stats = [
    { label: "Orders Today", value: ordersToday.length },
    { label: "Live In Kitchen", value: liveKitchen },
    { label: "Revenue Today", value: `$${revenueToday.toFixed(0)}` },
    { label: "Avg Order Value", value: `$${avgOrderValue.toFixed(2)}` },
    { label: "Guests Served Today", value: guestsToday },
    { label: "Cancelled Today", value: cancelledToday },
    { label: "Avg Kitchen Time", value: avgPrepMinutes == null ? "—" : `${avgPrepMinutes.toFixed(0)}m` },
    { label: "Sold Out Items", value: soldOut },
    { label: "On Markdown", value: markdown },
  ];

  // Top selling dishes today, by quantity across all order lines.
  const topItems = useMemo(() => {
    const counts = new Map();
    activeOrdersToday.forEach((o) => {
      (o.lines || []).forEach((l) => {
        counts.set(l.name, (counts.get(l.name) || 0) + (l.qty || 0));
      });
    });
    return Array.from(counts.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [activeOrdersToday]);

  // Busiest tables today, by order count — helps staffing/floor
  // decisions (e.g. which section is getting slammed).
  const busiestTables = useMemo(() => {
    const counts = new Map();
    activeOrdersToday.forEach((o) => {
      const t = o.table_number || "unassigned";
      counts.set(t, (counts.get(t) || 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([label, value]) => ({ label: `Table ${label}`, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [activeOrdersToday]);

  // Orders by hour today — a simple rush-hour view so staffing can be
  // matched to when orders actually land.
  const ordersByHour = useMemo(() => {
    const counts = new Array(24).fill(0);
    activeOrdersToday.forEach((o) => {
      if (!o.createdAt?.toDate) return;
      counts[o.createdAt.toDate().getHours()] += 1;
    });
    const nowHour = new Date().getHours();
    return counts
      .map((value, hour) => ({ hour, value }))
      .filter((r) => r.hour <= nowHour && r.value > 0)
      .map((r) => ({ label: `${(r.hour % 12) || 12}${r.hour < 12 ? "am" : "pm"}`, value: r.value }));
  }, [activeOrdersToday]);

  const splitBreakdown = useMemo(() => {
    const counts = new Map();
    activeOrdersToday.forEach((o) => {
      const key = o.split_preference || "one_bill";
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([key, value]) => ({ label: SPLIT_LABELS[key] || key, value }))
      .sort((a, b) => b.value - a.value);
  }, [activeOrdersToday]);

  return (
    <div>
      <h2 style={{ marginBottom: "1.25rem" }}>Analytics</h2>
      <div className="o-stat-grid" style={{ marginBottom: "1.5rem" }}>
        {stats.map((s) => (
          <div className="o-stat-card" key={s.label}>
            <strong>{s.value}</strong>
            <span>{s.label}</span>
          </div>
        ))}
      </div>

      <div className="o-panel-grid" style={{ gridTemplateColumns: "1fr", gap: "1.25rem" }}>
        <div className="o-analytics-grid">
          <div className="o-side-card">
            <h3>Top Dishes Today</h3>
            {topItems.length ? <Bars rows={topItems} /> : <EmptyState icon="🍽" title="No orders yet today" subtitle="Top-selling dishes will show up here once orders come in." />}
          </div>

          <div className="o-side-card">
            <h3>Busiest Tables Today</h3>
            {busiestTables.length ? <Bars rows={busiestTables} /> : <EmptyState icon="🪑" title="No orders yet today" subtitle="Table activity will show up here once orders come in." />}
          </div>

          <div className="o-side-card">
            <h3>Orders by Hour</h3>
            {ordersByHour.length ? <Bars rows={ordersByHour} /> : <EmptyState icon="⏱" title="No orders yet today" subtitle="Rush-hour patterns will show up here once orders come in." />}
          </div>

          <div className="o-side-card">
            <h3>Bill Split Preference</h3>
            {splitBreakdown.length ? <Bars rows={splitBreakdown} /> : <EmptyState icon="🧾" title="No orders yet today" subtitle="How tables choose to split the bill will show up here." />}
          </div>
        </div>
      </div>
    </div>
  );
}
