import "./Newsletter.css";

function Newsletter() {
  return (
    <section className="newsletter-section">
      <div className="newsletter-inner">
        <p className="section-tag">
          Stay Inspired
        </p>

        <h2 className="newsletter-title">
          Get Design Ideas & Offers
        </h2>

        <p className="newsletter-desc">
          Join thousands of homeowners receiving luxury decor inspiration,
          exclusive launches, and special offers every week.
        </p>

        <form className="newsletter-form">
          <input
            type="email"
            placeholder="Enter your email"
            className="newsletter-input"
          />

          <button
            type="submit"
            className="newsletter-btn"
          >
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}

export default Newsletter;