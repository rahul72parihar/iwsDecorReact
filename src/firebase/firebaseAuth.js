import { getAuth } from 'firebase/auth';
import app from './firebaseApp.js';

const auth = getAuth(app);

export default auth;

