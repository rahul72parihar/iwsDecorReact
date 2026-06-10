import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import useAuth from '../../auth/useAuth';
import { getOrdersForUser } from '../../firebase/orderService';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';

import './Orders.css';

const STATUS_META = {
  placed:     { label: 'Placed',      color: 'status--placed'     },
  confirmed:  { label: 'Confirmed',   color: 'status--confirmed'  },
  processing: { label: 'Processing',  color: 'status--processing' },
  shipped:    { label: 'Shipped',     color: 'status--shipped'    },
  delivered:  { label: 'Delivered',   color: 'status--delivered'  },
  cancelled:  { label: 'Cancelled',   color: 'status--cancelled'  },
};

function StatusBadge({ status }) {
  const key = (status ?? 'placed').toLowerCase();
  const meta = STATUS_META[key] ?? { label: status ?? 'Placed', color: 'status--placed' };
  return <span className={`order-status ${meta.color}`}>{meta.label}</span>;
}

export default function Orders() {
  const { user, loading } = useAuth();

  const [orders, setOrders]   = useState([]);
  const [fetching, setFetching] = useState(false);
  const [error, setError]     = useState('');

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
    return () => { active = false; };
  }, [canFetch, user]);

  return (
    <>
      <Header />

      <div className="orders-page">
        <div className="orders-header">
          <div>
            <h1 className="orders-title">My orders</h1>
            <p className="orders-subtitle">View and track your past purchases.</p>
          </div>
          {!fetching && !error && orders.length > 0 && (
            <span className="orders-count">{orders.length} order{orders.length !== 1 ? 's' : ''}</span>
          )}
        </div>

        {(fetching || loading) && (
          <div className="orders-state">
            <div className="orders-spinner" aria-label="Loading" />
            <p>Loading your orders…</p>
          </div>
        )}

        {!fetching && error && (
          <div className="orders-state orders-state--error">
            <i className="ti ti-alert-circle" aria-hidden="true" />
            <p>{error}</p>
          </div>
        )}

        {!fetching && !error && orders.length === 0 && (
          <div className="orders-empty">
            <i className="ti ti-shopping-bag" aria-hidden="true" />
            <p className="orders-empty-title">No orders yet</p>
            <p className="orders-empty-sub">When you place an order, it will appear here.</p>
            <Link to="/" className="orders-shop-btn">Start shopping</Link>
          </div>
        )}

        {orders.length > 0 && (
          <div className="orders-list">
            {orders.map((o) => {
              const total     = o?.totals?.total ?? o?.totals?.subtotal ?? 0;
              const createdAt = o.createdAt?.toDate ? o.createdAt.toDate() : null;
              const dateStr   = createdAt
                ? createdAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                : null;
              const timeStr   = createdAt
                ? createdAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                : null;
              const itemCount = o?.items?.length ?? null;

              return (
                <Link
                  key={o.id}
                  to={`/account/orders/${encodeURIComponent(o.id)}`}
                  className="order-card"
                >
                  <div className="order-card-top">
                    <div className="order-id-wrap">
                      <span className="order-id">#{o.id}</span>
                      {dateStr && (
                        <span className="order-date">
                          <i className="ti ti-calendar" aria-hidden="true" />
                          {dateStr}{timeStr ? `, ${timeStr}` : ''}
                        </span>
                      )}
                    </div>
                    <StatusBadge status={o.status} />
                  </div>

                  <div className="order-card-bottom">
                    {itemCount !== null && (
                      <span className="order-meta">
                        <i className="ti ti-box" aria-hidden="true" />
                        {itemCount} item{itemCount !== 1 ? 's' : ''}
                      </span>
                    )}
                    <span className="order-total">
                      ₹{Number(total).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <i className="ti ti-chevron-right order-chevron" aria-hidden="true" />
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}