// Firebase configuration
// IMPORTANT: Create a Firebase project and fill these values.
// For security, these values are safe to expose in the frontend.
function getEnv(name) {
  // In Vite (browser) we have `import.meta.env`.
  if (import.meta?.env && Object.prototype.hasOwnProperty.call(import.meta.env, name)) {
    return import.meta.env[name];
  }

  // In Node (scripts) `import.meta.env` is undefined; fall back to process.env.
  return process?.env[name];
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
const required = [
  firebaseConfig.apiKey,
  firebaseConfig.authDomain,
  firebaseConfig.projectId,
  firebaseConfig.storageBucket,
  firebaseConfig.messagingSenderId,
  firebaseConfig.appId,
];

if (typeof window === 'undefined') {
  for (const value of required) {
    if (!value) {
      throw new Error('Missing Firebase environment variables');
    }
  }
}



export default firebaseConfig;

