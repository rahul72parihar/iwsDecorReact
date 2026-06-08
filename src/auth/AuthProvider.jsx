import { createContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';

import auth from '../firebase/firebaseAuth';
import {
  signOutUser,
  signInWithEmailPassword,
  signUpWithEmailPassword,
  signInWithGooglePopup,
} from '../firebase/authService';
import { getUserProfile } from '../firebase/userProfileService';

export const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      
      if (nextUser) {
        try {
          const profile = await getUserProfile(nextUser.uid);
          setUserProfile(profile || {});
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          setUserProfile({});
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const value = useMemo(
    () => ({
      user,
      userProfile,
      loading,
      // actions
      signUpWithEmailPassword,
      signInWithEmailPassword,
      signInWithGooglePopup,
      signOutUser,
    }),
    [user, userProfile, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

