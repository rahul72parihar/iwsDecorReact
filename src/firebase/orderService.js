import { addDoc, collection, doc, getDoc, getDocs, limit, orderBy, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';


import db from './firestoreDb';

function getOrdersCol() {
  return collection(db, 'orders');
}

export async function createOrder({ userUid, shippingAddress, paymentMethod, items, totals }) {
  if (!userUid) throw new Error('Missing userUid');
  if (!shippingAddress) throw new Error('Missing shippingAddress');
  if (!paymentMethod) throw new Error('Missing paymentMethod');

  const payload = {
    userUid,
    shippingAddress,
    paymentMethod,
    items: Array.isArray(items) ? items : [],
    totals: totals ?? {},

    status: paymentMethod === 'online_demo' ? 'pending' : 'placed',

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const orderRef = await addDoc(getOrdersCol(), payload);
  return orderRef.id;
}

export async function getOrdersForUser(userUid, { pageSize = 20 } = {}) {
  if (!userUid) return [];

  // IMPORTANT:
  // This query previously used `orderBy('createdAt')` together with `where('userUid')`.
  // Depending on the project/index configuration, Firestore may require a composite index
  // and the UI fails entirely. To keep the user Orders page working reliably,
  // we fetch the filtered results and sort in memory.

  const q = query(getOrdersCol(), where('userUid', '==', userUid), limit(pageSize));
  const snap = await getDocs(q);

  const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

  docs.sort((a, b) => {
    const aTs = a?.createdAt?.toMillis ? a.createdAt.toMillis() : a?.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0;
    const bTs = b?.createdAt?.toMillis ? b.createdAt.toMillis() : b?.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0;
    return bTs - aTs;
  });

  return docs;
}


export async function markOrderPaid(orderId, { paid = true } = {}) {
  if (!orderId) return;
  const ref = doc(db, 'orders', orderId);
  await updateDoc(ref, {
    status: paid ? 'paid' : 'payment_failed',
    updatedAt: serverTimestamp(),
  });
}

export async function listOrdersForAdmin({ pageSize = 100 } = {}) {
  const q = query(getOrdersCol(), orderBy('createdAt', 'desc'), limit(pageSize));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getOrderByIdForAdmin(orderId) {
  if (!orderId) return null;
  const snap = await getDoc(doc(db, 'orders', orderId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function updateOrderStatus(orderId, status) {
  if (!orderId) throw new Error('Missing orderId');
  if (!status) throw new Error('Missing status');

  const ref = doc(db, 'orders', orderId);
  await updateDoc(ref, {
    status,
    updatedAt: serverTimestamp(),
  });
}

export async function getOrderByIdForUser(userUid, orderId) {
  if (!userUid || !orderId) return null;

  // Keep this constrained by userUid so users can only read their own orders.
  const q = query(collection(db, 'orders'), where('userUid', '==', userUid), where('__name__', '==', orderId));
  const snap = await getDocs(q);
  const doc0 = snap.docs[0];
  if (!doc0) return null;
  return { id: doc0.id, ...doc0.data() };
}
