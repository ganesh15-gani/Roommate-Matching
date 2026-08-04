import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyB6CzqxGiTaj8KA4eDAVKv32KOW7GK1fuU",
  authDomain: "stayzen1.firebaseapp.com",
  projectId: "stayzen1",
  storageBucket: "stayzen1.firebasestorage.app",
  messagingSenderId: "1074259914147",
  appId: "1:1074259914147:web:840b2054bec16596033e16",
  measurementId: "G-FDVTLKSQKJ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const storage = getStorage(app);
