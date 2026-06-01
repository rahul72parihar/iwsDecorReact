import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearCart } from '../../features/cart/cartSlice';

import { useNavigate } from 'react-router-dom';

import './CartSummary.css';

export default function CartSummary() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { items, totalPrice, totalQuantity } = useSelector((s) => s.cart);

  const breakdown = useMemo(() => {
    const subtotal = totalPrice;
    const shipping = subtotal > 0 ? 299 : 0;
    const tax = subtotal > 0 ? Math.round(subtotal * 0.05) : 0; // 5% luxury tax approximation
    const total = subtotal + shipping + tax;
    return { subtotal, shipping, tax, total };
  }, [totalPrice]);

  return (
    <aside className="cart-summary" aria-label="Cart summary">
      <div className="cs-card">
        <h2 className="cs-title">Order Summary</h2>

        <div className="cs-row">
          <span>Subtotal</span>
          <span className="cs-amount">₹{breakdown.subtotal.toLocaleString('en-IN')}</span>
        </div>

        <div className="cs-row">
          <span>Shipping</span>
          <span className="cs-amount">₹{breakdown.shipping.toLocaleString('en-IN')}</span>
        </div>

        <div className="cs-row">
          <span>Tax</span>
          <span className="cs-amount">₹{breakdown.tax.toLocaleString('en-IN')}</span>
        </div>

        <div className="cs-divider" />

        <div className="cs-row cs-total">
          <span>Total</span>
          <span className="cs-amount">₹{breakdown.total.toLocaleString('en-IN')}</span>
        </div>

        <button
          type="button"
          className="cs-btn"
          disabled={items.length === 0}
          onClick={() => navigate('/checkout')}
        >
          Proceed To Checkout
        </button>

        {items.length > 0 ? (
          <button
            type="button"
            className="cs-clear"
            onClick={() => dispatch(clearCart())}
          >
            Clear Cart
          </button>
        ) : null}

        <div className="cs-note">
          {totalQuantity > 0
            ? `${totalQuantity} item${totalQuantity === 1 ? '' : 's'} • Secure checkout, insured delivery.`
            : 'Add items to see your totals.'}
        </div>
      </div>
    </aside>
  );
}

