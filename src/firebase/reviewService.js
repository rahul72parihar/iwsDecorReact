import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';

import db from './firestoreDb';

const REVIEWS_COLLECTION = 'reviews';

function reviewsCollection() {
  return collection(db, REVIEWS_COLLECTION);
}

export async function listReviewsForAdmin({ pageSize = 100 } = {}) {
  const q = query(reviewsCollection(), orderBy('createdAt', 'desc'), limit(pageSize));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function createReview(data) {
  const payload = {
    productId: (data.productId || '').trim(),
    productName: (data.productName || '').trim(),
    customerName: (data.customerName || '').trim(),
    customerEmail: (data.customerEmail || '').trim(),
    rating: Number(data.rating) || 5,
    text: (data.text || '').trim(),
    status: data.status || 'approved',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const ref = await addDoc(reviewsCollection(), payload);
  return ref.id;
}

export async function listApprovedReviewsForProduct(productId, { pageSize = 100 } = {}) {
  if (!productId) return [];

  const q = query(
    reviewsCollection(),
    orderBy('createdAt', 'desc'),
    limit(pageSize)
  );

  // Firestore doesn't support !=/== for nested combos without composite index.
  // We'll filter in memory (acceptable for small review sets).
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((r) => r.productId === productId && r.status === 'approved');
}


export async function updateReview(reviewId, data) {
  if (!reviewId) throw new Error('Missing reviewId');
  await updateDoc(doc(db, REVIEWS_COLLECTION, reviewId), {
    ...data,
    rating: Number(data.rating) || 5,
    updatedAt: serverTimestamp(),
  });
}

export async function updateReviewStatus(reviewId, status) {
  if (!reviewId) throw new Error('Missing reviewId');
  if (!status) throw new Error('Missing status');
  await updateDoc(doc(db, REVIEWS_COLLECTION, reviewId), {
    status,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteReview(reviewId) {
  if (!reviewId) return;
  await deleteDoc(doc(db, REVIEWS_COLLECTION, reviewId));
}
