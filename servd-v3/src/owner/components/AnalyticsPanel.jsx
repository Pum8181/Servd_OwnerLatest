export default function AnalyticsPanel({ orders, menuItems }) {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const ordersToday = orders.filter((o) => o.createdAt?.toDate && o.createdAt.toDate() >= todayStart);
  const liveKitchen = orders.filter((o) => o.status === "pending" || o.status === "in_progress").length;
  const soldOut = menuItems.filter((i) => !i.available).length;
  const markdown = menuItems.filter((i) => (i.discount || 0) > 0).length;
  const revenueToday = ordersToday.filter((o) => o.status !== "cancelled").reduce((s, o) => s + o.total, 0);

  const stats = [
    { label: "Orders Today", value: ordersToday.length },
    { label: "Live In Kitchen", value: liveKitchen },
    { label: "Revenue Today", value: `$${revenueToday.toFixed(0)}` },
    { label: "Sold Out Items", value: soldOut },
    { label: "On Markdown", value: markdown },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: "1.25rem" }}>Analytics</h2>
      <div className="o-stat-grid">
        {stats.map((s) => (
          <div className="o-stat-card" key={s.label}>
            <strong>{s.value}</strong>
            <span>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
