import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { subscribeMenu, effectivePrice, isFeatured, itemInCarousel } from "../lib/menu";
import { createOrder, findTodaysSplitPreference } from "../lib/orders";
import { friendlyFirebaseError } from "../lib/errors";
import Header from "./components/Header";
import CategoryPills from "./components/CategoryPills";
import FeaturedCarousel from "./components/FeaturedCarousel";
import DishCard from "./components/DishCard";
import BottomNav from "./components/BottomNav";
import GuestModal from "./components/GuestModal";
import SplitModal from "./components/SplitModal";
import CartSheet from "./components/CartSheet";
import ServerRequestModal from "./components/ServerRequestModal";
import { useServerRequest } from "./useServerRequest";

const RESTAURANT_NAME = "Servd";

function readTableFromUrl() {
  const raw = (new URLSearchParams(window.location.search).get("table") || "").trim();
  if (!raw) return "";
  if (!/^[A-Za-z0-9][A-Za-z0-9 _-]{0,19}$/.test(raw)) return "";
  return raw;
}

export default function CustomerApp() {
  const [menuItems, setMenuItems] = useState([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const [cart, setCart] = useState({});
  const [navTab, setNavTab] = useState("home");
  const [cartOpen, setCartOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState(false);

  const [table] = useState(() => {
    const urlTable = readTableFromUrl();
    if (urlTable) sessionStorage.setItem("ic_table_number", urlTable);
    return urlTable || sessionStorage.getItem("ic_table_number") || "unassigned";
  });
  const [guestIdentifier, setGuestIdentifier] = useState(() => sessionStorage.getItem("ic_guest_identifier") || "");
  const [splitPreference, setSplitPreference] = useState(() => sessionStorage.getItem("ic_split_preference") || "");
  const [guestModalOpen, setGuestModalOpen] = useState(false);
  const [splitModalOpen, setSplitModalOpen] = useState(false);
  const [pendingItem, setPendingItem] = useState(null);
  const [toast, setToast] = useState("");
  const [loadError, setLoadError] = useState("");

  const serverRequest = useServerRequest(table);

  useEffect(() => subscribeMenu(setMenuItems, (err) => setLoadError(friendlyFirebaseError(err, "load the menu"))), []);

  // FIX (cart-state bug): the guest-name prompt only ever gated on
  // `!guestIdentifier`, which — once set — stayed truthy for the rest
  // of the browser session, by original design (asked once, not asked
  // again just because the cart temporarily emptied). In practice that
  // reads as "the prompt stopped working" once you empty and refill the
  // cart. Real fix: when the cart genuinely returns to empty (after
  // having items), clear the guest identifier so the next add asks
  // again — a different person may have picked the phone back up.
  // Deliberately NOT resetting splitPreference here: that's a
  // table-level lock (see resolveSplitPreference/findTodaysSplitPreference),
  // not a per-guest one, and should keep holding even if one guest's
  // cart empties, otherwise re-opening it could silently relock the
  // whole table to a different billing split mid-visit.
  const cartHadItemsRef = useRef(false);
  useEffect(() => {
    const hasItems = Object.keys(cart).length > 0;
    if (hasItems) {
      cartHadItemsRef.current = true;
    } else if (cartHadItemsRef.current) {
      cartHadItemsRef.current = false;
      setGuestIdentifier("");
      sessionStorage.removeItem("ic_guest_identifier");
    }
  }, [cart]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const categories = useMemo(() => {
    const set = new Set(menuItems.map((i) => i.cat).filter(Boolean));
    return Array.from(set).sort();
  }, [menuItems]);

  const filtered = useMemo(() => {
    let items = menuItems;
    if (activeCategory) items = items.filter((i) => i.cat === activeCategory);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      items = items.filter((i) => i.name.toLowerCase().includes(q) || (i.desc || "").toLowerCase().includes(q));
    }
    return items;
  }, [menuItems, activeCategory, search]);

  // Single merged "Featured" rail (Trending / Chef's Specials / Today's
  // Discounts) instead of four stacked per-tag carousels. Built from the
  // full menu, not the category/search-filtered list, since this is
  // meant to surface highlights regardless of what's being searched for
  // in the grid below.
  const featuredItems = useMemo(() => menuItems.filter(isFeatured), [menuItems]);
  const bestSellerItems = useMemo(
    () => menuItems.filter((i) => itemInCarousel(i, "Best Sellers")),
    [menuItems]
  );

  // Main menu grouped by category (elegant serif header + grid per
  // group), in the same order as the category pills above it, so
  // filtering by a pill or by search still lands in the right group.
  const categorizedItems = useMemo(() => {
    const groups = new Map();
    filtered.forEach((item) => {
      const cat = item.cat || "Other";
      if (!groups.has(cat)) groups.set(cat, []);
      groups.get(cat).push(item);
    });
    const ordered = [];
    categories.forEach((cat) => {
      if (groups.has(cat)) {
        ordered.push([cat, groups.get(cat)]);
        groups.delete(cat);
      }
    });
    groups.forEach((items, cat) => ordered.push([cat, items]));
    return ordered;
  }, [filtered, categories]);

  function cartKey(item) { return item.id; }

  function applyAdd(item, delta) {
    const key = cartKey(item);
    setCart((prev) => {
      const next = { ...prev };
      const price = effectivePrice(item);
      if (!next[key] && delta > 0) {
        next[key] = { name: item.name, qty: 0, price, menuItemId: item.id, spiceLevel: null, guestIdentifier };
      }
      if (!next[key]) return prev;
      next[key] = { ...next[key], qty: next[key].qty + delta };
      if (next[key].qty <= 0) delete next[key];
      return next;
    });
  }

  const resolveSplitPreference = useCallback(async (callback) => {
    if (splitPreference) { callback(); return; }
    try {
      const locked = await findTodaysSplitPreference(table);
      if (locked) {
        setSplitPreference(locked);
        sessionStorage.setItem("ic_split_preference", locked);
        setToast(`This table has chosen: ${locked === "one_bill" ? "One bill for the table" : locked === "split_equal" ? "Split equally" : "Split by what I ordered"}`);
        callback();
      } else {
        setPendingItem({ resumeAfterSplit: true, callback });
        setSplitModalOpen(true);
      }
    } catch (err) {
      console.error(err);
      setSplitPreference("one_bill");
      sessionStorage.setItem("ic_split_preference", "one_bill");
      callback();
    }
  }, [splitPreference, table]);

  function handleAdd(item, delta) {
    if (delta > 0 && !guestIdentifier) {
      setPendingItem({ item, delta });
      setGuestModalOpen(true);
      return;
    }
    if (delta > 0 && !splitPreference) {
      setPendingItem({ item, delta });
      resolveSplitPreference(() => applyAdd(item, delta));
      return;
    }
    applyAdd(item, delta);
  }

  function handleGuestResolved(name) {
    setGuestIdentifier(name);
    sessionStorage.setItem("ic_guest_identifier", name);
    setGuestModalOpen(false);
    const pending = pendingItem;
    setPendingItem(null);
    if (!pending) return;
    if (!splitPreference) {
      resolveSplitPreference(() => applyAdd(pending.item, pending.delta));
    } else {
      applyAdd(pending.item, pending.delta);
    }
  }

  function handleChangeSplit() {
    setSplitModalOpen(true);
  }

  function handleSplitResolved(value) {
    setSplitPreference(value);
    sessionStorage.setItem("ic_split_preference", value);
    setSplitModalOpen(false);
    const pending = pendingItem;
    setPendingItem(null);
    if (pending?.item) applyAdd(pending.item, pending.delta);
    else if (pending?.callback) pending.callback();
  }

  const total = Object.values(cart).reduce((sum, l) => sum + l.qty * l.price, 0);
  const cartCount = Object.values(cart).reduce((sum, l) => sum + l.qty, 0);

  async function handleConfirmOrder() {
    if (submitting || total <= 0) return;
    setSubmitting(true);
    try {
      const lines = Object.values(cart).map((l) => ({
        name: l.name, qty: l.qty, price: l.price, spiceLevel: l.spiceLevel || null,
        menuItemId: l.menuItemId, guestIdentifier: l.guestIdentifier || guestIdentifier,
      }));
      await createOrder({ tableNumber: table, guestIdentifier, lines, total, splitPreference: splitPreference || "one_bill" });
      setCart({});
      setCartOpen(false);
      setPlaced(true);
    } catch (err) {
      console.error(err);
      alert(friendlyFirebaseError(err, "send your order"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="c-app">
      <div className="c-wrap">
        <Header
          restaurantName={RESTAURANT_NAME}
          search={search}
          onSearchChange={setSearch}
          onProfileClick={() => setNavTab("profile")}
          onRequestHelp={serverRequest.openModal}
          helpPending={serverRequest.pending}
        />

        {(loadError || serverRequest.error) && (
          <div style={{ background: "rgba(217, 114, 75, 0.16)", color: "var(--accent)", padding: "0.75rem 1rem", borderRadius: "var(--radius-sm)", fontSize: "0.8125rem", marginBottom: "1rem" }}>
            {loadError || serverRequest.error}
          </div>
        )}

        {toast && (
          <div style={{ background: "var(--forest-light)", padding: "0.6rem 1rem", borderRadius: "var(--radius-pill)", fontSize: "0.8125rem", marginBottom: "1rem", textAlign: "center" }}>
            {toast}
          </div>
        )}

        {/* One merged hero carousel (Trending / Chef's Specials /
            Today's Discounts combined) instead of a wall of repetitive
            per-tag rows — renders nothing if no items qualify. */}
        <FeaturedCarousel
          title="Featured"
          items={featuredItems}
          cart={cart}
          onAdd={(item) => handleAdd(item, 1)}
          onRemove={(item) => handleAdd(item, -1)}
        />

        {/* Best Sellers gets its own rail (rather than being folded
            into Featured) since it's a distinct signal from "trending
            right now" / chef picks / discounts — still just one extra
            row, not a return to the old four-carousel wall. */}
        <FeaturedCarousel
          title="Best Sellers"
          items={bestSellerItems}
          cart={cart}
          onAdd={(item) => handleAdd(item, 1)}
          onRemove={(item) => handleAdd(item, -1)}
        />

        <div className="c-sticky-categories">
          <CategoryPills categories={categories} active={activeCategory} onChange={setActiveCategory} />
        </div>

        {categorizedItems.map(([cat, items]) => (
          <section className="c-category-section" key={cat}>
            <h2 className="c-category-header">{cat}</h2>
            <div className="c-feed-grid">
              {items.map((item) => (
                <DishCard
                  key={item.id}
                  item={item}
                  qty={cart[item.id]?.qty || 0}
                  onAdd={() => handleAdd(item, 1)}
                  onRemove={() => handleAdd(item, -1)}
                />
              ))}
            </div>
          </section>
        ))}
        {filtered.length === 0 && (
          <p style={{ color: "var(--ink-on-forest-muted)", textAlign: "center", padding: "2rem 0" }}>
            No dishes match your search.
          </p>
        )}
      </div>

      {cartCount > 0 && !cartOpen && (
        <button type="button" className="c-cart-bar" onClick={() => setCartOpen(true)}>
          <strong>{cartCount} item{cartCount === 1 ? "" : "s"}</strong>
          <span>${total.toFixed(2)} — View cart</span>
        </button>
      )}

      <BottomNav active={navTab} onChange={(tab) => (tab === "cart" ? setCartOpen(true) : setNavTab(tab))} cartCount={cartCount} />

      <GuestModal open={guestModalOpen} onResolve={handleGuestResolved} />
      <SplitModal open={splitModalOpen} onResolve={handleSplitResolved} />
      <ServerRequestModal
        open={serverRequest.modalOpen}
        view={serverRequest.view}
        table={table}
        submitting={serverRequest.submitting}
        remainingLabel={serverRequest.remainingLabel}
        onClose={serverRequest.closeModal}
        onChooseServer={serverRequest.chooseServer}
        onChooseOnline={serverRequest.chooseOnline}
      />
      <CartSheet
        open={cartOpen}
        cart={cart}
        total={total}
        splitPreference={splitPreference}
        onChangeSplit={handleChangeSplit}
        onClose={() => setCartOpen(false)}
        onConfirm={handleConfirmOrder}
        submitting={submitting}
      />

      {placed && (
        <>
          <div className="c-overlay" style={{ zIndex: 99 }} />
          <div className="c-modal-shell" style={{ zIndex: 100 }}>
            <div className="c-modal">
              <h2 style={{ marginBottom: "0.5rem" }}>Order placed!</h2>
              <p style={{ color: "var(--ink-muted)", marginBottom: "1.25rem" }}>Your order is being reviewed and will be sent to the kitchen shortly.</p>
              <button type="button" className="c-btn-primary" onClick={() => setPlaced(false)}>Back to menu</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
