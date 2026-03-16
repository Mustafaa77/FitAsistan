// Mock Firebase implementation for UI testing
export const auth = {
  currentUser: null,
  onAuthStateChanged: (callback) => {
    // Simulate no user logged in
    callback(null);
    return () => {};
  },
  signInWithEmailAndPassword: async (email, password) => {
    console.log("Mock Sign In:", email);
    return { user: { email, displayName: "Test User" } };
  },
  createUserWithEmailAndPassword: async (email, password) => {
    console.log("Mock Register:", email);
    return { user: { email, displayName: "New User" } };
  },
  updateProfile: async (user, profile) => {
    console.log("Mock Update Profile:", profile);
    return true;
  }
};

// Original Firebase imports commented out to avoid initialization errors
/*
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
*/
