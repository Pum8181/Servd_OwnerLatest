// Real menu categories pulled straight from the actual data (item.cat),
// not a fixed list — so this stays correct as categories are added or
// renamed from the owner's Menu Management tab, no code change needed.
export default function CategoryPills({ categories, active, onChange }) {
  return (
    <div className="c-pills c-category-pills">
      <button
        type="button"
        className={`c-pill${active === null ? " active" : ""}`}
        onClick={() => onChange(null)}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          type="button"
          className={`c-pill${active === cat ? " active" : ""}`}
          onClick={() => onChange(active === cat ? null : cat)}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
