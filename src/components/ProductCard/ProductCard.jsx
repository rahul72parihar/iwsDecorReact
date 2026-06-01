import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import './ProductCard.css';

function StarRow({ rating }) {
  const rounded = Math.max(0, Math.min(5, Math.round(rating * 2) / 2));
  const full = Math.floor(rounded);
  const half = rounded - full >= 0.5;

  return (
    <div className="product-rating" aria-label={`Rating ${rating} out of 5`}>
      <div className="stars">
        {Array.from({ length: 5 }).map((_, i) => {
          const idx = i + 1;
          const isFull = idx <= full;
          const isHalf = !isFull && half && idx === full + 1;
          return (
            <span
              key={i}
              className={isFull ? 'star full' : isHalf ? 'star half' : 'star'}
            >
              ★
            </span>
          );
        })}
      </div>
    </div>
  );
}

export default function ProductCard({ product, onAddToCart, onToggleWishlist }) {
  const [wishlisted, setWishlisted] = useState(false);

  const discountLabel = useMemo(() => {
    if (!product?.discountPercent) return null;
    return `${product.discountPercent}% OFF`;
  }, [product]);

  const handleWishlist = () => {
    setWishlisted((v) => !v);
    onToggleWishlist?.(product);
  };

  const handleAdd = () => {
    onAddToCart?.(product);
  };

  return (
    <div className="product-card" role="group" aria-label={product.name}>
      <div
        className="product-image"
        style={{ backgroundImage: `url("${product.image}")` }}
      >
        <button
          className="wishlist-btn"
          onClick={handleWishlist}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          type="button"
        >
          {wishlisted ? '♥' : '♡'}
        </button>

        {discountLabel ? <div className="discount-badge">{discountLabel}</div> : null}
      </div>

      <div className="product-content">
        <div className="product-category">{product.category}</div>

        <Link to={`/products/${product.id}`} className="product-name-link">
          <div className="product-name">{product.name}</div>
        </Link>

        <StarRow rating={product.rating} />

        <div className="price-row">
          <div className="current-price">₹{product.price.toLocaleString('en-IN')}</div>
          <div className="old-price">₹{product.oldPrice.toLocaleString('en-IN')}</div>
        </div>

        <div className="stock-row">
          <span className={product.inStock ? 'stock in' : 'stock out'}>
            {product.inStock ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>

        <button
          className="add-cart-btn"
          onClick={handleAdd}
          disabled={!product.inStock}
          type="button"
        >
          {product.inStock ? 'Add to Cart' : 'Unavailable'}
        </button>
      </div>
    </div>
  );
}

