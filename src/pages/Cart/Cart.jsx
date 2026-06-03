import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import CartItem from '../../components/CartItem/CartItem';
import CartSummary from '../../components/CartSummary/CartSummary';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import './Cart.css';

export default function Cart() {
  const { items } = useSelector((s) => s.cart);


  const hasItems = items.length > 0;

  const title = useMemo(() => {
    return `Shopping Cart`;
  }, []);

  return (
    <div className="cart-page">
      <Header/>
      <section className="cart-hero">
        <div className="cart-hero-inner">
          <div className="cart-hero-breadcrumb">IWS Decor • Cart</div>
          <h1 className="cart-title">{title}</h1>
        </div>
      </section>

      <section className="cart-main">
        <div className="cart-main-grid">
          <div className="cart-left">
            {hasItems ? (
              <div className="cart-list" role="list">
                {items.map((it) => (
                  <CartItem key={it.id} item={it} />
                ))}
              </div>
            ) : (
              <div className="cart-empty" role="status" aria-live="polite">
                <div className="cart-empty-icon" aria-hidden="true">🛍️</div>
                <div className="cart-empty-title">Your cart is empty</div>
                <div className="cart-empty-sub">
                  Explore luxury decor and statement lighting—add your favorites to begin.
                </div>
                <Link to="/products" className="cart-empty-btn">Continue Shopping</Link>
              </div>
            )}
          </div>

          <div className="cart-right">
            <CartSummary />
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

