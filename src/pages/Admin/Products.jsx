import { useEffect, useMemo, useState } from 'react';

import { listProducts, createOrUpdateProduct, deleteProduct } from '../../firebase/productService';
import { uploadProductImages } from '../../firebase/productUploadService';

import { onAuthStateChanged } from 'firebase/auth';
import auth from '../../firebase/firebaseAuth';

import './Products.css';

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
    discountPercent: '',
    rating: '',
    reviewsCount: '',
    inStock: true,
    tags: {
      featured: false,
      newest: false,
      bestSelling: false,
    },
    description: '',

    // upload inputs
    mainFile: null,
    additionalFiles: [],
  };
}

export default function AdminProducts() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [items, setItems] = useState([]);
  const [fetching, setFetching] = useState(false);

  const [form, setForm] = useState(makeEmptyForm());
  const [selectedProductId, setSelectedProductId] = useState(null);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const canEdit = !!user;

  const refresh = async () => {
    setFetching(true);
    setError('');
    setSuccess('');
    try {
      const list = await listProducts();
      setItems(list);
    } catch (e) {
      setError(e?.message || 'Failed to load products');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (!canEdit) return;
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canEdit]);

  const selected = useMemo(() => {
    if (!selectedProductId) return null;
    return items.find((p) => p.id === selectedProductId) || null;
  }, [items, selectedProductId]);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const setTag = (key, value) => {
    setForm((prev) => ({ ...prev, tags: { ...prev.tags, [key]: value } }));
  };

  const handlePickMain = (file) => {
    setForm((prev) => ({ ...prev, mainFile: file || null }));
  };

  const handlePickAdditional = (files) => {
    const arr = Array.from(files || []);
    setForm((prev) => ({ ...prev, additionalFiles: arr }));
  };

  const resetForm = () => {
    setForm(makeEmptyForm());
    setSelectedProductId(null);
  };

  const onEdit = (p) => {
    // Firestore doc data includes { id: storedId, ... }
    // In our create/update we ensure `id` is present.
    setSelectedProductId(p?.id ?? p?.id);
    setForm({
      ...makeEmptyForm(),
      id: p?.id ?? '',
      name: p?.name ?? '',
      category: p?.category ?? '',
      subcategory: p?.subcategory ?? '',
      brand: p?.brand ?? '',
      price: p?.price ?? '',
      oldPrice: p?.oldPrice ?? '',
      discountPercent: p?.discountPercent ?? '',
      rating: p?.rating ?? '',
      reviewsCount: p?.reviewsCount ?? '',
      inStock: !!p?.inStock,
      tags: {
        featured: !!p?.tags?.featured,
        newest: !!p?.tags?.newest,
        bestSelling: !!p?.tags?.bestSelling,
      },
      description: p?.description ?? '',
      mainFile: null,
      additionalFiles: [],
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const productId = (form.id || '').trim();
    if (!productId) {
      setError('Product id is required (will also be used by the storefront UI).');
      return;
    }

    const data = {
      id: productId,
      name: form.name.trim(),
      category: form.category.trim(),
      subcategory: form.subcategory.trim(),
      brand: form.brand.trim() || 'IWS Signature',
      price: toNumberOrNull(form.price),
      oldPrice: toNumberOrNull(form.oldPrice),
      discountPercent: toNumberOrNull(form.discountPercent),
      rating: toNumberOrNull(form.rating),
      reviewsCount: toNumberOrNull(form.reviewsCount) ?? 0,
      inStock: !!form.inStock,
      tags: {
        featured: !!form.tags?.featured,
        newest: !!form.tags?.newest,
        bestSelling: !!form.tags?.bestSelling,
      },
      description: form.description.trim(),

      // For storefront UI (ProductCard/ProductGallery)
      // `image` will be set when we upload main image.
    };

    try {
      // If mainFile selected, upload & set `image`.
      // If editing and no new mainFile, keep existing image URLs.
      let imagePatch = {};

      if (form.mainFile) {
        const existing = selected;
        const uploaded = await uploadProductImages({
          productId,
          mainFile: form.mainFile,
          additionalFiles: form.additionalFiles,
          existingMainUrl: existing?.image,
          existingAdditionalUrls: existing?.additionalImageUrls || [],
          deleteOldImages: false,
        });

        imagePatch = uploaded;
      } else {
        // Ensure storefront still has an image; you can enforce requirement if desired.
        const existing = selected;
        if (existing?.image) {
          imagePatch = { image: existing.image };
        }
      }

      const merged = { ...data, ...imagePatch };

      await createOrUpdateProduct(productId, merged);

      setSuccess('Saved successfully');
      resetForm();
      await refresh();
    } catch (e) {
      setError(e?.message || 'Failed to save product');
    }
  };

  const onDelete = async () => {
    if (!selectedProductId) return;
    setError('');
    setSuccess('');
    try {
      await deleteProduct(selectedProductId);
      setSuccess('Deleted');
      resetForm();
      await refresh();
    } catch (e) {
      setError(e?.message || 'Failed to delete product');
    }
  };

  if (loading) {
    return <div className="admin-empty">Loading…</div>;
  }

  if (!canEdit) {
    return (
      <div className="admin-empty">
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <h1 style={{ margin: 0, fontSize: 26 }}>Admin Products</h1>
          <p style={{ color: '#666', fontWeight: 700, marginTop: 10 }}>
            Please login to manage products.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-products-page">
      <div className="admin-products-head">
        <div>
          <h1>Admin Products</h1>
          <div className="admin-products-sub">
            Create / edit products and upload images (main + additional).
          </div>
        </div>

        <div className="admin-products-actionsRow">
          <button className="admin-btn" type="button" onClick={refresh} disabled={fetching}>
            {fetching ? 'Refreshing…' : 'Refresh list'}
          </button>
          <button className="admin-btn primary" type="button" onClick={resetForm}>
            New Product
          </button>
        </div>
      </div>

      <div className="admin-products-grid">
        <div className="admin-products-tableCard">
          {error ? <div className="admin-error">{error}</div> : null}
          {success ? <div className="admin-success">{success}</div> : null}

          <table className="admin-table" aria-label="Products table">
            <thead>
              <tr>
                <th className="admin-th">Preview</th>
                <th className="admin-th">Name</th>
                <th className="admin-th">Category</th>
                <th className="admin-th">Price</th>
                <th className="admin-th">In stock</th>
                <th className="admin-th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="admin-empty">No products yet.</div>
                  </td>
                </tr>
              ) : (
                items.map((p) => (
                  <tr key={p?.id || p?.name}>
                    <td>
                      {p?.image ? (
                        <img className="admin-thumb" src={p.image} alt={p.name || 'product'} />
                      ) : (
                        <div className="admin-thumb" />
                      )}
                    </td>
                    <td>
                      <div className="admin-rowTitle">{p?.name}</div>
                      <div style={{ color: '#777', fontWeight: 700, fontSize: 12 }}>
                        id: {p?.id}
                      </div>
                    </td>
                    <td>{p?.category}</td>
                    <td>₹{Number(p?.price || 0).toLocaleString('en-IN')}</td>
                    <td>{p?.inStock ? 'Yes' : 'No'}</td>
                    <td>
                      <div className="admin-miniBtns">
                        <button
                          type="button"
                          className="admin-linkBtn"
                          onClick={() => onEdit(p)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="admin-linkBtn"
                          onClick={() => {
                            setSelectedProductId(p?.id);
                          }}
                        >
                          Select
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {selectedProductId ? (
            <div style={{ marginTop: 14 }}>
              <button className="admin-btn danger" type="button" onClick={onDelete}>
                Delete selected
              </button>
            </div>
          ) : null}
        </div>

        <div className="admin-products-formCard">
          <form className="admin-form" onSubmit={onSubmit}>
            <div className="admin-field">
              <div className="admin-label">Product ID (used by storefront)</div>
              <input
                className="admin-input"
                value={form.id}
                onChange={(e) => setField('id', e.target.value)}
                placeholder="e.g. 1, 12, 21"
                required
              />
              <div className="admin-inlineHint">
                Your storefront loads products from `src/data/products.js` right now, so changing IDs here won’t affect it until you wire Firestore products into the storefront.
              </div>
            </div>

            <div className="admin-field">
              <div className="admin-label">Name</div>
              <input
                className="admin-input"
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
                placeholder="e.g. Solstice Crystal Chandelier"
                required
              />
            </div>

            <div className="admin-row">
              <div className="admin-field">
                <div className="admin-label">Category</div>
                <input
                  className="admin-input"
                  value={form.category}
                  onChange={(e) => setField('category', e.target.value)}
                  placeholder="Chandeliers"
                />
              </div>
              <div className="admin-field">
                <div className="admin-label">Subcategory</div>
                <input
                  className="admin-input"
                  value={form.subcategory}
                  onChange={(e) => setField('subcategory', e.target.value)}
                  placeholder="Crystal Chandeliers"
                />
              </div>
            </div>

            <div className="admin-field">
              <div className="admin-label">Brand</div>
              <input
                className="admin-input"
                value={form.brand}
                onChange={(e) => setField('brand', e.target.value)}
                placeholder="IWS Signature"
              />
            </div>

            <div className="admin-row">
              <div className="admin-field">
                <div className="admin-label">Price</div>
                <input
                  className="admin-input"
                  value={form.price}
                  onChange={(e) => setField('price', e.target.value)}
                  placeholder="189999"
                />
              </div>
              <div className="admin-field">
                <div className="admin-label">Old Price</div>
                <input
                  className="admin-input"
                  value={form.oldPrice}
                  onChange={(e) => setField('oldPrice', e.target.value)}
                  placeholder="239999"
                />
              </div>
            </div>

            <div className="admin-row">
              <div className="admin-field">
                <div className="admin-label">Discount %</div>
                <input
                  className="admin-input"
                  value={form.discountPercent}
                  onChange={(e) => setField('discountPercent', e.target.value)}
                  placeholder="21"
                />
              </div>
              <div className="admin-field">
                <div className="admin-label">In Stock</div>
                <select
                  className="admin-select"
                  value={form.inStock ? 'yes' : 'no'}
                  onChange={(e) => setField('inStock', e.target.value === 'yes')}
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
            </div>

            <div className="admin-row">
              <div className="admin-field">
                <div className="admin-label">Rating</div>
                <input
                  className="admin-input"
                  value={form.rating}
                  onChange={(e) => setField('rating', e.target.value)}
                  placeholder="4.8"
                />
              </div>
              <div className="admin-field">
                <div className="admin-label">Reviews Count</div>
                <input
                  className="admin-input"
                  value={form.reviewsCount}
                  onChange={(e) => setField('reviewsCount', e.target.value)}
                  placeholder="124"
                />
              </div>
            </div>

            <div className="admin-field">
              <div className="admin-label">Tags</div>
              <div className="admin-products-actionsRow">
                <label className="admin-linkBtn" style={{ cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={!!form.tags.featured}
                    onChange={(e) => setTag('featured', e.target.checked)}
                  />{' '}
                  Featured
                </label>
                <label className="admin-linkBtn" style={{ cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={!!form.tags.newest}
                    onChange={(e) => setTag('newest', e.target.checked)}
                  />{' '}
                  Newest
                </label>
                <label className="admin-linkBtn" style={{ cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={!!form.tags.bestSelling}
                    onChange={(e) => setTag('bestSelling', e.target.checked)}
                  />{' '}
                  Best Selling
                </label>
              </div>
            </div>

            <div className="admin-field">
              <div className="admin-label">Description</div>
              <textarea
                className="admin-textarea"
                value={form.description}
                onChange={(e) => setField('description', e.target.value)}
                placeholder="Product description"
              />
            </div>

            <div className="admin-field">
              <div className="admin-label">Main Image</div>
              <div className="admin-filePick">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handlePickMain(e.target.files?.[0])}
                />
                <div style={{ fontSize: 12, color: '#666', fontWeight: 700 }}>
                  {form.mainFile ? form.mainFile.name : 'Optional (required for new product)'}
                </div>
              </div>
            </div>

            <div className="admin-field">
              <div className="admin-label">Additional Images</div>
              <div className="admin-filePick">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handlePickAdditional(e.target.files)}
                />
                <div style={{ fontSize: 12, color: '#666', fontWeight: 700 }}>
                  {form.additionalFiles?.length ? `${form.additionalFiles.length} selected` : 'Optional'}
                </div>
              </div>
            </div>

            <div className="admin-formBtns">
              <button className="admin-btn primary" type="submit">
                {selectedProductId ? 'Save changes' : 'Create product'}
              </button>
              <button
                className="admin-btn"
                type="button"
                onClick={() => {
                  resetForm();
                  setError('');
                  setSuccess('');
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

