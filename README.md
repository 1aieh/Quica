# Quica - Grocery Delivery Project (DH2642)

## What is Quica?

### [Watch Demo Video (1:17)](https://vimeo.com/1075153820?share=copy)

Quica is a simple web app connecting people who want groceries delivered (Requesters) with folks willing to do the shopping and delivery (Deliverers).

Think of it like a mini-Instacart focused on quick, local deliveries. Requesters can browse items, add them to a cart, and place an order. Deliverers can see available orders nearby and accept them to earn a fee. The app provides real-time status updates for both users.

## How it Works (The Gist)

*   **Frontend:** Built with React (using Vite) and styled with Tailwind CSS.
*   **State Management:** Uses MobX for reactive state management in the browser (`myQuicaModel`). This keeps track of the logged-in user, their cart, relevant orders, etc.
*   **Backend & Persistence:** Firebase handles user authentication (Google Sign-in) and stores data (user profiles, orders) in Firestore (our database).
*   **Real-time Updates:** Firestore listeners update the MobX model automatically when data changes (like order status), so the UI refreshes without manual intervention.
*   **API:** Uses the Spoonacular API to fetch grocery item names and images (prices are simulated for now).
*   **Architecture:** Follows a Model-View-Presenter (MVP) pattern to keep things organized:
    *   **Model:** The MobX store (`QuicaModel.js`) holding the app's current data.
    *   **Views:** React components (`src/components/`) that just display stuff based on data passed to them.
    *   **Presenters:** React components (`src/presenters/`) that connect the Model data to the Views and handle user interactions.
    *   **Persistence:** Code (`src/firebase/`) that talks to Firebase to save/load data and update the Model.

## Current Features (Mid-Project)

*   Google Sign-in / Sign-out.
*   First-time user profile setup (choose role preference, add address/phone).
*   Browse grocery items fetched from Spoonacular (with simulated prices).
*   Add items to a frontend cart.
*   Place an order (saves to Firestore).
*   **Requester:** View real-time status updates for their placed order ("Finding Rider", "Rider Found", "Picked Up").
*   **Deliverer:** Activate/deactivate delivery mode.
*   **Deliverer:** View available ("Unassigned") orders.
*   **Deliverer:** Accept an order (updates status, assigns deliverer in Firestore).
*   **Deliverer:** View ongoing deliveries separately.
*   **Deliverer:** Mark an assigned order as "Picked Up" (updates status in Firestore).

## How to Run & Test the Core Flow

You'll need two browser tabs/windows to see both sides!

1.  **Sign Up / Profile Setup:**
    *   Open the deployed app link.
    *   Click "Sign in with Google" and use a Google account.
    *   If it's your first time, you'll see the "Tell us about yourself" screen.
        *   Select "Ordering & Delivering" (to test both roles).
        *   Enter a test address and phone number.
        *   Click "Save Profile".
    *   You should now be on the main "Order" screen.

2.  **Place an Order (Tab 1 - Requester):**
    *   Browse the items (fetched from Spoonacular).
    *   Click "Add to Cart" on a few items.
    *   Look at the cart display (usually visible on the same screen or via a link) to see your items.
    *   Click the "Place Order" button (often near the cart).
    *   The screen should change to show "Order placed successfully! Finding rider...". Keep this tab open.

3.  **Accept and Progress Order (Tab 2 - Deliverer):**
    *   Open a **new browser tab** (or incognito window) and go to the same app link.
    *   Sign in with a **DIFFERENT** Google account.
    *   Complete the profile setup (again, select "Ordering & Delivering", enter different test details).
    *   You'll land on the "Order" screen. Click the "Deliver" toggle/button in the top bar.
    *   Activate the "Delivery Mode" toggle/switch.
    *   You should see the order placed in Tab 1 appear under "Available Orders".
    *   Click the "Accept Order" button on that order card.
        *   **Check Tab 1:** The status should automatically change to "Rider found! [Deliverer Name] is picking up your order."
    *   **Back in Tab 2:** The accepted order should move to your "Ongoing Deliveries" list.
    *   Click the "Items Picked Up" button on the ongoing order card.
        *   **Check Tab 1:** The status should automatically change to "Your order has been picked up! (...ETA)".

This demonstrates the core loop: order placement, real-time visibility for deliverers, order acceptance updating both users, and subsequent status updates initiated by the deliverer reflecting for the requester.

## Future Plans

*   Implement remaining deliverer status updates (Delivering, Delivered).
*   Enhance requester tracking UI (maybe ETA, map later).
*   Fix API quota issues / potentially use a more stable API or handle keys better.
*   Implement proper Firestore security rules.
*   Improve error handling for users.
*   General UI/UX polishing.

## File Structure Overview

*   `src/api/`: Code for talking to external APIs (Spoonacular).
*   `src/components/`: Reusable UI building blocks (Views - dumb components). Organized by role (auth, requester, deliverer, common, layout).
*   `src/firebase/`: Firebase configuration and the persistence layer (talks to Firestore, handles auth state).
*   `src/model/`: The MobX application state (`QuicaModel.js`).
*   `src/presenters/`: Connects Model data to Views and handles UI logic.
*   `src/App.jsx`: Root component, handles routing/top-level view switching.
*   Other standard Vite/React config files (`vite.config.js`, `package.json`, etc.)

---