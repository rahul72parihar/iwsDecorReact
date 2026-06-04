import { getAuth } from 'firebase/auth';
import app from './firebaseApp';

const auth = getAuth(app);

export default auth;

