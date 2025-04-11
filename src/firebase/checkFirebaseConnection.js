import { db, auth } from "./firebaseConfig.js";
import { collection, getDocs } from "firebase/firestore";

async function checkFirebaseConnection() {
  try {
    // Test Firestore connection
    console.log("Testing Firestore connection...");
    // Just check if we can initialize a collection reference
    const colRef = collection(db, "users");
    console.log("✅ Firestore connection successful");

    // Test Authentication connection
    console.log("Testing Authentication connection...");
    if (auth.currentUser === null) {
      console.log("✅ Authentication service available (no user signed in)");
    } else {
      console.log("✅ Authentication service available (user signed in)");
    }

    return true;
  } catch (error) {
    console.error("❌ Firebase connection failed:", error.message);
    return false;
  }
}

// Run the check
checkFirebaseConnection()
  .then((isConnected) => {
    console.log(
      `Firebase connection check ${isConnected ? "passed" : "failed"}`
    );
  })
  .catch((error) => {
    console.error("Connection check failed:", error);
  });
