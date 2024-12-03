import {
    GoogleAuthProvider,
    User,
    onAuthStateChanged,
    signInWithPopup,
    signOut
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const googleProvider = new GoogleAuthProvider();

const createUserDocument = async (user: User) => {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        await setDoc(userRef, {
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            role: 'user', // או 'admin' למנהל
            createdAt: new Date()
        });
    }
};

export const authService = {
    async loginWithGoogle() {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            await createUserDocument(result.user);
            return result.user;
        } catch (error) {
            console.error('Error logging in with Google:', error);
            throw error;
        }
    },

    async logout() {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Error logging out:', error);
            throw error;
        }
    },

    onAuthStateChange(callback: (user: User | null) => void) {
        return onAuthStateChanged(auth, callback);
    },

    getCurrentUser() {
        return auth.currentUser;
    }
}; 