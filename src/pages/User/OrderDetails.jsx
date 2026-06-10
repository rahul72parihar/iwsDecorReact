import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import useAuth from '../../auth/useAuth';
import { getOrderByIdForUser } from '../../firebase/orderService';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';

import './OrderDetails.css';

const STATUS_STEPS = ['placed', 'confirmed', 'processing', 'shipped', 'delivered'];

function StatusPipeline({ status }) {
  const s = (status ?? 'placed').toLowerCase();
  const isCancelled = s === 'cancelled';
  const currentIdx = STATUS_STEPS.indexOf(s);

  if (isCancelled) {
    return (
      <div className="od-pipeline od-pipeline--cancelled">
        <span className="od-pipeline-label">Order cancelled</span>
      </div>
    );
  }

  return (
    <div className="od-pipeline">
      {STATUS_STEPS.map((step, i) => {
        const done = i <= currentIdx;
        const active = i === currentIdx;
        return (
          <div key={step} className={`od-pipeline-step ${done ? 'done' : ''} ${active ? 'active' : ''}`}>
            <div className="od-pipeline-dot">
              {done && (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5l2.2 2.2L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            {i < STATUS_STEPS.length - 1 && <div className="od-pipeline-line" />}
            <span className="od-pipeline-step-label">{step}</span>
          </div>
        );
      })}
    </div>
  );
}

function StatusBadge({ status }) {
  const s = (status ?? 'placed').toLowerCase();
  return <span className={`order-status status--${s}`}>{s}</span>;
}

export default function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const [order, setOrder] = useState(null);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');

  const canFetch = useMemo(() => !!user && !!orderId && !loading, [user, orderId, loading]);

  useEffect(() => {
    if (!canFetch) return;
    let active = true;
    (async () => {
      setFetching(true);
      setError('');
      try {
        const o = await getOrderByIdForUser(user.uid, orderId);
        if (!active) return;
        if (!o) { setOrder(null); setError('Order not found.'); return; }
        setOrder(o);
      } catch (e) {
        console.error(e);
        if (!active) return;
        setError('Failed to load order details. Please try again.');
      } finally {
        if (active) setFetching(false);
      }
    })();
    return () => { active = false; };
  }, [canFetch, orderId, user]);

  const totals = order?.totals ?? {};
  const items = Array.isArray(order?.items) ? order.items : [];

  return (
    <div className="od-root">
      <Header />

      <main className="od-page">

        {/* ── Top bar ── */}
        <div className="od-topbar">
          <button type="button" className="od-back-btn" onClick={() => navigate('/account/orders')}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Orders
          </button>
          <h1 className="od-title">Order Details</h1>
        </div>

        {/* ── States ── */}
        {(fetching || loading) && (
          <div className="orders-state">
            <div className="orders-spinner" />
            <p>Loading order…</p>
          </div>
        )}

        {error && !fetching && (
          <div className="orders-state orders-state--error">
            <i className="ph ph-warning-circle" />
            <p>{error}</p>
          </div>
        )}

        {/* ── Content ── */}
        {!fetching && !error && order && (
          <div className="od-grid">

            {/* ── Summary card ── */}
            <div className="od-card">
              <div className="od-card-head">
                <div>
                  <p className="od-order-id">Order #{order.id}</p>
                  {order.createdAt && (
                    <p className="od-order-date">
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                        <rect x="1" y="2" width="11" height="10" rx="2" stroke="currentColor" strokeWidth="1.2" />
                        <path d="M4 1v2M9 1v2M1 5h11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                      </svg>
                      {new Date(order.createdAt?.seconds ? order.createdAt.seconds * 1000 : order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  )}
                </div>
                <div className="od-card-head-right">
                  <p className="od-total-amount">₹{Number(totals.total ?? 0).toLocaleString('en-IN')}</p>
                  <StatusBadge status={order.status} />
                </div>
              </div>

              {/* status pipeline */}
              <div className="od-pipeline-wrap">
                <StatusPipeline status={order.status} />
              </div>

              {/* payment */}
              {order.paymentMethod && (
                <div className="od-meta-row">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <rect x="1" y="3" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                    <path d="M1 6h12" stroke="currentColor" strokeWidth="1.2" />
                  </svg>
                  <span>{order.paymentMethod}</span>
                </div>
              )}
            </div>

            {/* ── Shipping address ── */}
            {order.shippingAddress && (
              <div className="od-card">
                <p className="od-section-label">Shipping address</p>
                <div className="od-address">
                  <p className="od-address-name">
                    {order.shippingAddress.fullName}
                    {order.shippingAddress.phone && <span className="od-address-phone"> · {order.shippingAddress.phone}</span>}
                  </p>
                  <p className="od-address-line">
                    {order.shippingAddress.line1}
                    {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ''}
                  </p>
                  <p className="od-address-line">
                    {order.shippingAddress.city}, {order.shippingAddress.state} – {order.shippingAddress.pincode}
                  </p>
                  <p className="od-address-line">{order.shippingAddress.country}</p>
                </div>
              </div>
            )}

            {/* ── Items ── */}
            <div className="od-card">
              <p className="od-section-label">Items ({items.length})</p>

              {items.length === 0 ? (
                <p className="od-empty-items">No items found.</p>
              ) : (
                <div className="od-items">
                  {items.map((it) => (
                    <div key={it.id} className="od-item">
                      {it.image
                        ? <img src={it.image} alt={it.name} className="od-item-img" />
                        : <div className="od-item-img od-item-img--placeholder" />
                      }
                      <div className="od-item-info">
                        <p className="od-item-name">{it.name}</p>
                        <p className="od-item-qty">{it.quantity} × ₹{Number(it.price).toLocaleString('en-IN')}</p>
                      </div>
                      <p className="od-item-subtotal">₹{Number(it.subtotal ?? it.price * it.quantity).toLocaleString('en-IN')}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* ── Totals ── */}
              <div className="od-totals">
                <div className="od-totals-inner">
                  <div className="od-totals-row">
                    <span>Subtotal</span>
                    <span>₹{Number(totals.subtotal ?? 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="od-totals-row">
                    <span>Shipping</span>
                    <span>₹{Number(totals.shipping ?? 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="od-totals-row">
                    <span>Tax</span>
                    <span>₹{Number(totals.tax ?? 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="od-totals-row od-totals-row--total">
                    <span>Total</span>
                    <span>₹{Number(totals.total ?? 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}