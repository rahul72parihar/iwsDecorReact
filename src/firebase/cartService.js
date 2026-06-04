import { doc, getDoc, setDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';

import db from './firestoreDb';

function safeCartPayload(cart) {
  // Store only what we need.
  const items = Array.isArray(cart?.items) ? cart.items : [];
  const totalQuantity = Number.isFinite(cart?.totalQuantity) ? cart.totalQuantity : 0;
  const totalPrice = Number.isFinite(cart?.totalPrice) ? cart.totalPrice : 0;
  return { items, totalQuantity, totalPrice };
}

export function cartStateDocRef(userUid) {
  return doc(db, 'users', userUid, 'cart', 'state');
}

export async function getUserCart(userUid) {
  if (!userUid) return null;
  const ref = cartStateDocRef(userUid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data();
}

export async function setUserCart(userUid, cart) {
  if (!userUid) throw new Error('Missing userUid');
  const ref = cartStateDocRef(userUid);

  await setDoc(
    ref,
    {
      ...safeCartPayload(cart),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return true;
}

export async function clearUserCart(userUid) {
  if (!userUid) return;
  const ref = cartStateDocRef(userUid);
  await deleteDoc(ref).catch(() => {});
}

