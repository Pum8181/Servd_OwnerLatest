// "Request a server" — a new, independent Firestore collection
// (serverRequests), deliberately separate from `orders` since this is a
// help-flag, not a food order: different lifecycle (open → resolved,
// no line items), different consumers (a sidebar badge + dedicated
// panel, not the Kanban/kitchen queues).
import { collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot, query, where, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export const COOLDOWN_MS = 4 * 60 * 1000;

const COLLECTION = "serverRequests";

// Table-scoped listener for the customer app — a guest should only ever
// see (and be gated by) their own table's requests, not the whole
// restaurant's.
export function subscribeTableRequests(tableNumber, onChange, onError) {
  return onSnapshot(
    query(collection(db, COLLECTION), where("table_number", "==", tableNumber)),
    (snapshot) => {
      const requests = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      requests.sort((a, b) => (b.requestedAt?.toMillis?.() || 0) - (a.requestedAt?.toMillis?.() || 0));
      onChange(requests);
    },
    (err) => {
      console.error("Server request listener error:", err);
      onError?.(err);
    }
  );
}

// Whole-restaurant listener for the owner dashboard.
export function subscribeAllRequests(onChange, onError) {
  return onSnapshot(
    collection(db, COLLECTION),
    (snapshot) => {
      const requests = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      requests.sort((a, b) => (b.requestedAt?.toMillis?.() || 0) - (a.requestedAt?.toMillis?.() || 0));
      onChange(requests);
    },
    (err) => {
      console.error("Server request listener error:", err);
      onError?.(err);
    }
  );
}

// Given a table's requests (newest first, as returned above), derives
// whether a NEW tap of "Request server" should go through, get bumped
// onto the existing open request, or get blocked with a cooldown
// message — the single source of truth for that logic so the UI
// component doesn't have to duplicate it.
export function getRequestStatus(requests) {
  const latest = requests[0];
  if (!latest) return { canRequest: true, mode: "new" };

  if (latest.status === "resolved") {
    return { canRequest: true, mode: "new" };
  }

  // Still open (or in_progress): only blocked within the cooldown
  // window. Past the window, allow a "bump" (renews the same request's
  // timestamp instead of creating a duplicate) rather than a fresh doc —
  // keeps exactly one active request per table, matching the owner
  // panel's "stays visible until resolved" expectation.
  const requestedMs = latest.requestedAt?.toMillis ? latest.requestedAt.toMillis() : Date.now();
  const elapsed = Date.now() - requestedMs;
  if (elapsed < COOLDOWN_MS) {
    return { canRequest: false, mode: "cooldown", latest, remainingMs: COOLDOWN_MS - elapsed };
  }
  return { canRequest: true, mode: "bump", latest };
}

export async function requestServer(tableNumber, requests) {
  const status = getRequestStatus(requests);
  if (!status.canRequest) return status;

  if (status.mode === "bump") {
    await updateDoc(doc(db, COLLECTION, status.latest.id), { requestedAt: serverTimestamp() });
  } else {
    await addDoc(collection(db, COLLECTION), {
      table_number: tableNumber,
      status: "open",
      source: "server_request",
      requestedAt: serverTimestamp(),
    });
  }
  return { canRequest: true, mode: status.mode };
}

export function markInProgress(id) {
  return updateDoc(doc(db, COLLECTION, id), { status: "in_progress" });
}

export function resolveRequest(id) {
  return updateDoc(doc(db, COLLECTION, id), { status: "resolved", resolvedAt: serverTimestamp() });
}

// Lets the owner dismiss individual resolved requests from the history
// list (or clear all of them) — resolved requests otherwise pile up
// forever with no way to tidy the panel.
export function deleteRequest(id) {
  return deleteDoc(doc(db, COLLECTION, id));
}
