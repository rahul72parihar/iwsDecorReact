import { useMemo } from 'react';
import { Link } from 'react-router-dom';

export default function Checkout() {
  const steps = useMemo(() => ['Shipping', 'Payment', 'Success'], []);

  return (
    <div style={{ padding: 24 }}>
      <h1>Checkout</h1>
      <p>Checkout page placeholder.</p>
      <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
        {steps.map((s) => (
          <Link key={s} to="#" style={{ opacity: 0.85, textDecoration: 'none' }}>
            {s}
          </Link>
        ))}
      </div>
    </div>
  );
}

