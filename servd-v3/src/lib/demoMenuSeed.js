// Expanded demo menu so the app looks fully populated for a pitch demo.
// Category names ("Appetizers", "Mains", "Drinks", "Desserts") match
// what was asked for exactly.
//
// Images: real, text-free stock food photos via LoremFlickr (a live,
// actively-maintained service that serves real Flickr photos by
// keyword — unlike source.unsplash.com, which was shut down in 2023,
// or hand-picked Unsplash permalinks I can't actually verify still
// resolve from here). `lock=<n>` pins a specific deterministic photo
// per number rather than a new random one on every request, so each
// dish keeps the same image across reloads. These are honest stand-ins,
// not curated shots of the actual dishes — swap via Menu Management's
// photo upload whenever the restaurant has real photography.
function placeholderImage(seed, keywords) {
  return `https://loremflickr.com/800/600/${keywords}/all?lock=${seed}`;
}

// Simple deterministic string hash — a length-based seed would collide
// constantly (lots of dish names share a length), this doesn't.
function hashSeed(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash % 10000;
}

// tags: manually assignable in Menu Management, and what actually
// drives the customer-side carousels now (see CarouselSection /
// lib/menu.js#itemInCarousel) — replaces the earlier heuristic that
// piggybacked on the single legacy `tag` field. "Today's Discounts"
// still auto-includes anything with discount > 0 on top of whatever's
// tagged here, see itemInCarousel.
const RAW_ITEMS = [
  // ── Appetizers ──────────────────────────────────────────────────
  { id: "app-samosa-chaat", name: "Samosa Chaat", desc: "Crushed samosa topped with chickpeas, yogurt, tamarind & mint chutney", price: 9.95, cat: "Appetizers", order: 1, available: true, tag: "popular", discount: 0, spiceLevels: {}, tags: ["Trending"], keywords: "samosa,indian-food" },
  { id: "app-paneer-tikka", name: "Paneer Tikka", desc: "Cottage cheese marinated in tandoori spices, char-grilled with peppers & onion", price: 14.95, cat: "Appetizers", order: 2, available: true, tag: "chef", discount: 0, spiceLevels: { Mild: 0, Medium: 0, Hot: 0.5, "Extra Hot": 1 }, tags: ["Chef's Specials"], keywords: "paneer,tikka" },
  { id: "app-chicken-tikka", name: "Chicken Tikka", desc: "Boneless chicken thigh, yogurt-marinated, finished in the tandoor", price: 15.95, cat: "Appetizers", order: 3, available: true, tag: null, discount: 0, spiceLevels: { Mild: 0, Medium: 0, Hot: 0.5, "Extra Hot": 1 }, tags: ["Best Sellers"], keywords: "chicken-tikka" },
  { id: "app-veg-pakora", name: "Vegetable Pakora", desc: "Mixed vegetable fritters in a spiced chickpea batter, tamarind chutney", price: 8.95, cat: "Appetizers", order: 4, available: true, tag: null, discount: 15, spiceLevels: {}, tags: [], keywords: "pakora,fritters" },
  { id: "app-galouti-kebab", name: "Galouti Kebab With Two Parantha", desc: "Melt-in-your-mouth, finely spiced kebabs made from tender minced meat, served with two soft, crispy paranthas.", price: 18.50, cat: "Appetizers", order: 5, available: true, tag: "chef", discount: 0, spiceLevels: { Mild: 0, Medium: 0, Hot: 0, "Extra Hot": 0 }, tags: ["Chef's Specials"], keywords: "kebab,indian-food" },

  // ── Mains ───────────────────────────────────────────────────────
  { id: "main-butter-chicken", name: "Butter Chicken", desc: "Tandoori chicken in rich tomato-butter gravy with fenugreek & cream", price: 19.95, cat: "Mains", order: 1, available: true, tag: "chef", discount: 0, spiceLevels: { Mild: 0, Medium: 0, Hot: 0, "Extra Hot": 0 }, tags: ["Chef's Specials", "Trending"], keywords: "butter-chicken,curry" },
  { id: "main-dal-makhani", name: "Dal Makhani", desc: "Slow-cooked black lentils & kidney beans in cream, butter & tomato", price: 16.95, cat: "Mains", order: 2, available: true, tag: "popular", discount: 0, spiceLevels: {}, tags: ["Trending"], keywords: "dal,lentils" },
  { id: "main-palak-paneer", name: "Palak Paneer", desc: "Fresh spinach purée with soft paneer cubes, garlic & garam masala", price: 17.95, cat: "Mains", order: 3, available: true, tag: null, discount: 0, spiceLevels: {}, tags: [], keywords: "palak-paneer,spinach" },
  { id: "main-lamb-rogan-josh", name: "Lamb Rogan Josh", desc: "Kashmiri-style braised lamb in aromatic red gravy with whole spices", price: 22.95, cat: "Mains", order: 4, available: true, tag: null, discount: 10, spiceLevels: { Mild: 0, Medium: 0, Hot: 0, "Extra Hot": 0 }, tags: [], keywords: "lamb-curry" },
  { id: "main-chicken-biryani", name: "Hyderabadi Chicken Biryani", desc: "Fragrant basmati layered with spiced chicken, fried onions & saffron", price: 21.95, cat: "Mains", order: 5, available: true, tag: "popular", discount: 0, spiceLevels: { Mild: 0, Medium: 0, Hot: 0, "Extra Hot": 0 }, tags: ["Trending", "Best Sellers"], keywords: "biryani" },
  { id: "main-veg-biryani", name: "Vegetable Biryani", desc: "Seasonal vegetables & cashews with jeera rice, dum-cooked", price: 17.95, cat: "Mains", order: 6, available: true, tag: null, discount: 0, spiceLevels: {}, tags: ["Best Sellers"], keywords: "vegetable-biryani,rice" },

  // ── Drinks ──────────────────────────────────────────────────────
  { id: "drink-mango-lassi", name: "Mango Lassi", desc: "Thick yogurt drink blended with Alphonso mango pulp", price: 5.95, cat: "Drinks", order: 1, available: true, tag: "popular", discount: 0, spiceLevels: {}, tags: ["Trending"], keywords: "mango-lassi,smoothie" },
  { id: "drink-masala-chai", name: "Masala Chai", desc: "Black tea simmered with cardamom, ginger, cinnamon & cloves", price: 3.95, cat: "Drinks", order: 2, available: true, tag: null, discount: 0, spiceLevels: {}, tags: [], keywords: "chai,tea" },
  { id: "drink-sweet-lassi", name: "Sweet Lassi", desc: "Classic yogurt drink, lightly sweetened and chilled", price: 4.95, cat: "Drinks", order: 3, available: true, tag: null, discount: 0, spiceLevels: {}, tags: ["Best Sellers"], keywords: "lassi,yogurt-drink" },
  { id: "drink-nimbu-pani", name: "Nimbu Pani", desc: "Fresh lime soda with a pinch of black salt and mint", price: 4.50, cat: "Drinks", order: 4, available: true, tag: null, discount: 0, spiceLevels: {}, tags: [], keywords: "lime-soda,mint" },
  { id: "drink-sparkling-water", name: "Sparkling Water", desc: "Chilled sparkling water, served with lime", price: 3.50, cat: "Drinks", order: 5, available: true, tag: null, discount: 0, spiceLevels: {}, tags: [], keywords: "sparkling-water" },

  // ── Desserts ────────────────────────────────────────────────────
  { id: "dessert-gulab-jamun", name: "Gulab Jamun", desc: "Soft milk-solid dumplings soaked in rose-cardamom syrup", price: 6.95, cat: "Desserts", order: 1, available: true, tag: "popular", discount: 0, spiceLevels: {}, tags: ["Trending"], keywords: "gulab-jamun,dessert" },
  { id: "dessert-rasmalai", name: "Rasmalai", desc: "Delicate cottage cheese dumplings in chilled saffron-pistachio milk", price: 7.50, cat: "Desserts", order: 2, available: true, tag: "chef", discount: 0, spiceLevels: {}, tags: ["Chef's Specials"], keywords: "rasmalai,indian-dessert" },
  { id: "dessert-kheer", name: "Kheer", desc: "Slow-simmered rice pudding with cardamom, saffron & toasted almonds", price: 6.50, cat: "Desserts", order: 3, available: true, tag: null, discount: 0, spiceLevels: {}, tags: ["Best Sellers"], keywords: "rice-pudding,kheer" },
  { id: "dessert-gajar-halwa", name: "Gajar Ka Halwa", desc: "Warm carrot halwa slow-cooked in milk and ghee, topped with pistachios", price: 6.95, cat: "Desserts", order: 4, available: true, tag: null, discount: 20, spiceLevels: {}, tags: ["Today's Discounts"], keywords: "carrot-halwa,dessert" },
];

export const DEMO_MENU_ITEMS = RAW_ITEMS.map(({ keywords, ...item }) => ({
  ...item,
  image: placeholderImage(hashSeed(item.id), keywords),
}));
