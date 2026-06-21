// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBLaWIMZTQd46ZzFkdIWTcs4M3AfvmLvtk",
  authDomain: "support-desk-7479b.firebaseapp.com",
  projectId: "support-desk-7479b",
  storageBucket: "support-desk-7479b.firebasestorage.app",
  messagingSenderId: "116449296919",
  appId: "1:116449296919:web:7cdeed3e6743ba95545252",
  measurementId: "G-25PX360BMW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
if (typeof window !== "undefined") window.__firebaseAuth = auth;
