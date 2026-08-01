import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';

// Live Firebase Web Configuration for vibeagency Project
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyAMY9CBmJjOb8cRV0WfPYbpyGcn1uORJck',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'vibeagency.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'vibeagency',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'vibeagency.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '463808537588',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:463808537588:web:d0cde051d739151124cfa1',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-8R3NFNV19F'
};

// Initialize Firebase App, Auth & Firestore DB
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Configure Google OAuth Provider to force Account Chooser screen
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export const logAnalyticsEvent = (eventName, eventParams = {}) => {
  console.log(`[Firebase Analytics Event]: ${eventName}`, eventParams);
};

export {
  app,
  auth,
  db,
  googleProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  orderBy
};
