import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

import db from './firestoreDb';

export async function getUserProfile(userUid) {
  if (!userUid) return null;
  const ref = doc(db, 'users', userUid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data();
}

export async function upsertUserProfile(userUid, data) {
  if (!userUid) throw new Error('Missing userUid');

  const ref = doc(db, 'users', userUid);

  // Merge fields so existing data isn't lost.
  await setDoc(
    ref,
    {
      ...data,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  // Read back not required for UI; caller can optimistically update.
  return true;
}

