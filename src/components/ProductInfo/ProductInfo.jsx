import { useMemo } from 'react';

import './ProductInfo.css';

function Stars({ rating }) {
  const safe = Math.max(0, Math.min(5, rating));
  const full = Math.floor(safe);
  const half = safe - full >= 0.5;
  return (
    <div className="pi-stars" aria-label={`Rating ${safe.toFixed(1)} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const idx = i + 1;
        const isFull = idx <= full;
        const isHalf = !isFull && half && idx === full + 1;
        return (
          <span
            key={i}
            className={`pi-star ${isFull ? 'full' : isHalf ? 'half' : 'empty'}`}
          >
            ★
          </span>
        );
      })}
    </div>
  );
}

export default function ProductInfo({
  product,
  qty,
  setQty,
  activeTab,
  setActiveTab,
  tabs,
  onAddToCart,
}) {
  const priceRow = useMemo(() => {
    if (!product) return null;
    return {
      current: product.price,
      old: product.oldPrice,
      discount: product.discountPercent,
    };
  }, [product]);

  const decDisabled = qty <= 1;

  return (
    <aside className="product-info" aria-label="Product information">
      <div className="pi-card">
        <div className="pi-top">
          <div className="pi-cat">{product.category}</div>
          <div className="pi-name">{product.name}</div>
          <div className="pi-brand">{product.brand ?? 'IWS Signature'}</div>

          <div className="pi-ratingRow">
            <Stars rating={product.rating} />
            <div className="pi-reviewCount">({product.reviewsCount.toLocaleString('en-IN')})</div>
          </div>
        </div>

        {priceRow ? (
          <div className="pi-priceRow">
            {priceRow.discount ? <div className="pi-discount">{priceRow.discount}% OFF</div> : null}
            <div className="pi-price">
              ₹{priceRow.current.toLocaleString('en-IN')}
            </div>
            <div className="pi-oldPrice">₹{priceRow.old.toLocaleString('en-IN')}</div>
          </div>
        ) : null}

        <div className="pi-stock">
          <span className={`pi-stockPill ${product.inStock ? 'in' : 'out'}`}>{product.inStock ? 'In Stock' : 'Out of Stock'}</span>
          <span className="pi-stockText">Ships in 2–4 business days</span>
        </div>

        <div className="pi-actions">
          <div className="pi-qty">
            <button
              type="button"
              className="pi-qtyBtn"
              disabled={decDisabled}
              onClick={() => setQty((v) => Math.max(1, v - 1))}
              aria-label="Decrease quantity"
            >
              −
            </button>
            <div className="pi-qtyValue" aria-label="Quantity">{qty}</div>
            <button
              type="button"
              className="pi-qtyBtn"
              onClick={() => setQty((v) => Math.min(99, v + 1))}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          <div className="pi-actionBtns">
            <button
              type="button"
              className="pi-btn gold"
              disabled={!product.inStock}
              onClick={() => onAddToCart?.()}
            >
              Add To Cart
            </button>
            <button type="button" className="pi-btn dark" disabled={!product.inStock}>
              Buy Now
            </button>
            <button type="button" className="pi-wishlist" aria-label="Add to wishlist">
              ♡ Add to Wishlist
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

