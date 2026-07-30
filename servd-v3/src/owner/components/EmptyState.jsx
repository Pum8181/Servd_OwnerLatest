export default function EmptyState({ icon = "✓", title, subtitle }) {
  return (
    <div className="o-empty-state">
      <div className="o-empty-icon" aria-hidden="true">{icon}</div>
      <p className="o-empty-title">{title}</p>
      {subtitle && <p className="o-empty-subtitle">{subtitle}</p>}
    </div>
  );
}
