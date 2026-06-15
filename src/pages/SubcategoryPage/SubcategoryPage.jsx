import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getCategoryBySlug } from "../../firebase/categoryService";
import { getProductsBySubcategory } from "../../firebase/productService";

import "./SubcategoryPage.css";

function EmptyState({ title, description }) {
  return (
    <div className="subcategory-page__empty">
      <h3>{title}</h3>
      {description ? <p>{description}</p> : null}
    </div>
  );
}

const toReadableSlugless = (str = "") =>
  String(str).toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");


export default function SubcategoryPage() {
  const { categorySlug, subcategorySlug } = useParams();

  const [category, setCategory] = useState(null);
  const [subcategoryName, setSubcategoryName] = useState("");
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        if (!categorySlug || !subcategorySlug) {
          if (!mounted) return;
          setCategory(null);
          setSubcategoryName("");
          setProducts([]);
          setError("Invalid route.");
          return;
        }

        const cat = await getCategoryBySlug(categorySlug);
        if (!mounted) return;

        if (!cat) {
          setCategory(null);
          setSubcategoryName("");
          setProducts([]);
          return;
        }

        const subs = Array.isArray(cat.subcategories) ? cat.subcategories : [];
        const matched = subs.find((sub) => toReadableSlugless(sub) === subcategorySlug);

        if (!matched) {
          setCategory(cat);
          setSubcategoryName("");
          setProducts([]);
          return;
        }

        const prods = await getProductsBySubcategory(cat.name, matched);
        if (!mounted) return;

        setCategory(cat);
        setSubcategoryName(matched);
        setProducts(prods || []);
      } catch (err) {
        if (!mounted) return;
        setError(err?.message || "Failed to load subcategory.");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [categorySlug, subcategorySlug]);

  const categoryBreadcrumbLink = useMemo(() => {
    if (!category?.slug) return null;
    return `/category/${category.slug}`;
  }, [category]);

  if (loading) {
    return (
      <div className="subcategory-page">
        <div className="subcategory-page__container">Loading products...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="subcategory-page">
        <div className="subcategory-page__container subcategory-page__error">{error}</div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="subcategory-page">
        <div className="subcategory-page__container">
          <EmptyState
            title="Category not found"
            description="The category you’re looking for doesn’t exist."
          />
        </div>
      </div>
    );
  }

  if (!subcategoryName) {
    return (
      <div className="subcategory-page">
        <div className="subcategory-page__container">
          <EmptyState title="Subcategory not found" description="This subcategory doesn’t exist." />
        </div>
      </div>
    );
  }

  return (
    <div className="subcategory-page">
      <div className="subcategory-page__container">
        <div className="subcategory-page__header">
          {categoryBreadcrumbLink ? (
            <Link to={categoryBreadcrumbLink} className="subcategory-page__breadcrumb-link">
              {category.name}
            </Link>
          ) : null}

          <h1 className="subcategory-page__title">{subcategoryName}</h1>
          {Array.isArray(category.subcategories) && category.subcategories.length > 0 ? (
            <div className="subcategory-page__hint">Explore more subcategories</div>
          ) : null}
        </div>

        <div className="subcategory-page__products">
          <h2 className="subcategory-page__products-title">Products</h2>

          {products.length === 0 ? (
            <EmptyState title="No products found" description="There are currently no products in this subcategory." />
          ) : (
            <div className="subcategory-page__products-grid">
              {products.map((p) => (
                <Link
                  key={p.id}
                  to={`/products/${p.id}`}
                  className="subcategory-page__product-card"
                >
                  {p.image ? (
                    <img
                      className="subcategory-page__product-image"
                      src={p.image}
                      alt={p.name}
                    />
                  ) : p.imageUrl ? (
                    <img
                      className="subcategory-page__product-image"
                      src={p.imageUrl}
                      alt={p.name}
                    />
                  ) : null}

                  <div className="subcategory-page__product-info">
                    <div className="subcategory-page__product-name">{p.name}</div>
                    {typeof p.price !== "undefined" ? (
                      <div className="subcategory-page__product-price">₹{p.price}</div>
                    ) : null}
                    {typeof p.oldPrice !== "undefined" && p.oldPrice > p.price ? (
                      <div className="subcategory-page__product-old-price">₹{p.oldPrice}</div>
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

