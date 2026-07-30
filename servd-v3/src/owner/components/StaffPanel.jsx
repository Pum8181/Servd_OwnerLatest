import { useState, useEffect } from "react";
import { subscribeStaff, addStaffMember, deleteStaffMember } from "../../lib/staff";
import { friendlyFirebaseError } from "../../lib/errors";

export default function StaffPanel() {
  const [staff, setStaff] = useState([]);
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => subscribeStaff(setStaff, (err) => setError(friendlyFirebaseError(err, "load staff profiles"))), []);

  async function handleAdd(e) {
    e.preventDefault();
    if (!name.trim()) { setError("Enter a name."); return; }
    if (!/^\d{4}$/.test(pin)) { setError("PIN must be exactly 4 digits."); return; }
    if (staff.some((s) => s.pin === pin)) { setError("That PIN is already in use by another staff member."); return; }
    setSaving(true);
    setError("");
    try {
      await addStaffMember(name, pin);
      setName("");
      setPin("");
    } catch (err) {
      console.error(err);
      setError(friendlyFirebaseError(err, "add this staff member"));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Remove this staff member? They won't be able to log in with this PIN anymore.")) return;
    try {
      await deleteStaffMember(id);
    } catch (err) {
      console.error(err);
      alert(friendlyFirebaseError(err, "remove this staff member"));
    }
  }

  return (
    <div>
      <h2 style={{ marginBottom: "0.5rem" }}>Staff</h2>
      <p style={{ color: "var(--ink-muted)", marginBottom: "1.25rem", fontSize: "0.9375rem", maxWidth: 560 }}>
        Staff profiles here power the PIN login screen for this dashboard, and get tagged onto
        any order they approve. PINs are stored in plain text for this pilot, treat this as a
        shift-accountability convenience, not real account security.
      </p>

      <form onSubmit={handleAdd} className="o-side-card" style={{ maxWidth: 420, marginBottom: "1.5rem" }}>
        <h3>Add Staff</h3>
        <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--ink-muted)", marginBottom: "0.85rem" }}>
          Name
          <input
            type="text" value={name} onChange={(e) => setName(e.target.value)}
            style={{ display: "block", width: "100%", marginTop: "0.35rem", padding: "0.7rem 0.85rem", borderRadius: "var(--radius-sm)", border: "1.5px solid var(--line)", fontSize: "0.9375rem" }}
          />
        </label>
        <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--ink-muted)", marginBottom: "0.85rem" }}>
          4-Digit PIN
          <input
            type="text" inputMode="numeric" maxLength={4} value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
            style={{ display: "block", width: "100%", marginTop: "0.35rem", padding: "0.7rem 0.85rem", borderRadius: "var(--radius-sm)", border: "1.5px solid var(--line)", fontSize: "0.9375rem" }}
          />
        </label>
        {error && <p style={{ color: "var(--accent-deep)", fontSize: "0.8125rem", marginBottom: "0.75rem" }}>{error}</p>}
        <button type="submit" className="o-btn-approve" disabled={saving} style={{ width: "100%" }}>
          {saving ? "Adding…" : "Add Staff Member"}
        </button>
      </form>

      <h3 style={{ fontSize: "0.9375rem", marginBottom: "0.75rem", color: "var(--ink-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
        Current Staff
      </h3>
      {staff.length === 0 && <p style={{ color: "var(--ink-muted)" }}>No staff added yet.</p>}
      {staff.map((s) => (
        <div className="o-menu-row" key={s.id}>
          <div className="o-menu-row-name">{s.name}<span>PIN set</span></div>
          <button type="button" className="o-btn-reject" onClick={() => handleDelete(s.id)}>Remove</button>
        </div>
      ))}
    </div>
  );
}
