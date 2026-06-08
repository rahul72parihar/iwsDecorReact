import { useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { addToCart } from "../../features/cart/cartSlice";
import { pushAutoToast } from "../../store/toastSlice";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { products as allProducts } from "../../data/products";
import ProductGallery from "../../components/ProductGallery/ProductGallery";
import ProductInfo from "../../components/ProductInfo/ProductInfo";
import ProductDescription from "../../components/ProductDescription/ProductDescription";
import Reviews from "../../components/Reviews/Reviews";
import RelatedProducts from "../../components/RelatedProducts/RelatedProducts";

import "./ProductDetails.css";

const DUMMY_REVIEWS = [
  {
    id: "r1",
    name: "Anaya Sharma",
    rating: 5,
    text: "Absolutely stunning craftsmanship. The gold accents look even more premium in person.",
    date: "2026-02-18",
  },
  {
    id: "r2",
    name: "Rahul Mehta",
    rating: 4,
    text: "Elegant design and the finish is top-notch. Great addition to our living room.",
    date: "2026-01-29",
  },
  {
    id: "r3",
    name: "Priya Nair",
    rating: 5,
    text: "Looks luxurious and feels high-quality. Delivery was smooth and fast.",
    date: "2025-12-11",
  },
];

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

export default function ProductDetails() {
  const { productId } = useParams();
  const id = useMemo(() => {
    const n = Number(productId);
    return Number.isFinite(n) ? n : null;
  }, [productId]);

  const product = useMemo(
    () => allProducts.find((p) => p.id === id) ?? null,
    [id],
  );

  const dispatch = useDispatch();

  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState("description");

  const reviews = useMemo(() => {
    if (!product) return [];
    // Generate a small set deterministically per product.
    const seed = product.id;
    const rotated = DUMMY_REVIEWS.map((r, idx) => ({
      ...r,
      id: `${r.id}-${seed}-${idx}`,
      rating: Math.max(3, Math.min(5, r.rating - ((seed + idx) % 2))),
      date: new Date(Date.parse(r.date) + (seed % 9) * 86400000)
        .toISOString()
        .slice(0, 10),
    }));
    return rotated;
  }, [product]);

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
                      link: '/cart',
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

        <section className="product-details-reviews">
          <div className="section-head">
            <h2 className="section-title">Customer Reviews</h2>
            <div className="section-sub">
              <span className="gold">{product.rating.toFixed(1)}</span> rating •{" "}
              {product.reviewsCount.toLocaleString("en-IN")} reviews
            </div>
          </div>

          <Reviews reviews={reviews} formatDate={formatDate} />
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
