import { collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, serverTimestamp, setDoc } from 'firebase/firestore';

import db from './firestoreDb';

export async function getUserProfile(userUid) {
  if (!userUid) return null;
  const ref = doc(db, 'users', userUid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data();
}

export async function listUserProfiles() {
  const q = query(collection(db, 'users'), orderBy('updatedAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, uid: d.id, ...d.data() }));
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

export async function updateUserProfileByAdmin(userUid, data) {
  if (!userUid) throw new Error('Missing userUid');
  const ref = doc(db, 'users', userUid);
  await setDoc(
    ref,
    {
      ...data,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function deleteUserProfile(userUid) {
  if (!userUid) return;
  await deleteDoc(doc(db, 'users', userUid));
}
