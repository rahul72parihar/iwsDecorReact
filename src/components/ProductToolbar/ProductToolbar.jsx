import './ProductToolbar.css';

export default function ProductToolbar({
  productCount,
  sort,
  setSort,
}) {
  return (
    <div className="toolbar" aria-label="Product toolbar">
      <div className="toolbar-left">
        <div className="toolbar-count">
          <span className="count-strong">{productCount}</span> Products
        </div>
      </div>

      <div className="toolbar-right">
        <div className="sort-wrap">
          <label className="sort-label" htmlFor="sort-select">
            Sort
          </label>
          <select
            id="sort-select"
            className="sort-select"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="featured">Featured</option>
            <option value="newest">Newest</option>
            <option value="priceLow">Price Low to High</option>
            <option value="priceHigh">Price High to Low</option>
            <option value="bestSelling">Best Selling</option>
          </select>
        </div>
      </div>
    </div>
  );
}

