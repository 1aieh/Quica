import { makeAutoObservable } from "mobx";
import { searchSpoonacularProducts } from "../api/groceryAPI";
// Import the function to interact with Firestore persistence
import { placeOrderInFirestore } from "../firebase/persistence.js";

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
    // Check if the item already exists in the cart
    const existingItemIndex = this.cart.findIndex(cartItem => cartItem.id === item.id);

    if (existingItemIndex !== -1) {
      // If item exists, increment its quantity
      const updatedCart = [...this.cart];
      const existingItem = updatedCart[existingItemIndex];
      updatedCart[existingItemIndex] = {
        ...existingItem,
        quantity: (existingItem.quantity || 1) + 1
      };
      this.cart = updatedCart;
    } else {
      // If item doesn't exist, add it with quantity 1
      this.cart = [...this.cart, { ...item, quantity: 1 }];
    }

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
    return false; // Indicate failure if cart is empty
  }

  if (!this.user || !this.userProfile) {
    this.setError("User not logged in or profile not loaded.");
    return false; // Indicate failure
  }

  this.setLoading(true); // Indicate loading state
  this.setError(null);   // Clear previous errors

  // Calculate totals and prepare items array for Firestore
  const itemSubtotal = this.cart.reduce((sum, item) => {
    // Ensure we have valid price and quantity
    const price = parseFloat(item.price) || 0;
    const quantity = parseInt(item.quantity) || 1;
    return sum + (price * quantity);
  }, 0);
  
  const deliveryFee = 15; // Example fee, make this dynamic later if needed
  const totalPrice = itemSubtotal + deliveryFee;

  const orderItems = this.cart.map(item => {
    // Ensure all fields have valid values or null
    const itemData = {
      productId: (item.id || '').toString(), // Convert to string, empty string if undefined
      name: item.name || 'Unknown Item',
      price: parseFloat(item.price) || 0,
      quantity: parseInt(item.quantity) || 1,
      imageUrl: item.image || null
    };

    // Validate numeric fields
    if (isNaN(itemData.price)) itemData.price = 0;
    if (isNaN(itemData.quantity)) itemData.quantity = 1;

    return itemData;
  });

  // Ensure user profile data is valid
  const userDisplayName = this.userProfile?.displayName || this.user?.displayName || null;
  const userAddress = this.userProfile?.address || null;
  const userPhone = this.userProfile?.phone || null;

  // Construct the order data object for Firestore
  const orderData = {
    // Requester Info (Denormalized)
    requesterUid: this.user.uid,
    requesterName: userDisplayName,
    requesterAddress: userAddress,
    requesterPhone: userPhone,

    // Order Details
    items: orderItems,
    itemSubtotal: Number(itemSubtotal.toFixed(2)), // Round to 2 decimal places and ensure it's a number
    deliveryFee: Number(deliveryFee.toFixed(2)),
    totalPrice: Number(totalPrice.toFixed(2)),
    status: 'pending', // Initial status

    // Add timestamps
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // Final validation to ensure no undefined values
  Object.keys(orderData).forEach(key => {
    if (orderData[key] === undefined) {
      orderData[key] = null;
    }
  });

  // Call the persistence function to write to Firestore
  placeOrderInFirestore(orderData)
    .then(result => {
      if (result.success) {
        console.log("Model: Order successfully placed in Firestore, ID:", result.orderId);
        this.cart = []; // Clear the cart ONLY on successful placement
        this.orderJustPlaced = true; // Set flag for UI transition
        // No need to update this.requesterOrders here, the listener will do it.
      } else {
        // Error is already set in persistence function
        console.error("Model: Failed to place order in Firestore", result.error);
        // Keep cart as is, maybe show error message
      }
    })
    .finally(() => {
      this.setLoading(false); // Clear loading state regardless of outcome
    });

  // Note: This function becomes asynchronous due to the Firestore call,
  // but we don't necessarily need to return the promise here unless
  // the calling Presenter needs to wait for it. For now, we handle
  // state updates internally based on the promise result.
  // We return true optimistically for the UI flow, error state handles failure.
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
