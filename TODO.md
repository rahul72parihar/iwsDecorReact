# TODO - Cart & Wishlist integrated with Firebase

## Step 1: Create Firestore services
- [ ] Create `src/firebase/cartService.js` with: `getUserCart`, `setUserCart`, `clearUserCart`
- [ ] Create `src/firebase/wishlistService.js` with: `getUserWishlist`, `setUserWishlist`, `clearUserWishlist`

## Step 2: Add Redux <-> Firestore sync
- [ ] Create `src/features/cart/CartWishlistSync.jsx` component that:
  - loads cart/wishlist from Firestore into Redux when user logs in
  - pushes Redux cart/wishlist changes to Firestore when user exists
  - uses debounce to avoid excessive writes

## Step 3: Wire sync component into app
- [ ] Mount sync component inside `src/App.jsx` under `AuthProvider`

## Step 4: Adjust localStorage persistence
- [ ] Update `src/store/index.js` so localStorage persistence doesn’t override Firestore when user is logged in
  - keep localStorage for logged-out users

## Step 5: Validate
- [ ] Verify login loads Firestore cart/wishlist
- [ ] Verify cart/wishlist persist after refresh
- [ ] Verify logged-out flow still uses localStorage

