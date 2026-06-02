import { Link } from "react-router-dom";
import { useState } from "react";
import { useSelector } from "react-redux";
import "./Header.css";
import HeaderSidebar from "../HeaderSidebar/HeaderSidebar";

function Header() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const totalQuantity = useSelector((s) => s.cart?.totalQuantity ?? 0);
  const wishlistCount = useSelector((s) => s.wishlist?.items?.length ?? 0);

  return (
    <>
      <div className="topbar">
        Free shipping above ₹2,999 • Trusted by 50,000+ Homes Across India
      </div>

      <header className="header">
        <div className="header-inner">
          <button
            className="mobile-menu-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>

          <Link to="/" className="logo">
            <span className="logo-iws">IWS</span>
            <span className="logo-decor"> Decor</span>
          </Link>

          <div className="header-right">
            <nav className="desktop-links">
              <Link to="/brass-collection" className="nav-link">
                Brass Collection
              </Link>

              <Link to="/new-arrivals" className="nav-link">
                New Arrivals
              </Link>
            </nav>

            <div className="header-icons">
              <button className="icon-btn">🔍</button>

              <div className="icon-btn">
                <Link to="/wishlist" className="wishlist-btn-header">
                  🤍
                  {wishlistCount > 0 ? (
                    <span className="wishlist-count">{wishlistCount}</span>
                  ) : null}
                </Link>
              </div>

              <Link to="/cart" className="icon-btn cart-btn">
                🛒
                <span className="cart-count">{totalQuantity}</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <HeaderSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
    </>
  );
}

export default Header;
