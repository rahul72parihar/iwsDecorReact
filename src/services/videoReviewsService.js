import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import db from '../firebase/firestoreDb';

const COLLECTION = 'videoReviews';

export async function getVideoReviews() {
  try {
    const q = query(
      collection(db, COLLECTION),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching video reviews:', error);
    throw error;
  }
}

export async function addVideoReview(reviewData) {
  try {
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...reviewData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding video review:', error);
    throw error;
  }
}

export async function updateVideoReview(reviewId, reviewData) {
  try {
    const reviewRef = doc(db, COLLECTION, reviewId);
    await updateDoc(reviewRef, {
      ...reviewData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating video review:', error);
    throw error;
  }
}

export async function deleteVideoReview(reviewId) {
  try {
    await deleteDoc(doc(db, COLLECTION, reviewId));
  } catch (error) {
    console.error('Error deleting video review:', error);
    throw error;
  }
}
