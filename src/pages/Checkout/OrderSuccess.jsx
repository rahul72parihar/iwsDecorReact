import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

export default function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId') ?? '';

  const summary = useMemo(() => {
    if (!orderId) return null;
    return {
      status: 'placed',
      orderId,
    };
  }, [orderId]);

  return (
    <div style={{ padding: 24, maxWidth: 980, margin: '0 auto' }}>
      <h1 style={{ marginTop: 0 }}>Order Success</h1>

      <div
        style={{
          marginTop: 14,
          padding: 16,
          borderRadius: 18,
          background: 'rgba(255,255,255,0.9)',
          border: '1px solid rgba(0,0,0,0.04)',
          boxShadow: '0 14px 38px rgba(0,0,0,0.06)',
        }}
      >
        {summary ? (
          <>
            <div style={{ fontWeight: 950, fontSize: 18 }}>Your order has been placed!</div>
            <div style={{ marginTop: 8, color: 'rgba(29,24,21,0.75)', fontWeight: 800 }}>
              Order ID: <span style={{ color: '#1d1815' }}>{summary.orderId}</span>
            </div>
            <div style={{ marginTop: 10, color: 'rgba(29,24,21,0.65)', fontWeight: 800, fontSize: 13 }}>
              You can view order details in your account.
            </div>
          </>
        ) : (
          <div style={{ color: 'rgba(29,24,21,0.65)', fontWeight: 900 }}>Order placed.</div>
        )}

        <div style={{ marginTop: 14, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link
            to="/account/orders"
            style={{
              background: '#1d1815',
              color: 'white',
              border: '1px solid rgba(0,0,0,0.14)',
              borderRadius: 12,
              padding: '12px 16px',
              textDecoration: 'none',
              fontWeight: 950,
            }}
          >
            View orders
          </Link>

          <Link
            to="/"
            style={{
              background: 'white',
              color: '#1d1815',
              border: '1px solid rgba(0,0,0,0.14)',
              borderRadius: 12,
              padding: '12px 16px',
              textDecoration: 'none',
              fontWeight: 950,
            }}
          >
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

