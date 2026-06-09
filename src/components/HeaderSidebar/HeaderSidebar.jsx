import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import "./HeaderSidebar.css";

import { listCategories } from "../../firebase/categoryService";

import useAuth from "../../auth/useAuth";

function HeaderSidebar({ isOpen, onClose }) {
  const [openMenu, setOpenMenu] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  const { user, signOutUser } = useAuth();

  const totalQuantity = useSelector((s) => s.cart?.totalQuantity ?? 0);
  const wishlistCount = useSelector((s) => s.wishlist?.items?.length ?? 0);




  const toggleMenu = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  useEffect(() => {
    let alive = true;

    const run = async () => {
      setLoadingCategories(true);
      try {
        const list = await listCategories();
        if (!alive) return;
        setCategories(Array.isArray(list) ? list : []);
      } catch (e) {
        if (!alive) return;
        setCategories([]);
      } finally {
        if (!alive) return;
        setLoadingCategories(false);
      }
    };

    // Load on first open (or first mount if already open).
    if (isOpen) run();

    return () => {
      alive = false;
    };
  }, [isOpen]);

  const categoryItems = useMemo(() => {
    return (categories || []).map((c) => {
      const name = c?.name || '';
      const slug = c?.slug || '';
      const subcategories = Array.isArray(c?.subcategories) ? c.subcategories : [];

      return {
        id: c?.id || slug,
        name,
        slug,
        subcategories,
        hasSubcategories: subcategories.length > 0,
      };
    });
  }, [categories]);

  const handleNav = () => {
    if (onClose) onClose();
    setOpenMenu(null);
  };

  const renderCategoryLinks = () => {
    if (loadingCategories && (!categoryItems || categoryItems.length === 0)) {
      return (
        <div style={{ padding: 12, color: "rgba(0,0,0,0.6)", fontWeight: 600 }}>
          Loading categories…
        </div>
      );
    }

    if (!categoryItems || categoryItems.length === 0) {
      return (
        <div style={{ padding: 12, color: "rgba(0,0,0,0.6)", fontWeight: 600 }}>
          No categories
        </div>
      );
    }

    return categoryItems.map((cat) => {
      if (!cat?.slug) return null;

      const topKey = String(cat.id || cat.slug);

      if (!cat.hasSubcategories) {
        return (
          <Link
            key={topKey}
            to={`/categories/${cat.slug}`}
            className="header-sidebar__link"
            onClick={handleNav}
          >
            {cat.name || cat.slug}
          </Link>
        );
      }

      return (
        <div
          key={topKey}
          className={`header-sidebar__item ${
            openMenu === topKey ? "is-active" : ""
          }`}
        >
          <button
            type="button"
            className="header-sidebar__dropdown-btn"
            onClick={() => toggleMenu(topKey)}
          >
            <span>{cat.name || cat.slug}</span>
            <span className="header-sidebar__chev">▾</span>
          </button>

          <div className="header-sidebar__mega-menu">
            <div className="header-sidebar__mega-column">
              {/* Main category */}
              <Link
                to={`/categories/${cat.slug}`}
                onClick={handleNav}
                style={{ fontWeight: 800 }}
              >
                {cat.name || cat.slug}
              </Link>

              {/* Subcategories */}
              {cat.subcategories.map((sc) => (
                <Link
                  key={`${topKey}-${sc}`}
                  to={`/subcategories/${encodeURIComponent(sc)}`}
                  onClick={handleNav}
                >
                  {sc}
                </Link>
              ))}
            </div>
          </div>
        </div>
      );
    });
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
          {renderCategoryLinks()}

          <div className="header-sidebar__quick-actions">
            <Link
              to="/search"
              className="header-sidebar__quick-link"
              onClick={handleNav}
            >
              🔍 Search
            </Link>

            <Link
              to="/wishlist"
              className="header-sidebar__quick-link header-sidebar__quick-link--wishlist"
              onClick={handleNav}
            >
              🤍 Wishlist
              {wishlistCount > 0 ? (
                <span className="header-sidebar__badge">{wishlistCount}</span>
              ) : null}
            </Link>

            <Link
              to="/cart"
              className="header-sidebar__quick-link header-sidebar__quick-link--cart"
              onClick={handleNav}
            >
              🛒 Cart
              {totalQuantity > 0 ? (
                <span className="header-sidebar__badge">{totalQuantity}</span>
              ) : null}
            </Link>

            <Link
              to="/account/profile"
              className="header-sidebar__quick-link"
              onClick={handleNav}
            >
              👤 Profile
            </Link>

            <Link
              to="/account/orders"
              className="header-sidebar__quick-link"
              onClick={handleNav}
            >
              📦 Orders
            </Link>

            {user ? (
              <button
                type="button"
                className="header-sidebar__quick-link"
                onClick={async () => {
                  try {
                    await signOutUser();
                    if (onClose) onClose();
                  } catch (e) {
                    // keep silent here; auth page will show proper messaging
                    console.error(e);
                  }
                  setOpenMenu(null);
                }}
              >
                🚪 Logout
              </button>
            ) : null}
          </div>
        </div>
      </aside>
    </>
  );
}

export default HeaderSidebar;


