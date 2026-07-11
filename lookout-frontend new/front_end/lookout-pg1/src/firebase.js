// Firebase client-side SDK initialisation
// Populate the corresponding VITE_FIREBASE_* variables in your .env file
// with values from the Firebase console → Project Settings → Your apps.

import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup as fbSignInWithPopup,
  signInWithEmailAndPassword as fbSignInWithEmailAndPassword,
  createUserWithEmailAndPassword as fbCreateUserWithEmailAndPassword,
  sendPasswordResetEmail as fbSendPasswordResetEmail,
  signOut as fbSignOut,
  onAuthStateChanged as fbOnAuthStateChanged,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const isFirebaseConfigured = !!firebaseConfig.apiKey;

let app;
let auth;
let googleProvider;

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
} else {
  console.warn("WARNING: Firebase environment variables are missing. Authentication features will be disabled.");
  app = null;
  auth = {
    currentUser: null,
  };
  googleProvider = {};
}

// Wrapper functions that check config state to avoid crashes
export const onAuthStateChanged = (authInstance, callback) => {
  if (isFirebaseConfigured) {
    return fbOnAuthStateChanged(authInstance, callback);
  } else {
    // Firebase is not configured; trigger callback immediately with null user
    callback(null);
    return () => {};
  }
};

export const signInWithPopup = async (authInstance, provider) => {
  if (isFirebaseConfigured) {
    return fbSignInWithPopup(authInstance, provider);
  }
  throw new Error("Authentication is not configured. Please add Firebase variables to Vercel.");
};

export const signInWithEmailAndPassword = async (authInstance, email, password) => {
  if (isFirebaseConfigured) {
    return fbSignInWithEmailAndPassword(authInstance, email, password);
  }
  throw new Error("Authentication is not configured. Please add Firebase variables to Vercel.");
};

export const createUserWithEmailAndPassword = async (authInstance, email, password) => {
  if (isFirebaseConfigured) {
    return fbCreateUserWithEmailAndPassword(authInstance, email, password);
  }
  throw new Error("Authentication is not configured. Please add Firebase variables to Vercel.");
};

export const sendPasswordResetEmail = async (authInstance, email) => {
  if (isFirebaseConfigured) {
    return fbSendPasswordResetEmail(authInstance, email);
  }
  throw new Error("Authentication is not configured. Please add Firebase variables to Vercel.");
};

export const signOut = async (authInstance) => {
  if (isFirebaseConfigured) {
    return fbSignOut(authInstance);
  }
};

export { auth, googleProvider };
export default app;
