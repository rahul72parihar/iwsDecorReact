import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  setDoc,
  getCountFromServer,
  orderBy,
} from 'firebase/firestore';


import db from './firestoreDb.js';

const CATEGORIES_COLLECTION = 'categories';

export function categoriesCollection() {
  return collection(db, CATEGORIES_COLLECTION);
}

/**
 * List all categories.
 * Stored fields are kept generic so storefront/admin can evolve.
 */
export async function listCategories() {
  try {
    const q = query(categoriesCollection(), orderBy('createdAt', 'asc'));
    const snap = await getDocs(q);
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    if (items.length > 0) return items;
  } catch {
    // Fall through to an unordered fetch when ordering fails or returns nothing.
  }

  const snap = await getDocs(categoriesCollection());
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// NOTE: kept for backward-compat with earlier/alternate callers
export async function getCategories() {
  const snapshot = await getDocs(collection(db, 'categories'));

  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));
}


export async function getCategoryCount() {
  const snap = await getCountFromServer(categoriesCollection());
  return snap.data().count;
}

export async function getCategory(categoryId) {
  if (!categoryId) return null;
  const ref = doc(db, CATEGORIES_COLLECTION, categoryId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

/**
 * Get a category document by its slug field.
 * Slug is expected to be stored as `slug` inside each category document.
 */
export async function getCategoryBySlug(slug) {
  if (!slug) return null;

  const normalized = String(slug).trim();

  // NOTE: categories are likely small; we do a query by slug
  // instead of requiring docId==slug.
  const q = query(categoriesCollection(), where('slug', '==', normalized));

  const snap = await getDocs(q);
  if (snap.empty) return null;

  const docSnap = snap.docs[0];
  return { id: docSnap.id, ...docSnap.data() };
}









/**
 * Upsert category.
 * - categoryId is the document id.


 * - data is merged.
 */
export async function createOrUpdateCategory(categoryId, data) {
  if (!categoryId) throw new Error('Missing categoryId');

  const ref = doc(db, CATEGORIES_COLLECTION, categoryId);

  const payload = {
    ...data,
    id: data?.id ?? categoryId,
  };

  await setDoc(ref, payload, { merge: true });
  return getCategory(categoryId);
}

export async function deleteCategory(categoryId) {
  if (!categoryId) return;
  const ref = doc(db, CATEGORIES_COLLECTION, categoryId);
  await deleteDoc(ref);
}

