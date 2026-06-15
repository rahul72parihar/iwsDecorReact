# TODO

## Checkout: “Could not place the order. Please try again.”

- [x] Inspect checkout/payment flow and locate generic error message.
- [x] Update `src/pages/Checkout/Payment.jsx` to include the real failure message (from thrown Error) so the UI shows create/verify Razorpay failure reasons.
- [ ] Reproduce failure in browser to capture the displayed error detail.
- [ ] If error indicates missing/invalid Razorpay config or invalid signature, update `functions/index.js` accordingly and ensure returned JSON error details are consistent.
- [ ] Rebuild and re-test COD and Online checkout flows.


