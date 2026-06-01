import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { products as allProducts } from '../../data/products';

import './RelatedProducts.css';

function StarRating({ rating }) {
  const safe = Math.max(0, Math.min(5, rating));
  const full = Math.floor(safe);
  const half = safe - full >= 0.5;
  return (
    <div className="rp-stars" aria-label={`Rating ${safe.toFixed(1)} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const idx = i + 1;
        const isFull = idx <= full;
        const isHalf = !isFull && half && idx === full + 1;
        return (
          <span key={i} className={`rp-star ${isFull ? 'full' : isHalf ? 'half' : 'empty'}`}>★</span>
        );
      })}
    </div>
  );
}

export default function RelatedProducts({ currentProduct }) {
  const [wish, setWish] = useState({});

  const related = useMemo(() => {
    if (!currentProduct) return [];

    const sameCat = allProducts.filter((p) => p.category === currentProduct.category && p.id !== currentProduct.id);
    const others = allProducts.filter((p) => p.id !== currentProduct.id && p.category !== currentProduct.category);

    const pool = [...sameCat, ...others];

    // Pick 4 deterministically based on currentProduct.id
    const start = currentProduct.id % Math.max(1, pool.length);
    const picked = [];
    for (let i = 0; i < pool.length && picked.length < 4; i += 1) {
      picked.push(pool[(start + i) % pool.length]);
    }

    return picked;
  }, [currentProduct]);

  if (!related.length) return null;

  const onWishlistToggle = (p) => {
    setWish((prev) => ({ ...prev, [p.id]: !prev[p.id] }));
  };

  return (
    <div className="rp-grid" aria-label="Related products">
      {related.map((p) => (
        <div className="rp-card" key={p.id}>
          <div className="rp-imgWrap">
            <div className="rp-discount">{p.discountPercent ? `${p.discountPercent}% OFF` : 'Luxury Pick'}</div>
            <img className="rp-img" src={p.image} alt={p.name} />
            <button
              type="button"
              className="rp-wishBtn"
              onClick={() => onWishlistToggle(p)}
              aria-label={wish[p.id] ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              {wish[p.id] ? '♥' : '♡'}
            </button>
          </div>

          <Link to={`/products/${p.id}`} className="rp-nameLink">
            <div className="rp-name">{p.name}</div>
          </Link>

          <div className="rp-ratingRow">
            <StarRating rating={p.rating} />
            <div className="rp-reviewCount">({p.reviewsCount.toLocaleString('en-IN')})</div>
          </div>

          <div className="rp-priceRow">
            <div className="rp-price">₹{p.price.toLocaleString('en-IN')}</div>
            <div className="rp-old">₹{p.oldPrice.toLocaleString('en-IN')}</div>
          </div>

          <button
            type="button"
            className="rp-addBtn"
            disabled={!p.inStock}
          >
            {p.inStock ? 'Add to Cart' : 'Unavailable'}
          </button>
        </div>
      ))}
    </div>
  );
}

