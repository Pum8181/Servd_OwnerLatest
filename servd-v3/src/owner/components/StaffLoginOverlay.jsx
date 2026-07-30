import { useState, useEffect } from "react";
import { subscribeStaff, addStaffMember, getStaffMemberById } from "../../lib/staff";
import { friendlyFirebaseError } from "../../lib/errors";

const PIN_KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "clear", "0", "go"];

// FIX: this screen used to be a dead end when no staff existed yet —
// Staff Management lives inside the dashboard, and the dashboard was
// entirely locked behind this screen, so there was no way to create
// the first profile. Adding staff is now possible directly from here
// (always available as a small link, and shown by default when the
// list is empty), so there's no chicken-and-egg lockout.
function AddStaffForm({ onDone, onCancel }) {
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) { setError("Enter a name."); return; }
    if (!/^\d{4}$/.test(pin)) { setError("PIN must be exactly 4 digits."); return; }
    setSaving(true);
    setError("");
    try {
      await addStaffMember(name, pin);
      onDone();
    } catch (err) {
      console.error(err);
      setError(friendlyFirebaseError(err, "add this staff member"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ textAlign: "left", marginTop: "1.25rem" }}>
      <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--ink-on-forest-muted)", marginBottom: "0.85rem" }}>
        Name
        <input
          type="text" value={name} onChange={(e) => setName(e.target.value)} autoFocus
          style={{ display: "block", width: "100%", marginTop: "0.35rem", padding: "0.75rem 0.9rem", borderRadius: "var(--radius-sm)", border: "1.5px solid var(--line-on-forest)", background: "rgba(255,255,255,0.08)", color: "var(--ink-on-forest)", fontSize: "0.9375rem" }}
        />
      </label>
      <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--ink-on-forest-muted)", marginBottom: "1rem" }}>
        4-Digit PIN
        <input
          type="text" inputMode="numeric" maxLength={4} value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
          style={{ display: "block", width: "100%", marginTop: "0.35rem", padding: "0.75rem 0.9rem", borderRadius: "var(--radius-sm)", border: "1.5px solid var(--line-on-forest)", background: "rgba(255,255,255,0.08)", color: "var(--ink-on-forest)", fontSize: "0.9375rem" }}
        />
      </label>
      {error && <p style={{ color: "var(--accent)", fontSize: "0.8125rem", marginBottom: "0.75rem" }}>{error}</p>}
      <button type="submit" className="c-btn-primary" disabled={saving} style={{ marginBottom: "0.6rem" }}>
        {saving ? "Adding…" : "Add Staff Member"}
      </button>
      {onCancel && (
        <button type="button" className="c-skip-link" style={{ color: "var(--ink-on-forest-muted)" }} onClick={onCancel}>
          Cancel
        </button>
      )}
    </form>
  );
}

export default function StaffLoginOverlay({ onLogin }) {
  const [staff, setStaff] = useState([]);
  const [staffLoaded, setStaffLoaded] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [selected, setSelected] = useState(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [addingStaff, setAddingStaff] = useState(false);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => subscribeStaff(
    (list) => { setStaff(list); setStaffLoaded(true); setLoadError(""); },
    // FIX: a failed listener (e.g. permission-denied because the
    // Firestore rules for "staff" hadn't been added yet) used to just
    // hang here forever with no feedback — staffLoaded never became
    // true, so this screen sat showing an empty, unexplained state.
    // Now it surfaces exactly what went wrong instead.
    (err) => { setStaffLoaded(true); setLoadError(friendlyFirebaseError(err, "load staff profiles")); }
  ), []);

  function pressKey(key) {
    if (key === "clear") { setPin((p) => p.slice(0, -1)); return; }
    if (key === "go") { tryLogin(); return; }
    if (pin.length >= 4) return;
    const next = pin + key;
    setPin(next);
    if (next.length === 4) tryLogin(next);
  }

  // FIX (critical security bug): this used to compare against `selected`,
  // which came from whatever the live listener had cached at the moment
  // the tile was tapped — that can lag a delete performed elsewhere by a
  // few hundred ms to a couple seconds, a real window where a just-removed
  // staff member could still log in. Now every login attempt does a fresh,
  // authoritative read straight from Firestore first, so a deleted profile
  // (or a PIN that's since been changed) can never succeed, no matter what
  // any local snapshot still shows.
  async function tryLogin(value = pin) {
    if (!selected || verifying) return;
    setVerifying(true);
    try {
      const fresh = await getStaffMemberById(selected.id);
      if (!fresh) {
        setError("This profile was removed. Choose another staff member.");
        setPin("");
        setSelected(null);
        return;
      }
      if (value === fresh.pin) {
        setError("");
        onLogin(fresh);
      } else {
        setError("Incorrect PIN — try again");
        setPin("");
      }
    } catch (err) {
      console.error(err);
      setError(friendlyFirebaseError(err, "verify your PIN"));
      setPin("");
    } finally {
      setVerifying(false);
    }
  }

  if (!selected) {
    // Once Firestore has actually responded, an empty list means there
    // truly are no staff yet — go straight to the add-staff form instead
    // of showing a dead-end message.
    const showAddForm = addingStaff || (staffLoaded && staff.length === 0);

    return (
      <div className="o-login-overlay">
        <div className="o-login-card">
          <div className="o-login-brand">🌿 Servd</div>
          <h2>{showAddForm ? "Add a staff profile" : "Who's working this shift?"}</h2>

          {loadError && (
            <p style={{ color: "var(--accent)", fontSize: "0.8125rem", background: "rgba(0,0,0,0.2)", padding: "0.75rem 1rem", borderRadius: "var(--radius-sm)", marginBottom: "1rem", textAlign: "left" }}>
              {loadError}
            </p>
          )}

          {showAddForm ? (
            <>
              <p style={{ color: "var(--ink-on-forest-muted)", fontSize: "0.875rem" }}>
                {staff.length === 0
                  ? "No staff profiles exist yet — add the first one to unlock the dashboard."
                  : "Create a profile for a new team member."}
              </p>
              <AddStaffForm
                onDone={() => setAddingStaff(false)}
                onCancel={staff.length > 0 ? () => setAddingStaff(false) : null}
              />
            </>
          ) : (
            <>
              <div className="o-login-staff-grid">
                {staff.map((s) => (
                  <button key={s.id} type="button" className="o-login-staff-btn" onClick={() => { setSelected(s); setPin(""); setError(""); }}>
                    <span className="o-login-avatar">{s.name.charAt(0).toUpperCase()}</span>
                    {s.name}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="c-skip-link"
                style={{ color: "var(--ink-on-forest-muted)", marginTop: "1.25rem" }}
                onClick={() => setAddingStaff(true)}
              >
                + Add a new staff member
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="o-login-overlay">
      <div className="o-login-card">
        <div className="o-login-brand">🌿 Servd</div>
        <h2>Hi, {selected.name}</h2>
        <p style={{ color: "var(--ink-on-forest-muted)", fontSize: "0.875rem" }}>Enter your 4-digit PIN</p>

        <div className="o-pin-dots">
          {[0, 1, 2, 3].map((i) => <span key={i} className={`o-pin-dot${i < pin.length ? " filled" : ""}`} />)}
        </div>
        {error && <p style={{ color: "var(--accent)", fontSize: "0.8125rem", marginBottom: "0.5rem" }}>{error}</p>}

        <div className="o-pin-keypad">
          {PIN_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              className="o-pin-key"
              onClick={() => pressKey(key)}
              disabled={verifying}
              aria-label={key === "clear" ? "Backspace" : key === "go" ? "Submit" : key}
            >
              {key === "clear" ? "⌫" : key === "go" ? "Go" : key}
            </button>
          ))}
        </div>

        <button type="button" className="c-skip-link" style={{ color: "var(--ink-on-forest-muted)", marginTop: "1rem" }} onClick={() => setSelected(null)}>
          Not you? Switch staff
        </button>
      </div>
    </div>
  );
}
