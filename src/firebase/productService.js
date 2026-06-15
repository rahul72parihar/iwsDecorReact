import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
  setDoc,
  deleteDoc,
  getCountFromServer,
  where,
} from 'firebase/firestore';

import db from './firestoreDb.js';

const PRODUCTS_COLLECTION = 'products';

export function productsCollection() {
  return collection(db, PRODUCTS_COLLECTION);
}

/**
 * Fetch all products (no pagination). Kept for backward compatibility
 * with any existing callers (e.g. export flows, admin selects).
 */
export async function listProducts() {
  const q = query(productsCollection());
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Fetch products by category name.
 *
 * Firestore fields:
 * - category: category name (e.g. "Chandeliers")
 */
export async function getProductsByCategory(categoryName) {
  if (!categoryName) return [];

  const q = query(productsCollection(), where('category', '==', categoryName));
  const snap = await getDocs(q);

  if (!snap.empty) {
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }

  return [];
}

/**
 * Fetch products by category name and subcategory name.
 *
 * Firestore fields:
 * - category: category name (e.g. "Chandeliers")
 * - subcategory: subcategory name (e.g. "Crystal")
 */
export async function getProductsBySubcategory(categoryName, subcategoryName) {
  if (!categoryName || !subcategoryName) return [];

  const q = query(
    productsCollection(),
    where('category', '==', categoryName),
    where('subcategory', '==', subcategoryName)
  );

  const snap = await getDocs(q);

  if (!snap.empty) {
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }

  return [];
}

/**
 * Fetch a single page of products.
 *
 * @param {object}  options
 * @param {number}  options.pageSize      - Items per page. Default 10.
 * @param {import('firebase/firestore').QueryDocumentSnapshot | null} options.after
 *   - The last document snapshot from the previous page (cursor).
 *     Pass `null` / omit for the first page.
 * @param {string}  options.orderByField  - Field to sort by. Default 'name'.
 * @param {'asc'|'desc'} options.direction - Sort direction. Default 'asc'.
 *
 * @returns {Promise<{
 *   items: object[],
 *   cursor: import('firebase/firestore').QueryDocumentSnapshot | null,
 *   hasMore: boolean,
 * }>} 
 */
export async function listProductsPaginated({
  pageSize = 10,
  after = null,
  orderByField = 'name',
  direction = 'asc',
} = {}) {
  const constraints = [
    orderBy(orderByField, direction),
    limit(pageSize + 1), // fetch one extra to detect if there's a next page
  ];

  if (after) {
    constraints.splice(2, 0, startAfter(after));
  }

  const q = query(productsCollection(), ...constraints);
  const snap = await getDocs(q);

  const hasMore = snap.docs.length > pageSize;
  const docs = hasMore ? snap.docs.slice(0, pageSize) : snap.docs;

  return {
    items: docs.map((d) => ({ id: d.id, ...d.data() })),
    // cursor is the raw Firestore snapshot — pass it back as `after` for the next page
    cursor: docs.length > 0 ? docs[docs.length - 1] : null,
    hasMore,
  };
}

/**
 * Get total product count (single aggregation read — very cheap).
 */
export async function getProductCount() {
  const snap = await getCountFromServer(productsCollection());
  return snap.data().count;
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
  const ref = doc(db, PRODUCTS_COLLECTION, productId);
  await setDoc(
    ref,
    { ...data, id: data.id ?? productId },
    { merge: true }
  );
  return getProduct(productId);
}

export async function deleteProduct(productId) {
  if (!productId) return;
  const ref = doc(db, PRODUCTS_COLLECTION, productId);
  await deleteDoc(ref);
}

