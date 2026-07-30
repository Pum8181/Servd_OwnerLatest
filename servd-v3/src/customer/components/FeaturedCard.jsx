import { motion } from "motion/react";
import { effectivePrice } from "../../lib/menu";
import { useImageFallback } from "../useImageFallback";
import TagBadge from "./TagBadge";

export default function FeaturedCard({ item, qty, onAdd, onRemove }) {
  const { showFallback, onLoad, onError } = useImageFallback(item.image);
  const soldOut = !item.available;
  const onSale = (item.discount || 0) > 0 && !soldOut;
  const price = effectivePrice(item);

  return (
    <motion.article
      className={`c-hero-card${soldOut ? " is-soldout" : ""}`}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {!showFallback ? (
        <img className="c-hero-img" src={item.image} alt="" loading="lazy" onLoad={onLoad} onError={onError} />
      ) : (
        <div className="c-hero-img c-img-fallback" aria-hidden="true">🍴</div>
      )}
      <div className="c-hero-gradient" />

      {!soldOut && <TagBadge item={item} />}
      {soldOut && <span className="c-soldout-badge">Sold Out</span>}

      <div className="c-hero-content">
        <div className="c-hero-name">{item.name}</div>
        <div className="c-hero-price-row">
          {onSale ? (
            <>
              <span className="c-hero-price-was">${item.price.toFixed(2)}</span>
              <span className="c-hero-price-now">${price.toFixed(2)}</span>
            </>
          ) : (
            <span className="c-hero-price">${price.toFixed(2)}</span>
          )}
        </div>
      </div>

      {qty > 0 ? (
        <div className="c-qty-control c-hero-qty">
          <button type="button" onClick={onRemove} aria-label="Remove one">−</button>
          <span>{qty}</span>
          <button type="button" onClick={onAdd} aria-label="Add one">+</button>
        </div>
      ) : (
        <motion.button
          type="button"
          className="c-hero-add"
          onClick={onAdd}
          disabled={soldOut}
          whileTap={{ scale: 0.9 }}
          aria-label={soldOut ? "Sold out" : `Add ${item.name}`}
        >
          +
        </motion.button>
      )}
    </motion.article>
  );
}
