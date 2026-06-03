import { useMemo, useRef } from "react";
import "./VideoReviews.css";

function VideoReviews() {
  const reviews = useMemo(
    () => [
      {
        id: 1,
        video:
          "https://cdn.coverr.co/videos/coverr-woman-decorating-her-home-1567431474705?download=1080p",
        title: "Luxury Living Room",
        city: "Mumbai",
      },
      {
        id: 2,
        video:
          "https://cdn.coverr.co/videos/coverr-a-couple-in-their-living-room-1578507976324?download=1080p",
        title: "Modern Brass Setup",
        city: "Bangalore",
      },
      {
        id: 3,
        video:
          "https://cdn.coverr.co/videos/coverr-a-young-woman-relaxing-at-home-1567331149394?download=1080p",
        title: "Premium Dining Decor",
        city: "Delhi",
      },
      {
        id: 4,
        video:
          "https://cdn.coverr.co/videos/coverr-man-working-at-home-1567331148924?download=1080p",
        title: "Designer Lighting",
        city: "Hyderabad",
      },
    ],
    []
  );

  const carouselRef = useRef(null);

  const scrollByCard = (direction) => {
    const el = carouselRef.current;
    if (!el) return;

    const cards = el.querySelectorAll(".video-card");
    if (!cards || cards.length === 0) return;

    const first = cards[0];
    const second = cards[1];

    // If there's no second card, just do nothing.
    if (!first || !second) return;

    // Use real DOM offsets to calculate the exact "one card" step.
    const amount = second.offsetLeft - first.offsetLeft;

    el.scrollBy({ left: direction * amount, behavior: "smooth" });
  };

  return (
    <section className="video-section">
      <div className="section-header">
        <p className="section-tag">Real Homes</p>
        <h2 className="section-title">Customer Video Reviews</h2>
      </div>

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
            <div className="video-card" key={review.id}>
              <video autoPlay muted loop playsInline>
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
    </section>
  );
}

export default VideoReviews;
