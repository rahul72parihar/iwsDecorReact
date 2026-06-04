import { createContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';

import auth from '../firebase/firebaseAuth';
import {
  signOutUser,
  signInWithEmailPassword,
  signUpWithEmailPassword,
  signInWithGooglePopup,
} from '../firebase/authService';

export const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      // actions
      signUpWithEmailPassword,
      signInWithEmailPassword,
      signInWithGooglePopup,
      signOutUser,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

