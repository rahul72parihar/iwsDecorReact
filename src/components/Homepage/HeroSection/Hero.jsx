import { Link } from "react-router-dom";
import "./Hero.css";

function Hero() {
  return (
    <section className="hero">
      <div className="hero-content">
        <p className="hero-sub">New Collection 2026</p>

        <h1 className="hero-title">
          Where Light
          <br />
          <em>Tells a Story</em>
        </h1>

        <p className="hero-desc">
          Luxury handcrafted decor and statement lighting curated for modern
          Indian homes.
        </p>

        <div className="hero-actions">
          <Link to="/shop" className="btn-primary">
            Shop Collection
          </Link>

          <Link to="/lookbook" className="btn-ghost">
            View Lookbook
          </Link>
        </div>
      </div>

      <div className="hero-badge">
        <div className="hero-badge-line"></div>

        <div>
          <p className="hero-badge-title">
            Premium Material
          </p>

          <p className="hero-badge-text">
            Handmade luxury decor crafted with timeless elegance and premium
            brass finishes.
          </p>
        </div>
      </div>
    </section>
  );
}

export default Hero;