import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./CategoryBar.css";

import { listCategories } from "../../../firebase/categoryService";

const toSlug = (str = "") =>
  str.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

const normalizeSlug = (str = "") => toSlug(str);


const chunkArray = (arr, size) => {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};

function ProductCategoryMegaMenu({ category }) {
  const columns = chunkArray(category.subcategories, 4);

  return (
    <div className="mega-menu">
      {columns.map((col, ci) => (
        <div className="mega-column" key={ci}>
          <h4>
            <Link to={`/category/${category.slug}`}>{category.label}</Link>
          </h4>

          {col.map((sub) => (
            <Link
              key={sub.slug}
              to={`/category/${category.slug}/${sub.slug}`}
            >
              {sub.label}
            </Link>
          ))}

        </div>
      ))}
    </div>
  );
}

function CategoryBar() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadCategories = async () => {
      try {
        setLoading(true);

        const data = await listCategories();

        if (!mounted) return;

        setCategories(data || []);
      } catch (err) {
        if (!mounted) return;

        setError(err?.message || "Failed to load categories");
      } finally {
        if (!mounted) return;

        setLoading(false);
      }
    };

    loadCategories();

    return () => {
      mounted = false;
    };
  }, []);

  const dataCategories = useMemo(() => {
    return categories
      .map((cat) => ({
        id: cat.id,
        label: cat.name || cat.label,
        slug: cat.slug || normalizeSlug(cat.name || cat.label),

        subcategories: (cat.subcategories || []).map((sub) => ({
          label: sub,
          slug: normalizeSlug(sub),
        })),
      }))
      .filter((cat) => cat.label);
  }, [categories]);


  if (loading) {
    return (
      <div className="category-bar">
        <div className="category-container">
          Loading categories...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="category-bar">
        <div
          className="category-container"
          style={{ color: "#b00020" }}
        >
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="category-bar">
      <div className="category-container">
        {dataCategories.map((cat) => (
          <div className="category-item" key={cat.id}>
            <Link
              to={`/category/${cat.slug}`}
              className="category-link"
            >
              {cat.label}
            </Link>

            {cat.subcategories.length > 0 && (
              <ProductCategoryMegaMenu category={cat} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default CategoryBar;