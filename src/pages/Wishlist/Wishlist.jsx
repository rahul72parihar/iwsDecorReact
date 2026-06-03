import { useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";

import {
  toggleWishlist,
  clearWishlist,
} from "../../features/wishlist/wishlistSlice";

import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

import { pushAutoToast } from "../../store/toastSlice";

import "./Wishlist.css";

export default function Wishlist() {
  const dispatch = useDispatch();
  const items = useSelector((s) => s.wishlist?.items ?? []);

  const hasItems = items.length > 0;
  const title = useMemo(() => "Wishlist", []);

  return (
    <>
      <Header />

      <div className="wishlist-page">
        <section className="wishlist-hero">
          <div className="wishlist-hero-inner">
            <div className="wishlist-breadcrumb">IWS Decor • Wishlist</div>

            <div className="flex-row">
              <h1 className="wishlist-title">{title}</h1>

              {hasItems && (
                <div className="wishlist-actions">
                  <button
                    className="wishlist-clear-btn"
                    onClick={() => {
                      dispatch(clearWishlist());

                      dispatch(
                        pushAutoToast({
                          type: "success",
                          title: "Wishlist cleared",
                          message: "All items removed",
                          link: "/wishlist",
                        })
                      );
                    }}
                  >
                    Clear Wishlist
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="wishlist-main">
          {!hasItems ? (
            <div className="wishlist-empty">
              <div className="wishlist-empty-icon">🤍</div>

              <div className="wishlist-empty-title">
                Your wishlist is empty
              </div>

              <div className="wishlist-empty-sub">
                Save products you love and come back anytime.
              </div>

              <Link to="/products" className="wishlist-empty-btn">
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="wishlist-list">
              {items.map((p) => (
                <div key={p.id} className="wishlist-item">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="wishlist-item-image"
                  />

                  <div className="wishlist-item-content">
                    <div className="wishlist-item-category">
                      {p.category}
                    </div>

                    <h3 className="wishlist-item-name">
                      {p.name}
                    </h3>

                    <div className="wishlist-item-price">
                      ₹{p.price.toLocaleString()}
                    </div>
                  </div>

                  <button
                    className="wishlist-remove-btn"
                    onClick={() => {
                      dispatch(toggleWishlist(p));

                      dispatch(
                        pushAutoToast({
                          type: "success",
                          title: "Removed from wishlist",
                          message: p.name,
                          link: "/wishlist",
                        })
                      );
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <Footer />
    </>
  );
}