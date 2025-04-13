import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, onSnapshot, collection, query, where, Timestamp, addDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { auth, db } from "./firebaseConfig.js"; // Import db
import { myQuicaModel } from "../model/QuicaModel.js";

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
  console.log("Initializing auth state listener...");

  const unsubscribeAuth = onAuthStateChanged(auth, async (user) => { // Make async
    console.log("Auth state changed:", user?.uid || "signed out");

    // Always clean up previous listeners first
    unsubscribeUserProfile();
    unsubscribeRequesterOrders();
    unsubscribeAvailableOrders();
    unsubscribeDelivererOrders(); // Unsubscribe deliverer orders listener
    unsubscribeAdminOrders(); // Unsubscribe admin orders listener

    if (user) {
      // User is signed in
      myQuicaModel.setUser(user); // Set user in model immediately

      // Setup admin listener if user is admin
      if (adminEmails.includes(user.email)) {
        console.log("Admin user detected, setting up admin order listener");
        unsubscribeAdminOrders = setupAdminOrderListener(myQuicaModel);
      }

      // --- Firestore Interaction: User Profile ---
      const userDocRef = doc(db, "users", user.uid);
      unsubscribeUserProfile = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          console.log("User profile found:", docSnap.data());
          // Combine uid with Firestore data for the profile object in the model
          const profileData = { uid: user.uid, ...docSnap.data() };
          myQuicaModel.setUserProfile(profileData);

          // --- Firestore Interaction: Orders (Based on Role) ---
          // Setup listeners only AFTER profile (and role) is confirmed
          setupOrderListeners(user.uid, profileData.role);

        } else {
          // First sign-in: Create user profile document
          console.log("User profile not found, creating...");
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
          setDoc(userDocRef, newUserProfile)
            .then(() => {
              console.log("User profile created successfully.");
              // The onSnapshot listener will trigger automatically now with the new data
              // No need to call setUserProfile here again, listener handles it.
            })
            .catch((error) => {
              console.error("Error creating user profile:", error);
              myQuicaModel.setError("Failed to create user profile."); // Set error state in model
            });
        }
      }, (error) => {
          console.error("Error listening to user profile:", error);
          myQuicaModel.setError("Failed to load user profile."); // Set error state
          // Maybe clear profile if listener fails?
          myQuicaModel.setUserProfile(null);
      });
      // --- End User Profile ---

      // Check for active order if we have the profile
      // Note: This check might run before the profile listener sets the role,
      // so relying on setupOrderListeners triggered by the profile update is safer.
      // Consider removing this block or ensuring it runs *after* profile is set.
      // if (docSnap.exists()) { // docSnap is not available here
      //   const profileData = myQuicaModel.userProfile; // Use model state if available
      //   if (profileData && profileData.role === 'requester') {
      //     await checkForActiveOrder(user.uid);
      //   }
      // }

    } else {
      // User is signed out
      console.log("User signed out, clearing data and listeners.");
      myQuicaModel.setUser(null);
      myQuicaModel.clearUserData(); // This should clear profile, orders etc. in the model
      unsubscribeOrderTracking(); // Clean up order tracking listener
      // Other listeners are already unsubscribed above
    }
  });

  // Return the main auth listener unsubscriber function
  // This should be called when the app unmounts if applicable
  return unsubscribeAuth;
};

// Function to set up order listeners based on user role
const setupOrderListeners = (uid, role) => {
  console.log(`Setting up order listeners for UID: ${uid}, Role: ${role}`);
  console.log(`DEBUG: setupOrderListeners called with role: ${role}`); // DEBUG LOG

  // Clean up previous listeners *again* just in case role changed without logout
  unsubscribeRequesterOrders();
  unsubscribeAvailableOrders();
  unsubscribeDelivererOrders(); // Clean up deliverer listener too

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

  // Listener for AVAILABLE orders (Unassigned) - only if role includes delivery capability
  if (role === "both") {
    console.log("DEBUG: Setting up listener for AVAILABLE orders (role=both)"); // DEBUG LOG
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
    const qAssigned = query(ordersRef, where("delivererUid", "==", uid));
     unsubscribeDelivererOrders = onSnapshot(qAssigned, (querySnapshot) => {
      console.log(`DEBUG: Assigned orders listener fired - count: ${querySnapshot.size}`); // DEBUG LOG
      const orders = [];
      querySnapshot.forEach((doc) => {
        // Filter out potentially cancelled/completed orders if needed based on status
        // if (doc.data().status === 'Assigned' || doc.data().status === 'PickedUp' || ...)
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
  const ordersRef = collection(db, "orders");
  const q = query(
    ordersRef,
    where("requesterUid", "==", userId),
    where("status", "not-in", ["Delivered", "Cancelled"])
  );

  try {
    const querySnapshot = await getDocs(q); // Use getDocs for potentially multiple results
    if (!querySnapshot.empty) {
      // Get the most recent active order
      const latestOrder = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())[0];

      // Setup tracking for this order
      startOrderTracking(latestOrder.id);
    }
  } catch (error) {
    console.error("Error checking for active order:", error);
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
  console.log(`Updating order ${orderId} status to ${newStatus}`);
  try {
    const orderRef = doc(db, "orders", orderId);
    const updateData = {
      status: newStatus,
      updatedAt: Timestamp.now()
    };

    // Add specific timestamp based on status
    if (newStatus === 'Cancelled') {
      updateData.cancelledAt = Timestamp.now();
    } else if (newStatus === 'Delivered') {
      updateData.deliveredAt = Timestamp.now();
    } else if (newStatus === 'PickedUp') { // Add timestamp for PickedUp
      updateData.pickedUpAt = Timestamp.now();
    }

    await updateDoc(orderRef, updateData);
    return { success: true };
  } catch (error) {
    console.error("Error updating order status:", error);
    throw new Error(error.message || "Failed to update order status");
  }
};

// --- Firestore Write Operations ---

// Function to place a new order
// This would typically be called from a Model action, which is called by a Presenter
const placeOrderInFirestore = async (orderData) => {
  console.log("Attempting to place order in Firestore:", orderData);
  try {
    // Add mandatory fields if not already present
    const completeOrderData = {
      ...orderData,
      status: "Unassigned", // Initial status
      paymentStatus: "Pending", // Initial status
      delivererUid: null,
      delivererName: null,
      delivererPhone: null,
      createdAt: Timestamp.now(), // Set creation time
      assignedAt: null,
      pickedUpAt: null,
      deliveredAt: null,
      cancelledAt: null,
    };
    const docRef = await addDoc(collection(db, "orders"), completeOrderData);
    console.log("Order placed successfully with ID:", docRef.id);

    // Start tracking the new order if the user is the requester
    if (myQuicaModel.user?.uid === orderData.requesterUid) {
        startOrderTracking(docRef.id);
    }

    return { success: true, orderId: docRef.id };
  } catch (error) {
    console.error("Error placing order in Firestore:", error);
    myQuicaModel.setError("Failed to place order."); // Update model state
    return { success: false, error: error };
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
