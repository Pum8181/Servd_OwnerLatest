// Same Firebase project as firebase-config.js (used by index-v2.html /
// owner-v2.html), so orders and menu items placed here show up live on
// both the old pages and these new ones, and vice versa. Do not point
// this at a different project unless you intend to fork the data.
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBhoTod-an3v3JDvNlmTVpQfZDbDF4mNU4",
  authDomain: "digital-menu-7d1b3.firebaseapp.com",
  projectId: "digital-menu-7d1b3",
  storageBucket: "digital-menu-7d1b3.firebasestorage.app",
  messagingSenderId: "714935484620",
  appId: "1:714935484620:web:9ee239f2f98bd9968fc269",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
// Real, persistent image storage for menu-item photos uploaded from the
// owner dashboard (see src/lib/storage.js). Requires Storage security
// rules to be set in the Firebase console — see storage-rules.txt at
// the project root for the rules to paste in, mirroring how
// firestore-rules.txt already documents the Firestore rules.
export const storage = getStorage(app);
