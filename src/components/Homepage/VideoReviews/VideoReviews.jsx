import { useEffect, useRef, useState } from "react";
import { getVideoReviews } from "../../../services/videoReviewsService";
import "./VideoReviews.css";

function VideoReviews() {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const data = await getVideoReviews();
        setReviews(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch reviews:', err);
        setError('Failed to load video reviews');
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const carouselRef = useRef(null);

  const scrollByCard = (direction) => {
    const el = carouselRef.current;
    if (!el) return;

    const cards = el.querySelectorAll(".video-card");
    if (!cards.length) return;

    const first = cards[0];
    const second = cards[1];

    if (!first || !second) return;

    const amount = second.offsetLeft - first.offsetLeft;

    el.scrollBy({
      left: direction * amount,
      behavior: "smooth",
    });
  };

  return (
    <>
      <section className="video-section">
        <div className="section-header">
          <p className="section-tag">Real Homes</p>
          <h2 className="section-title">Customer Video Reviews</h2>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>Loading video reviews...</p>
          </div>
        )}

        {error && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#d32f2f' }}>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && reviews.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>No video reviews available yet.</p>
          </div>
        )}

        {!loading && reviews.length > 0 && (
          <div className="video-carousel-wrapper">
            <button
              type="button"
              className="carousel-arrow carousel-arrow-left"
              aria-label="Scroll reviews left"
              onClick={() => scrollByCard(-1)}
            >
              ‹
            </button>

            <div ref={carouselRef} className="video-carousel">
              {reviews.map((review) => (
                <div
                  className="video-card"
                  key={review.id}
                  onClick={() => setSelectedVideo(review)}
                >
                  <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                  >
                    <source src={review.video} type="video/mp4" />
                  </video>

                  <div className="video-overlay">
                    <h4>{review.title}</h4>
                    <p>{review.city}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="carousel-arrow carousel-arrow-right"
              aria-label="Scroll reviews right"
              onClick={() => scrollByCard(1)}
            >
              ›
            </button>
          </div>
        )}
      </section>

      {selectedVideo && (
        <div
          className="video-modal"
          onClick={() => setSelectedVideo(null)}
        >
          <div
            className="video-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="video-modal-close"
              onClick={() => setSelectedVideo(null)}
            >
              ×
            </button>

            <video
              src={selectedVideo.video}
              controls
              autoPlay
              playsInline
            />
          </div>
        </div>
      )}
    </>
  );
}

export default VideoReviews;