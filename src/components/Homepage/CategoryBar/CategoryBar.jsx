import { useEffect, useMemo, useState } from 'react';
import { Link } from "react-router-dom";
import "./CategoryBar.css";


import { listCategories } from '../../../firebase/categoryService';
import { getCategorySubcategories } from '../../../firebase/subcategoryService';

// Build nav structure from Firestore category docs
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
                to={`/subcategories`}
              >
                {category.label}
              </Link>

          </h4>
          {col.map((sub) => (
            <Link
              key={sub.slug}
              to={`/subcategories?subcategory=${encodeURIComponent(String(sub.label))}`}
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
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    const run = async () => {
      setLoading(true);
      setError('');
      try {
        const list = await listCategories();
        if (!alive) return;
        setCategories(list);
      } catch (e) {
        if (!alive) return;
        setError(e?.message || 'Failed to load categories');
        setCategories([]);
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

  const [subcategoriesByCategoryId, setSubcategoriesByCategoryId] = useState({});

  useEffect(() => {
    let alive = true;
    const run = async () => {
      if (!categories.length) {
        setSubcategoriesByCategoryId({});
        return;
      }

      const entries = await Promise.all(
        categories.map(async (c) => {
          const subs = await getCategorySubcategories(c.id);
          return [c.id, Array.isArray(subs) ? subs : []];
        }),
      );

      if (!alive) return;
      setSubcategoriesByCategoryId(Object.fromEntries(entries));
    };

    run();
    return () => {
      alive = false;
    };
  }, [categories]);

  const dataCategories = useMemo(() => {
    return categories
      .map((c) => {
        const label = (c?.label || c?.name || '').trim();
        if (!label) return null;

        const subcats = subcategoriesByCategoryId[c.id] || [];

        const slug = (c?.slug || toSlug(label)).trim();

        return {
          id: c.id,
          label,
          slug,
          subcategories: subcats
            .filter(Boolean)
            .map((sub) => ({
              label: sub,
              slug: toSlug(sub),
            })),
        };
      })
      .filter(Boolean);
  }, [categories, subcategoriesByCategoryId]);

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
              to={`/subcategories`}
              className="category-link"
            >
              {cat.label}
            </Link>


            {cat.subcategories?.length > 0 && (
            <ProductCategoryMegaMenu category={cat} />
          )}

          </div>
        ))}
      </div>
    </div>
  );
}


export default CategoryBar;
