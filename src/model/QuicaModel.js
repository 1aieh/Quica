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
  orderJustPlaced = false; // Flag to track if an order was just placed

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
    this.orderJustPlaced = false;
  }

  placeOrder() {
    if (this.cart.length === 0) {
      this.setError("Cannot place order with empty cart");
      return false;
    }

    const cartValue = this.cart.reduce((sum, item) => sum + item.rawPrice, 0);

    // Create order object matching the desired structure
    const newOrder = {
      id: Date.now().toString(), // Temporary ID, ensure it's a string
      items: this.cart.map(item => ({ name: item.name, price: item.rawPrice })), // Simplified item structure for the order
      cart_value: cartValue,
      status: 'Unassigned',
      price: cartValue, // Placeholder: Price might include delivery fee later
      payment: 'null', // Default payment status
      rider_id: null, // No rider assigned yet
      user_id: this.user?.uid,
      user_address: this.userProfile?.address || 'Address not set', // Placeholder, get from profile if available
      created_at: new Date().toISOString(), // Use ISO string for now, Firebase uses Timestamps
      // We might still want the full item details somewhere if needed for display later,
      // but requesterOrders should primarily hold the defined structure.
      // Let's add the original items under a different key for now.
      _originalCartItems: [...this.cart] 
    };

    this.requesterOrders = [...this.requesterOrders, newOrder];
    this.cart = []; // Clear the cart
    this.orderJustPlaced = true;
    console.log("Model: Order placed", newOrder);
    return true;
  }

  resetOrderPlacedStatus() {
    this.orderJustPlaced = false;
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
