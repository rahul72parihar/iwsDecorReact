import { useEffect, useMemo, useState, useCallback } from 'react';

import {
  listProducts,
  getProductCount,
  createOrUpdateProduct,
  deleteProduct,
} from '../../firebase/productService';
import { uploadProductImages } from '../../firebase/productUploadService';

import { listCategories } from '../../firebase/categoryService';
import { getCategorySubcategories } from '../../firebase/subcategoryService';


import { onAuthStateChanged } from 'firebase/auth';
import auth from '../../firebase/firebaseAuth';

import AdminNav from './AdminNav';

import './Products.css';

// Client-side page size — how many rows to show before "Load more"
const PAGE_SIZE = 10;

function toNumberOrNull(v) {
  const n = typeof v === 'string' && v.trim() !== '' ? Number(v) : v;
  return Number.isFinite(n) ? n : null;
}

function makeEmptyForm() {
  return {
    id: '',
    name: '',
    category: '',
    subcategory: '',
    brand: '',
    price: '',
    oldPrice: '',
    inStock: true,
    tags: {
      featured: false,
      newest: false,
      bestSelling: false,
    },
    description: '',
    mainFile: null,
    additionalFiles: [],
  };
}

export default function AdminProducts() {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // ── All products (source of truth) ──────────────────────────
  const [allItems, setAllItems]         = useState([]);
  const [totalCount, setTotalCount]     = useState(null);
  const [fetching, setFetching]         = useState(false);

  // ── Search ───────────────────────────────────────────────────
  const [searchQuery, setSearchQuery]   = useState('');

  // ── Client-side pagination ───────────────────────────────────
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // ── Form / UI state ─────────────────────────────────────────
  const [form, setForm]                             = useState(makeEmptyForm());
  const [selectedProductId, setSelectedProductId]   = useState(null);
  const [activeTab, setActiveTab]                   = useState('list');
  const [uploading, setUploading]                   = useState(false);
  const [error, setError]                           = useState('');
  const [success, setSuccess]                       = useState('');

  // ── Auth ─────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const canEdit = !!user;

  // ── Category / Subcategory dropdown data ─────────────────────
  const [allCategories, setAllCategories] = useState([]);
  const [subcategoriesForSelectedCategory, setSubcategoriesForSelectedCategory] = useState([]);
  const [loadingTaxonomy, setLoadingTaxonomy] = useState(false);



  // ── Fetch all products once ──────────────────────────────────

  const refresh = useCallback(async () => {
    setFetching(true);
    setError('');
    setSuccess('');
    try {
      const [list, count] = await Promise.all([
        listProducts(),
        getProductCount(),
      ]);
      setAllItems(list);
      setTotalCount(count);
      setVisibleCount(PAGE_SIZE); // reset pagination on every refresh
    } catch (e) {
      setError(e?.message || 'Failed to load products');
    } finally {
      setFetching(false);
    }
  }, []);

  const refreshTaxonomy = useCallback(async () => {
    setLoadingTaxonomy(true);
    try {
      const cats = await listCategories();
      setAllCategories(Array.isArray(cats) ? cats : []);
    } catch (e) {
      setError(e?.message || 'Failed to load categories');
    } finally {
      setLoadingTaxonomy(false);
    }
  }, []);

  useEffect(() => {
    // Load taxonomy for dropdowns on mount.
    refreshTaxonomy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTaxonomy]);


  const refreshSubcategoriesForCategory = useCallback(async (categoryId) => {
    const nextCategoryId = (categoryId || '').trim();
    if (!nextCategoryId) {
      setSubcategoriesForSelectedCategory([]);
      return;
    }

    setLoadingTaxonomy(true);
    try {
      const subs = await getCategorySubcategories(nextCategoryId);
      setSubcategoriesForSelectedCategory(Array.isArray(subs) ? subs : []);
    } catch (e) {
      setError(e?.message || 'Failed to load subcategories');
      setSubcategoriesForSelectedCategory([]);
    } finally {
      setLoadingTaxonomy(false);
    }
  }, []);


  useEffect(() => {
    if (!canEdit) return;
    refresh();
  }, [canEdit, refresh]);

  // ── Search filter (derived) ──────────────────────────────────
  // Runs entirely in JS — no extra Firestore reads.
  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return allItems;
    return allItems.filter(
      (p) =>
        p.name?.toLowerCase().includes(q)        ||
        p.category?.toLowerCase().includes(q)    ||
        p.subcategory?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q)       ||
        p.id?.toLowerCase().includes(q),
    );
  }, [allItems, searchQuery]);

  // Reset visible count whenever the search changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchQuery]);

  // ── Client-side pagination (derived) ────────────────────────
  const visibleItems = useMemo(
    () => filteredItems.slice(0, visibleCount),
    [filteredItems, visibleCount],
  );
  const hasMore = visibleCount < filteredItems.length;

  const loadMore = () =>
    setVisibleCount((prev) => prev + PAGE_SIZE);

  // ── Selected product ─────────────────────────────────────────
  const selected = useMemo(
    () => (selectedProductId ? allItems.find((p) => p.id === selectedProductId) ?? null : null),
    [allItems, selectedProductId],
  );

  // ── Form helpers ─────────────────────────────────────────────
  const setField = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const setTag = (key, value) =>
    setForm((prev) => ({ ...prev, tags: { ...prev.tags, [key]: value } }));

  const handlePickMain = (file) =>
    setForm((prev) => ({ ...prev, mainFile: file || null }));

  const handlePickAdditional = (files) =>
    setForm((prev) => ({ ...prev, additionalFiles: Array.from(files || []) }));

  const resetForm = () => {
    setForm(makeEmptyForm());
    setSelectedProductId(null);
    setError('');
    setSuccess('');
  };

  const onEdit = (p) => {
    const nextCategory = p?.category ?? '';

    setSelectedProductId(p?.id ?? '');
    setForm({
      ...makeEmptyForm(),
      id:           p?.id          ?? '',
      name:         p?.name        ?? '',
      category:     nextCategory,
      subcategory:  p?.subcategory ?? '',
      brand:        p?.brand       ?? '',
      price:        p?.price       ?? '',
      oldPrice:     p?.oldPrice    ?? '',
      inStock:      !!p?.inStock,
      tags: {
        featured:    !!p?.tags?.featured,
        newest:      !!p?.tags?.newest,
        bestSelling: !!p?.tags?.bestSelling,
      },
      description:     p?.description ?? '',
      mainFile:        null,
      additionalFiles: [],
    });

    // Ensure the subcategory dropdown matches the selected category.
    refreshSubcategoriesForCategory(nextCategory);

    setActiveTab('form');
    setError('');
    setSuccess('');
  };

  // ── Submit ───────────────────────────────────────────────────
  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const productId = (form.id || '').trim();

    if (!productId) {
      setError('Product ID is required.');
      return;
    }

    const data = {
      id:          productId,
      name:        form.name.trim(),
      category:    form.category.trim(),
      subcategory: form.subcategory.trim(),
      brand:       form.brand.trim() || 'IWS Signature',

      price:       toNumberOrNull(form.price),
      oldPrice:    toNumberOrNull(form.oldPrice),
      inStock:     !!form.inStock,
      tags: {
        featured:    !!form.tags?.featured,
        newest:      !!form.tags?.newest,
        bestSelling: !!form.tags?.bestSelling,
      },
      description: form.description.trim(),
    };

    try {
      setUploading(true);
      let imagePatch = {};

      if (form.mainFile) {
        const uploaded = await uploadProductImages({
          productId,
          mainFile:               form.mainFile,
          additionalFiles:        form.additionalFiles,
          existingMainUrl:        selected?.image,
          existingAdditionalUrls: selected?.additionalImageUrls || [],
          deleteOldImages:        false,
        });
        imagePatch = uploaded;
      } else if (selected?.image) {
        imagePatch = { image: selected.image };
      }

      await createOrUpdateProduct(productId, { ...data, ...imagePatch });

      setSuccess('Product saved successfully.');
      resetForm();
      await refresh();
      setActiveTab('list');
    } catch (e) {
      setError(e?.message || 'Failed to save product');
    } finally {
      setUploading(false);
    }
  };

  // ── Delete ───────────────────────────────────────────────────
  const onDelete = async (productId) => {
    if (!productId) return;
    setError('');
    setSuccess('');
    try {
      await deleteProduct(productId);
      setSuccess('Product deleted.');
      if (selectedProductId === productId) resetForm();
      await refresh();
    } catch (e) {
      setError(e?.message || 'Failed to delete product');
    }
  };

  // ── Render ───────────────────────────────────────────────────
  return (
    <div className="adminShell">
      <AdminNav />

      <div className="adminMain">
        <header className="adminDashHead">
          <div>
            <h1>Products</h1>
            <p>
              Create, edit, and manage your product catalogue.
              {totalCount !== null && (
                <span className="adminProductsTotalBadge">{totalCount} total</span>
              )}
            </p>
          </div>

          <div className="adminProductsHeadActions">
            <button
              type="button"
              className="adminSettingsBtnSecondary"
              onClick={refresh}
              disabled={fetching}
            >
              {fetching ? 'Refreshing…' : 'Refresh'}
            </button>

            <button
              type="button"
              className="adminSettingsBtn"
              onClick={() => {
                resetForm();
                setActiveTab('form');
              }}
            >
              New Product
            </button>
          </div>
        </header>

        {loading ? (
          <div className="adminSettingsLoading">Loading…</div>
        ) : !canEdit ? (
          <div className="adminSettingsError">Please log in to manage products.</div>
        ) : (
          <div className="adminSettingsCard">

            {/* ── Tabs ── */}
            <div className="adminSettingsTabs">
              <button
                type="button"
                className={activeTab === 'list' ? 'adminSettingsTab active' : 'adminSettingsTab'}
                onClick={() => { setError(''); setSuccess(''); setActiveTab('list'); }}
              >
                All Products
              </button>

              <button
                type="button"
                className={activeTab === 'form' ? 'adminSettingsTab active' : 'adminSettingsTab'}
                onClick={() => { setError(''); setSuccess(''); setActiveTab('form'); }}
              >
                {selectedProductId ? 'Edit Product' : 'New Product'}
              </button>
            </div>

            {/* ── Shared feedback ── */}
            {error   && <div className="adminSettingsError"   style={{ marginBottom: 16 }}>{error}</div>}
            {success && <div className="adminSettingsSuccess" style={{ marginBottom: 16 }}>{success}</div>}

            {/* ══════════════════════════════════════
                LIST TAB
            ══════════════════════════════════════ */}
            {activeTab === 'list' && (
              <>
                {/* ── Search bar ── */}
                <div className="adminProductsSearchWrap">
                  <div className="adminProductsSearchBox">
                    <svg className="adminProductsSearchIcon" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="9" cy="9" r="5.5" stroke="#aaa" strokeWidth="1.6"/>
                      <path d="M13.5 13.5L17 17" stroke="#aaa" strokeWidth="1.6" strokeLinecap="round"/>
                    </svg>
                    <input
                      type="search"
                      className="adminProductsSearchInput"
                      placeholder="Search by name, category, brand, or ID…"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        className="adminProductsSearchClear"
                        onClick={() => setSearchQuery('')}
                        aria-label="Clear search"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {searchQuery && (
                    <span className="adminProductsSearchMeta">
                      {filteredItems.length === 0
                        ? 'No results'
                        : `${filteredItems.length} result${filteredItems.length !== 1 ? 's' : ''}`}
                    </span>
                  )}
                </div>

                {/* ── Table ── */}
                {fetching && allItems.length === 0 ? (
                  <div className="adminProductsEmpty">Loading products…</div>
                ) : filteredItems.length === 0 ? (
                  <div className="adminProductsEmpty">
                    {searchQuery
                      ? <>No products match <strong>"{searchQuery}"</strong>. Try a different search.</>
                      : <>No products yet. Click <strong>New Product</strong> to add one.</>
                    }
                  </div>
                ) : (
                  <>
                    <div className="adminProductsTable">
                      <table aria-label="Products table">
                        <thead>
                          <tr>
                            <th>Preview</th>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>In Stock</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {visibleItems.map((p) => (
                            <tr
                              key={p?.id || p?.name}
                              className={selectedProductId === p?.id ? 'adminProductsRowSelected' : ''}
                            >
                              <td>
                                {p?.image ? (
                                  <img
                                    className="adminProductsThumb"
                                    src={p.image}
                                    alt={p.name || 'product'}
                                  />
                                ) : (
                                  <div className="adminProductsThumb adminProductsThumbEmpty" />
                                )}
                              </td>
                              <td>
                                <div className="adminProductsRowName">{p?.name}</div>
                                <div className="adminProductsRowId">id: {p?.id}</div>
                              </td>
                              <td>{p?.category}</td>
                              <td>₹{Number(p?.price || 0).toLocaleString('en-IN')}</td>
                              <td>
                                <span className={p?.inStock ? 'adminProductsBadgeIn' : 'adminProductsBadgeOut'}>
                                  {p?.inStock ? 'In Stock' : 'Out of Stock'}
                                </span>
                              </td>
                              <td>
                                <div className="adminProductsRowActions">
                                  <button
                                    type="button"
                                    className="adminProductsLinkBtn"
                                    onClick={() => onEdit(p)}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    className="adminProductsLinkBtn danger"
                                    onClick={() => onDelete(p?.id)}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* ── Pagination footer ── */}
                    <div className="adminProductsPagination">
                      <span className="adminProductsPaginationInfo">
                        Showing {visibleItems.length} of {filteredItems.length}
                        {searchQuery && totalCount !== null && filteredItems.length !== totalCount
                          ? ` (filtered from ${totalCount})`
                          : totalCount !== null
                            ? ` products`
                            : ''}
                      </span>

                      {hasMore && (
                        <button
                          type="button"
                          className="adminSettingsBtnSecondary"
                          onClick={loadMore}
                        >
                          Load more
                        </button>
                      )}
                    </div>
                  </>
                )}
              </>
            )}

            {/* ══════════════════════════════════════
                FORM TAB
            ══════════════════════════════════════ */}
            {activeTab === 'form' && (
              <form className="adminSettingsForm" onSubmit={onSubmit}>

                <label>
                  <span>Product ID</span>
                  <input
                    type="text"
                    value={form.id}
                    onChange={(e) => setField('id', e.target.value)}
                    placeholder="e.g. chandelier-01"
                    required
                  />
                  <span className="adminProductsHint">
                    Used by the storefront to identify this product. Cannot be changed after creation.
                  </span>
                </label>

                <label>
                  <span>Name</span>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setField('name', e.target.value)}
                    placeholder="e.g. Solstice Crystal Chandelier"
                    required
                  />
                </label>

                <div className="adminProductsRow">
                  <label>
                    <span>Category</span>
                    <select
                      value={form.category || ''}
                      onChange={(e) => {
                        const nextCategory = e.target.value;
                        setField('category', nextCategory);
                        // When category changes, reset subcategory to force valid selection.
                        setField('subcategory', '');
                        refreshSubcategoriesForCategory(nextCategory);
                      }}
                      disabled={loadingTaxonomy || !canEdit}
                    >
                      <option value="">Select a category…</option>
                      {allCategories.map((c) => (
                        <option key={c?.id} value={c?.id}>
                          {c?.name ? `${c.name} (${c.id})` : c?.id}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span>Subcategory</span>
                    <select
                      value={form.subcategory || ''}
                      onChange={(e) => setField('subcategory', e.target.value)}
                      disabled={loadingTaxonomy || !form.category}
                    >
                      <option value="">Select a subcategory…</option>
                      {subcategoriesForSelectedCategory.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>


                <label>
                  <span>Brand</span>
                  <input
                    type="text"
                    value={form.brand}
                    onChange={(e) => setField('brand', e.target.value)}
                    placeholder="IWS Signature"
                  />
                </label>

                <div className="adminProductsRow">
                  <label>
                    <span>Price (₹)</span>
                    <input
                      type="text"
                      value={form.price}
                      onChange={(e) => setField('price', e.target.value)}
                      placeholder="189999"
                    />
                  </label>
                  <label>
                    <span>Old Price (₹)</span>
                    <input
                      type="text"
                      value={form.oldPrice}
                      onChange={(e) => setField('oldPrice', e.target.value)}
                      placeholder="239999"
                    />
                  </label>
                </div>

                <label>
                  <span>In Stock</span>
                  <select
                    value={form.inStock ? 'yes' : 'no'}
                    onChange={(e) => setField('inStock', e.target.value === 'yes')}
                  >
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </label>

                <div className="adminProductsTagsField">
                  <span className="adminProductsTagsLabel">Tags</span>
                  <div className="adminProductsTags">
                    {[
                      { key: 'featured',    label: 'Featured'     },
                      { key: 'newest',      label: 'Newest'       },
                      { key: 'bestSelling', label: 'Best Selling' },
                    ].map(({ key, label }) => (
                      <label key={key} className="adminProductsTagChip">
                        <input
                          type="checkbox"
                          checked={!!form.tags[key]}
                          onChange={(e) => setTag(key, e.target.checked)}
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>

                <label>
                  <span>Description</span>
                  <textarea
                    value={form.description}
                    onChange={(e) => setField('description', e.target.value)}
                    placeholder="Product description"
                    rows={4}
                  />
                </label>

                <label>
                  <span>Main Image</span>
                  <div className="adminProductsFilePick">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePickMain(e.target.files?.[0])}
                    />
                    <span className="adminProductsHint">
                      {form.mainFile ? form.mainFile.name : 'Required for new products'}
                    </span>
                  </div>
                </label>

                <label>
                  <span>Additional Images</span>
                  <div className="adminProductsFilePick">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handlePickAdditional(e.target.files)}
                    />
                    <span className="adminProductsHint">
                      {form.additionalFiles?.length
                        ? `${form.additionalFiles.length} file${form.additionalFiles.length > 1 ? 's' : ''} selected`
                        : 'Optional'}
                    </span>
                  </div>
                </label>

                <div className="adminSettingsActions">
                  <button
                    type="submit"
                    className="adminSettingsBtn"
                    disabled={uploading || fetching}
                  >
                    {uploading
                      ? 'Uploading…'
                      : selectedProductId
                        ? 'Save Changes'
                        : 'Create Product'}
                  </button>

                  <button
                    type="button"
                    className="adminSettingsBtnSecondary"
                    onClick={() => { resetForm(); setActiveTab('list'); }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}