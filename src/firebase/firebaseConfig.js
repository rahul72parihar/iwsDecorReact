// Firebase configuration
// IMPORTANT: Create a Firebase project and fill these values.
// For security, these values are safe to expose in the frontend.

function getEnv(name) {
  // In Vite, values are available via import.meta.env.
  // In Node (seed script), values are provided via process.env.
  // eslint-disable-next-line no-undef
  const viteEnv = typeof import.meta !== 'undefined' ? import.meta.env?.[name] : undefined;
  const nodeEnv = process.env?.[name];
  return nodeEnv ?? viteEnv;
}

const firebaseConfig = {
  apiKey: getEnv('VITE_FIREBASE_API_KEY'),
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnv('VITE_FIREBASE_APP_ID'),
  measurementId: 'G-NGNPBMYXXL',
};

// Optional: fail fast when running in Node seed context.
for (const k of [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
]) {
  if (!firebaseConfig[k === 'VITE_FIREBASE_API_KEY' ? 'apiKey' : k]) {
    // don't throw in browser build
    if (typeof window === 'undefined') {
      // eslint-disable-next-line no-throw-literal
      throw new Error(`Missing env var for ${k}`);
    }
  }
}



export default firebaseConfig;

