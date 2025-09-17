// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAMYITd3X70Q3XecXE486tp0_qovoR534s",
  authDomain: "gem-prod-91ada.firebaseapp.com",
  projectId: "gem-prod-91ada",
  storageBucket: "gem-prod-91ada.firebasestorage.app",
  messagingSenderId: "780810782870",
  appId: "1:780810782870:web:24ec27c8c1938e69471ab7",
  measurementId: "G-BQGHM99S30"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics (only in browser environment)
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

// Initialize Auth
const auth = getAuth(app);

export { app, analytics, auth };
