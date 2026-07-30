// Same Firestore "orders" collection and field names as index-v2.html /
// owner-v2.html (table_number, guest_identifier, lines[], total, status,
// split_preference, createdAt, edited_by_owner, archived) — this is
// deliberately compatible so orders placed here show up live on the
// existing pages too, and vice versa.
import {
  collection, doc, onSnapshot, addDoc, updateDoc, getDocs, serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export const STATUS = {
  pending: "pending",
  in_progress: "in_progress",
  completed: "completed",
  cancelled: "cancelled",
};

function normalizeStatus(raw) {
  if (Object.values(STATUS).includes(raw)) return raw;
  if (raw === "new") return STATUS.pending;
  if (raw === "preparing" || raw === "ready") return STATUS.in_progress;
  if (raw === "served") return STATUS.completed;
  return STATUS.pending;
}

export function orderGuestName(order) {
  if (order.guest_identifier) return order.guest_identifier;
  if (order.lines?.[0]?.guestIdentifier) return order.lines[0].guestIdentifier;
  return "Guest 1";
}

export function subscribeOrders(onChange, onError) {
  return onSnapshot(
    collection(db, "orders"),
    (snapshot) => {
      const orders = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          table_number: data.table_number || data.table || "",
          guest_identifier: data.guest_identifier || "",
          lines: data.lines || [],
          total: Number(data.total) || 0,
          status: normalizeStatus(data.status),
          createdAt: data.createdAt || null,
          edited_by_owner: data.edited_by_owner === true,
          split_preference: data.split_preference || "one_bill",
          archived: data.archived === true,
          approved_by: data.approved_by || null,
          completedAt: data.completedAt || null,
        };
      });
      orders.sort((a, b) => {
        const ta = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const tb = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return tb - ta;
      });
      onChange(orders);
    },
    (err) => {
      console.error("Orders listener error:", err);
      onError?.(err);
    }
  );
}

export async function createOrder({ tableNumber, guestIdentifier, lines, total, splitPreference }) {
  return addDoc(collection(db, "orders"), {
    table_number: tableNumber || "unassigned",
    guest_identifier: guestIdentifier || "Guest 1",
    lines,
    total,
    status: STATUS.pending,
    split_preference: splitPreference || "one_bill",
    createdAt: serverTimestamp(),
  });
}

// approvedBy is the logged-in staff member's name (see StaffLoginOverlay
// / OwnerApp's activeStaff) — an accountability trail of who confirmed
// this order, not an auth boundary (see lib/staff.js for that caveat).
export function approveOrder(id, approvedBy) {
  return updateDoc(doc(db, "orders", id), {
    status: STATUS.in_progress,
    edited_by_owner: true,
    approved_by: approvedBy || null,
  });
}

export function rejectOrder(id) {
  return updateDoc(doc(db, "orders", id), { status: STATUS.cancelled, edited_by_owner: true });
}

export function completeOrder(id) {
  return updateDoc(doc(db, "orders", id), { status: STATUS.completed, edited_by_owner: true, completedAt: serverTimestamp() });
}

export function archiveOrder(id) {
  return updateDoc(doc(db, "orders", id), { archived: true });
}

// Lets staff fix a pending order (remove an out-of-stock item, adjust a
// quantity) before approving it, rather than only being able to
// approve/reject the order as originally placed.
export function updateOrderLines(id, lines, total) {
  return updateDoc(doc(db, "orders", id), { lines, total, edited_by_owner: true });
}

// Mirrors index-v2.html's resolveSplitPreference: look for an existing
// billing preference already set today for this table before asking the
// customer to choose. One-time read (not a live listener) since this is
// only needed at the moment a new guest starts ordering.
export async function findTodaysSplitPreference(tableNumber) {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const snapshot = await getDocs(collection(db, "orders"));
  let latest = null;
  snapshot.docs.forEach((d) => {
    const data = d.data();
    if ((data.table_number || "unassigned") !== tableNumber) return;
    if (!data.split_preference) return;
    const created = data.createdAt?.toDate ? data.createdAt.toDate() : null;
    if (!created || created < todayStart) return;
    if (!latest || created > latest.created) latest = { value: data.split_preference, created };
  });
  return latest?.value || null;
}
