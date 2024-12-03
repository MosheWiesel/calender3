import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDjaiHWyGV4PjUdaxdNhdta6uXNBNKl6Rs",
  authDomain: "calender-aeca8.firebaseapp.com",
  projectId: "calender-aeca8",
  storageBucket: "calender-aeca8.firebasestorage.app",
  messagingSenderId: "380792314265",
  appId: "1:380792314265:web:77f2c235ba0a212f115b08",
  measurementId: "G-7D5PDZ75P7"
};

// אתחול Firebase
const app = initializeApp(firebaseConfig);

// ייצוא שירותים
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app; 