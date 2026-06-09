import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import useAuth from '../../auth/useAuth';
import { getOrderByIdForUser } from '../../firebase/orderService';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';

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
        if (!o) {
          setOrder(null);
          setError('Order not found.');
          return;
        }
        setOrder(o);
      } catch (e) {
        console.error(e);
        if (!active) return;
        setError('Failed to load order details. Please try again.');
      } finally {
        if (active) setFetching(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [canFetch, orderId, user]);

  const totals = order?.totals ?? {};
  const items = Array.isArray(order?.items) ? order.items : [];

  return (
    <div style={{ minHeight: 400 }}>
      <Header />

      <div style={{ padding: 24, maxWidth: 980, margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 10 }}>
          <h1 style={{ margin: 0 }}>Order Details</h1>
          <button
            type="button"
            onClick={() => navigate('/account/orders')}
            style={{
              marginLeft: 'auto',
              border: '1px solid rgba(0,0,0,0.14)',
              background: 'white',
              borderRadius: 12,
              padding: '10px 14px',
              cursor: 'pointer',
              fontWeight: 900,
            }}
          >
            Back
          </button>
        </div>

        {fetching || loading ? <div style={{ marginTop: 14 }}>Loading...</div> : null}
        {error ? <div style={{ marginTop: 14, color: 'crimson', fontWeight: 900 }}>{error}</div> : null}

        {!fetching && !error && order ? (
          <div style={{ marginTop: 14, display: 'grid', gap: 12 }}>
            <div
              style={{
                padding: 16,
                borderRadius: 18,
                background: 'rgba(255,255,255,0.9)',
                border: '1px solid rgba(0,0,0,0.06)',
                boxShadow: '0 14px 38px rgba(0,0,0,0.03)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 950, fontSize: 18 }}>Order #{order.id}</div>
                  <div style={{ marginTop: 6, color: 'rgba(29,24,21,0.65)', fontWeight: 800, fontSize: 13 }}>
                    Status: {order.status ?? 'placed'}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 950, color: '#1d1815' }}>₹{Number(totals.total ?? 0).toLocaleString('en-IN')}</div>
                  <div style={{ marginTop: 6, color: 'rgba(29,24,21,0.65)', fontWeight: 800, fontSize: 13 }}>
                    Payment method: {order.paymentMethod ?? '—'}
                  </div>
                </div>
              </div>

              {order.shippingAddress ? (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(0,0,0,0.08)' }}>
                  <div style={{ fontWeight: 950 }}>Shipping address</div>
                  <div style={{ marginTop: 6, color: 'rgba(29,24,21,0.75)', fontWeight: 800, fontSize: 13, lineHeight: 1.5 }}>
                    {order.shippingAddress.fullName} • {order.shippingAddress.phone}
                    <br />
                    {order.shippingAddress.line1}
                    {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ''}
                    <br />
                    {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                    <br />
                    {order.shippingAddress.country}
                  </div>
                </div>
              ) : null}
            </div>

            <div
              style={{
                padding: 16,
                borderRadius: 18,
                background: 'rgba(255,255,255,0.9)',
                border: '1px solid rgba(0,0,0,0.06)',
              }}
            >
              <div style={{ fontWeight: 950, marginBottom: 10 }}>Items</div>

              {items.length === 0 ? (
                <div style={{ color: 'rgba(29,24,21,0.65)', fontWeight: 800 }}>No items found.</div>
              ) : (
                <div style={{ display: 'grid', gap: 12 }}>
                  {items.map((it) => (
                    <div
                      key={it.id}
                      style={{
                        display: 'flex',
                        gap: 12,
                        alignItems: 'center',
                        padding: 12,
                        borderRadius: 14,
                        border: '1px solid rgba(0,0,0,0.06)',
                      }}
                    >
                      {it.image ? (
                        <img
                          src={it.image}
                          alt={it.name}
                          style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 10 }}
                        />
                      ) : null}

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 950, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {it.name}
                        </div>
                        <div style={{ marginTop: 4, color: 'rgba(29,24,21,0.7)', fontWeight: 800, fontSize: 13 }}>
                          {it.quantity} × ₹{Number(it.price).toLocaleString('en-IN')}
                        </div>
                      </div>

                      <div style={{ fontWeight: 950, color: '#1d1815' }}>₹{Number(it.subtotal ?? it.price * it.quantity).toLocaleString('en-IN')}</div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ marginTop: 14, height: 1, background: 'rgba(0,0,0,0.08)' }} />

              <div style={{ marginTop: 12, display: 'grid', gap: 8, fontWeight: 800 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Subtotal</span>
                  <span>₹{Number(totals.subtotal ?? 0).toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Shipping</span>
                  <span>₹{Number(totals.shipping ?? 0).toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Tax</span>
                  <span>₹{Number(totals.tax ?? 0).toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 950, color: '#1d1815', fontSize: 18 }}>
                  <span>Total</span>
                  <span>₹{Number(totals.total ?? 0).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <Footer />
    </div>
  );
}


