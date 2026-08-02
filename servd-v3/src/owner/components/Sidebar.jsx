const NAV = [
  { id: "orders", label: "Live Orders", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></svg> },
  { id: "kitchen", label: "Kitchen", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 8h16M6 8v12h12V8M9 8V5h6v3" /></svg> },
  {
    id: "requests", label: "Server Requests",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 3a6 6 0 0 0-6 6v3.5c0 .6-.2 1.1-.6 1.6L4 16h16l-1.4-1.9c-.4-.5-.6-1-.6-1.6V9a6 6 0 0 0-6-6Z" />
        <path d="M9.5 19a2.5 2.5 0 0 0 5 0" />
      </svg>
    ),
  },
  { id: "settings", label: "Menu Management", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19 12a7 7 0 00-.14-1.4l2-1.5-2-3.4-2.3.9a7 7 0 00-2.4-1.4L14 3h-4l-.2 2.2a7 7 0 00-2.4 1.4l-2.3-.9-2 3.4 2 1.5a7 7 0 000 2.8l-2 1.5 2 3.4 2.3-.9a7 7 0 002.4 1.4L10 21h4l.2-2.2a7 7 0 002.4-1.4l2.3.9 2-3.4-2-1.5c.1-.5.1-.9.1-1.4z" /></svg> },
  { id: "qrcodes", label: "QR Codes", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h3v3h-3zM19 14h2v2h-2zM14 19h2v2h-2zM19 19h2v2h-2z" /></svg> },
  { id: "staff", label: "Staff", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="8" r="3" /><path d="M2 20c0-3 3-5 7-5s7 2 7 5" /><circle cx="18" cy="8" r="2.5" /><path d="M16 20c0-2 1-3.5 2.5-4" /></svg> },
  { id: "analytics", label: "Analytics", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 20V10M12 20V4M20 20v-7" /></svg> },
];

export default function Sidebar({ active, onChange, open, onClose, requestCount = 0, orderCount = 0 }) {
  return (
    <>
      {open && <div className="o-sidebar-overlay" onClick={onClose} />}
      <aside className={`o-sidebar${open ? " open" : ""}`}>
        <div className="o-sidebar-brand">
          <span aria-hidden="true">🌿</span> Servd
        </div>
        {NAV.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`o-nav-item${active === item.id ? " active" : ""}`}
            onClick={() => { onChange(item.id); onClose?.(); }}
          >
            {item.icon}
            {item.label}
            {item.id === "requests" && requestCount > 0 && (
              <span className="o-nav-badge">{requestCount}</span>
            )}
            {item.id === "orders" && orderCount > 0 && (
              <span className="o-nav-badge">{orderCount}</span>
            )}
          </button>
        ))}
      </aside>
    </>
  );
}
