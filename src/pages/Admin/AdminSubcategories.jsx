import React, { useEffect, useMemo, useState } from 'react';

import {
  getCategorySubcategories,
  upsertCategorySubcategories,
} from '../../firebase/subcategoryService';


function normalizeValue(v) {
  return (v || '').trim();
}

function dedupePreserveOrder(arr) {
  const seen = new Set();
  const out = [];
  for (const item of arr || []) {
    const v = normalizeValue(item);
    if (!v) continue;
    if (seen.has(v)) continue;
    seen.add(v);
    out.push(v);
  }
  return out;
}


export default function AdminSubcategories({
  categories,
  selectedCategoryId,
  onSelectCategoryId,
  onSaved,
}) {
  const selectedCategory = useMemo(() => {
    if (!selectedCategoryId) return null;
    return categories.find((c) => c?.id === selectedCategoryId) || null;
  }, [categories, selectedCategoryId]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [subcategories, setSubcategories] = useState([]);
  const [newSubcategory, setNewSubcategory] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!selectedCategoryId) {
        setSubcategories([]);
        setNewSubcategory('');
        return;
      }
      setLoading(true);
      setError('');
      setSuccess('');

      try {
        const subs = await getCategorySubcategories(selectedCategoryId);
        if (cancelled) return;
        setSubcategories(dedupePreserveOrder(Array.isArray(subs) ? subs : []));
      } catch (e) {
        if (cancelled) return;
        setError(e?.message || 'Failed to load subcategories');
      } finally {
        if (cancelled) return;
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [selectedCategoryId]);

  const persist = async (next) => {
    if (!selectedCategoryId) throw new Error('Select a category first.');
    await upsertCategorySubcategories(selectedCategoryId, dedupePreserveOrder(next));
    if (onSaved) onSaved();
  };

  const onAdd = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const v = normalizeValue(newSubcategory);
    if (!v) {
      setError('Subcategory name is required.');
      return;
    }

    // prevent duplicates client-side
    if (subcategories.includes(v)) {
      setError('That subcategory already exists.');
      return;
    }

    setLoading(true);
    try {
      const next = [...subcategories, v];
      await persist(next);
      setSubcategories(next);
      setNewSubcategory('');
      setSuccess('Subcategory added.');
    } catch (e2) {
      setError(e2?.message || 'Failed to add subcategory');
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (name) => {
    if (!selectedCategoryId) return;
    setError('');
    setSuccess('');

    setLoading(true);
    try {
      const next = subcategories.filter((s) => s !== name);
      await persist(next);
      setSubcategories(next);
      setSuccess('Subcategory deleted.');
    } catch (e2) {
      setError(e2?.message || 'Failed to delete subcategory');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>

        {error && (
          <div className="adminSettingsError" style={{ marginBottom: 0 }}>{error}</div>
        )}
        {success && (
          <div className="adminSettingsSuccess" style={{ marginBottom: 0 }}>{success}</div>
        )}
      </div>

      <form className="adminSettingsForm" onSubmit={onAdd}>
        <label>
          <span>Category</span>
          <select
            value={selectedCategoryId || ''}
            onChange={(e) => onSelectCategoryId(e.target.value || null)}
            required
            style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px solid #ddd' }}
          >
            <option value="">Select a category…</option>
            {categories.map((c) => (
              <option key={c?.id} value={c?.id}>
                {c?.name ? `${c.name} (${c.id})` : c?.id}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Add a subcategory</span>
          <input
            type="text"
            value={newSubcategory}
            onChange={(e) => setNewSubcategory(e.target.value)}
            placeholder="e.g. Crystal Chandeliers"
            disabled={!selectedCategoryId || loading}
          />
        </label>

        <div className="adminSettingsActions">
          <button type="submit" className="adminSettingsBtn" disabled={loading || !selectedCategoryId}>
            {loading ? 'Saving…' : 'Add'}
          </button>

          <button
            type="button"
            className="adminSettingsBtnSecondary"
            onClick={() => {
              setError('');
              setSuccess('');
              setNewSubcategory('');
            }}
          >
            Clear
          </button>
        </div>

        <div style={{ marginTop: 10, fontSize: 12, color: '#777', lineHeight: 1.5 }}>
          Subcategories are stored as an embedded <code>string[]</code> on <code>categories/{selectedCategoryId}</code> → <code>subcategories</code>.
        </div>

        <div style={{ marginTop: 14 }}>
          <div style={{ fontWeight: 800, marginBottom: 8, fontSize: 13 }}>Existing subcategories</div>

          {subcategories.length === 0 ? (
            <div style={{ color: '#888', fontSize: 13 }}>No subcategories yet.</div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {subcategories.map((s) => (
                <span
                  key={s}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 12px',
                    borderRadius: 999,
                    border: '1px solid #ddd',
                    background: '#fff',
                    fontWeight: 700,
                    fontSize: 13,
                  }}
                >
                  {s}
                  <button
                    type="button"
                    className="adminProductsLinkBtn danger"
                    style={{ padding: '4px 8px', borderRadius: 999 }}
                    disabled={loading}
                    onClick={() => onDelete(s)}
                  >
                    Delete
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </form>


      {selectedCategory && (
        <div style={{ marginTop: 12, fontSize: 13, color: '#333' }}>
          <div style={{ fontWeight: 700 }}>Selected:</div>
          <div>
            {selectedCategory.name} <span style={{ color: '#999' }}>(id: {selectedCategory.id})</span>
          </div>
        </div>
      )}
    </div>
  );
}

