import { useState } from "react";
import { Link } from "react-router-dom";
import "./HeaderSidebar.css";

function HeaderSidebar({ isOpen, onClose }) {
  const [openMenu, setOpenMenu] = useState(null);

  const toggleMenu = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const handleNav = () => {
    if (onClose) onClose();
    setOpenMenu(null);
  };

  return (
    <>
      {isOpen && (
        <div
          className="header-sidebar__overlay"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`header-sidebar ${isOpen ? "header-sidebar--active" : ""}`}
        aria-hidden={!isOpen}
      >
        <div className="header-sidebar__content">
          <Link to="/" className="header-sidebar__link" onClick={handleNav}>
            Living Room
          </Link>

          {/* BEDROOM */}
          <div
            className={`header-sidebar__item ${
              openMenu === "bedroom" ? "is-active" : ""
            }`}
          >
            <button
              type="button"
              className="header-sidebar__dropdown-btn"
              onClick={() => toggleMenu("bedroom")}
            >
              <span>Bedroom</span>
              <span className="header-sidebar__chev">▾</span>
            </button>

            <div className="header-sidebar__mega-menu">
              <div className="header-sidebar__mega-column">
                <h4 className="header-sidebar__mega-title">Beds</h4>
                <Link to="/" onClick={handleNav}>
                  King Size Beds
                </Link>
                <Link to="/" onClick={handleNav}>
                  Queen Size Beds
                </Link>
                <Link to="/" onClick={handleNav}>
                  Storage Beds
                </Link>
              </div>

              <div className="header-sidebar__mega-column">
                <h4 className="header-sidebar__mega-title">Wardrobes</h4>
                <Link to="/" onClick={handleNav}>
                  2 Door
                </Link>
                <Link to="/" onClick={handleNav}>
                  3 Door
                </Link>
                <Link to="/" onClick={handleNav}>
                  Sliding Wardrobes
                </Link>
              </div>
            </div>
          </div>

          <Link to="/" className="header-sidebar__link" onClick={handleNav}>
            Dining
          </Link>

          {/* OFFICE */}
          <div
            className={`header-sidebar__item ${
              openMenu === "office" ? "is-active" : ""
            }`}
          >
            <button
              type="button"
              className="header-sidebar__dropdown-btn"
              onClick={() => toggleMenu("office")}
            >
              <span>Office</span>
              <span className="header-sidebar__chev">▾</span>
            </button>

            <div className="header-sidebar__mega-menu">
              <div className="header-sidebar__mega-column">
                <h4 className="header-sidebar__mega-title">Office Chairs</h4>
                <Link to="/" onClick={handleNav}>
                  Gaming Chairs
                </Link>
                <Link to="/" onClick={handleNav}>
                  Ergonomic Chairs
                </Link>
                <Link to="/" onClick={handleNav}>
                  Executive Chairs
                </Link>
              </div>

              <div className="header-sidebar__mega-column">
                <h4 className="header-sidebar__mega-title">Tables</h4>
                <Link to="/" onClick={handleNav}>
                  Study Tables
                </Link>
                <Link to="/" onClick={handleNav}>
                  Computer Tables
                </Link>
                <Link to="/" onClick={handleNav}>
                  Standing Desks
                </Link>
              </div>
            </div>
          </div>

          <Link to="/" className="header-sidebar__link" onClick={handleNav}>
            Kitchen
          </Link>
          <Link to="/" className="header-sidebar__link" onClick={handleNav}>
            Lighting
          </Link>
          <Link to="/" className="header-sidebar__link" onClick={handleNav}>
            Decor
          </Link>

          {/* OUTDOOR */}
          <div
            className={`header-sidebar__item ${
              openMenu === "outdoor" ? "is-active" : ""
            }`}
          >
            <button
              type="button"
              className="header-sidebar__dropdown-btn"
              onClick={() => toggleMenu("outdoor")}
            >
              <span>Outdoor</span>
              <span className="header-sidebar__chev">▾</span>
            </button>

            <div className="header-sidebar__mega-menu">
              <div className="header-sidebar__mega-column">
                <h4 className="header-sidebar__mega-title">Garden</h4>
                <Link to="/" onClick={handleNav}>
                  Garden Chairs
                </Link>
                <Link to="/" onClick={handleNav}>
                  Outdoor Tables
                </Link>
                <Link to="/" onClick={handleNav}>
                  Swings
                </Link>
              </div>

              <div className="header-sidebar__mega-column">
                <h4 className="header-sidebar__mega-title">Balcony</h4>
                <Link to="/" onClick={handleNav}>
                  Balcony Sets
                </Link>
                <Link to="/" onClick={handleNav}>
                  Planters
                </Link>
                <Link to="/" onClick={handleNav}>
                  Lighting
                </Link>
              </div>
            </div>
          </div>

          <Link to="/" className="header-sidebar__link" onClick={handleNav}>
            Sale
          </Link>
        </div>
      </aside>
    </>
  );
}

export default HeaderSidebar;

