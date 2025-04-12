## 1. Project Context Recap & Current State

*   **App:** Quica (Grocery delivery, Requester/Deliverer roles)
*   **Tech:** React, Vite, MobX (`myQuicaModel`), Firebase (Auth - Google, Firestore)
*   **API:** Spoonacular API (for item names/images), **Simulated Prices** needed. **(Currently experiencing 402 errors - likely quota exceeded)**
*   **Structure:** MVP (Model-View-Presenter)
*   **Verified Working:**
    *   Google Auth (Login/Logout).
    *   User profile data loads into `myQuicaModel.userProfile` on login.
    *   `myQuicaModel.cart` updates correctly when items added.
    *   Basic transition to static "Order Placed" screen works.
    *   First-time user profile setup with role selection ('requester'/'both'), address, and phone input.
    *   Order placement persists order to Firestore with 'Unassigned' status.
    *   Requester order tracking screen displays basic status updates ('Unassigned', 'Assigned', 'PickedUp').
    *   Deliverer view allows activating/deactivating delivery mode.
    *   Deliverers with 'both' role can see available ('Unassigned') orders.
    *   Deliverers can accept available orders, updating status to 'Assigned' and assigning deliverer info in Firestore.
    *   Deliverer view separates "Ongoing Deliveries" from "Available Orders".
    *   Deliverers can mark an 'Assigned' order as 'PickedUp'.
    *   Top bar displays user name and functional Sign Out button.
*   **User Object:** Contains `uid`, `email`, `displayName`, `role` ('requester' or 'both'), `delivererStatus` ('active'/'inactive'/null), `address`, `phone`, etc.
*   **Order Object:** Contains requester/deliverer info, items, totals, status ('Unassigned' -> 'Assigned' -> 'PickedUp' etc.), timestamps (`createdAt`, `updatedAt`, `assignedAt`, `pickedUpAt`, etc.).

## 2. Original Goals (Recap)

1.  **Complete User Profile Setup:** ✅
2.  **Enhance Home Screen:** ✅ (Basic structure, TopBar widgets)
3.  **Implement Order Creation:** ✅
4.  **Implement Dynamic Order Status:** ✅ (Basic tracking implemented)
5.  **Improve Item Display:** ✅

## 3. Detailed Implementation Blocks & Status

---

### **Block 1: First-Time User Profile Setup Screen** ✅

*   **Goal:** Collect Role Preference ('requester'/'both'), Address, Phone after first sign-up and update Firestore.
*   **Status:** Completed and Verified Working.

---

### **Block 2: Home Screen Enhancements & Layout** ✅

*   **Goal:** Structure the main logged-in view with a top bar, Order/Deliver toggle, and basic Deliver area placeholder.
*   **Status:** Completed and Verified Working. (Placeholder replaced in Block 6).

---

### **Block 3: Item Display & Layout Improvements** ✅

*   **Goal:** Improve item display (cards), fix image handling, and optimize layout.
*   **Status:** Completed and Verified Working.

---

### **Block 4: Order Placement & Backend Logic** ✅

*   **Goal:** When "Place Order" is clicked, create the Order document in Firestore with 'Unassigned' status.
*   **Status:** Completed and Verified Working.

---

### **Block 5: Dynamic Order Status Tracking (Requester UI - Initial)** ✅

*   **Goal:** Show real-time order status updates on the screen after placing an order. Implement basic tracking presenter and view.
*   **Status:** Completed and Verified Working (Further updates in Block 8).
*   **Implementation Details:**
    *   Added `currentlyTrackedOrder` state and related actions/listeners in Model/Persistence.
    *   Created `OrderTrackingPresenter` and `OrderTrackingView`.
    *   Integrated into App logic to show tracking screen for active orders.

---

### **Block 6: Deliverer View & Order Acceptance** ✅

*   **Goal:** Implement the Deliverer view, allowing activation, viewing available orders, and accepting them.
*   **Status:** Completed and Verified Working.
*   **Implementation Details:**
    *   Added deliverer-specific state/actions (`acceptingOrderId`, `acceptOrderError`, `toggleDelivererStatus`, `acceptOrder`) to `QuicaModel`.
    *   Added `assignOrderToDeliverer` persistence function.
    *   Created `DelivererView`, `AvailableOrderCard`, and `DelivererPresenter`.
    *   Corrected listener logic in `persistence.js` to handle the "both" role correctly for activating available/assigned order listeners.
    *   Integrated `DelivererPresenter` into `HomePage`.
    *   Added defensive check in `AvailableOrderCard` for missing `requesterAddress`.

---

### **Block 7: Top Bar User Profile & Sign Out** ✅

*   **Goal:** Add user name display and sign-out functionality to the top bar.
*   **Status:** Completed and Verified Working.
*   **Implementation Details:**
    *   Created `UserProfileWidget` component.
    *   Integrated widget into `TopBar`, passing `userName` and `onSignOut` props.
    *   Added sign-out logic (calling Firebase `signOut`) to `HomePage` presenter.

---

### **Block 8: Deliverer Status Update (Picked Up)** ✅

*   **Goal:** Allow deliverers to mark assigned orders as 'PickedUp', updating Firestore and the requester's view.
*   **Status:** Completed and Verified Working.
*   **Implementation Details:**
    *   Modified `updateOrderStatus` in persistence to add `pickedUpAt` timestamp.
    *   Added state/action (`updatingOrderStatusId`, `updateOrderStatusError`, `updateDelivererOrderStatus`) to `QuicaModel`.
    *   Created `OngoingOrderCard` component to display assigned orders.
    *   Updated `DelivererView` to show separate "Ongoing Deliveries" list using `OngoingOrderCard` and pass status update props.
    *   Updated `DelivererPresenter` to handle status updates.
    *   Updated `OngoingOrderCard` with "Items Picked Up" button logic (visible when status is 'Assigned').
    *   Updated requester's `OrderTrackingView` to display specific message ("Your order has been picked up!") and ETA ("~5 minutes") when status is 'PickedUp'.

---

## 4. Remaining Steps & Considerations

*   **Deliverer Order Status Updates (Post-Pickup):**
    *   Implement UI buttons/actions in `OngoingOrderCard` for subsequent statuses (e.g., "Start Delivering", "Arrived", "Confirm Delivery").
    *   Update `updateOrderStatus` in persistence to handle these statuses and add relevant timestamps (e.g., `deliveredAt`).
    *   Update `QuicaModel` actions if needed.
*   **Requester Order Tracking UI:**
    *   Enhance `OrderTrackingView` to display appropriate messages/UI for 'Delivering' and 'Delivered' statuses.
    *   Consider adding more dynamic ETA or map view (stretch goal).
*   **API Key / Grocery Loading:**
    *   **Resolve 402 Error:** Address the Spoonacular API quota issue (wait, new key, or implement environment variables for the key).
    *   **Price Simulation:** Ensure a reliable way to add prices to items fetched from the API *before* they are added to the cart, as prices are needed for `placeOrder`. Currently, prices might be missing.
*   **Error Handling:** Improve user-facing feedback for errors (e.g., failed order placement, failed status updates, API errors) beyond console logs. Use the `errorMessage`, `orderError`, `acceptOrderError`, etc., states in the model more effectively in the UI.
*   **Firestore Security Rules:** Implement rules to ensure users can only read/write data according to their roles and ownership (e.g., requesters see own orders, deliverers see available/assigned orders, users can only update their own profile).
*   **Testing & Refinement:** Thoroughly test all user flows for both roles. Refine UI/UX based on testing.
*   **Styling:** Continue refining component styling for consistency and usability.
