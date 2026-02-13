import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, onSnapshot as onDocSnapshot } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { registerForPushNotifications } from '../services/notificationService';

const AppContext = createContext(null);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    let userDocUnsubscribe = null;

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);

      // Clean up previous user doc listener
      if (userDocUnsubscribe) {
        userDocUnsubscribe();
        userDocUnsubscribe = null;
      }

      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        // Real-time listener on user doc so stats update instantly
        userDocUnsubscribe = onDocSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserData(data);
            setIsAdmin(data.role === 'admin');
          }
          setLoading(false);
        }, (error) => {
          console.error('Error listening to user data:', error);
          setLoading(false);
        });

        // Register for push notifications
        registerForPushNotifications(firebaseUser.uid);
      } else {
        setUserData(null);
        setIsAdmin(false);
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      if (userDocUnsubscribe) userDocUnsubscribe();
    };
  }, []);

  useEffect(() => {
    // Lightweight JS-only connectivity check (no native module needed)
    let interval;
    const checkConnection = async () => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        await fetch('https://clients3.google.com/generate_204', {
          method: 'HEAD',
          signal: controller.signal,
        });
        clearTimeout(timeout);
        setIsOnline(true);
      } catch {
        setIsOnline(false);
      }
    };
    checkConnection();
    interval = setInterval(checkConnection, 15000);
    return () => clearInterval(interval);
  }, []);

  const refreshUserData = async () => {
    if (user) {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);
          setIsAdmin(data.role === 'admin');
        }
      } catch (error) {
        console.error('Error refreshing user data:', error);
      }
    }
  };

  const value = {
    user,
    userData,
    loading,
    isAdmin,
    isDark: true, // Always dark theme
    isOnline,
    refreshUserData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
