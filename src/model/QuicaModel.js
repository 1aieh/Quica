import { makeAutoObservable } from "mobx";
import { searchSpoonacularProducts } from "../api/groceryAPI";

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
    // Initialize user as null (not logged in) instead of undefined
    this.user = null;
    makeAutoObservable(this);
    console.log("Model: Initialized with user state:", this.user);
  }

  setUser(firebaseUser) {
    console.log("Model: Setting user state", {
      before: this.user?.uid || null,
      after: firebaseUser?.uid || null
    });
    this.user = firebaseUser;
  }

  setUserProfile(profileData) {
    // Called after fetching profile from Firestore
    console.log("Model: Setting user profile", {
      before: this.userProfile,
      after: profileData
    });
    this.userProfile = profileData;
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

  removeFromCart(itemToRemove) {
    this.cart = this.cart.filter(item => item.id !== itemToRemove.id);
    console.log("Model: Item removed from cart", itemToRemove);
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

  async loadGroceryItems(query = 'vegetables') {
    this.setLoading(true);
    this.setError(null);
    
    try {
      const items = await searchSpoonacularProducts(query);
      this.setGroceryItems(items);
    } catch (error) {
      this.setError(error.message || 'Failed to load grocery items');
      console.error('Error loading grocery items:', error);
    } finally {
      this.setLoading(false);
    }
  }
}

export const myQuicaModel = new QuicaModelClass();
