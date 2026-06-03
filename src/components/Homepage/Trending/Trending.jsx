import "./Trending.css";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

import { addToCart } from "../../../features/cart/cartSlice";
import { toggleWishlist } from "../../../features/wishlist/wishlistSlice";
import { products as allProducts } from "../../../data/products";
import { pushAutoToast } from "../../../store/toastSlice";

function Trending() {
  const dispatch = useDispatch();
  const wishlistItems = useSelector((s) => s.wishlist?.items ?? []);


  // Use real catalog products so Redux payloads match what reducers expect.
  const products = allProducts.slice(0, 4);

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
                <button
                  className="wishlist-btn"
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    dispatch(toggleWishlist(product));

                    const afterIsWishlisted = !wishlistItems.some(
                      (i) => i.id === product.id,
                    );

                    dispatch(
                      pushAutoToast({
                        type: "success",
                        title: afterIsWishlisted
                          ? "Added to wishlist"
                          : "Removed from wishlist",
                        message: product.name,
                        link: `/wishlist`,
                      }),
                    );
                  }}

                  aria-label="Toggle wishlist"
                >
                  {wishlistItems.some((i) => i.id === product.id) ? "♥" : "♡"}

                </button>
              </div>

              <div className="product-content">

                <p className="product-category">{product.category}</p>
                <h3 className="product-name">{product.name}</h3>

                <div className="product-rating">
                  <span className="stars">★★★★★</span>
                  {product.reviews && (
                    <span className="reviews">({product.reviews})</span>
                  )}
                </div>

                <div className="price-row">
                  <span className="current-price">₹{product.price}</span>
                  <span className="old-price">{product.oldPrice}</span>
                  <span className="discount">{product.discount}</span>
                </div>

                <button
                  className="add-cart-btn"
                  type="button"
                  disabled={!product.inStock}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!product.inStock) return;

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
                      })
                    );

                  }}
                >
                  {product.inStock ? "Add to Cart" : "Unavailable"}
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

