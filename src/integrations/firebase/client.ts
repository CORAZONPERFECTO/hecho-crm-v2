import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyBjuhU47D7f3tGlsh_z4INwf1pmDFvxWrs",
    authDomain: "apphechosrl.firebaseapp.com",
    projectId: "apphechosrl",
    storageBucket: "apphechosrl.firebasestorage.app",
    messagingSenderId: "63203392566",
    appId: "1:63203392566:web:e685fc33618e273225ec97"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
