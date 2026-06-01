import { useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { pushAutoToast } from '../../store/toastSlice';

import {
  removeFromCart,
  increaseQuantity,
  decreaseQuantity,
} from '../../features/cart/cartSlice';

import './CartItem.css';

export default function CartItem({ item }) {
  const dispatch = useDispatch();

  const subtotal = useMemo(() => {
    const n = Number(item.subtotal ?? item.price * item.quantity);
    return Number.isFinite(n) ? n : 0;
  }, [item.price, item.quantity, item.subtotal]);

  const decDisabled = item.quantity <= 1;

  return (
    <div className="cart-item" role="listitem" aria-label={item.name}>
      <div className="cart-item-imageWrap">
        <img className="cart-item-image" src={item.image} alt={item.name} />
      </div>

      <div className="cart-item-main">
        <div className="cart-item-top">
          <div>
            <div className="cart-item-category">{item.category}</div>
            <div className="cart-item-name">{item.name}</div>
          </div>

          <div className="cart-item-price">₹{Number(item.price).toLocaleString('en-IN')}</div>
        </div>

        <div className="cart-item-controls">
          <div className="cart-qty">
            <button
              type="button"
              className="cart-qty-btn"
              disabled={decDisabled}
              onClick={() => {
              dispatch(decreaseQuantity(item.id));
              if (decDisabled) {
                // decDisabled means quantity <=1 prior to click, so item will be removed
                dispatch(
                  pushAutoToast({
                    type: 'info',
                    title: 'Removed from cart',
                    message: item.name,
                  })
                );
              } else {
                dispatch(
                  pushAutoToast({
                    type: 'success',
                    title: 'Cart updated',
                    message: item.name,
                  })
                );
              }
            }}

              aria-label="Decrease quantity"
            >
              −
            </button>
            <div className="cart-qty-value" aria-label="Quantity">{item.quantity}</div>
            <button
              type="button"
              className="cart-qty-btn"
              onClick={() => {
              dispatch(increaseQuantity(item.id));
              dispatch(
                pushAutoToast({
                  type: 'success',
                  title: 'Cart updated',
                  message: item.name,
                })
              );
            }}

              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          <div className="cart-item-subtotal">
            Subtotal
            <div className="cart-item-subtotalValue">₹{subtotal.toLocaleString('en-IN')}</div>
          </div>

          <button
            type="button"
            className="cart-remove"
            onClick={() => {
              dispatch(removeFromCart(item.id));
              dispatch(
                pushAutoToast({
                  type: 'info',
                  title: 'Removed from cart',
                  message: item.name,
                })
              );
            }}
            aria-label="Remove item"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

