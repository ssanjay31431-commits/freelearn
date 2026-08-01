import { initializeApp } from 'firebase/app';
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

// Initialize Firebase App & Firestore DB
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export {
  app,
  db,
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
  orderBy
};
