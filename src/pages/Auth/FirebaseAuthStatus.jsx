import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';

import auth from '../../firebase/firebaseAuth';

// Optional helper component you can reuse for debugging.
export default function FirebaseAuthStatus() {
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUserEmail(user?.email || '');
    });
    return () => unsub();
  }, []);

  return <div style={{ display: 'none' }}>{userEmail}</div>;
}

