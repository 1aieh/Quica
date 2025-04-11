import { db, auth } from "./firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

async function checkFirebaseConnection() {
  try {
    // Test Firestore connection
    console.log("Testing Firestore connection...");
    const testQuery = await getDocs(collection(db, "test-collection"));
    console.log("✅ Firestore connection successful");

    // Test Authentication connection
    console.log("Testing Authentication connection...");
    (await auth.signInWithCustomToken)
      ? console.log("✅ Authentication service available")
      : console.log("❌ Authentication service unavailable");

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
