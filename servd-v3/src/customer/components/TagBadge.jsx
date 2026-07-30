import { useState } from "react";
import { activeTags, TAG_META } from "../../lib/menu";

// One loud primary badge (highest-priority tag) plus a small "+n" that
// reveals the rest on tap — keeps a triple-tagged dish from turning
// into a wall of pills on the card.
export default function TagBadge({ item }) {
  const [open, setOpen] = useState(false);
  const tags = activeTags(item);
  if (tags.length === 0) return null;

  const [primary, ...rest] = tags;
  const meta = TAG_META[primary];

  return (
    <div className="c-tag-badge-wrap">
      <span className={`c-tag-badge c-tag-badge--${meta.kind}`}>{meta.label}</span>
      {rest.length > 0 && (
        <button
          type="button"
          className="c-tag-more"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen((v) => !v); }}
          aria-expanded={open}
          aria-label={`${rest.length} more tag${rest.length === 1 ? "" : "s"} on ${item.name}`}
        >
          +{rest.length}
        </button>
      )}
      {open && (
        <div className="c-tag-popover" role="tooltip">
          {rest.map((t) => (
            <span key={t} className={`c-tag-badge c-tag-badge--${TAG_META[t].kind}`}>{TAG_META[t].label}</span>
          ))}
        </div>
      )}
    </div>
  );
}
