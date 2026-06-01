import { configureStore } from '@reduxjs/toolkit';

import appReducer from '../slices/app/appSlice';
import cartReducer from '../features/cart/cartSlice';
import toastReducer from './toastSlice';


const CART_STORAGE_KEY = 'iws_cart_v1';

function loadCartState() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return undefined;
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

const preloadedCart = loadCartState();

export const store = configureStore({
  reducer: {
    app: appReducer,
    cart: cartReducer,
    toast: toastReducer,
  },
  preloadedState: preloadedCart ? { cart: preloadedCart } : undefined,
});


store.subscribe(() => {
  try {
    const state = store.getState();
    localStorage.setItem(CART_STORAGE_KEY, state.cart);
  } catch {
    // ignore storage write errors
  }
});


