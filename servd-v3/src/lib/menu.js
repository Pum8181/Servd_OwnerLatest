// Same Firestore "menu" collection and field names as index-v2.html /
// owner-v2.html (name, desc, price, cat, order, available, tag,
// discount, image, spiceLevels) — keep this compatible, don't rename
// fields here without updating those files too.
import { collection, doc, onSnapshot, updateDoc, addDoc, writeBatch } from "firebase/firestore";
import { db } from "./firebase";
import { DEMO_MENU_ITEMS } from "./demoMenuSeed";

// onError matters here for the same reason it matters in lib/staff.js:
// a permission-denied or offline listener otherwise fails silently,
// leaving menuItems stuck at [] forever with no indication why.
export function subscribeMenu(onChange, onError) {
  return onSnapshot(
    collection(db, "menu"),
    (snapshot) => {
      const items = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          name: data.name || "",
          desc: data.desc || "",
          price: Number(data.price) || 0,
          cat: data.cat || "",
          order: Number(data.order) || 0,
          available: data.available !== false,
          tag: data.tag || null,
          discount: Number(data.discount) || 0,
          image: data.image || "",
          spiceLevels: data.spiceLevels || {},
          hasSpiceLevels: data.hasSpiceLevels === true,
          // NEW: owner-assignable carousel tags (Trending, Chef's
          // Specials, Today's Discounts, Best Sellers) — additive, on
          // top of the legacy single `tag` field above, which stays
          // untouched for compatibility with index.html/owner.html.
          tags: Array.isArray(data.tags) ? data.tags : [],
        };
      });
      onChange(items);
    },
    (err) => {
      console.error("Menu listener error:", err);
      onError?.(err);
    }
  );
}

// Carousel labels double as the tag values stored on each item — the
// same strings the owner picks in Menu Management's checkboxes and the
// customer-side CarouselSection titles, kept in one place so they can
// never drift out of sync with each other.
export const CAROUSELS = ["Trending", "Chef's Specials", "Today's Discounts", "Best Sellers"];

// "Today's Discounts" gets an automatic boost: anything actually on
// sale shows up there even if nobody remembered to tag it, on top of
// whatever's been tagged manually. The other three carousels are
// purely owner-controlled — there's no automatic signal for "trending"
// the way there is for a discount.
export function itemInCarousel(item, carousel) {
  const tagged = (item.tags || []).includes(carousel);
  if (carousel === "Today's Discounts") return tagged || (item.discount || 0) > 0;
  return tagged;
}

export function setTags(id, tags) {
  return updateDoc(doc(db, "menu", id), { tags });
}

// The customer app's top hero carousel merges these three tags into a
// single "Featured" rail instead of stacking one carousel per tag —
// "Best Sellers" is deliberately left out here (still an assignable
// owner tag, just not surfaced on its own carousel row yet).
export const FEATURED_TAGS = ["Trending", "Chef's Specials", "Today's Discounts"];

export function isFeatured(item) {
  return FEATURED_TAGS.some((tag) => itemInCarousel(item, tag));
}

// Priority order when a card carries more than one tag — only the
// first match becomes the loud, visible badge; the rest collapse into
// a "+n" indicator so cards never turn into a wall of pills.
export const TAG_PRIORITY = ["Today's Discounts", "Chef's Specials", "Trending", "Best Sellers"];

export const TAG_META = {
  "Today's Discounts": { label: "Sale", kind: "discount" },
  "Chef's Specials": { label: "Chef's Special", kind: "chef" },
  "Trending": { label: "Trending", kind: "trending" },
  "Best Sellers": { label: "Best Seller", kind: "bestseller" },
};

export function activeTags(item) {
  return TAG_PRIORITY.filter((t) => itemInCarousel(item, t));
}

export function effectivePrice(item) {
  const discount = item.discount || 0;
  if (discount > 0) return Math.round(item.price * (1 - discount / 100) * 100) / 100;
  return item.price;
}

export function toggleSoldOut(id, available) {
  return updateDoc(doc(db, "menu", id), { available });
}

export function setDiscount(id, discount) {
  return updateDoc(doc(db, "menu", id), { discount: Number(discount) || 0 });
}

export function setPrice(id, price) {
  return updateDoc(doc(db, "menu", id), { price: Number(price) || 0 });
}

export function addMenuItem(item) {
  return addDoc(collection(db, "menu"), item);
}

export function updateMenuItem(id, fields) {
  return updateDoc(doc(db, "menu", id), fields);
}

export function setImage(id, url) {
  return updateDoc(doc(db, "menu", id), { image: url });
}

// Batch-writes a larger, realistic demo menu straight into the real
// Firestore "menu" collection (upsert by fixed id, safe to run more than
// once — re-running just overwrites the same docs rather than
// duplicating them). Deliberately separate from firebase-config.js's
// SEED_MENU (used by index.html/owner.html's "Load starting menu"
// button) so that shared list isn't disrupted for the older pages.
export async function seedFullDemoMenu() {
  const batch = writeBatch(db);
  DEMO_MENU_ITEMS.forEach((item) => {
    const { id, ...fields } = item;
    batch.set(doc(db, "menu", id), fields, { merge: true });
  });
  await batch.commit();
}
