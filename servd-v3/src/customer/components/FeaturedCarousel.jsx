import { useRef } from "react";
import FeaturedCard from "./FeaturedCard";

// Reusable hero-card rail — used for both the merged "Featured" tag
// group and the standalone "Best Sellers" tag, so there are two
// premium carousels instead of the old wall of four near-identical ones.
export default function FeaturedCarousel({ title, items, cart, onAdd, onRemove }) {
  const trackRef = useRef(null);

  if (!items || items.length === 0) return null;

  function scrollByAmount(direction) {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * (track.clientWidth * 0.85), behavior: "smooth" });
  }

  return (
    <section className="c-featured-section">
      <h2 className="c-section-title">{title}</h2>
      <div className="c-carousel-wrap">
        <button
          type="button"
          className="c-carousel-arrow c-featured-arrow c-carousel-arrow-left"
          onClick={() => scrollByAmount(-1)}
          aria-label={`Scroll ${title} left`}
        >
          ‹
        </button>

        <div className="c-carousel-track c-featured-track" ref={trackRef}>
          {items.map((item) => (
            <div className="c-featured-item" key={item.id}>
              <FeaturedCard
                item={item}
                qty={cart[item.id]?.qty || 0}
                onAdd={() => onAdd(item)}
                onRemove={() => onRemove(item)}
              />
            </div>
          ))}
        </div>

        <button
          type="button"
          className="c-carousel-arrow c-featured-arrow c-carousel-arrow-right"
          onClick={() => scrollByAmount(1)}
          aria-label={`Scroll ${title} right`}
        >
          ›
        </button>
      </div>
    </section>
  );
}
