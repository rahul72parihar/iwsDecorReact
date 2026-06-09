import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
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
  const q = query(categoriesCollection(), orderBy('createdAt', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
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

