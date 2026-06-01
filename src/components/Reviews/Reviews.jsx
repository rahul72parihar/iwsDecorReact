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

  return (
    <div className="reviews-grid" aria-label="Customer reviews">
      {reviews.map((r) => (
        <article className="review-card" key={r.id}>
          <div className="review-top">
            <div className="review-name">{r.name}</div>
            <div className="review-date">{formatDate(r.date)}</div>
          </div>

          <StarLine rating={r.rating} />

          <div className="review-text">{r.text}</div>
        </article>
      ))}
    </div>
  );
}

