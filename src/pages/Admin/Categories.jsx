import { useCallback, useEffect, useMemo, useState } from 'react';

import AdminNav from './AdminNav';

import './Categories.css';

import auth from '../../firebase/firebaseAuth';
import { onAuthStateChanged } from 'firebase/auth';

import {
  listCategories,
  getCategoryCount,
  createOrUpdateCategory,
  deleteCategory,
} from '../../firebase/categoryService';



import { uploadImage } from '../../firebase/cloudinaryUploadService';

import AdminSubcategories from './AdminSubcategories.jsx';





const PAGE_SIZE = 10;

function makeEmptyForm() {
  return {
    id: '',
    name: '',
    slug: '',
    description: '',
    imageUrl: '',

    mainFile: null,
    createdAt: new Date().toISOString(),
  };
}


function toSlug(str) {
  return (str || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

export default function AdminCategories() {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const canEdit = !!user;

  const [allItems, setAllItems] = useState([]);
  const [totalCount, setTotalCount] = useState(null);
  const [fetching, setFetching] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const [activeTab, setActiveTab] = useState('list');
  const [form, setForm] = useState(makeEmptyForm());
  const [selectedId, setSelectedId] = useState(null);

  // Subcategories are managed only in the dedicated “Manage Subcategories” tab.
  // Intentionally no parse/format helpers for the category form.



  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [subTabCategoryId, setSubTabCategoryId] = useState(null);



  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoadingAuth(false);
    });
    return () => unsub();
  }, []);

  const refresh = useCallback(async () => {
    setFetching(true);
    setError('');
    setSuccess('');
    try {
      const [list, count] = await Promise.all([listCategories(), getCategoryCount()]);
      setAllItems(list);
      setTotalCount(count);
      setVisibleCount(PAGE_SIZE);
    } catch (e) {
      setError(e?.message || 'Failed to load categories');
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    if (!canEdit) return;
    refresh();
  }, [canEdit, refresh]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchQuery]);

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return allItems;
    return allItems.filter((c) => {
      const name = c?.name || '';
      const slug = c?.slug || '';
      const desc = c?.description || '';
      const id = c?.id || '';
      return (
        name.toLowerCase().includes(q) ||
        slug.toLowerCase().includes(q) ||
        desc.toLowerCase().includes(q) ||
        id.toLowerCase().includes(q)
      );
    });
  }, [allItems, searchQuery]);

  const visibleItems = useMemo(
    () => filteredItems.slice(0, visibleCount),
    [filteredItems, visibleCount],
  );

  const hasMore = visibleCount < filteredItems.length;

  const resetForm = () => {
    setForm(makeEmptyForm());
    setSelectedId(null);
    setError('');
    setSuccess('');
  };

  const selected = useMemo(() => {
    if (!selectedId) return null;
    return allItems.find((c) => c.id === selectedId) || null;
  }, [allItems, selectedId]);


  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // Note: subcategories are intentionally NOT editable from this form.


  const onEdit = (c) => {
    setSelectedId(c?.id ?? '');

    setForm({
      id: c?.id ?? '',
      name: c?.name ?? '',
      slug: c?.slug ?? '',
      description: c?.description ?? '',
      imageUrl: c?.imageUrl ?? '',
      mainFile: null,
      createdAt: c?.createdAt ?? new Date().toISOString(),
    });

    setActiveTab('form');
    setError('');
    setSuccess('');
  };


  const onDelete = async (categoryId) => {
    if (!categoryId) return;
    setError('');
    setSuccess('');
    try {
      await deleteCategory(categoryId);
      setSuccess('Category deleted.');
      if (selectedId === categoryId) resetForm();
      await refresh();
      setActiveTab('list');
    } catch (e) {
      setError(e?.message || 'Failed to delete category');
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const id = (form.id || '').trim();
    const name = (form.name || '').trim();
    if (!id) {
      setError('Category ID is required.');
      return;
    }
    if (!name) {
      setError('Category name is required.');
      return;
    }

    const slug = (form.slug || '').trim() || toSlug(name);

    try {
      setUploading(true);

      let imageUrl = form.imageUrl || '';

      if (form.mainFile) {
        // Upload to Cloudinary; storefront currently doesn't use it, but admin can manage.
        imageUrl = await uploadImage(form.mainFile);
      }

      // Do not allow subcategory edits from the category create/edit form.
      // Subcategories are managed only in the “Manage Subcategories” tab.
      const payload = {
        id,
        name,
        slug,
        description: (form.description || '').trim(),
        imageUrl,
        createdAt: form.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await createOrUpdateCategory(id, payload);


      setSuccess(selectedId ? 'Category updated successfully.' : 'Category created successfully.');
      await refresh();
      resetForm();
      setActiveTab('list');
    } catch (e2) {
      setError(e2?.message || 'Failed to save category');
    } finally {
      setUploading(false);
    }
  };

  if (loadingAuth) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: 18,
        color: '#666',
      }}>
        Loading…
      </div>
    );
  }

  return (
    <div className="adminShell">
      <AdminNav />

      <div className="adminMain">
        <header className="adminDashHead">
          <div>
            <h1>Categories</h1>
            <p>
              Manage storefront taxonomy (currently categories/subcategories are derived from product fields).
              This page stores category docs in Firestore collection <code>categories</code>.
              {totalCount !== null && (
                <span className="adminProductsTotalBadge">{totalCount} total</span>
              )}
            </p>
          </div>

          <div className="adminCategoriesHeaderActions">
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
              New Category
            </button>
          </div>
        </header>

        {!canEdit ? (
          <div className="adminSettingsError">Please log in to manage categories.</div>
        ) : (
          <div className="adminSettingsCard">
            {/* Tabs */}
            <div className="adminSettingsTabs">
              <button
                type="button"
                className={activeTab === 'list' ? 'adminSettingsTab active' : 'adminSettingsTab'}
                onClick={() => {
                  setError('');
                  setSuccess('');
                  setActiveTab('list');
                }}
              >
                All Categories
              </button>

              <button
                type="button"
                className={activeTab === 'form' ? 'adminSettingsTab active' : 'adminSettingsTab'}
                onClick={() => {
                  setError('');
                  setSuccess('');
                  setActiveTab('form');
                }}
              >
                {selectedId ? 'Edit Category' : 'New Category'}
              </button>

              <button
                type="button"
                className={activeTab === 'subcategories' ? 'adminSettingsTab active' : 'adminSettingsTab'}
                onClick={() => {
                  setError('');
                  setSuccess('');
                  setActiveTab('subcategories');
                  setSubTabCategoryId(null);
                }}
              >
                Manage Subcategories
              </button>
            </div>


            {error && <div className="adminSettingsError" style={{ marginBottom: 16 }}>{error}</div>}
            {success && <div className="adminSettingsSuccess" style={{ marginBottom: 16 }}>{success}</div>}

            {/* SUBCATEGORIES */}
            {activeTab === 'subcategories' && (
              <div style={{ paddingTop: 6 }}>
                <AdminSubcategories
                  categories={allItems}
                  selectedCategoryId={subTabCategoryId}
                  onSelectCategoryId={(id) => {
                    setSubTabCategoryId(id);
                    setError('');
                    setSuccess('');
                  }}
                  onSaved={() => {
                    setError('');
                    setSuccess('Subcategories updated successfully.');
                    refresh();
                  }}
                />
              </div>
            )}

            {/* LIST */}
            {activeTab === 'list' && (
              <div>






                <div className="adminCategoriesSearchWrap">
                  <div className="adminProductsSearchBox" style={{ marginBottom: 0 }}>
                    <svg className="adminProductsSearchIcon" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="9" cy="9" r="5.5" stroke="#aaa" strokeWidth="1.6" />
                      <path d="M13.5 13.5L17 17" stroke="#aaa" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                    <input
                      type="search"
                      className="adminProductsSearchInput"
                      placeholder="Search categories by name, slug, or ID…"
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

                {fetching && allItems.length === 0 ? (
                  <div className="adminCategoriesEmpty">Loading categories…</div>
                ) : filteredItems.length === 0 ? (
                  <div className="adminCategoriesEmpty">
                    {searchQuery
                      ? <>No categories match <strong>"{searchQuery}"</strong>.</>
                      : <>No categories yet. Click <strong>New Category</strong> to add one.</>}
                  </div>
                ) : (
                  <>
                    <div className="adminCategoriesTable">
                      <table aria-label="Categories table">
                        <thead>
                          <tr>
                            <th>Preview</th>
                            <th>Name</th>
                            <th>Slug</th>
                            <th>Description</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {visibleItems.map((c) => (
                            <tr
                              key={c?.id || c?.name}
                              className={selectedId === c?.id ? 'adminCategoriesRowSelected' : ''}
                            >
                              <td>
                                {c?.imageUrl ? (
                                  <img
                                    className="adminCategoriesThumb"
                                    src={c.imageUrl}
                                    alt={c.name || 'category'}
                                  />
                                ) : (
                                  <div className="adminCategoriesThumb adminCategoriesThumbEmpty" />
                                )}
                              </td>
                              <td>
                                <div className="adminCategoriesRowName">{c?.name}</div>
                                <div className="adminCategoriesRowId">id: {c?.id}</div>
                              </td>
                              <td>{c?.slug}</td>
                              <td style={{ maxWidth: 320 }}>
                                <div style={{ color: '#555', fontSize: 13, fontWeight: 600 }}>
                                  {(c?.description || '').slice(0, 80)}{(c?.description || '').length > 80 ? '…' : ''}
                                </div>
                              </td>
                              <td>
                                <div className="adminCategoriesRowActions">
                                  <button
                                    type="button"
                                    className="adminProductsLinkBtn"
                                    onClick={() => onEdit(c)}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    className="adminProductsLinkBtn danger"
                                    onClick={() => onDelete(c?.id)}
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

                    <div className="adminCategoriesPagination">
                      <span className="adminProductsPaginationInfo">
                        Showing {visibleItems.length} of {filteredItems.length}
                        {searchQuery && totalCount !== null && filteredItems.length !== totalCount
                          ? ` (filtered from ${totalCount})`
                          : totalCount !== null
                            ? ' categories'
                            : ''}
                      </span>

                      {hasMore && (
                        <button
                          type="button"
                          className="adminSettingsBtnSecondary"
                          onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                        >
                          Load more
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* FORM */}
            {activeTab === 'form' && (

              <form className="adminSettingsForm" onSubmit={onSubmit}>



                <label>
                  <span>Category ID</span>
                  <input
                    type="text"
                    value={form.id}
                    onChange={(e) => {
                      const v = e.target.value;
                      setField('id', v);
                      // If slug not set yet, keep it aligned with id/name
                      if (!form.slug && v) setField('slug', toSlug(v));
                    }}
                    placeholder="e.g. chandeliers"
                    required
                  />
                </label>

                <label>
                  <span>Name</span>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => {
                      const v = e.target.value;
                      setField('name', v);
                      if (!form.slug) setField('slug', toSlug(v));
                    }}
                    placeholder="Chandeliers"
                    required
                  />
                </label>

                <div className="adminProductsRow">
                  <label>
                    <span>Slug</span>
                    <input
                      type="text"
                      value={form.slug}
                      onChange={(e) => setField('slug', e.target.value)}
                      placeholder="chandeliers"
                    />
                  </label>

                  {/* Subcategories are managed only in the dedicated “Manage Subcategories” tab. */}
                  <label>
                    <span>Subcategories</span>
                    <input
                      type="text"
                      value={''}
                      placeholder="Managed in “Manage Subcategories”"
                      disabled
                      aria-disabled="true"
                    />
                  </label>


                </div>

                <label>
                  <span>Image (optional)</span>
                  <div className="adminProductsFilePick">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setField('mainFile', e.target.files?.[0] || null)}
                    />
                    <span className="adminProductsHint">
                      {form.mainFile ? form.mainFile.name : form.imageUrl ? 'Image set' : 'No image yet'}
                    </span>
                  </div>
                </label>


                <label>
                  <span>Description</span>
                  <textarea
                    value={form.description}
                    onChange={(e) => setField('description', e.target.value)}
                    placeholder="Short description shown in admin only (currently)."
                    rows={4}
                  />
                </label>

                <div className="adminSettingsActions">
                  <button
                    type="submit"
                    className="adminSettingsBtn"
                    disabled={uploading || fetching}
                  >
                    {uploading
                      ? 'Saving…'
                      : selectedId
                        ? 'Save Changes'
                        : 'Create Category'}
                  </button>

                  <button
                    type="button"
                    className="adminSettingsBtnSecondary"
                    onClick={() => {
                      resetForm();
                      setActiveTab('list');
                    }}
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

