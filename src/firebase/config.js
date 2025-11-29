import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCUwCr-eAq0em5_ESuiF80Nqfr9IZxhgRg",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "antojado-9d910.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "antojado-9d910",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "antojado-9d910.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "462607836002",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:462607836002:web:4188dd9cd8780334bbc23b"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;