import { useEffect, useMemo, useRef, useState } from 'react';
import './Reviews.css';

export default function Reviews({ reviews, formatDate }) {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="reviews-empty">
        <div className="reviews-emptyTitle">No reviews yet</div>
        <div className="reviews-emptySub">Be the first to share your experience.</div>
      </div>
    );
  }

  const StarLine = ({ rating }) => {
    const safe = Math.max(0, Math.min(5, rating));
    return (
      <div className="rv-stars" aria-label={`Rating ${safe.toFixed(1)} out of 5`}>
        {Array.from({ length: 5 }).map((_, i) => {
          const idx = i + 1;
          const isFull = idx <= Math.round(safe);
          return (
            <span key={i} className={`rv-star ${isFull ? 'full' : 'empty'}`}>★</span>
          );
        })}
      </div>
    );
  };

  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const cardRef = useRef(null);

  const [cardWidth, setCardWidth] = useState(0);
  const [gapWidth, setGapWidth] = useState(18);
  const [index, setIndex] = useState(0);

  const maxIndex = useMemo(() => {
    // With translate based on card+gap, clamp conservatively.
    // If cardWidth isn't measured yet, keep at 0.
    if (!cardWidth) return 0;
    return Math.max(0, reviews.length - 1);
  }, [reviews.length, cardWidth]);

  useEffect(() => {
    const measure = () => {
      const cardEl = cardRef.current;
      const trackEl = trackRef.current;
      if (!cardEl || !trackEl) return;

      const computed = window.getComputedStyle(trackEl);
      const gapStr = computed.columnGap || computed.gap || '18px';
      const gapNum = Number.parseFloat(gapStr) || 18;

      // Measure width of one card.
      const rect = cardEl.getBoundingClientRect();
      setCardWidth(rect.width);
      setGapWidth(gapNum);
    };

    measure();

    // Re-measure on resize.
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [reviews.length]);

  useEffect(() => {
    setIndex((i) => Math.max(0, Math.min(i, maxIndex)));
  }, [maxIndex]);

  const canPrev = index > 0;
  const canNext = index < maxIndex;

  const step = cardWidth ? cardWidth + gapWidth : 0;

  const scrollToIndex = (nextIndex) => {
    const viewportEl = viewportRef.current;
    if (!viewportEl) return;
    if (!step) return;
    viewportEl.scrollTo({
      left: nextIndex * step,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    // Keep the carousel aligned when index changes (prev/next buttons).
    if (!cardWidth) return;
    scrollToIndex(index);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, cardWidth, gapWidth]);

  const goPrev = () => {
    if (!canPrev) return;
    const next = Math.max(0, index - 1);
    setIndex(next);
    scrollToIndex(next);
  };

  const goNext = () => {
    if (!canNext) return;
    const next = Math.min(maxIndex, index + 1);
    setIndex(next);
    scrollToIndex(next);
  };

  return (
    <div className="reviews-carousel" aria-label="Customer reviews">
      <div className="reviews-carousel-top">
        <div className="reviews-carousel-spacer" />
        <div className="reviews-carousel-controls">
          <button
            type="button"
            className="reviews-carousel-btn"
            onClick={goPrev}
            disabled={!canPrev}
            aria-label="Previous reviews"
          >
            ‹
          </button>
          <button
            type="button"
            className="reviews-carousel-btn"
            onClick={goNext}
            disabled={!canNext}
            aria-label="Next reviews"
          >
            ›
          </button>
        </div>
      </div>

      <div className="reviews-viewport" aria-live="polite" ref={viewportRef}>
        <div ref={trackRef} className="reviews-track">
          {reviews.map((r, idx) => (
            <article
              className="review-card"
              key={r.id}
              ref={idx === 0 ? cardRef : null}
            >
              <div className="review-top">
                <div className="review-name">{r.name}</div>
                <div className="review-date">{formatDate(r.date)}</div>
              </div>

              <StarLine rating={r.rating} />

              <div className="review-text">{r.text}</div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

