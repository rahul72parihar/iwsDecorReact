import { useMemo } from 'react';
import './ProductFilters.css';

const CATEGORY_VALUES = [
  'Chandeliers',
  'Pendant Lights',
  'Wall Lights',
  'Table Lamps',
  'Floor Lamps',
  'Brass Decor',
];

export default function ProductFilters({
  search,
  setSearch,
  selectedCategories,
  setSelectedCategories,
  priceMin,
  priceMax,
  setPriceMin,
  setPriceMax,
  availability,
  setAvailability,
  ratingMin,
  setRatingMin,
  minPossiblePrice,
  maxPossiblePrice,
  minPossibleRating = 0,
  maxPossibleRating = 5,
}) {
  const priceLabel = useMemo(() => {
    const fmt = (v) => `₹${Math.round(v).toLocaleString('en-IN')}`;
    return `${fmt(priceMin)} - ${fmt(priceMax)}`;
  }, [priceMin, priceMax]);

  const toggleCategory = (cat) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  return (
    <aside className="filters" aria-label="Product filters">
      <div className="filters-card">
        <div className="filters-title">Filters</div>

        <div className="filter-block">
          <label className="filter-label" htmlFor="product-search">
            Search Products
          </label>
          <input
            id="product-search"
            className="filter-input"
            type="text"
            value={search}
            placeholder="Search by name or category"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-block">
          <div className="filter-label">Categories</div>
          <div className="check-list">
            {CATEGORY_VALUES.map((cat) => (
              <label key={cat} className="check-item">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat)}
                  onChange={() => toggleCategory(cat)}
                />
                <span>{cat}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="filter-block">
          <div className="filter-label">Price Range</div>
          <div className="price-label">{priceLabel}</div>

          <div className="range-group">
            <input
              className="range"
              type="range"
              min={minPossiblePrice}
              max={maxPossiblePrice}
              step={1000}
              value={priceMin}
              onChange={(e) => setPriceMin(Number(e.target.value))}
            />
            <input
              className="range"
              type="range"
              min={minPossiblePrice}
              max={maxPossiblePrice}
              step={1000}
              value={priceMax}
              onChange={(e) => setPriceMax(Number(e.target.value))}
            />
          </div>

          <div className="range-hint">Tip: Adjust both sliders</div>
        </div>

        <div className="filter-block">
          <div className="filter-label">Availability</div>
          <div className="check-list">
            <label className="check-item">
              <input
                type="checkbox"
                checked={availability === 'in'}
                onChange={() => setAvailability('in')}
              />
              <span>In Stock</span>
            </label>
            <label className="check-item">
              <input
                type="checkbox"
                checked={availability === 'out'}
                onChange={() => setAvailability('out')}
              />
              <span>Out of Stock</span>
            </label>
            <label className="check-item">
              <input
                type="checkbox"
                checked={availability === 'all'}
                onChange={() => setAvailability('all')}
              />
              <span>All</span>
            </label>
          </div>
        </div>

        <div className="filter-block">
          <div className="filter-label">Rating</div>
          <div className="rating-row">
            <input
              className="range"
              type="range"
              min={minPossibleRating}
              max={maxPossibleRating}
              step={0.1}
              value={ratingMin}
              onChange={(e) => setRatingMin(Number(e.target.value))}
            />
            <div className="rating-value">{ratingMin.toFixed(1)}+</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

