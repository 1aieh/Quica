import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebaseConfig.js";
import { myQuicaModel } from "../model/QuicaModel.js";

// Initialize auth state listener
const initializeAuthListener = () => {
  console.log("Initializing auth state listener...");
  
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    console.log("Auth state changed:", user?.uid || "signed out");
    
    if (user) {
      // User is signed in
      myQuicaModel.setUser(user);
      // TODO: Load user profile from Firestore when implemented
      // For now, just set a basic profile
      myQuicaModel.setUserProfile({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        role: "requester", // Default role for now
      });
    } else {
      // User is signed out
      myQuicaModel.setUser(null);
      myQuicaModel.clearUserData();
    }
  });

  return unsubscribe;
};

// Initialize the auth listener immediately
initializeAuthListener();

export { auth };
