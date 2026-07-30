/**
 * Indian Courtyard — Firebase + demo fallback
 *
 * Replace placeholder values with your Firebase web app config.
 * Until then the app runs in demo mode (localStorage) so you can
 * preview the full UI without Firebase setup.
 */

const firebaseConfig = {
  apiKey: "AIzaSyBhoTod-an3v3JDvNlmTVpQfZDbDF4mNU4",
  authDomain: "digital-menu-7d1b3.firebaseapp.com",
  projectId: "digital-menu-7d1b3",
  storageBucket: "digital-menu-7d1b3.firebasestorage.app",
  messagingSenderId: "714935484620",
  appId: "1:714935484620:web:9ee239f2f98bd9968fc269"
};

firebase.initializeApp(firebaseConfig);
window.db = firebase.firestore();

const IS_DEMO =
  !firebaseConfig.apiKey ||
  firebaseConfig.apiKey === "YOUR_API_KEY" ||
  firebaseConfig.projectId === "YOUR_PROJECT_ID";

window.IC_IS_DEMO = IS_DEMO;

// NOTE: this is a generic starter menu for demoing the system — swap it
// out with your real menu via owner.html's "Add new item" form (see
// README.md). "Galouti Kebab With Two Parantha" below is the one real,
// confirmed item from indiancourtyard.com's public menu page — it's
// included with spice_levels enabled to demonstrate that feature end to
// end. Every other item here is placeholder demo data.
const SEED_MENU = [
  { id: "galouti-kebab", name: "Galouti Kebab With Two Parantha", desc: "Melt-in-your-mouth, finely spiced kebabs made from tender minced meat, served with two soft, crispy paranthas.", price: 18.50, cat: "Non-Vegetarian Appetizers", order: 1, available: true, tag: "chef", discount: 0, spiceLevels: { Mild: 0, Medium: 0, Hot: 0, "Extra Hot": 0 } },
  { id: "samosa-chaat", name: "Samosa Chaat", desc: "Crushed samosa topped with chickpeas, yogurt, tamarind & mint chutney", price: 9.95, cat: "Starters", order: 1, available: true, tag: "popular", discount: 0 },
  { id: "paneer-tikka", name: "Paneer Tikka", desc: "Cottage cheese marinated in tandoori spices, char-grilled with peppers & onion", price: 14.95, cat: "Starters", order: 2, available: true, tag: "chef", discount: 0 },
  { id: "chicken-tikka", name: "Chicken Tikka", desc: "Boneless chicken thigh, yogurt-marinated, finished in the tandoor", price: 15.95, cat: "Starters", order: 3, available: true, tag: null, discount: 0 },
  { id: "dal-makhani", name: "Dal Makhani", desc: "Slow-cooked black lentils & kidney beans in cream, butter & tomato", price: 16.95, cat: "Mains", order: 1, available: true, tag: "popular", discount: 0 },
  { id: "butter-chicken", name: "Butter Chicken", desc: "Tandoori chicken in rich tomato-butter gravy with fenugreek & cream", price: 19.95, cat: "Mains", order: 2, available: true, tag: "chef", discount: 0 },
  { id: "palak-paneer", name: "Palak Paneer", desc: "Fresh spinach purée with soft paneer cubes, garlic & garam masala", price: 17.95, cat: "Mains", order: 3, available: true, tag: null, discount: 0 },
  { id: "lamb-rogan-josh", name: "Lamb Rogan Josh", desc: "Kashmiri-style braised lamb in aromatic red gravy with whole spices", price: 22.95, cat: "Mains", order: 4, available: true, tag: null, discount: 0 },
  { id: "chicken-biryani", name: "Hyderabadi Chicken Biryani", desc: "Fragrant basmati layered with spiced chicken, fried onions & saffron", price: 21.95, cat: "Biryani & Rice", order: 1, available: true, tag: "popular", discount: 0 },
  { id: "veg-biryani", name: "Vegetable Biryani", desc: "Seasonal vegetables & cashews with jeera rice, dum-cooked", price: 17.95, cat: "Biryani & Rice", order: 2, available: true, tag: null, discount: 0 },
  { id: "jeera-rice", name: "Jeera Rice", desc: "Basmati rice tempered with cumin seeds & ghee", price: 5.95, cat: "Biryani & Rice", order: 3, available: true, tag: null, discount: 0 },
  { id: "pav-bhaji", name: "Pav Bhaji", desc: "Mumbai-style spiced vegetable mash with buttered pav rolls", price: 13.95, cat: "Street Food", order: 1, available: true, tag: "chef", discount: 0 },
  { id: "chole-bhature", name: "Chole Bhature", desc: "Punjabi chickpea curry with fluffy fried bread — weekend favourite", price: 14.95, cat: "Street Food", order: 2, available: true, tag: null, discount: 0 },
  { id: "garlic-naan", name: "Garlic Naan", desc: "Tandoor-baked leavened bread brushed with garlic butter", price: 4.95, cat: "Breads", order: 1, available: true, tag: "popular", discount: 0 },
  { id: "butter-naan", name: "Butter Naan", desc: "Classic soft naan finished with melted butter", price: 3.95, cat: "Breads", order: 2, available: true, tag: null, discount: 0 },
  { id: "mango-lassi", name: "Mango Lassi", desc: "Thick yogurt drink blended with Alphonso mango pulp", price: 5.95, cat: "Beverages", order: 1, available: true, tag: null, discount: 0 },
];

window.IC_SEED_MENU = SEED_MENU;

function createDemoDb() {
  const MENU_KEY = "ic_demo_menu";
  const ORDERS_KEY = "ic_demo_orders";

  function loadMenu() {
    try {
      const raw = localStorage.getItem(MENU_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* ignore */ }
    return SEED_MENU.map(function (item) { return Object.assign({}, item); });
  }

  function saveMenu(items) {
    localStorage.setItem(MENU_KEY, JSON.stringify(items));
  }

  function loadOrders() {
    try {
      const raw = localStorage.getItem(ORDERS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* ignore */ }
    return [];
  }

  function saveOrders(items) {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(items));
  }

  let menuItems = loadMenu();
  let orders = loadOrders();
  const listeners = { menu: new Set(), orders: new Set() };

  function notify(type) {
    listeners[type].forEach(function (fn) {
      try { fn(makeSnapshot(type)); } catch (e) { console.error(e); }
    });
  }

  function makeSnapshot(type) {
    const list = type === "menu" ? menuItems : orders;
    return {
      docs: list.map(function (item) {
        return {
          id: item.id,
          data: function () {
            const copy = Object.assign({}, item);
            delete copy.id;
            return copy;
          },
        };
      }),
      empty: list.length === 0,
    };
  }

  function makeDocRef(collection, id) {
    return {
      update: function (fields) {
        return new Promise(function (resolve) {
          if (collection === "menu") {
            menuItems = menuItems.map(function (item) {
              if (item.id !== id) return item;
              return Object.assign({}, item, fields);
            });
            saveMenu(menuItems);
            notify("menu");
          } else {
            orders = orders.map(function (item) {
              if (item.id !== id) return item;
              return Object.assign({}, item, fields);
            });
            saveOrders(orders);
            notify("orders");
          }
          resolve();
        });
      },
      set: function (data) {
        return new Promise(function (resolve) {
          const existing = menuItems.findIndex(function (m) { return m.id === id; });
          const doc = Object.assign({ id: id }, data);
          if (existing >= 0) menuItems[existing] = doc;
          else menuItems.push(doc);
          saveMenu(menuItems);
          notify("menu");
          resolve();
        });
      },
    };
  }

  return {
    collection: function (name) {
      return {
        orderBy: function () { return this; },
        onSnapshot: function (onNext, onError) {
          const set = name === "menu" ? listeners.menu : listeners.orders;
          set.add(onNext);
          try {
            onNext(makeSnapshot(name));
          } catch (e) {
            if (onError) onError(e);
          }
          return function () { set.delete(onNext); };
        },
        add: function (data) {
          return new Promise(function (resolve) {
            const id = "ord_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
            const order = Object.assign({ id: id, createdAt: { toDate: function () { return new Date(); }, toMillis: function () { return Date.now(); } } }, data);
            orders.unshift(order);
            saveOrders(orders);
            notify("orders");
            resolve({ id: id });
          });
        },
        doc: function (id) {
          return makeDocRef(name, id);
        },
        get: function () {
          return Promise.resolve(makeSnapshot(name));
        },
      };
    },
    batch: function () {
      const ops = [];
      return {
        set: function (ref, data) {
          ops.push({ ref: ref, data: data });
        },
        commit: function () {
          return Promise.all(ops.map(function (op) {
            return op.ref.set(op.data);
          }));
        },
      };
    },
    seedMenuIfEmpty: function () {
      if (menuItems.length === 0) {
        menuItems = SEED_MENU.map(function (item) { return Object.assign({}, item); });
        saveMenu(menuItems);
        notify("menu");
      }
    },
  };
}

let db;

if (IS_DEMO) {
  db = createDemoDb();
  db.seedMenuIfEmpty();
  window.firebase = {
    firestore: {
      FieldValue: {
        serverTimestamp: function () {
          return { toDate: function () { return new Date(); }, toMillis: function () { return Date.now(); } };
        },
      },
    },
  };
} else {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  db = firebase.firestore();
}

window.db = db;
