import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, getDocs, setDoc, onSnapshot, collection, query, where, Timestamp, addDoc, updateDoc, deleteDoc, runTransaction, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebaseConfig.js"; // Import db
import { myQuicaModel } from "../model/QuicaModel.js";

// Network status tracking
let isOnline = navigator.onLine;
console.log(`🌐 Initial network status: ${isOnline ? 'online' : 'offline'}`);

// Keep track of order tracking listener
let unsubscribeOrderTracking = () => {};

// Keep track of active Firestore listeners to unsubscribe on logout
let unsubscribeUserProfile = () => {};
let unsubscribeRequesterOrders = () => {};
let unsubscribeAvailableOrders = () => {};
let unsubscribeDelivererOrders = () => {}; // Added listener for deliverer's assigned orders
let unsubscribeAdminOrders = () => {}; // Added listener for admin orders

// Admin emails
const adminEmails = ['laiehjwella@gmail.com', 'bhavyasehgal2010@gmail.com'];

const initializeAuthListener = () => {
  console.log("🔐 Initializing auth state listener...");
  let isFirstAuthCheck = true;

  const unsubscribeAuth = onAuthStateChanged(auth, async (user) => { // Make async
    console.log("👤 Auth state changed:", user ? `User ${user.uid} signed in` : "signed out");
    console.log(`📡 Network status during auth change: ${navigator.onLine ? 'online' : 'offline'}`);

    // Set authInitialized to true after first auth check
    if (isFirstAuthCheck) {
      isFirstAuthCheck = false;
      console.log("🎯 First auth check complete");
      myQuicaModel.setAuthInitialized(true);
    }

    // Always clean up previous listeners first
    console.log("🧹 Cleaning up previous listeners");
    unsubscribeUserProfile();
    unsubscribeRequesterOrders();
    unsubscribeAvailableOrders();
    unsubscribeDelivererOrders(); // Unsubscribe deliverer orders listener
    unsubscribeAdminOrders(); // Unsubscribe admin orders listener

    if (user) {
      // User is signed in
      console.log("✅ Setting user in model:", user.uid);
      myQuicaModel.setUser(user); // Set user in model immediately

      // Setup admin listener if user is admin
      if (adminEmails.includes(user.email)) {
        console.log("👑 Admin user detected, setting up admin order listener");
        unsubscribeAdminOrders = setupAdminOrderListener(myQuicaModel);
      }

      // --- Firestore Interaction: User Profile ---
      const userDocRef = doc(db, "users", user.uid);
      console.log("📝 Setting up user profile listener for:", user.uid);
      
      unsubscribeUserProfile = onSnapshot(userDocRef, async (docSnap) => {
        if (docSnap.exists()) {
          console.log("👤 User profile found:", docSnap.data());
          
          // First, clean up any existing order tracking
          unsubscribeOrderTracking();
          
          // Combine uid with Firestore data for the profile object in the model
          const profileData = { uid: user.uid, ...docSnap.data() };
          console.log("💾 Setting user profile in model:", profileData);
          myQuicaModel.setUserProfile(profileData);

          // Check for active order only for requesters AFTER profile is confirmed
          if (profileData.role === 'requester' || profileData.role === 'both') {
            console.log("🔍 Checking for active orders for requester:", user.uid);
            myQuicaModel.setLoadingInitialOrderCheck(true); // Set loading before check
            await checkForActiveOrder(user.uid);
          } else {
            myQuicaModel.setLoadingInitialOrderCheck(false); // Ensure loading is false if not checking
          }

          // --- Firestore Interaction: Orders (Based on Role) ---
          console.log("📦 Setting up order listeners for role:", profileData.role);
          setupOrderListeners(user.uid, profileData.role);

        } else {
          // First sign-in: Create user profile document
          console.log("➕ User profile not found, creating new profile");
          const newUserProfile = {
            email: user.email,
            displayName: user.displayName || "New User",
            role: "requester", // Default role
            address: "", // Initialize empty or prompt user later
            phone: "",   // Initialize empty or prompt user later
            delivererStatus: null, // Default for deliverers
            rating: null,          // Default for deliverers
            totalDeliveries: 0,    // Default for deliverers
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          };

          try {
            await setDoc(userDocRef, newUserProfile);
            console.log("✅ User profile created successfully");
          } catch (error) {
            console.error("❌ Error creating user profile:", error);
            console.log(`📡 Network status during error: ${navigator.onLine ? 'online' : 'offline'}`);
            myQuicaModel.setError("Failed to create user profile."); // Set error state in model
          }
        }
      }, (error) => {
          console.error("❌ Error listening to user profile:", error);
          console.log(`📡 Network status during listener error: ${navigator.onLine ? 'online' : 'offline'}`);
          myQuicaModel.setError("Failed to load user profile."); // Set error state
          // Maybe clear profile if listener fails?
          myQuicaModel.setUserProfile(null);
      });

    } else {
      // User is signed out
      console.log("👋 User signed out, clearing data and listeners");
      myQuicaModel.setUser(null);
      myQuicaModel.clearUserData(); // This should clear profile, orders etc. in the model
      unsubscribeOrderTracking(); // Clean up order tracking listener
    }
  });

  // Return the main auth listener unsubscriber function
  return unsubscribeAuth;
};

// Function to set up order listeners based on user role
const setupOrderListeners = (uid, role) => {
  console.log(`Setting up order listeners for UID: ${uid}, Role: ${role}`);
  console.log(`DEBUG: setupOrderListeners called with role: ${role}`); // DEBUG LOG

  // Clean up list-related listeners when role changes
  unsubscribeRequesterOrders();
  unsubscribeAvailableOrders();
  unsubscribeDelivererOrders();

  const ordersRef = collection(db, "orders");

  // Listener for orders placed BY this user (requester OR both)
  if (role === "requester" || role === "both") {
    const q = query(ordersRef, where("requesterUid", "==", uid));
    unsubscribeRequesterOrders = onSnapshot(q, (querySnapshot) => {
      const orders = [];
      querySnapshot.forEach((doc) => {
        orders.push({ id: doc.id, ...doc.data() });
      });
      console.log("Requester orders updated:", orders.length);
      myQuicaModel.setRequesterOrders(orders); // Update model
    }, (error) => {
        console.error("Error listening to requester orders:", error);
        myQuicaModel.setError("Failed to load your orders.");
    });
  }

  // Listener for AVAILABLE orders (Unassigned) - only if role includes delivery capability AND delivererStatus is active
  if (role === "both" && myQuicaModel.userProfile?.delivererStatus === 'active') {
    console.log("DEBUG: Setting up listener for AVAILABLE orders (role=both, status=active)"); // DEBUG LOG
    const qAvailable = query(ordersRef, where("status", "==", "Unassigned"));
    unsubscribeAvailableOrders = onSnapshot(qAvailable, (querySnapshot) => {
      console.log(`DEBUG: Available orders listener fired - count: ${querySnapshot.size}`); // DEBUG LOG
      const orders = [];
      querySnapshot.forEach((doc) => {
        orders.push({ id: doc.id, ...doc.data() });
      });
      console.log("Available orders updated:", orders.length);
      myQuicaModel.setAvailableOrders(orders); // Update model
    }, (error) => {
        console.error("Error listening to available orders:", error);
        myQuicaModel.setError("Failed to load available orders.");
    });

    // Listener for orders ASSIGNED TO this deliverer
    console.log("DEBUG: Setting up listener for ASSIGNED orders (role=both)"); // DEBUG LOG
    const qAssigned = query(
      ordersRef, 
      where("delivererUid", "==", uid),
      // Include both active and completed orders
      where("status", "in", ["Assigned", "PickedUp", "ArrivedAtApartment", "Delivered"])
    );
    unsubscribeDelivererOrders = onSnapshot(qAssigned, (querySnapshot) => {
      console.log(`DEBUG: Assigned orders listener fired - count: ${querySnapshot.size}`); // DEBUG LOG
      const orders = [];
      querySnapshot.forEach((doc) => {
        orders.push({ id: doc.id, ...doc.data() });
      });
      console.log("Deliverer's assigned orders updated:", orders.length);
      myQuicaModel.setDelivererOrders(orders); // Update model
    }, (error) => {
        console.error("Error listening to deliverer orders:", error);
        myQuicaModel.setError("Failed to load your assigned orders.");
    });
  }
};

// Function to check for active order on login
const checkForActiveOrder = async (userId) => {
  console.log("Checking for active order for user:", userId);
  
  // Clean up any existing tracking before checking
  unsubscribeOrderTracking();
  myQuicaModel.clearTrackedOrder();
  
  const ordersRef = collection(db, "orders");
  const q = query(
    ordersRef,
    where("requesterUid", "==", userId),
    where("status", "not-in", ["Delivered", "Cancelled"])
  );

  try {
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      // Get the most recent active order
      const latestOrder = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())[0];
      
      // Setup tracking for this order and update model
      startOrderTracking(latestOrder.id);
      myQuicaModel.setCurrentlyTrackedOrder(latestOrder);
    }
  } catch (error) {
    console.error("Error checking for active order:", error);
    myQuicaModel.setError("Failed to check for active orders");
    myQuicaModel.clearTrackedOrder();
  } finally {
    myQuicaModel.setLoadingInitialOrderCheck(false); // Clear loading after check
  }
};

// Function to start tracking a specific order
const startOrderTracking = (orderId) => {
  console.log("Starting order tracking for:", orderId);
  // Clean up any existing listener
  unsubscribeOrderTracking();

  const orderRef = doc(db, "orders", orderId);
  unsubscribeOrderTracking = onSnapshot(orderRef, (docSnap) => {
    if (docSnap.exists()) {
      const orderData = { id: docSnap.id, ...docSnap.data() };
      myQuicaModel.setCurrentlyTrackedOrder(orderData);

      // If order reaches a final state, stop tracking
      if (orderData.status === 'Delivered' || orderData.status === 'Cancelled') {
        console.log("Order reached final state, stopping tracking");
        unsubscribeOrderTracking();
        myQuicaModel.clearTrackedOrder();
      }
    } else {
      console.log("Order document no longer exists");
      myQuicaModel.clearTrackedOrder();
    }
  }, (error) => {
    console.error("Error tracking order:", error);
    myQuicaModel.setError("Failed to track order status");
  });

  return unsubscribeOrderTracking;
};

// Function to update order status
const updateOrderStatus = async (orderId, newStatus) => {
  console.log(`🔄 Updating order ${orderId} status to ${newStatus}`);
  console.log(`🔑 Current user UID: ${auth.currentUser?.uid}`);
  
  if (!auth.currentUser) {
    console.error("❌ No authenticated user");
    throw new Error("You must be logged in to update orders");
  }

  try {
    const orderRef = doc(db, "orders", orderId);
    
    // First verify the order exists and get its data
    const orderSnap = await getDoc(orderRef);
    if (!orderSnap.exists()) {
      console.error("❌ Order not found:", orderId);
      throw new Error("Order not found");
    }

    const orderData = orderSnap.data();
    console.log("📄 Current order data:", {
      id: orderId,
      status: orderData.status,
      delivererUid: orderData.delivererUid,
      timestamps: {
        updatedAt: orderData.updatedAt?.toDate?.(),
        pickedUpAt: orderData.pickedUpAt?.toDate?.(),
        arrivedAtApartmentAt: orderData.arrivedAtApartmentAt?.toDate?.(),
        deliveredAt: orderData.deliveredAt?.toDate?.(),
        cancelledAt: orderData.cancelledAt?.toDate?.()
      }
    });
    
    // Verify user permissions
    const isDeliverer = orderData.delivererUid === auth.currentUser.uid;
    console.log("🔐 Permission check:", {
      currentUser: auth.currentUser.uid,
      orderDeliverer: orderData.delivererUid,
      isDeliverer,
      orderStatus: orderData.status,
      attemptingStatus: newStatus
    });

    if (!isDeliverer) {
      console.error("❌ Permission denied - Current user:", auth.currentUser.uid, "Order deliverer:", orderData.delivererUid);
      throw new Error("You don't have permission to update this order");
    }

    // Validate status transition
    const validTransitions = {
      'Unassigned': ['Assigned', 'Cancelled'],
      'Assigned': ['PickedUp', 'Cancelled'],
      'PickedUp': ['ArrivedAtApartment', 'Cancelled'],
      'ArrivedAtApartment': ['Delivered', 'Cancelled']
    };

    const isValidTransition = validTransitions[orderData.status]?.includes(newStatus);
    console.log("🔄 Status transition check:", {
      currentStatus: orderData.status,
      newStatus,
      validTransitionsForCurrentStatus: validTransitions[orderData.status],
      isValidTransition
    });

    if (!isValidTransition) {
      console.error(`❌ Invalid status transition from ${orderData.status} to ${newStatus}`);
      throw new Error(`Invalid status transition from ${orderData.status} to ${newStatus}`);
    }

    // Create update data with ONLY the fields allowed by security rules
    const updatePayload = {
      status: newStatus,
      updatedAt: serverTimestamp() // Use server timestamp
    };

    // Add the appropriate timestamp field based on status
    if (newStatus === 'ArrivedAtApartment') {
      updatePayload.arrivedAtApartmentAt = serverTimestamp(); // Use server timestamp
    }

    // Log the exact update payload and affected fields
    console.log("📝 Update operation details:", {
      updateMethod: "updateDoc",
      documentPath: `orders/${orderId}`,
      updateFields: Object.keys(updatePayload),
      // Log server timestamps as strings for clarity, as .toDate() won't work before write
      updateDataForLogging: {
        ...updatePayload,
        updatedAt: "SERVER_TIMESTAMP",
        ...(updatePayload.arrivedAtApartmentAt && { arrivedAtApartmentAt: "SERVER_TIMESTAMP" })
      }
    });

    // Attempt the update
    console.log("🚀 Initiating Firestore update...");
    await updateDoc(orderRef, updatePayload);
    console.log("✅ Order status updated successfully");

    return { success: true, data: updatePayload }; // data will contain placeholders
  } catch (error) {
    console.error("❌ Error updating order status:", {
      errorCode: error.code,
      errorMessage: error.message,
      errorName: error.name,
      errorStack: error.stack
    });
    console.log("🔍 Current auth state:", {
      isAuthenticated: !!auth.currentUser,
      uid: auth.currentUser?.uid,
      email: auth.currentUser?.email
    });
    console.log("📡 Network status:", navigator.onLine ? 'online' : 'offline');
    throw error;
  }
};

// --- Firestore Write Operations ---

// Function to place a new order
// This would typically be called from a Model action, which is called by a Presenter
const placeOrderInFirestore = async (orderData) => {
  console.log("🛒 Attempting to place order in Firestore:", orderData);
  
  if (!auth.currentUser) {
    console.error("❌ No authenticated user");
    throw new Error("You must be logged in to place an order");
  }

  try {
    // Validate required fields
    const requiredFields = ['items', 'totalPrice', 'requesterUid', 'requesterName', 'requesterAddress', 'requesterPhone'];
    const missingFields = requiredFields.filter(field => !orderData[field]);
    
    if (missingFields.length > 0) {
      console.error("❌ Missing required fields:", missingFields);
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Validate items array
    if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
      console.error("❌ Invalid items array");
      throw new Error("Order must contain at least one item");
    }

    // Add mandatory fields
    const completeOrderData = {
      ...orderData,
      status: "Unassigned",
      paymentStatus: "Pending",
      delivererUid: null,
      delivererName: null,
      delivererPhone: null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      assignedAt: null,
      pickedUpAt: null,
      arrivedAtApartmentAt: null,
      deliveredAt: null,
      cancelledAt: null
    };

    console.log("📝 Attempting to create order with data:", completeOrderData);
    const docRef = await addDoc(collection(db, "orders"), completeOrderData);
    console.log("✅ Order placed successfully with ID:", docRef.id);

    // Start tracking the new order
    if (auth.currentUser.uid === orderData.requesterUid) {
      startOrderTracking(docRef.id);
    }

    return { success: true, orderId: docRef.id, data: completeOrderData };
  } catch (error) {
    console.error("❌ Error placing order in Firestore:", error);
    console.log("🔍 Current auth state:", auth.currentUser?.uid);
    console.log("📡 Network status:", navigator.onLine ? 'online' : 'offline');
    throw error;
  }
};

// Initialize the auth listener immediately when this module loads
initializeAuthListener();

// Function to update user profile data
const updateUserProfile = async (userId, dataToUpdate) => {
  console.log("Updating user profile:", { userId, dataToUpdate });
  try {
    const userDocRef = doc(db, "users", userId);
    const updateData = {
      ...dataToUpdate,
      updatedAt: Timestamp.now()
    };
    await setDoc(userDocRef, updateData, { merge: true });
    console.log("User profile updated successfully");
    return { success: true };
  } catch (error) {
    console.error("Error updating user profile:", error);
    myQuicaModel.setError("Failed to update profile.");
    return { success: false, error };
  }
};

// Function to assign an order to a deliverer
const assignOrderToDeliverer = async (orderId, deliverer) => {
  console.log(`Assigning order ${orderId} to deliverer:`, deliverer);
  try {
    const orderRef = doc(db, "orders", orderId);

    // First get the current order to verify it's still available
    const orderSnap = await getDoc(orderRef);
    if (!orderSnap.exists()) {
      throw new Error("Order not found");
    }

    const orderData = orderSnap.data();
    if (orderData.status !== "Unassigned") {
      throw new Error("Order is no longer available");
    }

    const updateData = {
      status: "Assigned",
      delivererUid: deliverer.uid,
      delivererName: deliverer.displayName,
      delivererPhone: deliverer.phone,
      assignedAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    await updateDoc(orderRef, updateData);
    return { success: true };
  } catch (error) {
    console.error("Error assigning order:", error);
    throw new Error(error.message || "Failed to assign order");
  }
};

// Export functions needed by the Model or Presenters
// Function to setup admin order listener
const setupAdminOrderListener = (model) => {
  console.log("Setting up admin order listener");
  const ordersRef = collection(db, "orders");
  const q = query(ordersRef, where("status", "in", ["Unassigned", "Assigned", "PickedUp"]));

  return onSnapshot(q, (querySnapshot) => {
    const orders = [];
    querySnapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() });
    });
    console.log("Admin orders updated:", orders.length);
    model.setAdminActiveOrders(orders);
  }, (error) => {
    console.error("Error listening to admin orders:", error);
    model.setError("Failed to load admin orders.");
  });
};

// Function to delete an order from Firestore
const deleteOrderFromFirestore = async (orderId) => {
  console.log(`Deleting order ${orderId}`);
  try {
    const orderRef = doc(db, "orders", orderId);
    await deleteDoc(orderRef);
    return { success: true };
  } catch (error) {
    console.error("Error deleting order:", error);
    throw new Error(error.message || "Failed to delete order");
  }
};

export {
  auth,
  placeOrderInFirestore,
  updateUserProfile,
  updateOrderStatus,
  startOrderTracking,
  assignOrderToDeliverer,
  deleteOrderFromFirestore
};
