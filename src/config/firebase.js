import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from '@react-native-async-storage/async-storage';

// TODO: Replace with your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBJLn0HNv8xrWyNooNsyDm7LEG8at-L_MQ",
  authDomain: "autocard-7abf7.firebaseapp.com",
  projectId: "autocard-7abf7",
  storageBucket: "autocard-7abf7.firebasestorage.app",
  messagingSenderId: "965133769093",
  appId: "1:965133769093:web:a0b73be5220e5875e14cec",
  measurementId: "G-4SQZJCVBY7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services with AsyncStorage persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
