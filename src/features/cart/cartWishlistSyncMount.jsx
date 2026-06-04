// Backwards compatible mount wrapper (keeps App.jsx changes minimal)
import CartWishlistSync from './CartWishlistSync';

export default function cartWishlistSyncMount() {
  return <CartWishlistSync />;
}

