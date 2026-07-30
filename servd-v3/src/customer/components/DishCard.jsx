import { motion } from "motion/react";
import { effectivePrice } from "../../lib/menu";
import { useImageFallback } from "../useImageFallback";
import TagBadge from "./TagBadge";

export default function DishCard({ item, qty, onAdd, onRemove }) {
  const { showFallback, onLoad, onError } = useImageFallback(item.image);
  const soldOut = !item.available;
  const onSale = (item.discount || 0) > 0 && !soldOut;
  const price = effectivePrice(item);

  return (
    <motion.article
      className={`c-card${soldOut ? " is-soldout" : ""}`}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {!showFallback ? (
        <img className="c-card-img" src={item.image} alt="" loading="lazy" onLoad={onLoad} onError={onError} />
      ) : (
        <div className="c-card-img c-img-fallback" aria-hidden="true">🍴</div>
      )}

      {!soldOut && <TagBadge item={item} />}
      {soldOut && <span className="c-soldout-badge">Sold Out</span>}

      <div className="c-card-body">
        <div className="c-card-name">{item.name}</div>
        {item.desc && <p className="c-card-desc">{item.desc}</p>}
        <div className="c-card-price-row">
          {onSale ? (
            <>
              <span className="c-card-price-was">${item.price.toFixed(2)}</span>
              <span className="c-card-price-now">${price.toFixed(2)}</span>
            </>
          ) : (
            <span className="c-card-price">${price.toFixed(2)}</span>
          )}
        </div>
      </div>

      {qty > 0 ? (
        <div className="c-qty-control">
          <button type="button" onClick={onRemove} aria-label="Remove one">−</button>
          <span>{qty}</span>
          <button type="button" onClick={onAdd} aria-label="Add one">+</button>
        </div>
      ) : (
        <motion.button
          type="button"
          className="c-add-btn"
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
