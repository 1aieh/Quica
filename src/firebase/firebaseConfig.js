// For Firebase JS SDK v7.20.0 and later, measurementId is optional
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyChctzR19-tfhJznpsDzG1_ah0S9V25uso",
  authDomain: "quica-6870a.firebaseapp.com",
  projectId: "quica-6870a",
  storageBucket: "quica-6870a.firebasestorage.app",
  messagingSenderId: "144970803127",
  appId: "1:144970803127:web:42c180c6cf1b29da422a32",
  measurementId: "G-DK4M9LE3G2",
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const auth = getAuth(app);

export { db, auth };
export default firebaseConfig;
