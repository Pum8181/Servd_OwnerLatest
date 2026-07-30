const ICONS = {
  home: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /></svg>,
  search: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>,
  heart: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21s-7-4.5-9.5-9C.7 8 2 4 6 4c2 0 3.5 1 4 2 0.5-1 2-2 4-2 4 0 5.3 4 3.5 8-2.5 4.5-9.5 9-9.5 9z" /></svg>,
  profile: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 4-6 8-6s8 2 8 6" /></svg>,
};

export default function BottomNav({ active, onChange, cartCount }) {
  const items = [
    { id: "home", icon: ICONS.home },
    { id: "search", icon: ICONS.search },
    { id: "cart", icon: ICONS.heart, badge: cartCount > 0 },
    { id: "profile", icon: ICONS.profile },
  ];
  return (
    <nav className="c-bottom-nav" aria-label="Primary">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`c-nav-btn${active === item.id ? " active" : ""}`}
          onClick={() => onChange(item.id)}
          aria-label={item.id}
        >
          {item.icon}
          {item.badge && <span className="c-nav-badge" aria-hidden="true" />}
        </button>
      ))}
    </nav>
  );
}
