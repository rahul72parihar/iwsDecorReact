export function getCheckoutSession() {
  const raw = sessionStorage.getItem('checkout');
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function setCheckoutSession(patch) {
  const prev = getCheckoutSession();
  const next = { ...prev, ...patch };
  sessionStorage.setItem('checkout', JSON.stringify(next));
  return next;
}

export function clearCheckoutSession() {
  sessionStorage.removeItem('checkout');
}

