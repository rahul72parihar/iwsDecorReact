export function computeCheckoutTotals(cartTotalPrice) {
  const subtotal = cartTotalPrice;
  const shipping = subtotal > 0 ? 299 : 0;
  const tax = subtotal > 0 ? Math.round(subtotal * 0.05) : 0;
  const total = subtotal + shipping + tax;
  return { subtotal, shipping, tax, total };
}

