import { useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';


import { clearCart } from '../../features/cart/cartSlice';

import useAuth from '../../auth/useAuth';
import { createOrder } from '../../firebase/orderService';
import { getCheckoutSession, clearCheckoutSession } from './CheckoutUtils';

export default function Payment() {
  const { user, loading } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const cart = useSelector((s) => s.cart);

  const [paymentMethod, setPaymentMethod] = useState('cod'); // cod | online
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');

  const breakdown = useMemo(() => {
    const subtotal = cart.totalPrice;
    const shipping = subtotal > 0 ? 299 : 0;
    const tax = subtotal > 0 ? Math.round(subtotal * 0.05) : 0;
    const total = subtotal + shipping + tax;
    return { subtotal, shipping, tax, total };
  }, [cart.totalPrice]);

  const session = useMemo(() => getCheckoutSession(), []);
  const selectedAddress = session?.selectedAddress ?? null;
  const selectedAddressId = session?.selectedAddressId ?? '';

  async function handlePlaceOrder() {
    setError('');

    if (loading) return;
    if (!user) {
      setError('Please login to checkout.');
      navigate('/login');
      return;
    }
    if (!cart.items.length) {
      setError('Your cart is empty.');
      return;
    }
    if (!selectedAddressId || !selectedAddress) {
      setError('Please select a shipping address.');
      navigate('/checkout/shipping');
      return;
    }

    setPlacing(true);
    try {
      const paymentMethodLabel = paymentMethod === 'cod' ? 'cash_on_delivery' : 'online_demo';

      // Create order in Firestore
      const orderId = await createOrder({
        userUid: user.uid,
        shippingAddress: selectedAddress,
        paymentMethod: paymentMethodLabel,
        items: cart.items,
        totals: breakdown,
      });

      // In this app we treat both methods as "placed" immediately.
      // (Hooking real payments can be done later.)

      dispatch(clearCart());
      clearCheckoutSession();
      navigate(`/checkout/success?orderId=${encodeURIComponent(orderId)}`);
    } catch (e) {
      console.error(e);
      setError('Could not place the order. Please try again.');
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 980, margin: '0 auto' }}>
      <h1 style={{ marginTop: 0 }}>Payment</h1>

      {cart.items.length === 0 ? (
        <div style={{ marginTop: 12, color: 'rgba(29,24,21,0.65)', fontWeight: 800 }}>
          Your cart is empty.
        </div>
      ) : null}

      <div
        style={{
          marginTop: 14,
          padding: 14,
          borderRadius: 18,
          background: 'rgba(255,255,255,0.9)',
          border: '1px solid rgba(0,0,0,0.04)',
          boxShadow: '0 14px 38px rgba(0,0,0,0.06)',
        }}
      >
        <h3 style={{ margin: 0 }}>Choose a payment method</h3>

        {error ? (
          <div style={{ marginTop: 10, color: 'crimson', fontWeight: 900 }}>{error}</div>
        ) : null}

        <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
          <label
            style={{
              display: 'flex',
              gap: 10,
              alignItems: 'flex-start',
              padding: 12,
              borderRadius: 14,
              border:
                paymentMethod === 'cod'
                  ? '2px solid rgba(0,0,0,0.75)'
                  : '1px solid rgba(0,0,0,0.08)',
              background: paymentMethod === 'cod' ? 'rgba(0,0,0,0.02)' : 'transparent',
              cursor: 'pointer',
            }}
          >
            <input
              type="radio"
              name="paymentMethod"
              checked={paymentMethod === 'cod'}
              onChange={() => setPaymentMethod('cod')}
              style={{ marginTop: 4 }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 950 }}>Cash on Delivery</div>
              <div style={{ marginTop: 2, color: 'rgba(29,24,21,0.75)', fontWeight: 700, fontSize: 13 }}>
                Pay with cash when your order arrives.
              </div>
            </div>
          </label>

          <label
            style={{
              display: 'flex',
              gap: 10,
              alignItems: 'flex-start',
              padding: 12,
              borderRadius: 14,
              border:
                paymentMethod === 'online'
                  ? '2px solid rgba(0,0,0,0.75)'
                  : '1px solid rgba(0,0,0,0.08)',
              background: paymentMethod === 'online' ? 'rgba(0,0,0,0.02)' : 'transparent',
              cursor: 'pointer',
            }}
          >
            <input
              type="radio"
              name="paymentMethod"
              checked={paymentMethod === 'online'}
              onChange={() => setPaymentMethod('online')}
              style={{ marginTop: 4 }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 950 }}>Online (Demo)</div>
              <div style={{ marginTop: 2, color: 'rgba(29,24,21,0.75)', fontWeight: 700, fontSize: 13 }}>
                Simulated payment for now.
              </div>
            </div>
          </label>
        </div>

        <div style={{ marginTop: 14, height: 1, background: 'rgba(0,0,0,0.08)' }} />

        <div style={{ marginTop: 12, display: 'grid', gap: 8, fontWeight: 800 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(29,24,21,0.82)' }}>
            <span>Subtotal</span>
            <span>₹{breakdown.subtotal.toLocaleString('en-IN')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(29,24,21,0.82)' }}>
            <span>Shipping</span>
            <span>₹{breakdown.shipping.toLocaleString('en-IN')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(29,24,21,0.82)' }}>
            <span>Tax</span>
            <span>₹{breakdown.tax.toLocaleString('en-IN')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#1d1815', fontSize: 18, fontWeight: 950 }}>
            <span>Total</span>
            <span>₹{breakdown.total.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div style={{ marginTop: 14, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handlePlaceOrder}
            disabled={placing}
            style={{
              background: '#1d1815',
              color: 'white',
              border: '1px solid rgba(0,0,0,0.14)',
              borderRadius: 12,
              padding: '12px 16px',
              cursor: placing ? 'not-allowed' : 'pointer',
              fontWeight: 950,
              opacity: placing ? 0.7 : 1,
              minWidth: 220,
            }}
          >
            {placing ? 'Placing order...' : 'Place order'}
          </button>
        </div>

        {selectedAddress ? (
          <div style={{ marginTop: 14, color: 'rgba(29,24,21,0.7)', fontWeight: 800, fontSize: 13 }}>
            Deliver to: {selectedAddress.fullName} • {selectedAddress.line1}
          </div>
        ) : null}
      </div>

      <div style={{ marginTop: 10, color: 'rgba(29,24,21,0.65)', fontWeight: 800, fontSize: 12 }}>
        Payment processing is simulated (no external payment gateway wired yet).
      </div>
    </div>
  );
}

