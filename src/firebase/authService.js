import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from 'firebase/auth';

import auth from './firebaseAuth';

export async function signUpWithEmailPassword(email, password) {
  return createUserWithEmailAndPassword(auth, email, password);
}

export async function signInWithEmailPassword(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signInWithGooglePopup() {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
}

// If you prefer redirect flow instead of popup, use this:
// import { signInWithRedirect } from 'firebase/auth'
// export async function signInWithGoogleRedirect() {
//   const provider = new GoogleAuthProvider();
//   return signInWithRedirect(auth, provider);
// }

export async function signOutUser() {
  return signOut(auth);
}

