import { configureStore } from '@reduxjs/toolkit';

import appReducer from '../slices/app/appSlice';
import cartReducer from '../features/cart/cartSlice';
import wishlistReducer from '../features/wishlist/wishlistSlice';
import toastReducer from './toastSlice';


const CART_STORAGE_KEY = 'iws_cart_v1';
const WISHLIST_STORAGE_KEY = 'iws_wishlist_v1';

function safeLoadJSON(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return undefined;
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

const preloadedCart = safeLoadJSON(CART_STORAGE_KEY);
const preloadedWishlist = safeLoadJSON(WISHLIST_STORAGE_KEY);

export const store = configureStore({
  reducer: {
    app: appReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    toast: toastReducer,
  },
  preloadedState: {
    ...(preloadedCart ? { cart: preloadedCart } : null),
    ...(preloadedWishlist ? { wishlist: preloadedWishlist } : null),
  },
});


store.subscribe(() => {
  try {
    const state = store.getState();
    localStorage.setItem(CART_STORAGE_KEY, state.cart);
    localStorage.setItem(WISHLIST_STORAGE_KEY, state.wishlist);
  } catch {
    // ignore storage write errors
  }
});





