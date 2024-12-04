import { initializeApp } from 'firebase/app';
import { browserLocalPersistence, getAuth, setPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDjaiHWyGV4PjUdaxdNhdta6uXNBNKl6Rs",
  authDomain: "calender-aeca8.firebaseapp.com",
  projectId: "calender-aeca8",
  storageBucket: "calender-aeca8.appspot.com",
  messagingSenderId: "380792314265",
  appId: "1:380792314265:web:77f2c235ba0a212f115b08",
  measurementId: "G-7D5PDZ75P7"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// הגדרת שמירת מצב ההתחברות בדפדפן
setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.error("שגיאה בהגדרת persistence:", error);
  });

export const db = getFirestore(app); 