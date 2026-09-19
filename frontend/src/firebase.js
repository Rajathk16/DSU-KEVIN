// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyChr27SZzJUBWr3Yl4KeAanaxj1UAxLftc",
  authDomain: "kevin-37b3b.firebaseapp.com",
  projectId: "kevin-37b3b",
  storageBucket: "kevin-37b3b.firebasestorage.app",
  messagingSenderId: "638637499517",
  appId: "1:638637499517:web:d4f3d812ffdeb39caafd14",
  measurementId: "G-WMXRVWRE0X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
