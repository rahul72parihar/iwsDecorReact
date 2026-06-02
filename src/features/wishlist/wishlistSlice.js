import { createSlice } from '@reduxjs/toolkit';

function normalizeProduct(product) {
  if (!product || product.id == null) return null;
  return {
    id: product.id,
    name: product.name,
    image: product.image,
    category: product.category,
    price: product.price,
    oldPrice: product.oldPrice,
    rating: product.rating,
    inStock: product.inStock,
    tags: product.tags,
  };
}

const initialState = {
  items: [],
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    toggleWishlist: (state, action) => {
      const product = normalizeProduct(action.payload);
      if (!product) return;

      const idx = state.items.findIndex((i) => i.id === product.id);
      if (idx >= 0) {
        state.items.splice(idx, 1);
      } else {
        state.items.push(product);
      }
    },

    removeFromWishlist: (state, action) => {
      const id = action.payload;
      state.items = state.items.filter((i) => i.id !== id);
    },

    clearWishlist: (state) => {
      state.items = [];
    },
  },
});

export const { toggleWishlist, removeFromWishlist, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;

