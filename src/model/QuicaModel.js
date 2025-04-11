import { makeAutoObservable } from "mobx";

class QuicaModelClass {
  //state
  user = undefined;
  userProfile = null;
  groceryItems = [];
  isLoading = false;
  errorMessage = null;

  cart = []; // Array of items in the current cart
  requesterOrders = []; // Array of orders placed by the current user

  availableOrders = []; // Array of orders available for pickup
  delivererOrders = []; // Array of orders currently assigned to the deliverer

  constructor() {
    makeAutoObservable(this);
  }

  setUser(firebaseUser) {
    this.user = firebaseUser;
    console.log("Model: User state set", this.user?.uid || null);
  }

  setUserProfile(profileData) {
    // Called after fetching profile from Firestore
    this.userProfile = profileData;
    console.log("Model: User profile set", this.userProfile);
  }

  setGroceryItems(items) {
    this.groceryItems = items;
    console.log("Model: Grocery items set", this.groceryItems);
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
    console.log("Model: Clearing user-specific data");
    this.userProfile = null;
    this.groceryItems = [];
    this.cart = [];
    this.requesterOrders = [];
    this.availableOrders = [];
    this.delivererOrders = [];
    this.errorMessage = null;
  }

  // Add more methods here as needed for:
  // - Placing orders
  // - Accepting orders
  // - Updating order status
  // - Removing items from cart
  // - etc.
}

export const myQuicaModel = new QuicaModelClass();
