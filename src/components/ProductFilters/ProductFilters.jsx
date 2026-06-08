import { useEffect, useMemo, useState } from 'react';
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
  const [localPriceMin, setLocalPriceMin] = useState(priceMin);
  const [localPriceMax, setLocalPriceMax] = useState(priceMax);
  const [localRatingMin, setLocalRatingMin] = useState(ratingMin);

  useEffect(() => {
    setLocalPriceMin(priceMin);
  }, [priceMin]);

  useEffect(() => {
    setLocalPriceMax(priceMax);
  }, [priceMax]);

  useEffect(() => {
    setLocalRatingMin(ratingMin);
  }, [ratingMin]);

  const normalizePriceRange = (minV, maxV) => {
    const min = Math.min(minV, maxV);
    const max = Math.max(minV, maxV);

    const clampedMin = Math.max(
      minPossiblePrice,
      Math.min(min, maxPossiblePrice)
    );
    const clampedMax = Math.max(
      minPossiblePrice,
      Math.min(max, maxPossiblePrice)
    );

    return { min: clampedMin, max: clampedMax };
  };
  const priceLabel = useMemo(() => {
    const fmt = (v) => `₹${Math.round(v).toLocaleString('en-IN')}`;
    return `${fmt(priceMin)} - ${fmt(priceMax)}`;
  }, [priceMin, priceMax]);

  const toggleCategory = (cat) => {
    setSelectedCategories((prevCategories) => {
      if (prevCategories.includes(cat)) {
        return prevCategories.filter((c) => c !== cat);
      }
      return [...prevCategories, cat];
    });
  };

  const clearAllFilters = () => {
    setSearch('');
    setSelectedCategories([]);
    setPriceMin(minPossiblePrice);
    setPriceMax(maxPossiblePrice);
    setAvailability('all');
    setRatingMin(0);
  };

  const hasActiveFilters = 
    search.trim() !== '' ||
    selectedCategories.length > 0 ||
    priceMin !== minPossiblePrice ||
    priceMax !== maxPossiblePrice ||
    availability !== 'all' ||
    ratingMin > 0;

  return (
    <aside className="filters" aria-label="Product filters">
      <div className="filters-card">
        <div className="filters-header">
          <div className="filters-title">Filters</div>
          {hasActiveFilters && (
            <button
              className="clear-filters-btn"
              onClick={clearAllFilters}
              type="button"
              aria-label="Clear all filters"
            >
              Clear
            </button>
          )}
        </div>

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
              value={localPriceMin}
              onChange={(e) => setLocalPriceMin(Number(e.target.value))}
              onMouseUp={() => {
                const next = normalizePriceRange(localPriceMin, localPriceMax);
                setPriceMin(next.min);
                setPriceMax(next.max);
              }}
              onTouchEnd={() => {
                const next = normalizePriceRange(localPriceMin, localPriceMax);
                setPriceMin(next.min);
                setPriceMax(next.max);
              }}
            />
            <input
              className="range"
              type="range"
              min={minPossiblePrice}
              max={maxPossiblePrice}
              step={1000}
              value={localPriceMax}
              onChange={(e) => setLocalPriceMax(Number(e.target.value))}
              onMouseUp={() => {
                const next = normalizePriceRange(localPriceMin, localPriceMax);
                setPriceMin(next.min);
                setPriceMax(next.max);
              }}
              onTouchEnd={() => {
                const next = normalizePriceRange(localPriceMin, localPriceMax);
                setPriceMin(next.min);
                setPriceMax(next.max);
              }}
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

        {/* <div className="filter-block">
          <div className="filter-label">Rating</div>
          <div className="rating-row">
            <input
              className="range"
              type="range"
              min={minPossibleRating}
              max={maxPossibleRating}
              step={0.1}
              value={localRatingMin}
              onChange={(e) => setLocalRatingMin(Number(e.target.value))}
              onMouseUp={() => {
                setRatingMin(localRatingMin);
              }}
              onTouchEnd={() => {
                setRatingMin(localRatingMin);
              }}
            />
            <div className="rating-value">{localRatingMin.toFixed(1)}+</div>
          </div>
        </div> */}
      </div>
    </aside>
  );
}

