import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import useAuth from '../../auth/useAuth';
import { getOrdersForUser } from '../../firebase/orderService';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';

export default function Orders() {
  const { user, loading } = useAuth();

  const [orders, setOrders] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');

  const canFetch = useMemo(() => !!user && !loading, [user, loading]);

  useEffect(() => {
    if (!canFetch) return;

    let active = true;
    (async () => {
      setFetching(true);
      setError('');
      try {
        const list = await getOrdersForUser(user.uid, { pageSize: 50 });
        if (!active) return;
        setOrders(list);
      } catch (e) {
        console.error(e);
        if (!active) return;
        setError('Failed to load orders. Please try again.');
      } finally {
        if (active) setFetching(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [canFetch, user]);

  return (
    <div style={{ minHeight: 400 }}>
      <Header />

      <div style={{ padding: 24, maxWidth: 980, margin: '0 auto' }}>
        <h1 style={{ marginTop: 10 }}>Orders</h1>
        <div style={{ color: 'rgba(29,24,21,0.65)', fontWeight: 800, marginTop: 8, fontSize: 13 }}>
          View your past purchases.
        </div>

        {fetching || loading ? (
          <div style={{ marginTop: 14 }}>Loading...</div>
        ) : error ? (
          <div style={{ marginTop: 14, color: 'crimson', fontWeight: 900 }}>{error}</div>
        ) : null}

        {!fetching && !error && orders.length === 0 ? (
          <div style={{ marginTop: 18, padding: 16, border: '1px solid rgba(0,0,0,0.06)', borderRadius: 14, background: 'rgba(255,255,255,0.9)' }}>
            <div style={{ fontWeight: 950 }}>No orders yet</div>
            <div style={{ marginTop: 6, color: 'rgba(29,24,21,0.65)', fontWeight: 800, fontSize: 13 }}>
              When you place an order, it will appear here.
            </div>
          </div>
        ) : null}

        {orders.length > 0 ? (
          <div style={{ marginTop: 14, display: 'grid', gap: 12 }}>
            {orders.map((o) => {
              const total = o?.totals?.total ?? o?.totals?.subtotal ?? 0;
              const createdAt = o.createdAt?.toDate ? o.createdAt.toDate() : null;
              const dateStr = createdAt ? createdAt.toLocaleString('en-IN') : '';

              return (
                <Link
                  key={o.id}
                  to={`/account/orders/${encodeURIComponent(o.id)}`}
                  style={{
                    textDecoration: 'none',
                    color: 'inherit',
                    padding: 14,
                    borderRadius: 16,
                    background: 'rgba(255,255,255,0.9)',
                    border: '1px solid rgba(0,0,0,0.06)',
                    boxShadow: '0 14px 38px rgba(0,0,0,0.03)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 950 }}>Order #{o.id}</div>
                      <div style={{ marginTop: 4, color: 'rgba(29,24,21,0.7)', fontWeight: 800, fontSize: 13 }}>
                        {dateStr || '—'}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 950, color: '#1d1815' }}>₹{Number(total).toLocaleString('en-IN')}</div>
                      <div style={{ marginTop: 4, fontWeight: 900, color: 'rgba(29,24,21,0.65)', fontSize: 13 }}>
                        Status: {o.status ?? 'placed'}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : null}
      </div>

      <Footer />
    </div>
  );
}


