// This module only helps build endpoint URLs from env.
// Endpoints are created in Firebase Functions and must be deployed.

const BASE_URL = import.meta?.env?.VITE_RAZORPAY_FUNCTIONS_BASE_URL || '';


function mustGetBaseUrl() {
  if (!BASE_URL) {
    // eslint-disable-next-line no-console
    console.warn('Missing VITE_RAZORPAY_FUNCTIONS_BASE_URL. Falling back to same origin.');
  }
  return BASE_URL;
}

export function getCreateRazorpayOrderUrl() {
  const base = mustGetBaseUrl();
  // e.g. https://us-central1-<project>.cloudfunctions.net/createRazorpayOrder
  return base ? `${base}/createRazorpayOrder` : '/createRazorpayOrder';
}

export function getVerifyRazorpayPaymentUrl() {
  const base = mustGetBaseUrl();
  return base ? `${base}/verifyRazorpayPayment` : '/verifyRazorpayPayment';
}

