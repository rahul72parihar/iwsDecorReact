import { Link } from "react-router-dom";
import "./Categories.css";

function Categories() {
  const categories = [
    {
      id: 1,
      name: "Chandeliers",
      products: "48 Products",
      image:
        "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1200&auto=format&fit=crop",
    },
    {
      id: 2,
      name: "Table Lamps",
      products: "62 Products",
      image:
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200&auto=format&fit=crop",
    },
    {
      id: 3,
      name: "Pendant Lights",
      products: "35 Products",
      image:
        "https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1200&auto=format&fit=crop",
    },
  ];

  return (
    <section className="categories-section">
      <div className="section-header">
        <p className="section-tag">Browse Collection</p>

        <h2 className="section-title">
          Shop by Category
        </h2>
      </div>

      <div className="categories-grid">
        {categories.map((category) => (
          <Link
            key={category.id}
            to={`/categories/${encodeURIComponent(category.name.toLowerCase().replace(/\s+/g, '-'))}`}
            className="cat-card"
          >
            <div
              className="cat-img"
              style={{
                backgroundImage: `url(${category.image})`,
              }}
            />

            <div className="cat-info">
              <h3>{category.name}</h3>
              <p>{category.products}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default Categories;
