import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function Checkout() {
  const steps = useMemo(() => ['Shipping', 'Payment', 'Success'], []);
  const { items, totalQuantity, totalPrice } = useSelector((s) => s.cart);

  const breakdown = useMemo(() => {
    const subtotal = totalPrice;
    const shipping = subtotal > 0 ? 299 : 0;
    const tax = subtotal > 0 ? Math.round(subtotal * 0.05) : 0;
    const total = subtotal + shipping + tax;
    return { subtotal, shipping, tax, total };
  }, [totalPrice]);

  return (
    <div style={{ padding: 24 }}>
      <h1>Checkout</h1>

      <div style={{ marginTop: 10 }}>
        <div style={{ fontWeight: 900, fontSize: 16 }}>
          {totalQuantity > 0
            ? `${totalQuantity} item${totalQuantity === 1 ? '' : 's'} in your cart`
            : 'Your cart is empty'}
        </div>

        <div style={{ marginTop: 14, padding: 14, borderRadius: 18, background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 14px 38px rgba(0,0,0,0.06)' }}>
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
          <div style={{ marginTop: 14, color: 'rgba(29,24,21,0.65)', fontWeight: 800, fontSize: 13 }}>
            Proceed to complete shipping and payment.
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
        {steps.map((s) => (
          <Link key={s} to={s === 'Shipping' ? '/checkout/shipping' : s === 'Payment' ? '/checkout/payment' : '/checkout/success'} style={{ opacity: 0.85, textDecoration: 'none' }}>
            {s}
          </Link>
        ))}
      </div>

      {items.length === 0 ? (
        <div style={{ marginTop: 14, color: 'rgba(29,24,21,0.65)', fontWeight: 800 }}>
          Add items to your cart to continue.
        </div>
      ) : null}
    </div>
  );
}

