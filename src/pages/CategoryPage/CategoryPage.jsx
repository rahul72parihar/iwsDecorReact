import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getCategoryBySlug } from "../../firebase/categoryService";
import { getProductsByCategory } from "../../firebase/productService";

import "./CategoryPage.css";

function EmptyState({ title, description }) {
  return (
    <div className="category-page__empty">
      <h3>{title}</h3>
      {description ? <p>{description}</p> : null}
    </div>
  );
}

export default function CategoryPage() {
  const { categorySlug } = useParams();

  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        if (!categorySlug) {
          if (!mounted) return;
          setCategory(null);
          setProducts([]);
          setError("Invalid category.");
          return;
        }

        const cat = await getCategoryBySlug(categorySlug);

        if (!mounted) return;

        if (!cat) {
          setCategory(null);
          setProducts([]);
          return;
        }

        setCategory(cat);

        const prods = await getProductsByCategory(cat.name);
        if (!mounted) return;
        setProducts(prods || []);
      } catch (err) {
        if (!mounted) return;
        setError(err?.message || "Failed to load category.");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [categorySlug]);



  if (loading) {
    return (
      <div className="category-page">
        <div className="category-page__container">Loading category...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="category-page">
        <div className="category-page__container category-page__error">{error}</div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="category-page">
        <div className="category-page__container">
          <EmptyState title="Category not found" description="The category you’re looking for doesn’t exist." />
        </div>
      </div>
    );
  }

  const subcategoryLinks = (category.subcategories || []).map((sub) => {
    const subSlug = String(sub)
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");


    return (
      <Link
        key={sub}
        className="category-page__subcategory-link"
        to={`/category/${category.slug}/${subSlug}`}
      >
        {sub}
      </Link>
    );
  });

  return (
    <div className="category-page">
      <div className="category-page__container">
        <div className="category-page__hero">
          {category.imageUrl ? (
            <img
              className="category-page__image"
              src={category.imageUrl}
              alt={category.name}
            />
          ) : null}

          <div className="category-page__meta">
            <h1 className="category-page__title">{category.name}</h1>
            {category.description ? (
              <p className="category-page__description">{category.description}</p>
            ) : null}

            {subcategoryLinks.length > 0 ? (
              <div className="category-page__subcategories">
                <h3>Subcategories</h3>
                <div className="category-page__subcategories-grid">{subcategoryLinks}</div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="category-page__products">
          <h2 className="category-page__products-title">Products</h2>

          {products.length === 0 ? (
            <EmptyState title="No products found" description="There are currently no products in this category." />
          ) : (
            <div className="category-page__products-grid">
              {products.map((p) => (
                <Link
                  key={p.id}
                  to={`/products/${p.id}`}
                  className="category-page__product-card"
                >
                  {p.image ? (
                    <img
                      className="category-page__product-image"
                      src={p.image}
                      alt={p.name}
                    />
                  ) : p.imageUrl ? (
                    <img
                      className="category-page__product-image"
                      src={p.imageUrl}
                      alt={p.name}
                    />
                  ) : null}

                  <div className="category-page__product-info">
                    <div className="category-page__product-name">{p.name}</div>

                    {typeof p.price !== "undefined" ? (
                      <div className="category-page__product-price">₹{p.price}</div>
                    ) : null}
                    {typeof p.oldPrice !== "undefined" && p.oldPrice > p.price ? (
                      <div className="category-page__product-old-price">₹{p.oldPrice}</div>
                    ) : null}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

