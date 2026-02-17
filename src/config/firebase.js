import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getReactNativePersistence, initializeAuth, getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBJLn0HNv8xrWyNooNsyDm7LEG8at-L_MQ",
  authDomain: "autocard-7abf7.firebaseapp.com",
  projectId: "autocard-7abf7",
  storageBucket: "autocard-7abf7.firebasestorage.app",
  messagingSenderId: "965133769093",
  appId: "1:965133769093:web:a0b73be5220e5875e14cec",
  measurementId: "G-4SQZJCVBY7"
};

// Initialize Firebase via compat (ensures all components register properly)
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const app = firebase.app();

// Initialize modular Auth with AsyncStorage persistence
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} catch (e) {
  // Already initialized (hot reload) — just get existing instance
  auth = getAuth(app);
}

export { auth };
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
