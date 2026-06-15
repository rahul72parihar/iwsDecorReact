import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { addToCart } from "../../features/cart/cartSlice";
import { pushAutoToast } from "../../store/toastSlice";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { getProduct } from "../../firebase/productService";

import useAuth from "../../auth/useAuth";
import { createReview, listApprovedReviewsForProduct } from "../../firebase/reviewService";


import ProductGallery from "../../components/ProductGallery/ProductGallery";
import ProductInfo from "../../components/ProductInfo/ProductInfo";
import ProductDescription from "../../components/ProductDescription/ProductDescription";
import Reviews from "../../components/Reviews/Reviews";
import RelatedProducts from "../../components/RelatedProducts/RelatedProducts";

import "./ProductDetails.css";

function formatDate(iso) {
  const d = new Date(iso);
  // fallback for invalid dates
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function StarPicker({ rating, onChange, disabled }) {
  const [hover, setHover] = useState(0);

  return (
    <div
      className="product-review-form__stars"
      role="radiogroup"
      aria-label="Select your rating"
      onMouseLeave={() => setHover(0)}
    >
      {[1, 2, 3, 4, 5].map((value) => {
        const active = value <= (hover || rating);
        return (
          <button
            key={value}
            type="button"
            className={`product-review-form__star ${active ? "is-active" : ""}`}
            onClick={() => onChange(value)}
            onMouseEnter={() => setHover(value)}
            disabled={disabled}
            role="radio"
            aria-checked={rating === value}
            aria-label={`${value} star${value > 1 ? "s" : ""}`}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}

function ReviewForm({
  onSubmit,
  initialRating = 5,
  customerName,
  customerEmail,
  productId,
  productName,
}) {
  const [rating, setRating] = useState(initialRating);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const trimmed = text.trim();
    if (!trimmed || trimmed.length < 5) {
      setError("Please write at least 5 characters.");
      return;
    }

    if (!rating || rating < 1 || rating > 5) {
      setError("Please select a rating.");
      return;
    }

    setSaving(true);
    try {
      await onSubmit({
        productId,
        productName,
        rating,
        text: trimmed,
        customerName: customerName || "Customer",
        customerEmail: customerEmail || "",
      });
      setText("");
      setRating(initialRating);
    } catch (e) {
      setError(e?.message || "Failed to submit review");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="product-review-form__form" onSubmit={handleSubmit} noValidate>
      <div className="product-review-form__grid">
        <div className="product-review-form__field">
          <label className="product-review-form__label" id="review-rating-label">
            Your rating
          </label>
          <StarPicker rating={rating} onChange={setRating} disabled={saving} />
          <span className="product-review-form__rating-hint">
            {rating} out of 5 stars
          </span>
        </div>

        <div className="product-review-form__field product-review-form__field--full">
          <label className="product-review-form__label" htmlFor="review-text">
            Your review
          </label>
          <textarea
            id="review-text"
            className="product-review-form__textarea"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Tell us about the quality, design, and how it looks in your space…"
            disabled={saving}
            rows={5}
            required
            minLength={5}
            aria-describedby={error ? "review-error" : undefined}
          />
        </div>
      </div>

      {error && (
        <div id="review-error" className="product-review-form__error" role="alert">
          {error}
        </div>
      )}

      <div className="product-review-form__actions">
        <button type="submit" className="product-review-form__btn" disabled={saving}>
          {saving ? "Submitting…" : "Submit review"}
        </button>
      </div>
    </form>
  );
}

export default function ProductDetails() {
  const { productId } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    const run = async () => {
      setLoading(true);
      setError("");
      try {
        const p = await getProduct(productId);
        if (!alive) return;
        setProduct(p);
      } catch (e) {
        if (!alive) return;
        setError(e?.message || "Failed to load product");
        setProduct(null);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    };
    run();
    return () => {
      alive = false;
    };
  }, [productId]);

  const dispatch = useDispatch();

  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState("description");

  const { user } = useAuth();

  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState("");

  useEffect(() => {
    let alive = true;
    const run = async () => {
      if (!product?.id) return;
      setReviewsLoading(true);
      setReviewsError("");
      try {
        const list = await listApprovedReviewsForProduct(product.id);
        if (!alive) return;

        const mapped = list.map((r) => ({
          id: r.id,
          name: r.customerName || "Customer",
          rating: Number(r.rating) || 5,
          text: r.text || "",
          date:
            r.createdAt && typeof r.createdAt.toDate === "function"
              ? r.createdAt.toDate().toISOString()
              : r.createdAt || r.date || new Date().toISOString(),
        }));

        setReviews(mapped);
      } catch (e) {
        if (!alive) return;
        setReviewsError(e?.message || "Failed to load reviews");
        setReviews([]);
      } finally {
        if (!alive) return;
        setReviewsLoading(false);
      }
    };

    run();
    return () => {
      alive = false;
    };
  }, [product?.id]);


  const productTabs = useMemo(() => {
    if (!product) return [];

    const specs = [
      {
        label: "Material",
        value: "Brass finish with premium-grade components",
      },
      { label: "Finish", value: "Champagne gold tone with anti-glare coating" },
      { label: "Style", value: "Luxury statement decor" },
      {
        label: "Recommended Use",
        value: `${product.category} styling for living spaces & entryways`,
      },
    ];

    // Admin requirement: tabs are derived mainly from Name/Description.
    // We still keep the existing tab keys so UI remains unchanged.
    return [
      {
        key: "description",
        title: "Description",
        content:
          product.description ??
          `Elevate your interiors with the ${product.name}. Crafted for timeless elegance, it brings warm illumination and a refined luxury aesthetic to any space.`,
      },
      {
        key: "specifications",
        title: "Specifications",
        content: specs,
      },
      {
        key: "care",
        title: "Care Instructions",
        content: [
          "Wipe gently with a soft, dry cloth to preserve the premium finish.",
          "Avoid abrasive cleaners and direct harsh chemicals.",
          "For best results, keep away from prolonged direct moisture.",
        ],
      },
      {
        key: "shipping",
        title: "Shipping Information",
        content: [
          "Packed with protective materials to ensure safe transit.",
          "Ships within 2–4 business days.",
          "Delivery timelines vary by location; we keep you updated via email.",
        ],
      },
    ];
  }, [product]);

  if (loading) {
    return (
      <>
        <Header />
        <div
          className="product-details-page"
          style={{ padding: 24, textAlign: "center", fontWeight: 800 }}
        >
          Loading product…
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div
          className="product-details-page"
          style={{
            padding: 24,
            textAlign: "center",
            fontWeight: 800,
            color: "#b00020",
          }}
        >
          {error}
        </div>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Header />

        <div className="product-details-page">
          <section className="product-details-hero">
            <div className="product-details-hero-inner">
              <div className="product-details-error">Product not found.</div>
            </div>
          </section>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      <div className="product-details-page">
        <section className="product-details-hero">
          <div className="product-details-hero-inner">
            <div className="breadcrumb">IWS Decor • Products</div>
            <h1 className="product-details-h1">{product.name}</h1>
            <p className="product-details-sub">
              {product.category} • {product.brand ?? "IWS Signature"}
            </p>
          </div>
        </section>

        <section className="product-details-main">
          <div className="product-details-main-grid">
            <div className="product-details-left">
              <ProductGallery product={product} />
            </div>

            <div className="product-details-right">
              <ProductInfo
                product={product}
                qty={qty}
                setQty={setQty}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                tabs={productTabs}
                onAddToCart={() => {
                  dispatch(
                    addToCart({
                      id: product.id,
                      name: product.name,
                      image: product.image,
                      category: product.category,
                      price: product.price,
                    }),
                  );

                  dispatch(
                    pushAutoToast({
                      type: "success",
                      title: "Added to cart",
                      message: product.name,
                      link: "/cart",
                    }),
                  );
                }}
              />
            </div>
          </div>
        </section>

        <section className="product-details-description">
          <ProductDescription
            description={product.description}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            tabs={productTabs}
          />
        </section>

        <section className="product-details-reviews" aria-labelledby="customer-reviews-title">
          <div className="product-reviews-wrap">
            <header className="product-reviews-header">
              <div className="product-reviews-header-copy">
                <p className="product-reviews-eyebrow">Testimonials</p>
                <h2 id="customer-reviews-title" className="product-reviews-title">
                  Customer Reviews
                </h2>
                <p className="product-reviews-sub">
                  Real feedback from customers who chose this piece.
                </p>
              </div>

              <div className="product-reviews-score" aria-label="Average product rating">
                <span className="product-reviews-score-value">
                  {product?.rating?.toFixed(1) ?? "—"}
                </span>
                <div className="product-reviews-score-meta">
                  <div className="product-reviews-score-stars" aria-hidden="true">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={`product-reviews-score-star ${
                          i < Math.round(product?.rating || 0) ? "is-filled" : ""
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="product-reviews-score-count">
                    {product?.reviewsCount
                      ? `${product.reviewsCount.toLocaleString("en-IN")} reviews`
                      : "No ratings yet"}
                  </span>
                </div>
              </div>
            </header>

            {reviewsLoading && (
              <div className="product-reviews-status is-loading" role="status">
                <span className="product-reviews-status-dot" aria-hidden="true" />
                Loading reviews…
              </div>
            )}

            {reviewsError && (
              <div className="product-reviews-status is-error" role="alert">
                {reviewsError}
              </div>
            )}

            {!reviewsLoading && !reviewsError && (
              <Reviews reviews={reviews} formatDate={formatDate} />
            )}

            <div className="product-review-form-card">
              <div className="product-review-form-head">
                <h3 className="product-review-form-title">Write your review</h3>
                <p className="product-review-form-sub">
                  Share details that would help other shoppers.
                </p>
              </div>

              {!user ? (
                <div className="product-reviews-login-prompt">
                  <p>Please log in to add a review.</p>
                </div>
              ) : (
                <ReviewForm
                  onSubmit={async (payload) => {
                    await createReview(payload);
                    const list = await listApprovedReviewsForProduct(product.id);
                    const mapped = list.map((r) => ({
                      id: r.id,
                      name: r.customerName || "Customer",
                      rating: Number(r.rating) || 5,
                      text: r.text || "",
                      date:
                        r.createdAt && typeof r.createdAt.toDate === "function"
                          ? r.createdAt.toDate().toISOString()
                          : r.createdAt || r.date || new Date().toISOString(),
                    }));
                    setReviews(mapped);
                    dispatch(
                      pushAutoToast({
                        type: "success",
                        title: "Review submitted",
                        message: "Thanks for sharing your experience!",
                      }),
                    );
                  }}
                  initialRating={5}
                  customerName={user?.displayName || user?.email?.split("@")[0] || "Customer"}
                  customerEmail={user?.email || ""}
                  productId={product.id}
                  productName={product.name}
                />
              )}
            </div>
          </div>
        </section>


        <section className="product-details-related">
          <div className="section-head">
            <h2 className="section-title">Related Products</h2>
            <div className="section-sub">
              Curated styles inspired by your selection.
            </div>
          </div>

          <RelatedProducts currentProduct={product} />
        </section>
      </div>

      <Footer />
    </>
  );
}
