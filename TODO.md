# TODO

## Cart (Redux Toolkit) + Pages

- [x] Create Redux cart slice at `src/features/cart/cartSlice.js`

  - [x] addToCart(product)

  - [x] removeFromCart(id)

  - [x] increaseQuantity(id)

  - [x] decreaseQuantity(id)

  - [x] clearCart()

  - [x] State shape: `cart: { items: [], totalQuantity: 0, totalPrice: 0 }`


- [x] Update store to include cart reducer and enable localStorage persistence
  - [x] Load cart from localStorage on startup
  - [x] Subscribe store changes and save to localStorage

- [x] Connect Header cart badge to Redux `totalQuantity`

- [x] Build Cart page
  - [x] Create `src/pages/Cart/Cart.jsx` + `Cart.css`
  - [x] Create `src/components/CartItem/CartItem.jsx` + `CartItem.css`
  - [x] Create `src/components/CartSummary/CartSummary.jsx` + `CartSummary.css`
  - [x] Empty cart state + continue shopping
  - [x] Cart item controls wired to Redux actions
  - [x] Proceed to checkout navigates to `/checkout`

  - [x] Wire Product Listing “Add to Cart”
  - [x] Update `src/pages/Products/Products.jsx` to dispatch `addToCart(product)`

- [x] Wire Product Details “Add to Cart”
  - [x] Update `src/pages/ProductDetails/ProductDetails.jsx` to dispatch `addToCart`
  - [x] Update `src/components/ProductInfo/ProductInfo.jsx` to call provided handler



- [x] Update Checkout page to display Redux cart data
  - [x] Read `cart.items/totalPrice/totalQuantity`

- [x] Verify functionality
- [x] Add/remove/increase/decrease works
- [x] Header badge updates instantly
- [x] Refresh persists cart
- [x] Cart page + checkout render correctly

