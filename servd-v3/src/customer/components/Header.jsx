export default function Header({ restaurantName, search, onSearchChange, onProfileClick, onRequestHelp, helpPending }) {
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

      {/* A labeled pill rather than a bare icon — a bell alone reads as
          decorative/ambiguous, especially to a first-time guest who's
          never used this app before. Spelling out what it does removes
          any guessing. */}
      <button
        type="button"
        className={`c-help-pill${helpPending ? " is-pending" : ""}`}
        onClick={onRequestHelp}
        aria-label={helpPending ? "Server request sent — tap to check status" : "Request a server or get help"}
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 3a6 6 0 0 0-6 6v3.5c0 .6-.2 1.1-.6 1.6L4 16h16l-1.4-1.9c-.4-.5-.6-1-.6-1.6V9a6 6 0 0 0-6-6Z" />
          <path d="M9.5 19a2.5 2.5 0 0 0 5 0" />
        </svg>
        <span>{helpPending ? "Help is on the way" : "Need help? Request a server"}</span>
        {helpPending && <span className="c-help-badge" aria-hidden="true" />}
      </button>

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
