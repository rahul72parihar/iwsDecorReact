import { useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";

import {
  toggleWishlist,
  clearWishlist,
} from "../../features/wishlist/wishlistSlice";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import ProductCard from "../../components/ProductCard/ProductCard";

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
                          link: '/wishlist',
                        }),
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
            <div className="wishlist-empty" role="status" aria-live="polite">
              <div className="wishlist-empty-icon" aria-hidden="true">
                🤍
              </div>
              <div className="wishlist-empty-title">Your wishlist is empty</div>
              <div className="wishlist-empty-sub">
                Save products you love and come back anytime.
              </div>
              <Link to="/products" className="wishlist-empty-btn">
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="wishlist-grid">
              {items.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onAddToCart={() => {
                    // keep wishlist page focused; user can add from product card.
                  }}
                  onToggleWishlist={(product) => {
                    dispatch(toggleWishlist(product));
                    dispatch(
                      pushAutoToast({
                        type: "success",
                        title: "Wishlist updated",
                        message: product.name,
                        link: '/wishlist',
                      }),
                    );
                  }}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      <Footer />
    </>
  );
}
