import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import CartItem from '../../components/CartItem/CartItem';
import CartSummary from '../../components/CartSummary/CartSummary';
import Header from '../../components/Header/Header';

export default function Checkout() {
  const navigate = useNavigate();
  const { items, totalQuantity, totalPrice } = useSelector((s) => s.cart);

  const breakdown = useMemo(() => {
    const subtotal = totalPrice;
    const shipping = subtotal > 0 ? 299 : 0;
    const tax = subtotal > 0 ? Math.round(subtotal * 0.05) : 0;
    const total = subtotal + shipping + tax;
    return { subtotal, shipping, tax, total };
  }, [totalPrice]);

  const canProceed = items.length > 0;

  return (
    <>
      <Header />
      <div style={{ padding: 24, paddingTop: 0, maxWidth: 980, margin: '0 auto' }}>
        <h1 style={{ marginTop: 24 }}>Checkout</h1>

        <div style={{ display: 'flex', gap: 18, marginTop: 14, alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 900, fontSize: 16 }}>
              {totalQuantity > 0
                ? `${totalQuantity} item${totalQuantity === 1 ? '' : 's'} in your cart`
                : 'Your cart is empty'}
            </div>

            {items.length === 0 ? (
              <div style={{ marginTop: 14, color: 'rgba(29,24,21,0.65)', fontWeight: 800 }}>
                Add items to your cart to continue.
              </div>
            ) : (
              <div style={{ marginTop: 14 }}>
                <div role="list" aria-label="Cart items" style={{ display: 'grid', gap: 14 }}>
                  {items.map((it) => (
                    <CartItem key={it.id} item={it} />
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginTop: 16, padding: 14, borderRadius: 18, background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 14px 38px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontWeight: 800, color: 'rgba(29,24,21,0.82)' }}>
                <span>Subtotal</span>
                <span>₹{breakdown.subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontWeight: 800, color: 'rgba(29,24,21,0.82)', marginTop: 10 }}>
                <span>Shipping</span>
                <span>₹{breakdown.shipping.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontWeight: 800, color: 'rgba(29,24,21,0.82)', marginTop: 10 }}>
                <span>Tax</span>
                <span>₹{breakdown.tax.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ height: 1, background: 'rgba(0,0,0,0.08)', marginTop: 14, marginBottom: 10 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontWeight: 950, color: '#1d1815', fontSize: 18 }}>
                <span>Total</span>
                <span>₹{breakdown.total.toLocaleString('en-IN')}</span>
              </div>

              <div style={{ marginTop: 14, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => navigate('/checkout/shipping')}
                  disabled={!canProceed}
                  style={{
                    background: '#1d1815',
                    color: 'white',
                    border: '1px solid rgba(0,0,0,0.14)',
                    borderRadius: 12,
                    padding: '12px 16px',
                    cursor: canProceed ? 'pointer' : 'not-allowed',
                    fontWeight: 950,
                    opacity: canProceed ? 1 : 0.55,
                    minWidth: 220,
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}



