import { getStorage } from 'firebase/storage';

import app from './firebaseApp';

const storage = getStorage(app);

export default storage;

