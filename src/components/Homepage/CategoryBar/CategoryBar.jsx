import { Link } from "react-router-dom";
import "./CategoryBar.css";

function CategoryBar() {
  return (
    <div className="category-bar">
      <div className="category-container">
        <Link to="/" className="category-link">
          Living Room
        </Link>

        {/* BEDROOM */}
        <div className="category-item">
          <span className="category-link">
            Bedroom
          </span>

          <div className="mega-menu">
            <div className="mega-column">
              <h4>Beds</h4>
              <Link to="/">King Size Beds</Link>
              <Link to="/">Queen Size Beds</Link>
              <Link to="/">Storage Beds</Link>
            </div>

            <div className="mega-column">
              <h4>Wardrobes</h4>
              <Link to="/">2 Door</Link>
              <Link to="/">3 Door</Link>
              <Link to="/">Sliding Wardrobes</Link>
            </div>
          </div>
        </div>

        <Link to="/" className="category-link">
          Dining
        </Link>

        {/* OFFICE */}
        <div className="category-item">
          <span className="category-link">
            Office
          </span>

          <div className="mega-menu">
            <div className="mega-column">
              <h4>Office Chairs</h4>
              <Link to="/">Gaming Chairs</Link>
              <Link to="/">Ergonomic Chairs</Link>
              <Link to="/">Executive Chairs</Link>
            </div>

            <div className="mega-column">
              <h4>Tables</h4>
              <Link to="/">Study Tables</Link>
              <Link to="/">Computer Tables</Link>
              <Link to="/">Standing Desks</Link>
            </div>
          </div>
        </div>

        <Link to="/" className="category-link">
          Kitchen
        </Link>

        <Link to="/" className="category-link">
          Lighting
        </Link>

        <Link to="/" className="category-link">
          Decor
        </Link>

        {/* OUTDOOR */}
        <div className="category-item">
          <span className="category-link">
            Outdoor
          </span>

          <div className="mega-menu">
            <div className="mega-column">
              <h4>Garden</h4>
              <Link to="/">Garden Chairs</Link>
              <Link to="/">Outdoor Tables</Link>
              <Link to="/">Swings</Link>
            </div>

            <div className="mega-column">
              <h4>Balcony</h4>
              <Link to="/">Balcony Sets</Link>
              <Link to="/">Planters</Link>
              <Link to="/">Lighting</Link>
            </div>
          </div>
        </div>

        <Link to="/" className="category-link">
          Kids
        </Link>

        <Link to="/" className="category-link">
          Sale
        </Link>
      </div>
    </div>
  );
}

export default CategoryBar;