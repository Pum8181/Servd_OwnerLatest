// Real, persistent image upload for menu items (Firebase Storage), not
// just a local createObjectURL preview — the returned URL is written to
// the menu item's `image` field in Firestore, so it shows on the real
// customer app for anyone, on any device, after a refresh.
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

export async function uploadMenuImage(file, itemId) {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `menu-images/${itemId}-${Date.now()}.${ext}`;
  const fileRef = ref(storage, path);
  await uploadBytes(fileRef, file);
  return getDownloadURL(fileRef);
}
