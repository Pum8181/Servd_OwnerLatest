// Turns a raw Firebase error into something a restaurant owner (not a
// developer) can actually act on. permission-denied specifically is
// almost always a missing/stale Firestore security rule — see
// firestore-rules.txt at the project root for what to paste into
// Firebase Console → Firestore Database → Rules.
export function friendlyFirebaseError(err, context = "save this") {
  if (err?.code === "permission-denied") {
    return "Permission denied by Firestore. Your security rules don't allow this yet — paste the current firestore-rules.txt into Firebase Console → Firestore Database → Rules, then try again.";
  }
  if (err?.code === "unavailable") {
    return "Couldn't reach Firestore. Check your internet connection and try again.";
  }
  return err?.message ? `Could not ${context}: ${err.message}` : `Could not ${context}. Please try again.`;
}
