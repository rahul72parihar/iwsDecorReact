import { useEffect, useMemo, useState } from 'react';
import { Link } from "react-router-dom";
import "./CategoryBar.css";

import { listProducts } from '../../../firebase/productService';

// Build nav structure directly from product data
const toSlug = (str) =>
  str.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");


// Split product categories into groups of ~3 for multi-column mega menus
const chunkArray = (arr, size) => {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
  return chunks;
};

function ProductCategoryMegaMenu({ category }) {
  const columns = chunkArray(category.subcategories, 4);
  return (
    <div className="mega-menu">
      {columns.map((col, ci) => (
        <div className="mega-column" key={ci}>
          <h4>
              <Link
                to={`/categories/${encodeURIComponent(category.label)}`}
              >
                {category.label}
              </Link>

          </h4>
          {col.map((sub) => (
            <Link
              key={sub.slug}
              to={`/categories/${encodeURIComponent(category.label)}?subcategory=${encodeURIComponent(sub.label)}`}
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
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    const run = async () => {
      setLoading(true);
      setError('');
      try {
        const list = await listProducts();
        if (!alive) return;
        setProducts(list);
      } catch (e) {
        if (!alive) return;
        setError(e?.message || 'Failed to load categories');
        setProducts([]);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    };
    run();
    return () => {
      alive = false;
    };
  }, []);

  const dataCategories = useMemo(() => {
    const map = {};
    products.forEach(({ category, subcategory }) => {
      if (!category) return;
      if (!map[category]) map[category] = new Set();
      if (subcategory) map[category].add(subcategory);
    });

    return Object.entries(map).map(([category, subs]) => ({
      label: category,
      slug: toSlug(category),
      subcategories: [...subs].map((sub) => ({
        label: sub,
        slug: toSlug(sub),
      })),
    }));
  }, [products]);

  if (loading) {
    return (
      <div className="category-bar">
        <div className="category-container" style={{ padding: 16, fontWeight: 800, textAlign: 'center' }}>
          Loading categories…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="category-bar">
        <div className="category-container" style={{ padding: 16, fontWeight: 800, textAlign: 'center', color: '#b00020' }}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="category-bar">
      <div className="category-container">
        {dataCategories.map((cat) => (
          <div className="category-item" key={cat.slug}>
            <Link
              to={`/categories/${encodeURIComponent(cat.label)}`}
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
