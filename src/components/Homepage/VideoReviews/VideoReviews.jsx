import "./VideoReviews.css";

function VideoReviews() {
  const reviews = [
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
  ];

  return (
    <section className="video-section">
      <div className="section-header">
        <p className="section-tag">Real Homes</p>
        <h2 className="section-title">
          Customer Video Reviews
        </h2>
      </div>

      <div className="video-carousel">
        {reviews.map((review) => (
          <div className="video-card" key={review.id}>
            <video
              autoPlay
              muted
              loop
              playsInline
            >
              <source
                src={review.video}
                type="video/mp4"
              />
            </video>

            <div className="video-overlay">
              <h4>{review.title}</h4>
              <p>{review.city}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default VideoReviews;