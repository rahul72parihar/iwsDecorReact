# Razorpay 404 / endpoint configuration fix

## Goal
Fix frontend `POST /createRazorpayOrder 404` by ensuring Vite calls the correct deployed Firebase Function URL (not the Vite dev server).

## Steps
1. Read existing `.env` and determine whether `VITE_RAZORPAY_FUNCTIONS_BASE_URL` exists.
2. Add `VITE_RAZORPAY_FUNCTIONS_BASE_URL` to `.env` (do not commit secrets).
3. Restart Vite dev server.
4. Re-test checkout online payment.
5. If still failing, verify that Firebase functions are deployed and that routes match `createRazorpayOrder` and `verifyRazorpayPayment`.

