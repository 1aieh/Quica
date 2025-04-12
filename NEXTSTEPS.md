## 1. Project Context Recap & Current State

*   **App:** Quica (Grocery delivery, Requester/Deliverer roles)
*   **Tech:** React, Vite, MobX (`myQuicaModel`), Firebase (Auth - Google, Firestore)
*   **API:** Spoonacular API (for item names/images), **Simulated Prices** needed.
*   **Structure:** MVP (Model-View-Presenter)
*   **Verified Working:**
    *   Google Auth (Login/Logout).
    *   User profile data loads into `myQuicaModel.userProfile` on login.
    *   `myQuicaModel.cart` updates correctly when items added.
    *   Basic transition to static "Order Placed" screen works.
    *   First-time user profile setup with role selection, address, and phone input.
*   **User Object:** Contains `uid`, `email`, `displayName`, `role` ('requester' initially), `delivererStatus` (null initially), `address`, `phone`, etc.
*   **Order Object:** Will contain requester/deliverer info, items, totals, status ('Unassigned' -> 'Assigned' etc.), timestamps.

## 2. Goals for Next Session (Targeting Peer Review)

1.  **Complete User Profile Setup:** Implement the "Tell us about yourself" screen.
2.  **Enhance Home Screen:** Add top bar widgets, Order/Deliver toggle, basic Deliver view.
3.  **Implement Order Creation:** Persist orders to Firestore when "Place Order" is clicked.
4.  **Implement Dynamic Order Status:** Make the Requester's order screen react to status changes in Firestore.
5.  **Improve Item Display:** Style grocery items as vertical cards.

## 3. Detailed Next Steps & Implementation Blocks

---

### **Block 1: First-Time User Profile Setup Screen** ✅

*   **Goal:** Collect Role Preference, Address, Phone after first sign-up and update Firestore.
*   **Status:** Completed and Verified Working
*   **Implementation Details:**
    *   Added `isProfileSetupComplete` state and actions to `QuicaModel`.
    *   Created `ProfileSetupView` with role selection (Ordering Only/Both), address, and phone inputs.
    *   Implemented `updateUserProfile` in persistence layer with Firestore integration.
    *   Created `ProfileSetupPresenter` to handle form submission and user profile updates.
    *   Updated `App.jsx` to conditionally render profile setup for new users.
    *   Data is properly persisted to Firestore with automatic profile completion tracking.

    1.  **Modify Model (`QuicaModel.js`):**
        *   Add a state property like `isProfileSetupComplete = false`. Initialize it based on loaded `userProfile` data (check if `address` or `phone` is filled, or use a dedicated `profileComplete` flag loaded from Firestore).
        *   Add an action `setProfileSetupComplete(isComplete)`.
    2.  **Create UI Component (`ProfileSetupView.jsx`):**
        *   Build the view: H1 "Tell us about yourself", "I'm interested in..." heading, two clickable "cards" (Ordering [default selected], Delivering) with subtitles, Address input, Phone input, "Save Profile" button.
        *   Use local `useState` to manage the input values and the selected role preference ('orderOnly' or 'deliverToo').
    3.  **Create Persistence Function (`persistence.js`):**
        *   Add an exported async function `updateUserProfile(userId, dataToUpdate)`. Use `updateDoc` to update the `/users/{userId}` document in Firestore. Handle errors.
    4.  **Create Presenter (`ProfileSetupPresenter.jsx`):**
        *   Wrap with `observer`, import `myQuicaModel`, `ProfileSetupView`, `updateUserProfile`.
        *   Manage local state from the view inputs/selections.
        *   Implement `handleSaveProfile`:
            *   Determine `role` ('requester' or 'both') and `delivererStatus` ('inactive' or null) based on selection.
            *   Get `address` and `phone` from state.
            *   Create `updateData = { role, delivererStatus, address, phone, profileComplete: true }`.
            *   Call `await updateUserProfile(myQuicaModel.user.uid, updateData)`.
            *   On success, call `myQuicaModel.setProfileSetupComplete(true)` (or update the local userProfile in the model). Handle errors.
        *   Render `<ProfileSetupView />` with necessary props/handlers.
    5.  **Integrate into App Logic (`App.jsx` or similar):**
        *   Wrap `App.jsx` with `observer`.
        *   Conditionally render based on `myQuicaModel.user` and `myQuicaModel.isProfileSetupComplete`.
        *   If logged in but profile *not* complete -> Render `<ProfileSetupPresenter />`.
        *   If logged in and profile *is* complete -> Render main app view (Block 2).

---

### **Block 2: Home Screen Enhancements & Layout**

*   **Goal:** Structure the main logged-in view with a top bar, Order/Deliver toggle, and basic Deliver area.

    1.  **Modify Model (`QuicaModel.js`):**
        *   Add state property `viewMode = 'order'`.
        *   Add action `setViewMode(mode)`.
    2.  **Create UI Component (`TopBar.jsx`):**
        *   Build the component with 3 sections (Left: Address Widget, Middle: Order/Deliver Segmented Button, Right: Placeholder).
        *   Address Widget: Takes `address` prop, displays "Delivering At" + address.
        *   Segmented Button: Takes `currentMode` and `onModeChange` props. Highlights active button, calls `onModeChange('order')` or `onModeChange('deliver')`.
    3.  **Create UI Component (`DeliverViewPlaceholder.jsx`):**
        *   Build a simple static view for now: "Activate Delivery Mode" toggle/button (non-functional initially), "Your Deliveries" heading, "Available Orders" heading.
    4.  **Create Container/Presenter (`HomePage.jsx` - Replaces direct rendering in App):**
        *   Wrap with `observer`. Import `myQuicaModel`, `TopBar`, `GroceryListPresenter`, `DeliverViewPlaceholder`.
        *   Read `myQuicaModel.viewMode`, `myQuicaModel.userProfile.address`.
        *   Define `handleModeChange = (mode) => myQuicaModel.setViewMode(mode)`.
        *   Render `<TopBar address={...} currentMode={...} onModeChange={handleModeChange} />`.
        *   Conditionally render `<GroceryListPresenter />` if `viewMode === 'order'`.
        *   Conditionally render `<DeliverViewPlaceholder />` if `viewMode === 'deliver'`.
    5.  **Update `App.jsx`:**
        *   When user is logged in and profile is complete, render `<HomePage />`.

---

### **Block 3: Item Display Styling**

*   **Goal:** Display grocery items from Spoonacular as vertical cards.

    1.  **Create UI Component (`GroceryItemCard.jsx`):**
        *   Takes `item` and `onAddToCart` props.
        *   Use Tailwind CSS. Structure:
            *   Outer card `div`.
            *   `<img>` tag for `item.imageUrl` (check if it exists).
            *   `div` for `item.name`.
            *   `div` for `item.price` (remember this is simulated!).
            *   "Add to Cart" button calling `onAddToCart(item)`.
    2.  **Update UI Component (`GroceryListView.jsx`):**
        *   Modify the rendering logic. Instead of `<li>`, map `items` to render `<GroceryItemCard item={item} onAddToCart={onAddToCart} />`.
        *   Use Flexbox (`flex flex-wrap`) or Grid (`grid grid-cols-..`) to arrange the cards nicely.

---

### **Block 4: Order Placement & Backend Logic**

*   **Goal:** When "Place Order" is clicked, create the Order document in Firestore.

    1.  **Modify Model (`QuicaModel.js`):**
        *   Add state `orderInProgress = false` (or use `isLoading`).
        *   Add state `orderError = null`.
        *   Add state `orderJustPlacedId = null` (to store ID of newly created order).
        *   Add action `setOrderJustPlacedId(orderId)`.
        *   Add action `clearCart() { this.cart = []; }`.
        *   Create `async placeOrder()` action:
            *   Set `orderInProgress = true`, `orderError = null`.
            *   Get required data: `cart = this.cart`, `userProfile = this.userProfile`, `userId = this.user.uid`.
            *   Calculate `itemSubtotal` and `totalPrice` (subtotal + deliveryFee). **Ensure items in cart have simulated prices.**
            *   Construct the `orderData` object matching your target Firestore structure (status 'Unassigned', include items, totals, requester info, null fields for deliverer, timestamps).
            *   `try...catch` block:
                *   Call `const orderId = await createOrder(orderData);` (**Needs persistence function**).
                *   Call `this.setOrderJustPlacedId(orderId)`.
                *   Call `this.clearCart()`.
            *   Handle errors in `catch`, set `orderError`.
            *   Set `orderInProgress = false` in `finally`.
    2.  **Create Persistence Function (`persistence.js`):**
        *   Add exported async function `createOrder(orderData)`.
        *   Use `addDoc(collection(db, "orders"), orderData)` to add the order to Firestore.
        *   Return the new document's ID (`newDocRef.id`). Handle errors.
    3.  **Update UI/Presenter (Cart View/Presenter):**
        *   Add a "Place Order" button if not already present.
        *   Disable button if `myQuicaModel.orderInProgress` is true.
        *   Connect the button's `onClick` to call `myQuicaModel.placeOrder()`.
        *   Display `myQuicaModel.orderError` if it exists.

---

### **Block 5: Dynamic Order Status Tracking (Requester UI)**

*   **Goal:** Show real-time order status updates on the screen after placing an order.

    1.  **Modify Model (`QuicaModel.js`):**
        *   Add state `currentlyTrackedOrder = null`.
        *   Add action `setCurrentlyTrackedOrder(orderData)`.
        *   Modify `clearUserData` to also set `currentlyTrackedOrder = null`, `orderJustPlacedId = null`.
    2.  **Modify Persistence Logic (`persistence.js`):**
        *   Need a mechanism to **start listening** to the specific order document *after* it's placed.
        *   Modify `onAuthStateChanged` or create a new function: When a user logs in, check if `myQuicaModel.orderJustPlacedId` has a value (maybe store this ID in the user profile too?). If so, set up the listener.
        *   Alternatively, trigger listener setup from the model after `placeOrder` succeeds.
        *   The listener function (`setupOrderListener(orderId)`):
            *   Stores the unsubscribe function returned by `onSnapshot`.
            *   Uses `onSnapshot(doc(db, "orders", orderId), (docSnap) => { ... })`.
            *   Inside the callback: if `docSnap.exists()`, call `myQuicaModel.setCurrentlyTrackedOrder({ id: docSnap.id, ...docSnap.data() })`. Handle errors/doc deletion.
        *   Ensure listener is **unsubscribed** (`unsubscribe()`) on logout, or when the order reaches a final state (Delivered/Cancelled), or when navigating away.
    3.  **Create Presenter (`OrderTrackingPresenter.jsx`):**
        *   Wrap with `observer`. Import `myQuicaModel`.
        *   Read `myQuicaModel.currentlyTrackedOrder`.
        *   If `!currentlyTrackedOrder`, show loading or "No active order".
        *   Conditionally render based on `currentlyTrackedOrder.status`:
            *   `'Unassigned'`: "Order placed successfully! Finding rider..."
            *   `'Assigned'`: "Rider found! {currentlyTrackedOrder.delivererName || 'Your rider'} is picking up your order."
            *   Add other statuses ('PickedUp', 'Delivered', 'Cancelled') later.
    4.  **Integrate into App Logic (`App.jsx` / `HomePage.jsx`):**
        *   Modify the main view logic. If `myQuicaModel.orderJustPlacedId` is set OR `myQuicaModel.currentlyTrackedOrder` exists and has a non-final status, render `<OrderTrackingPresenter />` instead of the Order/Deliver views.

---

**Key Considerations:**

*   **Price Simulation:** Ensure prices are added correctly when fetching from Spoonacular in `groceryAPI.js` or `loadGroceryItems`. These prices are needed for `placeOrder`.
*   **Error Handling:** Add user-facing error messages for API calls, Firestore writes, etc.
*   **State Management:** Decide carefully where state belongs (local component state vs. global MobX model state). Use MobX for shared state needed across different presenters/views.
*   **Real-time Listeners:** Be mindful of starting/stopping Firestore listeners correctly to avoid leaks and unnecessary reads.
