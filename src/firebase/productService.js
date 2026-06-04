import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';

import db from './firestoreDb';

const PRODUCTS_COLLECTION = 'products';

export function productsCollection() {
  return collection(db, PRODUCTS_COLLECTION);
}

export async function listProducts() {
  const q = query(productsCollection());
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getProduct(productId) {
  if (!productId) return null;
  const ref = doc(db, PRODUCTS_COLLECTION, productId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function createOrUpdateProduct(productId, data) {
  if (!productId) throw new Error('Missing productId');

  // Merge so editing doesn’t wipe other fields.
  const ref = doc(db, PRODUCTS_COLLECTION, productId);
  await setDoc(
    ref,
    {
      ...data,
      id: data.id ?? productId,
    },
    { merge: true },
  );

  return getProduct(productId);
}

export async function deleteProduct(productId) {
  if (!productId) return;
  const ref = doc(db, PRODUCTS_COLLECTION, productId);
  await deleteDoc(ref);
}

