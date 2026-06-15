import './Reviews.css';

function getInitials(name) {
  const parts = String(name || 'Customer')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length) return 'C';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function StarLine({ rating }) {
  const safe = Math.max(0, Math.min(5, Number(rating) || 0));

  return (
    <div className="rv-stars" aria-label={`Rating ${safe} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const idx = i + 1;
        const isFull = idx <= Math.round(safe);
        return (
          <span key={i} className={`rv-star ${isFull ? 'full' : 'empty'}`} aria-hidden="true">
            ★
          </span>
        );
      })}
    </div>
  );
}

export default function Reviews({ reviews, formatDate }) {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="reviews-empty">
        <div className="reviews-empty-icon" aria-hidden="true">
          ★
        </div>
        <div className="reviews-emptyTitle">No reviews yet</div>
        <div className="reviews-emptySub">Be the first to share your experience.</div>
      </div>
    );
  }

  return (
    <div className="reviews-grid" aria-label="Customer reviews list">
      {reviews.map((r) => (
        <article className="review-card" key={r.id}>
          <div className="review-card-top">
            <div className="review-avatar" aria-hidden="true">
              {getInitials(r.name)}
            </div>

            <div className="review-meta">
              <div className="review-name">{r.name}</div>
              <time className="review-date" dateTime={r.date}>
                {formatDate(r.date)}
              </time>
            </div>

            <div className="review-rating-badge">{Number(r.rating).toFixed(1)}</div>
          </div>

          <StarLine rating={r.rating} />

          <blockquote className="review-text">{r.text}</blockquote>
        </article>
      ))}
    </div>
  );
}
