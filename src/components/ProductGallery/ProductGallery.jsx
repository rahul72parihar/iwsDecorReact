import { useMemo, useState } from 'react';

import './ProductGallery.css';

export default function ProductGallery({ product }) {
  const images = useMemo(() => {
    if (!product?.image) return [];

    // Use the main product image as the base and derive a premium multi-angle feel.
    // Keeping it deterministic without extra data fields.
    const base = product.image;
    const safe = (u) => u.replace(/\?.*$/, '');
    const clean = safe(base);

    return [
      { src: base, alt: `${product.name} - main` },
      { src: `${clean}?variant=1`, alt: `${product.name} - detail 1` },
      { src: `${clean}?variant=2`, alt: `${product.name} - detail 2` },
      { src: `${clean}?variant=3`, alt: `${product.name} - detail 3` },
    ];
  }, [product]);

  const [activeIndex, setActiveIndex] = useState(0);

  // Reset gallery when product changes
  if (images.length && activeIndex > images.length - 1) setActiveIndex(0);

  const active = images[activeIndex] ?? images[0];

  return (
    <div className="product-gallery" aria-label="Product gallery">
      <div className="gallery-mainWrap">
        <div className="gallery-main">
          {active ? (
            <img className="gallery-mainImg" src={active.src} alt={active.alt} />
          ) : null}
          <div className="gallery-zoomHint">Hover to zoom</div>
        </div>
      </div>

      <div className="gallery-thumbs" role="list" aria-label="Product thumbnails">
        {images.map((img, idx) => (
          <button
            key={img.src + idx}
            type="button"
            className={`thumb-btn ${idx === activeIndex ? 'active' : ''}`}
            onClick={() => setActiveIndex(idx)}
            aria-label={`Show image ${idx + 1}`}
          >
            <img className="thumb-img" src={img.src} alt={img.alt} />
          </button>
        ))}
      </div>
    </div>
  );
}

