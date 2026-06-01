import "./Trending.css";
import { Link } from "react-router-dom";

function Trending() {
  const products = [
    {
      id: 1,
      category: "Table Lamps",
      name: "Velvet Brass Lamp",
      price: "₹4,299",
      oldPrice: "₹5,999",
      discount: "22% OFF",
      reviews: 104,
      image:
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200&auto=format&fit=crop",
    },
    {
      id: 2,
      category: "Pendant Lights",
      name: "Modern Hanging Light",
      price: "₹6,499",
      oldPrice: "₹7,899",
      discount: "18% OFF",
      reviews: 88,
      image:
        "https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1200&auto=format&fit=crop",
    },
    {
      id: 3,
      category: "Chandeliers",
      name: "Luxury Crystal Chandelier",
      price: "₹18,999",
      oldPrice: "₹24,999",
      discount: "24% OFF",
      reviews: 201,
      image:
        "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1200&auto=format&fit=crop",
    },
    {
      id: 4,
      category: "Wall Decor",
      name: "Brass Wall Sconce",
      price: "₹8,499",
      oldPrice: "₹10,999",
      discount: "19% OFF",
      reviews: 52,
      image:
        "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?q=80&w=1200&auto=format&fit=crop",
    },
  ];

  return (
    <section className="trending-section">
      <div className="section-header">
        <p className="section-tag">Featured Collection</p>
        <h2 className="section-title">Trending</h2>
      </div>

      <div className="trending-grid">
        {products.map((product) => (
          <div className="product-card" key={product.id}>
            <Link
              to={`/products/${product.id}`}
              className="trending-item-link"
              aria-label={`View ${product.name} details`}
            >
              <div
                className="product-image"
                style={{
                  backgroundImage: `url(${product.image})`,
                }}
              >
                <button className="wishlist-btn" type="button">
                  ♡
                </button>
              </div>

              <div className="product-content">
                <p className="product-category">{product.category}</p>
                <h3 className="product-name">{product.name}</h3>

                <div className="product-rating">
                  <span className="stars">★★★★★</span>
                  <span className="reviews">({product.reviews})</span>
                </div>

                <div className="price-row">
                  <span className="current-price">{product.price}</span>
                  <span className="old-price">{product.oldPrice}</span>
                  <span className="discount">{product.discount}</span>
                </div>

                <button className="add-cart-btn" type="button">
                  Add to Cart
                </button>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Trending;

