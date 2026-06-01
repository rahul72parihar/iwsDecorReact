import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">

        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <span className="logo-iws">IWS</span>
            <span className="logo-decor"> Decor</span>
          </Link>

          <p className="footer-tagline">
            Bringing warmth, elegance and luxury to modern Indian homes.
          </p>
        </div>

        <div className="footer-links">

          <div className="footer-col">
            <h4>Shop</h4>

            <Link to="/">Chandeliers</Link>
            <Link to="/">Pendant Lights</Link>
            <Link to="/">Wall Lights</Link>
            <Link to="/">Table Lamps</Link>
          </div>

          <div className="footer-col">
            <h4>Help</h4>

            <Link to="/">Returns</Link>
            <Link to="/">Shipping</Link>
            <Link to="/">Track Order</Link>
            <Link to="/">Support</Link>
          </div>

          <div className="footer-col">
            <h4>Company</h4>

            <Link to="/">About</Link>
            <Link to="/">Careers</Link>
            <Link to="/">Artisans</Link>
            <Link to="/">Blog</Link>
          </div>

        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 IWS Decor. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;