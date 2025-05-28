import { makeAutoObservable, runInAction } from "mobx";
import { searchSpoonacularProducts } from "../api/groceryAPI";
// Import the function to interact with Firestore persistence
import { placeOrderInFirestore, updateOrderStatus, updateUserProfile, assignOrderToDeliverer, deleteOrderFromFirestore } from "../firebase/persistence.js";

class QuicaModelClass {
  //state
  user = undefined;
  userProfile = null;
  groceryItems = [];
  isLoading = false;
  errorMessage = null;
  isProfileSetupComplete = false;
  authInitialized = false;
  isLoadingInitialOrderCheck = true; // Add this state

  cart = []; // Array of items in the current cart
  requesterOrders = []; // Array of orders placed by the current user
  viewMode = 'order'; // Current view mode ('order' or 'deliver')
  
  // Order tracking state
  currentlyTrackedOrder = null; // Full data of the active order being tracked
  orderListenerUnsubscribe = null; // Function to unsubscribe from Firestore listener
  orderCancellationInProgress = false; // Tracks cancellation action state
  orderCancellationError = null; // Stores cancellation errors

  // Deliverer state
  availableOrders = []; // Array of orders available for pickup
  delivererOrders = []; // Array of orders currently assigned to the deliverer
  acceptingOrderId = null; // ID of order currently being accepted
  acceptOrderError = null; // Error message if accepting order fails
  updatingOrderStatusId = null; // ID of order whose status is being updated
  updateOrderStatusError = null; // Error message if updating status fails

  // Admin state
  adminActiveOrders = []; // Array of orders for admin panel

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

  setAuthInitialized(value) {
    console.log("Model: Setting auth initialized:", value);
    this.authInitialized = value;
  }

  setLoadingInitialOrderCheck(value) { // Add this setter
    this.isLoadingInitialOrderCheck = value;
  }

  setUserProfile(profileData) {
    // Called after fetching profile from Firestore
    console.log("Model: Setting user profile", {
      before: this.userProfile,
      after: profileData
    });
    this.userProfile = profileData;
    // Update profile completion status based on required fields
    this.isProfileSetupComplete = !!(profileData?.address && profileData?.phone && profileData?.role);
  }

  setProfileSetupComplete(isComplete) {
    this.isProfileSetupComplete = isComplete;
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
    console.log("DEBUG: setAvailableOrders called with:", orders); // DEBUG LOG
    this.availableOrders = orders;
    console.log("Model: Available orders set", this.availableOrders);
  }

  setDelivererOrders(orders) {
    this.delivererOrders = orders;
    console.log("Model: Deliverer orders set", this.delivererOrders);
  }

  // Constants
  static DELIVERY_FEE = 15;

  addToCart(item) {
    const existingItemIndex = this.cart.findIndex(cartItem => cartItem.id === item.id);
    // Ensure consistent price handling
    const price = typeof item.price === 'string' ? parseFloat(item.price) : (item.price || 0);
    const rawPrice = price;

    if (existingItemIndex !== -1) {
      // If item exists, increment its quantity
      const updatedCart = [...this.cart];
      const existingItem = updatedCart[existingItemIndex];
      updatedCart[existingItemIndex] = {
        ...existingItem,
        quantity: (existingItem.quantity || 1) + 1,
        // Keep original rawPrice but ensure price is also set
        rawPrice: existingItem.rawPrice,
        price: existingItem.rawPrice // Set price equal to rawPrice for consistency
      };
      this.cart = updatedCart;
    } else {
      // If item doesn't exist, add it with quantity 1 and store consistent prices
      this.cart = [...this.cart, { 
        ...item, 
        quantity: 1,
        rawPrice,
        price: rawPrice // Ensure both price and rawPrice are the same
      }];
    }

    console.log("Model: Item added to cart", item);
  }

  removeFromCart(itemToRemove) {
    const existingItemIndex = this.cart.findIndex(item => item.id === itemToRemove.id);
    
    if (existingItemIndex === -1) return; // Item not in cart
    
    const updatedCart = [...this.cart];
    const existingItem = updatedCart[existingItemIndex];
    
    if (existingItem.quantity > 1) {
      // If quantity > 1, decrement quantity
      updatedCart[existingItemIndex] = {
        ...existingItem,
        quantity: existingItem.quantity - 1
      };
      this.cart = updatedCart;
    } else {
      // If quantity is 1, remove the item
      this.cart = this.cart.filter(item => item.id !== itemToRemove.id);
    }
    
    console.log("Model: Item removed from cart", itemToRemove);
  }

  // Computed property to find the first active order for the requester
  get activeRequesterOrder() {
    const activeStatuses = ['Unassigned', 'Assigned', 'PickedUp', 'ArrivedAtApartment']; // Add new status
    return this.requesterOrders.find(order => activeStatuses.includes(order.status)) || null;
  }

  getCartTotal() {
    const itemSubtotal = this.cart.reduce((sum, item) => {
      return sum + (item.rawPrice * (item.quantity || 1));
    }, 0);
    return Number((itemSubtotal + QuicaModelClass.DELIVERY_FEE).toFixed(2));
  }

  getCartSubtotal() {
    return Number(this.cart.reduce((sum, item) => {
      return sum + (item.rawPrice * (item.quantity || 1));
    }, 0).toFixed(2));
  }

  // Utility Actions
  setLoading(isLoading) {
    this.isLoading = isLoading;
  }

  setError(message) {
    this.errorMessage = message;
  }

  // Order tracking actions
  setCurrentlyTrackedOrder(orderData) {
    console.log("Model: Setting currently tracked order", orderData);
    this.currentlyTrackedOrder = orderData;
  }

  setOrderListenerUnsubscribe(unsubscribeFn) {
    this.orderListenerUnsubscribe = unsubscribeFn;
  }

  clearTrackedOrder() {
    console.log("Model: Clearing tracked order");
    if (this.orderListenerUnsubscribe) {
      this.orderListenerUnsubscribe();
      this.orderListenerUnsubscribe = null;
    }
    this.currentlyTrackedOrder = null;
  }

  async cancelOrder() {
    if (!this.currentlyTrackedOrder) {
      this.orderCancellationError = "No active order to cancel";
      return;
    }

    if (this.currentlyTrackedOrder.status !== 'Unassigned') {
      this.orderCancellationError = "Cannot cancel order - rider already assigned";
      return;
    }

    this.orderCancellationInProgress = true;
    this.orderCancellationError = null;

    try {
      await updateOrderStatus(this.currentlyTrackedOrder.id, 'Cancelled');
      this.clearTrackedOrder(); // Explicitly clear the tracked order
      this.setViewMode('order'); // Switch back to order view mode
    } catch (error) {
      this.orderCancellationError = error.message || "Failed to cancel order";
      console.error("Model: Error cancelling order:", error);
    } finally {
      this.orderCancellationInProgress = false;
    }
  }

  clearUserData() {
    console.log("Model: Clearing user-specific data");
    this.userProfile = null;
    this.groceryItems = [];
    this.cart = [];
    this.isProfileSetupComplete = false;
    this.requesterOrders = [];
    this.availableOrders = [];
    this.delivererOrders = [];
    this.errorMessage = null;
    // Clear order tracking state
    this.clearTrackedOrder();
    this.orderCancellationInProgress = false;
    this.orderCancellationError = null;
  }

  async placeOrder() {
    if (this.cart.length === 0) {
      this.setError("Cannot place order with empty cart");
      return false;
    }

    // Clear any previous order tracking state
    this.clearTrackedOrder();

    if (!this.user || !this.userProfile) {
      this.setError("User not logged in or profile not loaded.");
      return false;
    }

    this.setLoading(true);
    this.setError(null);

    // Calculate totals and prepare items array for Firestore
    const itemSubtotal = this.cart.reduce((sum, item) => {
      const price = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 1;
      return sum + (price * quantity);
    }, 0);
    
    const deliveryFee = 15;
    const totalPrice = itemSubtotal + deliveryFee;

    const orderItems = this.cart.map(item => ({
      productId: (item.id || '').toString(),
      name: item.name || 'Unknown Item',
      price: parseFloat(item.price) || 0,
      quantity: parseInt(item.quantity) || 1,
      imageUrl: item.image || null
    }));

    // Ensure user profile data is valid
    const userDisplayName = this.userProfile?.displayName || this.user?.displayName || null;
    const userAddress = this.userProfile?.address || null;
    const userPhone = this.userProfile?.phone || null;

    const orderData = {
      requesterUid: this.user.uid,
      requesterName: userDisplayName,
      requesterAddress: userAddress,
      requesterPhone: userPhone,
      items: orderItems,
      itemSubtotal: Number(itemSubtotal.toFixed(2)),
      deliveryFee: Number(deliveryFee.toFixed(2)),
      totalPrice: Number(totalPrice.toFixed(2)),
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'Unassigned' // Set initial status
    };

    try {
      const result = await placeOrderInFirestore(orderData);
      if (result.success) {
        console.log("Model: Order successfully placed in Firestore, ID:", result.orderId);
        this.cart = []; // Clear the cart
        // Update the tracked order - the Firestore listener will keep it up to date
        this.currentlyTrackedOrder = { ...orderData, id: result.orderId };
        return true;
      } else {
        console.error("Model: Failed to place order in Firestore", result.error);
        return false;
      }
    } catch (error) {
      this.setError(error.message || "Failed to place order");
      return false;
    } finally {
      this.setLoading(false);
    }
  }


  setViewMode(mode) {
    if (mode !== 'order' && mode !== 'deliver' && mode !== 'admin') {
      console.error('Invalid view mode:', mode);
      return;
    }
    console.log('Model: Setting view mode to:', mode);
    this.viewMode = mode;
  }

  // Admin actions
  setAdminActiveOrders(orders) {
    console.log("Model: Setting admin active orders", orders);
    this.adminActiveOrders = orders;
  }

  async deleteOrder(orderId) {
    try {
      await deleteOrderFromFirestore(orderId);
      return { success: true };
    } catch (error) {
      console.error("Model: Error deleting order:", error);
      return { success: false, error: error.message || "Failed to delete order" };
    }
  }

  // Deliverer actions
  async toggleDelivererStatus() {
    if (!this.user || !this.userProfile) {
      this.setError("User not logged in or profile not loaded");
      return;
    }

    const newStatus = this.userProfile.delivererStatus === 'active' ? 'inactive' : 'active';
    try {
      const result = await updateUserProfile(this.user.uid, { 
        delivererStatus: newStatus,
        updatedAt: new Date()
      });
      
      if (result.success) {
        // Clear any errors when deactivating deliver mode
        if (newStatus === 'inactive') {
          this.setError(null);
          // Reload grocery items if empty
          if (this.groceryItems.length === 0) {
            this.loadGroceryItems('pizza');
          }
        }
      } else {
        this.setError("Failed to update deliverer status");
      }
    } catch (error) {
      this.setError(error.message || "Failed to update deliverer status");
      console.error("Model: Error updating deliverer status:", error);
    }
  }

  // Action to set accepting order ID
  setAcceptingOrderId(id) {
    this.acceptingOrderId = id;
  }

  async acceptOrder(orderId) {
    if (!this.user || !this.userProfile) {
      this.setError("User not logged in or profile not loaded");
      return;
    }

    if (this.userProfile.delivererStatus !== 'active') {
      this.setError("Must be in active delivery mode to accept orders");
      return;
    }

    this.setAcceptingOrderId(orderId);
    this.acceptOrderError = null;

    try {
      await assignOrderToDeliverer(orderId, {
        uid: this.user.uid,
        displayName: this.userProfile.displayName || this.user.displayName,
        phone: this.userProfile.phone
      });
      // The onSnapshot listener will handle updating the model state
    } catch (error) {
      runInAction(() => {
        this.acceptOrderError = error.message || "Failed to accept order";
      });
      console.error("Model: Error accepting order:", error);
    } finally {
      this.setAcceptingOrderId(null);
    }
  }

  // MobX actions for state modifications
  setUpdateOrderStatusId(id) {
    this.updatingOrderStatusId = id;
  }

  setUpdateOrderStatusError(error) {
    this.updateOrderStatusError = error;
  }

  async updateDelivererOrderStatus(orderId, newStatus) {
    this.setUpdateOrderStatusId(orderId);
    this.setUpdateOrderStatusError(null);

    try {
      await updateOrderStatus(orderId, newStatus);
      // Listener will update the model state
    } catch (error) {
      this.setUpdateOrderStatusError(error.message || `Failed to update status to ${newStatus}`);
      console.error("Model: Error updating order status:", error);
    } finally {
      this.setUpdateOrderStatusId(null);
    }
  }

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

  async markArrivedAtApartment(orderId) {
    this.updatingOrderStatusId = orderId;
    this.updateOrderStatusError = null;
    try {
      await updateOrderStatus(orderId, 'ArrivedAtApartment');
    } catch (error) {
      this.updateOrderStatusError = error.message || 'Failed to update status to ArrivedAtApartment';
      console.error('Model: Error updating order status:', error);
    } finally {
      this.updatingOrderStatusId = null;
    }
  }

  async markDelivered(orderId) {
    this.updatingOrderStatusId = orderId;
    this.updateOrderStatusError = null;
    try {
      await updateOrderStatus(orderId, 'Delivered');
    } catch (error) {
      this.updateOrderStatusError = error.message || 'Failed to update status to Delivered';
      console.error('Model: Error updating order status:', error);
    } finally {
      this.updatingOrderStatusId = null;
    }
  }
}

export const myQuicaModel = new QuicaModelClass();
