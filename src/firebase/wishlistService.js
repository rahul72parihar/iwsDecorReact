import { doc, getDoc, setDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';

import db from './firestoreDb';

function safeWishlistPayload(wishlist) {
  const items = Array.isArray(wishlist?.items) ? wishlist.items : [];
  return { items };
}

export function wishlistStateDocRef(userUid) {
  return doc(db, 'users', userUid, 'wishlist', 'state');
}

export async function getUserWishlist(userUid) {
  if (!userUid) return null;
  const ref = wishlistStateDocRef(userUid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data();
}

export async function setUserWishlist(userUid, wishlist) {
  if (!userUid) throw new Error('Missing userUid');
  const ref = wishlistStateDocRef(userUid);

  await setDoc(
    ref,
    {
      ...safeWishlistPayload(wishlist),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return true;
}

export async function clearUserWishlist(userUid) {
  if (!userUid) return;
  const ref = wishlistStateDocRef(userUid);
  await deleteDoc(ref).catch(() => {});
}

