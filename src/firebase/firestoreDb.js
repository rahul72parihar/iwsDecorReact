import { getFirestore } from 'firebase/firestore';

import app from './firebaseApp';

// Create Firestore instance.
// Assumes you've enabled Firestore in Firebase console.
const db = getFirestore(app);

export default db;

