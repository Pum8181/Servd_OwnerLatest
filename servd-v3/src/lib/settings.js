// Restaurant-wide settings that aren't tied to a single menu item — for
// now just the spice-level names, kept in one Firestore doc
// (settings/general) rather than a whole collection since there's only
// ever one restaurant's worth of this config here.
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "./firebase";

const DOC_REF_PATH = ["settings", "general"];
export const DEFAULT_SPICE_LEVELS = ["Mild", "Medium", "Hot", "Extra Hot"];

export function subscribeSpiceLevels(onChange, onError) {
  return onSnapshot(
    doc(db, ...DOC_REF_PATH),
    (snap) => {
      const data = snap.data();
      const levels = Array.isArray(data?.spiceLevels) ? data.spiceLevels.filter((l) => l && l.trim()) : [];
      onChange(levels.length ? levels : DEFAULT_SPICE_LEVELS);
    },
    (err) => {
      console.error("Settings listener error:", err);
      onError?.(err);
    }
  );
}

export function updateSpiceLevels(levels) {
  const cleaned = levels.map((l) => l.trim()).filter(Boolean);
  return setDoc(doc(db, ...DOC_REF_PATH), { spiceLevels: cleaned }, { merge: true });
}
