// New Firestore "staff" collection (name, pin) backing the PIN login
// overlay and the accountability tag on approved orders.
//
// SECURITY CAVEAT (same tradeoff already documented in
// firestore-rules.txt for the owner PIN gate): PINs are stored and
// checked in plain text, client-side. This is a convenience gate to
// know *who* approved an order during a shift, not real authentication
// — anyone with your Firebase web config could read the staff list
// directly. Don't reuse these PINs anywhere sensitive, and treat this
// the same way firestore-rules.txt already tells you to treat the
// owner PIN: fine for a single-restaurant pilot, not a security
// boundary.
import { collection, doc, onSnapshot, addDoc, deleteDoc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

// onError fires for things like a missing Firestore security rule
// (permission-denied) — without it, a failed listener just hangs
// silently forever with no feedback, which is exactly what happened
// here: the staff collection had no matching rule yet, so this errored
// on the very first load and the screen never recovered.
export function subscribeStaff(onChange, onError) {
  return onSnapshot(
    collection(db, "staff"),
    (snapshot) => {
      const staff = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      staff.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
      onChange(staff);
    },
    (err) => {
      console.error("Staff listener error:", err);
      onError?.(err);
    }
  );
}

export function addStaffMember(name, pin) {
  return addDoc(collection(db, "staff"), { name: name.trim(), pin: String(pin) });
}

export function deleteStaffMember(id) {
  return deleteDoc(doc(db, "staff", id));
}

// FIX (critical): logging in used to trust whatever the live `staff`
// listener happened to have cached locally at that moment, which can
// briefly lag a delete (or, worse, never re-check at all once a
// session is already active — see OwnerApp's staff-roster validation).
// This does a fresh, authoritative read straight from Firestore at the
// exact moment of login, so a deleted profile or changed PIN can never
// be used to get in, regardless of what any local snapshot still shows.
export async function getStaffMemberById(id) {
  const snap = await getDoc(doc(db, "staff", id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}
