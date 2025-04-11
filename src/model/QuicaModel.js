// src/model/QuicaModel.js
import { makeAutoObservable } from "mobx";

class QuicaModelClass {
  // --- State Properties ---

  // Authentication & User state
  user = undefined; // undefined = initial state (checking auth), null = logged out, object = logged in
  userProfile = null; // Holds additional user data from Firestore (role, name, etc.) once loaded

  // Order / Cart state (requester)
  cart = []; // Array of items in the current cart
  requesterOrders = []; // Array of orders placed by the current user

  // Order state (deliverer)
  availableOrders = []; // Array of orders available for pickup
  delivererOrders = []; // Array of orders currently assigned to the deliverer

  // Loading / Error state
  isLoading = false; // General loading indicator
  errorMessage = null; // For displaying errors

  // --- Constructor ---
  constructor() {
    // This makes all properties observable and all methods actions by default.
    // Crucial step for MobX reactivity!
    makeAutoObservable(this);
  }

  // --- Actions (Methods to change state) ---

  // Auth/User Actions
  setUser(firebaseUser) {
    // Called from onAuthStateChanged
    this.user = firebaseUser;
    console.log("Model: User state set", this.user?.uid || null);
  }

  setUserProfile(profileData) {
    // Called after fetching profile from Firestore
    this.userProfile = profileData;
    console.log("Model: User profile set", this.userProfile);
  }

  // Order/Cart Actions (Examples - add more as needed)
  setRequesterOrders(orders) {
    this.requesterOrders = orders;
    console.log("Model: Requester orders set", this.requesterOrders);
  }

  setAvailableOrders(orders) {
    this.availableOrders = orders;
    console.log("Model: Available orders set", this.availableOrders);
  }

  setDelivererOrders(orders) {
    this.delivererOrders = orders;
    console.log("Model: Deliverer orders set", this.delivererOrders);
  }

  addToCart(item) {
    // Example: Needs logic for quantity, duplicates etc.
    this.cart = [...this.cart, item];
    console.log("Model: Item added to cart", item);
  }

  // Utility Actions
  setLoading(isLoading) {
    this.isLoading = isLoading;
  }

  setError(message) {
    this.errorMessage = message;
  }

  clearUserData() {
    // Called on sign-out
    console.log("Model: Clearing user-specific data");
    this.userProfile = null;
    this.cart = [];
    this.requesterOrders = [];
    this.availableOrders = [];
    this.delivererOrders = [];
    this.errorMessage = null;
    // Keep user=null (set by setUser(null))
  }

  // Add more methods here as needed for:
  // - Placing orders
  // - Accepting orders
  // - Updating order status
  // - Removing items from cart
  // - etc.
}

// --- Singleton Instance ---
// Create and export a single instance of the model for the whole app to use
export const myQuicaModel = new QuicaModelClass();