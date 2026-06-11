import { useCallback, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';

import AdminNav from './AdminNav';
import auth from '../../firebase/firebaseAuth';
import {
  createReview,
  deleteReview,
  listReviewsForAdmin,
  updateReview,
  updateReviewStatus,
} from '../../firebase/reviewService';

import './Reviews.css';

const PAGE_SIZE = 12;
const STATUS_OPTIONS = ['pending', 'approved', 'hidden', 'rejected'];

function makeEmptyForm() {
  return {
    productId: '',
    productName: '',
    customerName: '',
    customerEmail: '',
    rating: '5',
    status: 'pending',
    text: '',
  };
}

function timestampToDate(value) {
  if (!value) return null;
  if (typeof value.toDate === 'function') return value.toDate();
  if (typeof value.toMillis === 'function') return new Date(value.toMillis());
  if (value.seconds) return new Date(value.seconds * 1000);
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value) {
  const date = timestampToDate(value);
  if (!date) return 'Not available';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function StarRating({ rating }) {
  const safe = Math.max(0, Math.min(5, Number(rating) || 0));
  return (
    <span className="adminReviewsStars" aria-label={`${safe} out of 5 stars`}>
      {'★'.repeat(Math.round(safe))}{'☆'.repeat(5 - Math.round(safe))}
    </span>
  );
}

export default function AdminReviews() {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [selectedReviewId, setSelectedReviewId] = useState('');
  const [form, setForm] = useState(makeEmptyForm());
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoadingAuth(false);
    });
    return () => unsub();
  }, []);

  const canManage = !!user;

  const refresh = useCallback(async () => {
    setFetching(true);
    setError('');
    setSuccess('');
    try {
      const list = await listReviewsForAdmin({ pageSize: 150 });
      setReviews(Array.isArray(list) ? list : []);
      setVisibleCount(PAGE_SIZE);
    } catch (e) {
      setError(e?.message || 'Failed to load reviews');
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    if (!canManage) return;
    queueMicrotask(refresh);
  }, [canManage, refresh]);

  const filteredReviews = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return reviews.filter((review) => {
      const status = (review.status || 'pending').toLowerCase();
      if (statusFilter !== 'all' && status !== statusFilter) return false;
      if (!q) return true;

      return [
        review.id,
        review.productId,
        review.productName,
        review.customerName,
        review.customerEmail,
        review.text,
      ].some((field) => String(field || '').toLowerCase().includes(q));
    });
  }, [reviews, searchQuery, statusFilter]);

  const visibleReviews = useMemo(() => filteredReviews.slice(0, visibleCount), [filteredReviews, visibleCount]);

  const stats = useMemo(() => {
    const approved = reviews.filter((review) => review.status === 'approved').length;
    const pending = reviews.filter((review) => !review.status || review.status === 'pending').length;
    const avgRating = reviews.length
      ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length
      : 0;
    return { approved, pending, avgRating };
  }, [reviews]);

  const resetForm = () => {
    setForm(makeEmptyForm());
    setSelectedReviewId('');
    setError('');
    setSuccess('');
  };

  const editReview = (review) => {
    setSelectedReviewId(review.id);
    setForm({
      productId: review.productId || '',
      productName: review.productName || '',
      customerName: review.customerName || '',
      customerEmail: review.customerEmail || '',
      rating: String(review.rating || 5),
      status: review.status || 'pending',
      text: review.text || '',
    });
    setActiveTab('form');
    setError('');
    setSuccess('');
  };

  const saveReview = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    if (!form.customerName.trim() || !form.text.trim()) {
      setError('Customer name and review text are required.');
      setSaving(false);
      return;
    }

    try {
      const payload = {
        ...form,
        productId: form.productId.trim(),
        productName: form.productName.trim(),
        customerName: form.customerName.trim(),
        customerEmail: form.customerEmail.trim(),
        text: form.text.trim(),
        rating: Number(form.rating) || 5,
      };

      if (selectedReviewId) {
        await updateReview(selectedReviewId, payload);
        setSuccess('Review updated.');
      } else {
        await createReview(payload);
        setSuccess('Review created.');
      }

      resetForm();
      setActiveTab('list');
      await refresh();
    } catch (e2) {
      setError(e2?.message || 'Failed to save review');
    } finally {
      setSaving(false);
    }
  };

  const setReviewStatus = async (reviewId, status) => {
    setError('');
    setSuccess('');
    try {
      await updateReviewStatus(reviewId, status);
      setReviews((prev) => prev.map((review) => (
        review.id === reviewId ? { ...review, status } : review
      )));
      setSuccess('Review status updated.');
    } catch (e) {
      setError(e?.message || 'Failed to update review status');
    }
  };

  const removeReview = async (reviewId) => {
    setError('');
    setSuccess('');
    try {
      await deleteReview(reviewId);
      setReviews((prev) => prev.filter((review) => review.id !== reviewId));
      if (selectedReviewId === reviewId) resetForm();
      setSuccess('Review deleted.');
    } catch (e) {
      setError(e?.message || 'Failed to delete review');
    }
  };

  if (loadingAuth) return <div className="adminReviewsCenter">Loading...</div>;

  return (
    <div className="adminShell">
      <AdminNav />

      <main className="adminMain">
        <header className="adminDashHead">
          <div>
            <h1>Reviews</h1>
            <p>
              Create, edit, approve, hide, and remove customer reviews.
              <span className="adminProductsTotalBadge">{reviews.length} total</span>
            </p>
          </div>
          <div className="adminProductsHeadActions">
            <button type="button" className="adminSettingsBtnSecondary" onClick={refresh} disabled={fetching}>
              {fetching ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
              type="button"
              className="adminSettingsBtn"
              onClick={() => {
                resetForm();
                setActiveTab('form');
              }}
            >
              New Review
            </button>
          </div>
        </header>

        {!canManage ? (
          <div className="adminSettingsError">Please log in to manage reviews.</div>
        ) : (
          <>
            <section className="adminReviewsStats" aria-label="Review stats">
              <div className="adminReviewsStat"><span>Approved</span><strong>{stats.approved}</strong></div>
              <div className="adminReviewsStat"><span>Pending</span><strong>{stats.pending}</strong></div>
              <div className="adminReviewsStat"><span>Average Rating</span><strong>{stats.avgRating.toFixed(1)}</strong></div>
            </section>

            <div className="adminSettingsCard">
              <div className="adminSettingsTabs">
                <button
                  type="button"
                  className={activeTab === 'list' ? 'adminSettingsTab active' : 'adminSettingsTab'}
                  onClick={() => { setActiveTab('list'); setError(''); setSuccess(''); }}
                >
                  All Reviews
                </button>
                <button
                  type="button"
                  className={activeTab === 'form' ? 'adminSettingsTab active' : 'adminSettingsTab'}
                  onClick={() => { setActiveTab('form'); setError(''); setSuccess(''); }}
                >
                  {selectedReviewId ? 'Edit Review' : 'New Review'}
                </button>
              </div>

              {error && <div className="adminSettingsError adminReviewsNotice">{error}</div>}
              {success && <div className="adminSettingsSuccess adminReviewsNotice">{success}</div>}

              {activeTab === 'list' && (
                <>
                  <div className="adminReviewsToolbar">
                    <div className="adminProductsSearchBox">
                      <svg className="adminProductsSearchIcon" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="9" cy="9" r="5.5" stroke="#aaa" strokeWidth="1.6" />
                        <path d="M13.5 13.5L17 17" stroke="#aaa" strokeWidth="1.6" strokeLinecap="round" />
                      </svg>
                      <input
                        type="search"
                        className="adminProductsSearchInput"
                        placeholder="Search reviews, product, customer..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      {searchQuery && (
                        <button type="button" className="adminProductsSearchClear" onClick={() => setSearchQuery('')} aria-label="Clear search">x</button>
                      )}
                    </div>

                    <select className="adminReviewsFilter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                      <option value="all">All statuses</option>
                      {STATUS_OPTIONS.map((status) => <option key={status} value={status}>{status}</option>)}
                    </select>
                  </div>

                  {fetching && reviews.length === 0 ? (
                    <div className="adminProductsEmpty">Loading reviews...</div>
                  ) : filteredReviews.length === 0 ? (
                    <div className="adminProductsEmpty">No reviews match your filters.</div>
                  ) : (
                    <>
                      <div className="adminProductsTable adminReviewsTable">
                        <table aria-label="Reviews table">
                          <thead>
                            <tr>
                              <th>Review</th>
                              <th>Product</th>
                              <th>Rating</th>
                              <th>Status</th>
                              <th>Date</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {visibleReviews.map((review) => (
                              <tr key={review.id}>
                                <td>
                                  <div className="adminProductsRowName">{review.customerName || 'Customer'}</div>
                                  <div className="adminReviewsExcerpt">{review.text}</div>
                                </td>
                                <td>
                                  <div>{review.productName || review.productId || 'General'}</div>
                                  {review.productId && <div className="adminProductsRowId">id: {review.productId}</div>}
                                </td>
                                <td><StarRating rating={review.rating} /></td>
                                <td>
                                  <select
                                    className={`adminReviewsStatusSelect adminReviewsStatus--${review.status || 'pending'}`}
                                    value={review.status || 'pending'}
                                    onChange={(e) => setReviewStatus(review.id, e.target.value)}
                                  >
                                    {STATUS_OPTIONS.map((status) => <option key={status} value={status}>{status}</option>)}
                                  </select>
                                </td>
                                <td>{formatDate(review.createdAt)}</td>
                                <td>
                                  <div className="adminProductsRowActions">
                                    <button type="button" className="adminProductsLinkBtn" onClick={() => editReview(review)}>Edit</button>
                                    <button type="button" className="adminProductsLinkBtn danger" onClick={() => removeReview(review.id)}>Delete</button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="adminProductsPagination">
                        <span className="adminProductsPaginationInfo">Showing {visibleReviews.length} of {filteredReviews.length}</span>
                        {visibleCount < filteredReviews.length && (
                          <button type="button" className="adminSettingsBtnSecondary" onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}>
                            Load more
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </>
              )}

              {activeTab === 'form' && (
                <form className="adminReviewsForm" onSubmit={saveReview}>
                  <div className="adminReviewsFormRow">
                    <label>
                      <span>Product ID</span>
                      <input value={form.productId} onChange={(e) => setForm((prev) => ({ ...prev, productId: e.target.value }))} placeholder="optional" />
                    </label>
                    <label>
                      <span>Product Name</span>
                      <input value={form.productName} onChange={(e) => setForm((prev) => ({ ...prev, productName: e.target.value }))} placeholder="optional" />
                    </label>
                  </div>

                  <div className="adminReviewsFormRow">
                    <label>
                      <span>Customer Name</span>
                      <input value={form.customerName} onChange={(e) => setForm((prev) => ({ ...prev, customerName: e.target.value }))} required />
                    </label>
                    <label>
                      <span>Customer Email</span>
                      <input type="email" value={form.customerEmail} onChange={(e) => setForm((prev) => ({ ...prev, customerEmail: e.target.value }))} />
                    </label>
                  </div>

                  <div className="adminReviewsFormRow">
                    <label>
                      <span>Rating</span>
                      <select value={form.rating} onChange={(e) => setForm((prev) => ({ ...prev, rating: e.target.value }))}>
                        <option value="5">5 stars</option>
                        <option value="4">4 stars</option>
                        <option value="3">3 stars</option>
                        <option value="2">2 stars</option>
                        <option value="1">1 star</option>
                      </select>
                    </label>
                    <label>
                      <span>Status</span>
                      <select value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}>
                        {STATUS_OPTIONS.map((status) => <option key={status} value={status}>{status}</option>)}
                      </select>
                    </label>
                  </div>

                  <label>
                    <span>Review Text</span>
                    <textarea value={form.text} onChange={(e) => setForm((prev) => ({ ...prev, text: e.target.value }))} rows={6} required />
                  </label>

                  <div className="adminSettingsActions">
                    <button type="submit" className="adminSettingsBtn" disabled={saving}>{saving ? 'Saving...' : selectedReviewId ? 'Update Review' : 'Create Review'}</button>
                    <button type="button" className="adminSettingsBtnSecondary" onClick={() => { resetForm(); setActiveTab('list'); }} disabled={saving}>
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
