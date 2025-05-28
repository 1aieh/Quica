// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

console.log("🔍 Starting Firebase configuration load...");

// With Vite, we use import.meta.env for environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_MEASUREMENT_ID,
};

// Log environment variable status
console.log("📝 Firebase config check:", {
  hasApiKey: !!firebaseConfig.apiKey,
  hasAuthDomain: !!firebaseConfig.authDomain,
  hasProjectId: !!firebaseConfig.projectId,
  hasStorageBucket: !!firebaseConfig.storageBucket,
  hasMessagingSenderId: !!firebaseConfig.messagingSenderId,
  hasAppId: !!firebaseConfig.appId
});

// Ensure required variables are loaded
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error("❌ Missing required Firebase configuration!");
  throw new Error(
    "❌ Firebase environment variables not found! Make sure you have a .env.local file with the required VITE_* environment variables."
  );
}

console.log("🚀 Initializing Firebase app...");
const app = initializeApp(firebaseConfig);

console.log("📚 Initializing Firestore...");
const db = getFirestore(app);

console.log("🔐 Initializing Authentication...");
const auth = getAuth(app);
if (!auth) {
  console.error("❌ Authentication initialization failed!");
  throw new Error("Authentication failed to initialize");
}

console.log("✅ Firebase initialization complete!");

// Add network status monitoring
window.addEventListener('online', () => console.log('🌐 Network connection restored'));
window.addEventListener('offline', () => console.log('⚠️ Network connection lost'));

export { db, auth };
export default firebaseConfig; // You might not need this default export for the check script
