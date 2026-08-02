import { useEffect, useMemo, useState } from "react";
import { toggleSoldOut, setDiscount, setPrice, setTags, effectivePrice, seedFullDemoMenu, CAROUSELS, itemInCarousel } from "../../lib/menu";
import { subscribeSpiceLevels, updateSpiceLevels } from "../../lib/settings";
import MenuItemModal from "./MenuItemModal";
import { friendlyFirebaseError } from "../../lib/errors";

// Owner names these however their kitchen actually talks about heat
// ("Mild/Medium/Hot/Extra Hot", "1 Chili/2 Chili/3 Chili", etc.) — one
// shared list rather than per-item, since guests expect the same scale
// across the whole menu. Any item can then opt into showing this list
// via its own "Let guests choose a spice level" toggle (MenuItemModal).
function SpiceLevelsCard() {
  const [levels, setLevels] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => subscribeSpiceLevels(setLevels, (err) => setError(friendlyFirebaseError(err, "load spice levels"))), []);

  function persist(next) {
    setLevels(next);
    setSaving(true);
    updateSpiceLevels(next)
      .catch((err) => setError(friendlyFirebaseError(err, "save spice levels")))
      .finally(() => setSaving(false));
  }

  function updateLevel(i, value) {
    const next = [...levels];
    next[i] = value;
    setLevels(next);
  }

  function commitLevel(i) {
    const value = (levels[i] || "").trim();
    if (!value) return removeLevel(i);
    persist(levels.map((l, idx) => (idx === i ? value : l)));
  }

  function addLevel() {
    persist([...levels, "New Level"]);
  }

  function removeLevel(i) {
    if (levels.length <= 1) return;
    persist(levels.filter((_, idx) => idx !== i));
  }

  return (
    <div className="o-side-card" style={{ marginBottom: "1.5rem" }}>
      <h3>Spice Levels</h3>
      <p style={{ color: "var(--ink-muted)", fontSize: "0.875rem", marginBottom: "1rem" }}>
        Name the spice options your kitchen actually uses — this exact list is what guests pick
        from on any dish with "Let guests choose a spice level" turned on.
      </p>
      <div className="o-spice-level-list">
        {levels.map((level, i) => (
          <div className="o-spice-level-row" key={i}>
            <input
              type="text"
              value={level}
              maxLength={24}
              onChange={(e) => updateLevel(i, e.target.value)}
              onBlur={() => commitLevel(i)}
              onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
            />
            <button type="button" className="o-btn-reject" onClick={() => removeLevel(i)} disabled={levels.length <= 1} aria-label={`Remove ${level}`}>
              ×
            </button>
          </div>
        ))}
      </div>
      <button type="button" className="o-btn-reject" style={{ marginTop: "0.75rem" }} onClick={addLevel}>+ Add Level</button>
      {saving && <span className="o-field-hint" style={{ marginLeft: "0.75rem" }}>Saving…</span>}
      {error && <p style={{ color: "var(--accent-deep)", fontSize: "0.8125rem", marginTop: "0.5rem" }}>{error}</p>}
    </div>
  );
}

// Chip "kind" → color mapping, shared visual language with the
// customer-side TagBadge (same kind names, same colors) so an owner
// who's seen the customer app recognizes a tag instantly here too.
const TAG_CHIPS = [
  { label: "Chef's Specials", kind: "chef" },
  { label: "Trending", kind: "trending" },
  { label: "Today's Discounts", kind: "discount" },
  { label: "Best Sellers", kind: "bestseller" },
];

const FILTERS = [
  { key: "all", label: "All" },
  { key: "Chef's Specials", label: "Chef's Specials" },
  { key: "Trending", label: "Trending" },
  { key: "Today's Discounts", label: "Discounts" },
  { key: "Best Sellers", label: "Best Sellers" },
  { key: "sold-out", label: "Sold Out" },
];

function matchesFilter(item, key) {
  if (key === "all") return true;
  if (key === "sold-out") return !item.available;
  return itemInCarousel(item, key);
}

function MenuRow({ item, onEdit }) {
  const [price, setPriceLocal] = useState(item.price);
  const [discount, setDiscountLocal] = useState(item.discount);
  const tags = item.tags || [];
  const markedDown = (item.discount || 0) > 0;

  function toggleTag(label) {
    const next = tags.includes(label) ? tags.filter((t) => t !== label) : [...tags, label];
    setTags(item.id, next);
  }

  return (
    <div className="o-menu-row">
      {item.image ? <img src={item.image} alt="" width={44} height={44} style={{ borderRadius: 10, objectFit: "cover" }} /> : <div style={{ width: 44, height: 44, borderRadius: 10, background: "var(--cream-deep)" }} />}
      <div className="o-menu-row-name">
        {item.name}
        <span>
          {item.discount > 0
            ? <>Base ${item.price.toFixed(2)} → ${effectivePrice(item).toFixed(2)} ({item.discount}% off)</>
            : <>${item.price.toFixed(2)}</>}
        </span>

        {/* At-a-glance tag chips: click any of the four owner tags to
            toggle it instantly, no need to open the full Edit modal.
            Sold Out and Marked Down reflect real state and are
            included here so every signal lives in one scannable row. */}
        <div className="o-menu-row-tags">
          {TAG_CHIPS.map((t) => (
            <button
              key={t.label}
              type="button"
              className={`o-tag-chip o-tag-chip--${t.kind}${tags.includes(t.label) ? " is-on" : ""}`}
              onClick={() => toggleTag(t.label)}
              title={`${t.label} — click to ${tags.includes(t.label) ? "remove" : "add"}`}
            >
              {t.label}
            </button>
          ))}
          <button
            type="button"
            className={`o-tag-chip o-tag-chip--soldout${!item.available ? " is-on" : ""}`}
            onClick={() => toggleSoldOut(item.id, !item.available)}
            title={item.available ? "Available — click to mark sold out" : "Sold out — click to restore"}
          >
            Sold Out
          </button>
          {markedDown && (
            <span className="o-tag-chip o-tag-chip--markeddown is-on" title={`${item.discount}% off — set in the Discount % field`}>
              Marked Down
            </span>
          )}
        </div>
      </div>

      <label style={{ fontSize: "0.75rem", color: "var(--ink-muted)" }}>
        Price
        <input
          type="number" min="0" step="0.25" value={price}
          onChange={(e) => setPriceLocal(e.target.value)}
          onBlur={() => setPrice(item.id, price)}
        />
      </label>

      <label style={{ fontSize: "0.75rem", color: "var(--ink-muted)" }}>
        Discount %
        <input
          type="number" min="0" max="100" value={discount}
          onChange={(e) => setDiscountLocal(e.target.value)}
          onBlur={() => setDiscount(item.id, discount)}
        />
      </label>

      <button type="button" className="o-btn-reject" style={{ padding: "0.5rem 1rem" }} onClick={() => onEdit(item)}>
        Edit
      </button>
    </div>
  );
}

export default function SettingsPanel({ menuItems }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [seeding, setSeeding] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");

  function openAdd() { setEditingItem(null); setModalOpen(true); }
  function openEdit(item) { setEditingItem(item); setModalOpen(true); }

  async function handleSeed() {
    setSeeding(true);
    try {
      await seedFullDemoMenu();
    } catch (err) {
      console.error(err);
      alert(friendlyFirebaseError(err, "load the demo menu"));
    } finally {
      setSeeding(false);
    }
  }

  const filtered = useMemo(
    () => menuItems.filter((item) => matchesFilter(item, activeFilter)),
    [menuItems, activeFilter]
  );

  const grouped = filtered.reduce((acc, item) => {
    const cat = item.cat || "Other";
    (acc[cat] ||= []).push(item);
    return acc;
  }, {});

  return (
    <div>
      <SpiceLevelsCard />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem", marginBottom: "0.5rem" }}>
        <h2>Menu Management</h2>
        <div style={{ display: "flex", gap: "0.6rem" }}>
          <button type="button" className="o-btn-reject" onClick={handleSeed} disabled={seeding}>
            {seeding ? "Loading…" : "Load Full Demo Menu"}
          </button>
          <button type="button" className="o-btn-approve" onClick={openAdd}>+ Add New Item</button>
        </div>
      </div>
      <p style={{ color: "var(--ink-muted)", marginBottom: "1.25rem", fontSize: "0.9375rem" }}>
        Click any tag chip to toggle it instantly, no need to open Edit. Price, discount, and photo
        still live in the full Edit modal. Everything here saves straight to Firestore and shows on
        the customer app right away.
      </p>

      <div className="o-filter-bar">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            className={`o-filter-pill${activeFilter === f.key ? " active" : ""}`}
            onClick={() => setActiveFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {menuItems.length === 0 && <p style={{ color: "var(--ink-muted)" }}>No menu items yet — try "Load Full Demo Menu" to populate one.</p>}
      {menuItems.length > 0 && filtered.length === 0 && <p style={{ color: "var(--ink-muted)" }}>No items match this filter.</p>}

      {Object.keys(grouped).map((cat) => (
        <div key={cat} style={{ marginBottom: "1.5rem" }}>
          <h3 style={{ fontSize: "0.9375rem", marginBottom: "0.6rem", color: "var(--ink-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{cat}</h3>
          {grouped[cat].map((item) => <MenuRow key={item.id} item={item} onEdit={openEdit} />)}
        </div>
      ))}

      <MenuItemModal item={editingItem} open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
