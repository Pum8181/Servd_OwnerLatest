export default function Header({ restaurantName, search, onSearchChange, onProfileClick }) {
  return (
    <>
      <div className="c-header">
        <button type="button" className="c-icon-btn" aria-hidden="true" style={{ visibility: "hidden" }}>·</button>
        <h1>{restaurantName}</h1>
        <button type="button" className="c-avatar-btn" onClick={onProfileClick} aria-label="Profile">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
          </svg>
        </button>
      </div>
      <div className="c-search">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" />
        </svg>
        <input
          type="search"
          placeholder="Search dishes, ingredients…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </>
  );
}
