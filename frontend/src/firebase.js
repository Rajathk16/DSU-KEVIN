// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// Set these in .env.local (local) or Vercel Dashboard (production)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyChr27SZzJUBWr3Yl4KeAanaxj1UAxLftc",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "kevin-37b3b.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "kevin-37b3b",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "kevin-37b3b.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "638637499517",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:638637499517:web:d4f3d812ffdeb39caafd14",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-WMXRVWRE0X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
