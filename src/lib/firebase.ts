import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Your Firebase configuration

const firebaseConfig = {
    apiKey: "AIzaSyD_AC1GKLlwLsjYjUP03WdiqcwwahkEPFE",
    authDomain: "gem-2025-1f813.firebaseapp.com",
    projectId: "gem-2025-1f813",
    storageBucket: "gem-2025-1f813.firebasestorage.app",
    messagingSenderId: "894935835168",
    appId: "1:894935835168:web:71b57de701fd014160d245",
    measurementId: "G-0LLNKLQW2J"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app; 