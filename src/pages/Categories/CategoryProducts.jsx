import { useEffect, useMemo, useState } from 'react';

import { useDispatch } from 'react-redux';

import { addToCart } from '../../features/cart/cartSlice';
import { toggleWishlist } from '../../features/wishlist/wishlistSlice';
import { pushAutoToast } from '../../store/toastSlice';

import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';

import ProductCard from '../../components/ProductCard/ProductCard';
import ProductFilters from '../../components/ProductFilters/ProductFilters';
import ProductToolbar from '../../components/ProductToolbar/ProductToolbar';

import { listProducts } from '../../firebase/productService';

import './CategoryProducts.css';
import CategoryBar from '../../components/Homepage/CategoryBar/CategoryBar';

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

const priceBounds = (items) => {
  const prices = items.map((p) => p.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const step = 1000;
  return {
    min: Math.floor(min / step) * step,
    max: Math.ceil(max / step) * step,
  };
};

export default function CategoryProducts() {
  const dispatch = useDispatch();

  const [allProducts, setAllProducts] = useState([]);
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
        setAllProducts(list);
      } catch (e) {
        if (!alive) return;
        setError(e?.message || 'Failed to load products');
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

  // Supports two URL formats:
  // 1) /categories/:categoryId (categoryId is used as category label in this app)
  // 2) /categories/:categoryId?subcategory=... (subcategory is optional)
  const params = new URLSearchParams(window.location.search);
  const subcategory = (params.get('subcategory') || '').trim();

  const pathParts = window.location.pathname.split('/').filter(Boolean);
  const categoryIdFromPath = pathParts[pathParts.length - 1] || '';
  const normalizedCategory = categoryIdFromPath.trim();

  const filteredByCategory = useMemo(() => {
    if (!normalizedCategory) return [];
    return allProducts.filter((p) => p.category === normalizedCategory);
  }, [allProducts, normalizedCategory]);

  const filteredByCategoryAndSubcategory = useMemo(() => {
    if (!normalizedCategory) return [];
    if (!subcategory) return filteredByCategory;
    return filteredByCategory.filter((p) => p.subcategory === subcategory);
  }, [filteredByCategory, normalizedCategory, subcategory]);

  const bounds = useMemo(() => {
    const items = filteredByCategory.length ? filteredByCategory : [{ price: 0 }];
    return priceBounds(items);
  }, [filteredByCategory]);

  const [search, setSearch] = useState('');
  const [availability, setAvailability] = useState('all');
  const [ratingMin, setRatingMin] = useState(0);
  const [sort, setSort] = useState('featured');

  // Subcategory checkbox group is driven by `subcategory` query param.
  const [subcategoryFilterSelectedCategories, setSubcategoryFilterSelectedCategories] = useState(
    subcategory ? [subcategory] : [],
  );

  useEffect(() => {
    // Keep checkbox state in sync with URL query param.
    setSubcategoryFilterSelectedCategories(subcategory ? [subcategory] : []);
    setPage(1);
  }, [subcategory]);


  const availableSubcategories = useMemo(() => {
    // Ideally we’d fetch from category document; for now we derive from products already loaded.
    if (!normalizedCategory) return [];
    const set = new Set(
      filteredByCategory
        .map((p) => p.subcategory)
        .filter(Boolean),
    );
    return [...set];
  }, [filteredByCategory, normalizedCategory]);


  const [priceMin, setPriceMin] = useState(bounds.min);
  const [priceMax, setPriceMax] = useState(bounds.max);

  useEffect(() => {
    setPriceMin(bounds.min);
    setPriceMax(bounds.max);
  }, [bounds.min, bounds.max]);

  const [page, setPage] = useState(1);
  const pageSize = 12;

  const normalizedPrice = useMemo(() => {
    const minV = Math.min(priceMin, priceMax);
    const maxV = Math.max(priceMin, priceMax);
    return { min: minV, max: maxV };
  }, [priceMin, priceMax]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return filteredByCategoryAndSubcategory.filter((p) => {
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);

      const matchesCategory =
        lockedSelectedCategories.length === 0 ||
        lockedSelectedCategories.includes(p.category);

      const matchesSubcategory =
        !subcategory || p.subcategory === subcategory;

      const matchesPrice =
        p.price >= normalizedPrice.min && p.price <= normalizedPrice.max;

      const matchesAvailability =
        availability === 'all'
          ? true
          : availability === 'in'
            ? p.inStock
            : !p.inStock;

      const matchesRating = p.rating >= ratingMin;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesSubcategory &&
        matchesPrice &&
        matchesAvailability &&
        matchesRating
      );
    });
  }, [
    filteredByCategoryAndSubcategory,
    search,
    lockedSelectedCategories,
    subcategory,
    normalizedPrice,
    availability,
    ratingMin,
  ]);

  const sorted = useMemo(() => {
    const arr = [...filtered];

    const scoreFeatured = (p) => (p.tags?.featured ? 1 : 0);
    const scoreNewest = (p) => (p.tags?.newest ? 1 : 0);
    const scoreBestSelling = (p) => (p.tags?.bestSelling ? 1 : 0);

    arr.sort((a, b) => {
      switch (sort) {
        case 'newest':
          return scoreNewest(b) - scoreNewest(a) || b.id - a.id;
        case 'priceLow':
          return a.price - b.price;
        case 'priceHigh':
          return b.price - a.price;
        case 'bestSelling':
          return scoreBestSelling(b) - scoreBestSelling(a) || b.rating - a.rating;
        case 'featured':
        default:
          return scoreFeatured(b) - scoreFeatured(a) || b.rating - a.rating;
      }
    });

    return arr;
  }, [filtered, sort]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = clamp(page, 1, totalPages);

  const pageItems = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, safePage]);

  const pageNumbers = useMemo(() => {
    const windowSize = 5;
    const half = Math.floor(windowSize / 2);
    let start = Math.max(1, safePage - half);
    let end = Math.min(totalPages, start + windowSize - 1);
    start = Math.max(1, end - windowSize + 1);

    const nums = [];
    for (let i = start; i <= end; i += 1) nums.push(i);
    return nums;
  }, [safePage, totalPages]);

  const onAddToCart = (product) => {
    if (!product) return;
    dispatch(
      addToCart({
        id: product.id,
        name: product.name,
        image: product.image,
        category: product.category,
        price: product.price,
      }),
    );

    dispatch(
      pushAutoToast({
        type: 'success',
        title: 'Added to cart',
        message: product.name,
        link: '/cart',
      }),
    );
  };

  const onToggleWishlist = (product) => {
    if (!product) return;
    dispatch(toggleWishlist(product));

    dispatch(
      pushAutoToast({
        type: 'success',
        title: 'Wishlist updated',
        message: product.name,
        link: '/wishlist',
      }),
    );
  };

  if (loading) {
    return (
      <>
        <Header />
        <div style={{ padding: 24, textAlign: 'center', fontWeight: 800 }}>
          Loading products…
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div
          style={{
            padding: 24,
            textAlign: 'center',
            fontWeight: 800,
            color: '#b00020',
          }}
        >
          {error}
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <CategoryBar />

      <div className="category-page">
        <section className="category-hero">
          <div className="category-hero-inner">
            <div className="category-hero-tag">IWS Decor</div>
            <h1 className="category-hero-title">
              {normalizedCategory || 'Category'}
            </h1>
            <p className="category-hero-sub">
              {subcategory
                ? `Showing subcategory: ${subcategory}`
                : 'Explore products in this category.'}
            </p>
          </div>
        </section>

        <section className="category-layout">
          <div className="category-layout-grid">
            <ProductFilters
              search={search}
              setSearch={(v) => {
                setSearch(v);
                setPage(1);
              }}
              selectedCategories={subcategoryFilterSelectedCategories}
              setSelectedCategories={() => {
                // Lock subcategory selection to the URL.
                // Prevent user from picking a different subcategory checkbox.
                setSubcategoryFilterSelectedCategories(subcategory ? [subcategory] : []);
              }}
              availableCategories={availableSubcategories}
              priceMin={priceMin}
              priceMax={priceMax}
              setPriceMin={(v) => {
                setPriceMin(v);
                setPage(1);
              }}
              setPriceMax={(v) => {
                setPriceMax(v);
                setPage(1);
              }}
              availability={availability}
              setAvailability={(v) => {
                setAvailability(v);
                setPage(1);
              }}
              ratingMin={ratingMin}
              setRatingMin={(v) => {
                setRatingMin(v);
                setPage(1);
              }}
              minPossiblePrice={bounds.min}
              maxPossiblePrice={bounds.max}
            />

            <main>
              <ProductToolbar
                productCount={sorted.length}
                sort={sort}
                setSort={(v) => {
                  setSort(v);
                  setPage(1);
                }}
              />

              <div className="product-grid">
                {pageItems.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onAddToCart={onAddToCart}
                    onToggleWishlist={onToggleWishlist}
                  />
                ))}
              </div>

              {sorted.length === 0 ? (
                <div style={{ marginTop: 28, textAlign: 'center' }}>
                  <div
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: 44,
                      color: '#1d1815',
                      marginBottom: 10,
                      fontWeight: 800,
                    }}
                  >
                    No matches found
                  </div>
                  <div style={{ color: 'rgba(29,24,21,0.7)', fontWeight: 700 }}>
                    Try adjusting filters or search terms.
                  </div>
                </div>
              ) : null}

              {totalPages > 1 && (
                <div className="pagination" aria-label="Pagination">
                  <button
                    className="page-btn"
                    type="button"
                    disabled={safePage <= 1}
                    onClick={() => {
                      setPage((p) => Math.max(1, p - 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    Previous
                  </button>

                  <div className="page-numbers">
                    {pageNumbers.map((n) => (
                      <button
                        key={n}
                        type="button"
                        className={`page-number ${n === safePage ? 'active' : ''}`}
                        onClick={() => {
                          setPage(n);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                      >
                        {n}
                      </button>
                    ))}
                  </div>

                  <button
                    className="page-btn"
                    type="button"
                    disabled={safePage >= totalPages}
                    onClick={() => {
                      setPage((p) => Math.min(totalPages, p + 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    Next
                  </button>
                </div>
              )}
            </main>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}

