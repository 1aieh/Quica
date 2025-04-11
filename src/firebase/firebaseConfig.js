// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import dotenv from "dotenv"; // Import dotenv

dotenv.config({ path: '.env.local' }); // Load variables from .env.local file into process.env

// Access variables via process.env INSTEAD of import.meta.env
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_MEASUREMENT_ID,
};

// Ensure required variables are loaded
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error(
    "❌ Firebase environment variables not found! Make sure you have a .env file in the project root and it's loaded correctly."
  );
  process.exit(1); // Exit if config is incomplete
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
export default firebaseConfig; // You might not need this default export for the check script
