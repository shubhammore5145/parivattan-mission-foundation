import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  type User as FirebaseUser,
} from "firebase/auth";
// Firebase configuration for Parivattan Mission Foundation Student Portal
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDFtOnKN39fAphYP9iuJ6v__xDP6ZnhXDY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "parivattan-mission-foundation.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "parivattan-mission-foundation",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "parivattan-mission-foundation.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "553937607563",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:553937607563:web:f9e6d9303ea5589d6ced8e",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-8EP312G1CX",
};

// Safe initialization to prevent multiple apps on hot reloads
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  type FirebaseUser,
};
