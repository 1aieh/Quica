import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, onSnapshot, collection, query, where, Timestamp, addDoc } from "firebase/firestore"; // Import Firestore functions including addDoc
import { auth, db } from "./firebaseConfig.js"; // Import db
import { myQuicaModel } from "../model/QuicaModel.js";

// Keep track of active Firestore listeners to unsubscribe on logout
let unsubscribeUserProfile = () => {};
let unsubscribeRequesterOrders = () => {};
let unsubscribeAvailableOrders = () => {};
let unsubscribeDelivererOrders = () => {}; // Added listener for deliverer's assigned orders

const initializeAuthListener = () => {
  console.log("Initializing auth state listener...");

  const unsubscribeAuth = onAuthStateChanged(auth, async (user) => { // Make async
    console.log("Auth state changed:", user?.uid || "signed out");

    // Always clean up previous listeners first
    unsubscribeUserProfile();
    unsubscribeRequesterOrders();
    unsubscribeAvailableOrders();
    unsubscribeDelivererOrders(); // Unsubscribe deliverer orders listener

    if (user) {
      // User is signed in
      myQuicaModel.setUser(user); // Set user in model immediately

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

    } else {
      // User is signed out
      console.log("User signed out, clearing data and listeners.");
      myQuicaModel.setUser(null);
      myQuicaModel.clearUserData(); // This should clear profile, orders etc. in the model
      // Listeners are already unsubscribed above
    }
  });

  // Return the main auth listener unsubscriber function
  // This should be called when the app unmounts if applicable
  return unsubscribeAuth;
};

// Function to set up order listeners based on user role
const setupOrderListeners = (uid, role) => {
  console.log(`Setting up order listeners for UID: ${uid}, Role: ${role}`);

  // Clean up previous listeners *again* just in case role changed without logout
  unsubscribeRequesterOrders();
  unsubscribeAvailableOrders();
  unsubscribeDelivererOrders(); // Clean up deliverer listener too

  const ordersRef = collection(db, "orders");

  if (role === "requester") {
    // Listener for orders placed BY this user
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

  } else if (role === "deliverer") {
    // Listener for AVAILABLE orders (Unassigned)
    const qAvailable = query(ordersRef, where("status", "==", "Unassigned"));
    unsubscribeAvailableOrders = onSnapshot(qAvailable, (querySnapshot) => {
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
    const qAssigned = query(ordersRef, where("delivererUid", "==", uid));
     unsubscribeDelivererOrders = onSnapshot(qAssigned, (querySnapshot) => {
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
    return { success: true, orderId: docRef.id };
  } catch (error) {
    console.error("Error placing order in Firestore:", error);
    myQuicaModel.setError("Failed to place order."); // Update model state
    return { success: false, error: error };
  }
};

// TODO: Add functions for deliverer actions:
// - acceptOrder(orderId, delivererProfile) -> updates order status, delivererUid, delivererName, delivererPhone, assignedAt
// - updateOrderStatus(orderId, newStatus) -> updates status, relevant timestamp (pickedUpAt, deliveredAt)


// Initialize the auth listener immediately when this module loads
initializeAuthListener();

// Export functions needed by the Model or Presenters
export { auth, placeOrderInFirestore }; // Export the write function
// Export other functions like acceptOrder, updateOrderStatus when implemented
