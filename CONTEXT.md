# Quica Project - Context for Development (DH2642)

## 1. Project Overview

**Quica** is a two-sided interactive web application built with React. It connects:

1.  **Requesters:** Users who want groceries delivered.
2.  **Deliverers:** Users willing to shop for and deliver grocery orders.

The application provides separate interfaces and functionalities tailored to each role, facilitating order placement, management, and fulfillment with real-time updates. A key goal is a smooth, potentially game-inspired (for demo), user experience.

## 2. Course Goals & Grading Emphasis (DH2642)

The primary goal of this course project is to practice building **highly-usable, data-persistent interactive web applications** following **well-architected GUI programming paradigms (specifically Model-View-Presenter or related)**.

**High grades (A/B) heavily depend on:**

1.  **Architecture/Code (Separation of Concerns):**
    *   Strict adherence to **MVP (Model-View-Presenter)**.
    *   **Clear separation** between:
        *   **Application State (Model):** Reactive data store (`QuicaModel.js` using MobX).
        *   **Views (Components):** Dumb UI components (`src/components/`). Should **not** contain state logic, API calls, or persistence logic.
        *   **Presenters:** Connect Model and Views (`src/presenters/`). Handle user interactions, fetch/format data from the Model for Views, call Model/Persistence actions.
        *   **Persistence:** Dedicated module (`src/firebase/persistence.js`) interacting with Firebase for Auth and Database (Firestore), updating the Model based on backend changes.
        *   **Navigation:** Handled separately (e.g., using `react-router-dom`).
    *   **Avoiding mixing concerns** (e.g., state logic in Views, persistence calls in Presenters) is critical. See grading rubric.

2.  **Usability/User Experience:**
    *   Clear target group and benefits.
    *   Efficient task accomplishment for both Requesters and Deliverers.
    *   **Excellent feedback** on user actions and **high visibility of system status** (e.g., real-time order updates).
    *   **Documented user consultation/testing:** Requires prototyping feedback and formative evaluation leading to documented, ideally creative, improvements. (Crucial for 'A' grade / UX Prize).
    *   **UX Prize (40p Bonus):** Awarded for outstanding user experience, potentially including originality and mobile-first design. This is a primary target.

3.  **Web APIs and Persistence:**
    *   Application state **must** be persisted on a server (Firebase).
    *   **Per-user persistence:** Data must be linked to an **authenticated user**. Users must **only** see their own relevant data (e.g., their orders, their cart, available orders if deliverer). This is achieved via Firebase Auth and Firestore rules/queries based on `user.uid`.
    *   Use of at least one external Web API (e.g., for grocery items - `src/api/`).
    *   **Real-time updates:** UI should update automatically when underlying persisted data changes (e.g., using Firebase `onSnapshot`). (Bonus potential: Reactivity on persistence - 5p).

4.  **Group Cooperation:** Documented roles and balanced work.

## 3. Core Architectural Principles & Implementation Plan

*   **Pattern:** Model-View-Presenter (MVP)
*   **Model (`src/model/QuicaModel.js`):**
    *   Uses **MobX** for reactivity (`makeAutoObservable`).
    *   Single, shared instance (`myQuicaModel`).
    *   Holds **current application state** relevant to the logged-in user:
        *   `user`: Firebase Auth user object (or null/undefined).
        *   `userProfile`: Data loaded from Firestore `users` collection (role, etc.).
        *   `cart`, `requesterOrders`, `availableOrders`, `delivererOrders`: Arrays holding *relevant* data loaded from Firestore.
        *   Loading/error states.
    *   Provides **actions** (methods) to modify state (e.g., `setUser`, `setOrders`, `addToCart`). Actions are called by Presenters or the Persistence layer.
*   **Views (`src/components/`):**
    *   Purely presentational React components.
    *   Receive data and callback functions as props from Presenters.
    *   Grouped by role (requester, deliverer, auth, common).
    *   Styled using **Tailwind CSS**.
*   **Presenters (`src/presenters/`):**
    *   React components that act as intermediaries.
    *   Import the `myQuicaModel` instance.
    *   Use the **`observer`** HOC from `mobx-react-lite` to react to Model changes.
    *   Read data from the Model.
    *   Pass data and action callbacks (e.g., `() => myQuicaModel.addToCart(item)`) down to View components.
    *   Handle UI events from Views and call Model actions.
*   **Persistence (`src/firebase/persistence.js`):**
    *   Initializes Firebase (`firebaseConfig.js`).
    *   Exports the `auth` object.
    *   **Crucially implements `onAuthStateChanged`:**
        *   Updates `myQuicaModel.user`.
        *   Checks for/creates user profile document in Firestore (`users` collection, doc ID = `user.uid`) on first sign-in.
        *   Loads `userProfile` into the model.
        *   Sets up/cleans up **real-time Firestore listeners (`onSnapshot`)** based on user role and UID to fetch relevant data (e.g., user's orders, available orders).
        *   Updates the Model (`myQuicaModel.setXyzOrders()`) when Firestore data changes.
        *   Clears user-specific data from the model on sign-out (`myQuicaModel.clearUserData()`).
*   **Routing (`src/router/`):**
    *   Uses `react-router-dom`.
    *   Managed likely within `App.jsx` or a dedicated router component.
    *   Navigates between Auth page and role-specific pages based on `myQuicaModel.user` and potentially `myQuicaModel.userProfile.role`.
*   **Root Component (`src/App.jsx`):**
    *   Wrapped with `observer`.
    *   Checks `myQuicaModel.user` state to render:
        *   Loading indicator (if `user === undefined`).
        *   Auth Presenter/Page (if `user === null`).
        *   Main application Router/Layout (if `user` is truthy).

## 4. Technology Stack

*   **Framework/Library:** React 18+
*   **Build Tool:** Vite
*   **Language:** JavaScript (ES6+)
*   **State Management:** MobX (`mobx`, `mobx-react-lite`)
*   **Backend/Persistence:** Firebase (Authentication, Firestore)
*   **Styling:** Tailwind CSS
*   **Routing:** React Router DOM (`react-router-dom`)

## 5. System Workflow Overview (Order Lifecycle)

1.  **Auth:** User signs up/logs in (Firebase Auth). `onAuthStateChanged` fires.
2.  **Persistence:** Creates user profile in Firestore if needed, loads profile/role into MobX model. Sets up relevant Firestore listeners.
3.  **Requester:**
    *   Browses items (potentially from `src/api/`).
    *   Adds items to cart (updates `model.cart`).
    *   Places order -> triggers action that writes a new document to Firestore `orders` collection (status: 'Unassigned', includes cart, user info, address).
    *   Views order status (Presenter reads `model.requesterOrders`, updated in real-time by `onSnapshot`).
4.  **Deliverer:**
    *   Views available orders (Presenter reads `model.availableOrders`, populated by `onSnapshot` listening for status: 'Unassigned').
    *   Accepts an order -> triggers action that updates the order document in Firestore (sets `rider-id` = current user UID, status = 'Assigned').
    *   `onSnapshot` updates lists for all relevant users (order disappears from available, appears in deliverer's assigned list, status updates for requester).
    *   Deliverer updates status (Picked Up, Delivering, Arrived) -> triggers Firestore updates.
    *   Deliverer marks as Delivered -> final Firestore update.

## 6. Key Functionalities Required (MVP)

**Authentication:**

*   Sign-up (Email/Password or Google)
        *   Sign-in (Google) - Implemented and Verified
        *   Sign-out - Implemented and Verified

**Requester Role:**

*   View grocery items (potentially fetched from API)
*   Add/remove items from a persistent cart (tied to user state)
*   View cart details (items, total value)
*   Place order (persisted to Firebase)
*   View list of own orders (pending, active, completed)
*   View real-time status updates for active orders

**Deliverer Role:**

*   View list of available (unassigned) orders
*   Accept an available order
*   View details of accepted orders (items, addresses, map?)
*   Update order status (e.g., Picked Up, Delivering, Arrived, Delivered) - persisted to Firebase
*   View list of own active/completed orders
*   View earnings/balance (potentially)

## 7. Firebase Integration Reminders

*   Use `onAuthStateChanged` in `persistence.js` as the central point for reacting to login/logout (Verified working).
*   Store user profile data in a Firestore collection (e.g., `users`) using the Firebase Auth `uid` as the document ID.
*   Structure Firestore queries for orders based on `user.uid` (for requesters/deliverers) and `status` (for available orders).
*   Use `onSnapshot` for real-time data updates to keep the MobX model synchronized.
*   User profile data is persisted in Firestore in the `users` collection, using the Firebase Auth `uid` as the document ID.
*   Orders are persisted in Firestore in the `orders` collection.
*   Ensure Firestore security rules are configured eventually to enforce per-user data access.

## 8. High-Grade Strategy Summary

*   **Prioritize Clean Architecture:** Strict MVP separation is non-negotiable.
*   **Focus on UX:** Make workflows smooth, provide clear status feedback (real-time!), and conduct/document user testing for improvements (Aim for UX Prize).
*   **Implement Per-User Persistence Correctly:** Use Firebase Auth UID to link and query data.
*   **Leverage Real-time Updates:** Use `onSnapshot` effectively.

## 9. Development Notes for LLM

*   The user has chosen **JavaScript** and **MobX**.
*   Presenters and Root components using MobX state must be wrapped with `observer` from `mobx-react-lite`.
*   Assume standard Vite + React setup.
*   Focus suggestions on maintaining the described MVP structure.
*   When suggesting Firebase interactions, emphasize doing them within the `src/firebase/persistence.js` module or via actions in the Model that might call persistence functions, *not* directly in Presenters/Views.
*   Refer to `myQuicaModel` for accessing/updating application state.
