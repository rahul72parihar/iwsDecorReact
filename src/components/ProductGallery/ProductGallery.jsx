import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState(null);

  useEffect(() => {
    if (!isModalOpen) return;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false);
        setModalImage(null);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isModalOpen]);

  const openModalForActive = () => {
    if (!active) return;
    setModalImage(active);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalImage(null);
  };

  const modalNode =
    isModalOpen && modalImage
      ? createPortal(
          <div
            className="pg-modalOverlay"
            role="dialog"
            aria-modal="true"
            aria-label="Product image preview"
            onMouseDown={(e) => {
              // Close only when user clicks the overlay (not the image card)
              if (e.target === e.currentTarget) closeModal();
            }}
          >
            <div className="pg-modalCard">
              <button
                type="button"
                className="pg-modalClose"
                aria-label="Close image preview"
                onClick={closeModal}
              >
                ×
              </button>

              <img className="pg-modalImg" src={modalImage.src} alt={modalImage.alt} />
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div className="product-gallery" aria-label="Product gallery">
      {modalNode}

      <div className="gallery-mainWrap">
        <div className="gallery-main">
          {active ? (
            <img
              className="gallery-mainImg"
              src={active.src}
              alt={active.alt}
              role="button"
              tabIndex={0}
              onClick={openModalForActive}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') openModalForActive();
              }}
            />
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

