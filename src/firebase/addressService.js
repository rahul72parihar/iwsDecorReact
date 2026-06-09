import { addDoc, collection, deleteDoc, doc, getDocs, getDoc, query, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';

import db from './firestoreDb';

function normalizeAddress(address) {
  // Keep it permissive; only validate in UI.
  return {
    fullName: address?.fullName ?? '',
    phone: address?.phone ?? '',
    line1: address?.line1 ?? '',
    line2: address?.line2 ?? '',
    city: address?.city ?? '',
    state: address?.state ?? '',
    pincode: address?.pincode ?? '',
    country: address?.country ?? 'India',
    landmark: address?.landmark ?? '',
  };
}

function addressRef(userUid) {
  if (!userUid) throw new Error('Missing userUid');
  return collection(db, 'users', userUid, 'addresses');
}

export async function listAddresses(userUid) {
  const col = addressRef(userUid);
  const snap = await getDocs(query(col));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getAddress(userUid, addressId) {
  if (!userUid || !addressId) return null;
  const ref = doc(db, 'users', userUid, 'addresses', addressId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function addAddress(userUid, address) {
  const col = addressRef(userUid);
  const payload = normalizeAddress(address);

  const docRef = await addDoc(col, {
    ...payload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function updateAddress(userUid, addressId, address) {
  if (!userUid || !addressId) throw new Error('Missing parameters');
  const ref = doc(db, 'users', userUid, 'addresses', addressId);
  const payload = normalizeAddress(address);

  await updateDoc(ref, {
    ...payload,
    updatedAt: serverTimestamp(),
  });

  return true;
}

export async function deleteAddress(userUid, addressId) {
  if (!userUid || !addressId) return;
  const ref = doc(db, 'users', userUid, 'addresses', addressId);
  await deleteDoc(ref);
}

export async function getDefaultAddressId(userUid) {
  if (!userUid) return null;
  const ref = doc(db, 'users', userUid, 'addressesMeta', 'meta');
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data()?.defaultAddressId ?? null;
}

export async function setDefaultAddressId(userUid, addressId) {
  if (!userUid || !addressId) throw new Error('Missing parameters');
  const ref = doc(db, 'users', userUid, 'addressesMeta', 'meta');
  await setDoc(
    ref,
    {
      defaultAddressId: addressId,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

