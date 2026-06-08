import { Link } from "react-router-dom";
import { products } from "../../../data/products.js";
import "./CategoryBar.css";

// Build nav structure directly from product data
const toSlug = (str) =>
  str.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

const buildNavCategories = () => {
  const map = {};
  products.forEach(({ category, subcategory }) => {
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
};

const DATA_CATEGORIES = buildNavCategories();

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
              to={`/products?category=${encodeURIComponent(category.label)}`}
            >
              {category.label}
            </Link>
          </h4>
          {col.map((sub) => (
            <Link
              key={sub.slug}
              to={`/products?category=${encodeURIComponent(sub.label)}`}
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
  return (
    <div className="category-bar">
      <div className="category-container">

        {/* Product-data-driven categories: Lighting, Decor, etc. */}
        {DATA_CATEGORIES.map((cat) => (
          <div className="category-item" key={cat.slug}>
            <Link to={`/products?category=${encodeURIComponent(cat.label)}`} className="category-link">
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
