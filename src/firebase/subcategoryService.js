import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  getCountFromServer,
} from 'firebase/firestore';

import db from './firestoreDb.js';

/**
 * NOTE:
 * Subcategories are stored embedded on the category document as `subcategories: string[]`.
 * This service provides helper operations by reading/updating the category doc.
 */

const CATEGORIES_COLLECTION = 'categories';

function categoriesCollection() {
  return collection(db, CATEGORIES_COLLECTION);
}

function categoryDoc(categoryId) {
  return doc(db, CATEGORIES_COLLECTION, categoryId);
}

export async function getCategorySubcategories(categoryId) {
  const ref = categoryDoc(categoryId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data();
  return Array.isArray(data?.subcategories) ? data.subcategories : [];
}

export async function upsertCategorySubcategories(categoryId, subcategories) {
  if (!categoryId) throw new Error('Missing categoryId');
  const ref = categoryDoc(categoryId);
  const next = Array.isArray(subcategories) ? subcategories : [];
  await setDoc(ref, { subcategories: next }, { merge: true });
  return getCategorySubcategories(categoryId);
}

export async function deleteCategoryIfNoProducts(categoryId, { productService } = {}) {
  // This is intentionally left as a thin helper; actual product-check happens in the admin page.
  // Kept here so future refactors can centralize logic.
  const ref = categoryDoc(categoryId);
  await deleteDoc(ref);
}

