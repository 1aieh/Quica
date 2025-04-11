# Partner B: Laieh - Frontend & Presentation (`CONTEXT_B.md` - Google Sign-in, Simple API, Frontend Cart)

## Project Context Summary (from CONTEXT.md)

*   **Project:** Quica - A two-sided (Requester/Deliverer) interactive grocery delivery web app using React.
*   **Architecture:** Strict **Model-View-Presenter (MVP)** is required for high grades.
    *   **Model:** `src/model/QuicaModel.js` (Shared MobX store - `myQuicaModel`). Holds reactive app state (user, profile, items, cart, etc.). Managed by Bhavya.
    *   **Views:** `src/components/` (Your focus). Dumb UI components receiving data/callbacks via props. Use Tailwind CSS.
    *   **Presenters:** `src/presenters/` (Your focus). Connect Model & Views. Use `observer` HOC. Read from `myQuicaModel`, pass data/callbacks to Views, call Model actions on UI events.
    *   **Persistence:** `src/firebase/persistence.js`. Handles Firebase Auth/Firestore, updates Model via `onSnapshot`. Managed by Bhavya.
*   **Key Tech:** React 18+, Vite, JavaScript (ES6+), MobX (`mobx`, `mobx-react-lite`), Firebase (Auth, Firestore), Tailwind CSS, React Router DOM.
*   **Core Principles:** Clear separation of concerns (MVP), per-user persistence (data tied to `user.uid`), real-time UI updates (via MobX reacting to persistence changes), high usability (UX Prize target).
*   **Your Role:** Build UI components (Auth, Grocery List, Cart) and their Presenters, connecting them to the MobX model (`myQuicaModel`). Set up the main `App.jsx` structure for routing/display logic based on model state.

---

## Your Detailed Plan & Dependencies

**Your Goal:** Build the UI for Google Auth, Grocery List display (with "Add to Cart" buttons), and a simple Cart display. Create Presenters to handle interactions and connect Views to the MobX model managed by Bhavya. Set up `App.jsx`.

**Your Goal:** Build the UI for Google Auth, Grocery List display (with "Add to Cart" buttons), and a simple Cart display. Create Presenters to handle interactions and connect Views to the MobX model managed by Bhavya. Set up `App.jsx`.

**Core Modules:** `src/components/`, `src/presenters/`, `src/App.jsx`

**Context: Partner A (Bhavya)'s Parallel Work:**
*   Bhavya is setting up **Firebase** (Auth - Google Enabled, Firestore) & config.
*   Bhavya is implementing **`persistence.js`** (`onAuthStateChanged` reacting to your Google sign-in to update user/profile state in the model). He exports `auth`.
*   Bhavya is defining **`QuicaModel.js`** (MobX store) with state: `user`, `userProfile`, `groceryItems`, **`cart` (frontend cart)**, `isLoading`, `errorMessage`. He provides actions: `setUser`, `setUserProfile`, `loadGroceryItems`, **`addToCart`**, `clearUserData`.
*   Bhavya is creating **`groceryAPI.js`** which calls the **Simple Grocery Store API (`GET /products`)** and *simulates prices* for the items. The `loadGroceryItems` action uses this.

---

**Phase 1: Foundational Setup (~30 mins)**

1.  **Wait for Bhavya:** Need initial `firebaseConfig.js` (for `auth`) and `QuicaModel.js` (for model structure).
2.  **Basic Auth UI & Initial Views:**
    *   **Action:** Create `src/components/auth/GoogleSignInButton.jsx` (optional, button can be in presenter). Takes `onSignIn` prop.
    *   **Action:** Create `src/components/requester/GroceryListView.jsx`. Takes `items` array and **`onAddToCart` function** props. Renders item names and an "Add" button next to each, calling `onAddToCart(item)` when clicked.
    *   **Action:** Create `src/components/requester/CartView.jsx`. Takes `cartItems` array prop. Renders a simple list of item names (and maybe prices/quantity) from the cart.
    *   **Action:** `git add .`, `git commit -m "feat: Create basic auth, grocery list, and cart view components"`, `git push`.
    *   **Checkpoint/Communication:** Basic UI shells ready.

**Phase 2: Core Logic Implementation (~60 mins)**

1.  **Action:** `git pull` to get Bhavya's config/model.
2.  **Auth Presenter (Google Sign-in):**
    *   **Action:** Create `src/presenters/AuthPresenter.jsx`. Import `auth` from persistence. Implement `handleGoogleSignIn` using `signInWithPopup`. Render the sign-in button.
    *   **Action:** `git add .`, `git commit -m "feat: Implement AuthPresenter for Google Sign-in"`, `git push`.
    *   **Checkpoint/Communication:** Auth presenter ready, clicking should trigger Bhavya's `onAuthStateChanged`.
3.  **Grocery List Presenter:**
    *   **Action:** Create `src/presenters/GroceryListPresenter.jsx`.
    *   **Action:** Import `observer`, `useEffect`, `myQuicaModel`, `GroceryListView`. Wrap component with `observer`.
    *   **Action:** Use `useEffect` to call `myQuicaModel.loadGroceryItems()` on mount (if logged in).
    *   **Action:** Read `isLoading`, `errorMessage`, `groceryItems` from `myQuicaModel`.
    *   **Action:** Define `handleAddToCart = (item) => { myQuicaModel.addToCart(item); }`.
    *   **Action:** Render loading/error or `<GroceryListView items={myQuicaModel.groceryItems} onAddToCart={handleAddToCart} />`.
    *   **Action:** `git add .`, `git commit -m "feat: Implement grocery list presenter fetching data and handling add to cart"`, `git push`.
    *   **Checkpoint/Communication:** Grocery list should display data from Bhavya's API call and clicking "Add" should call his model action.
4.  **Cart Presenter:**
    *   **Action:** Create `src/presenters/CartPresenter.jsx`.
    *   **Action:** Import `observer`, `myQuicaModel`, `CartView`. Wrap component with `observer`.
    *   **Action:** Read `myQuicaModel.cart`.
    *   **Action:** Render `<CartView cartItems={myQuicaModel.cart} />`. (Add basic "Cart" heading).
    *   **Action:** `git add .`, `git commit -m "feat: Implement cart presenter displaying frontend cart state"`, `git push`.
    *   **Checkpoint/Communication:** Cart display ready, should reflect items added via `GroceryListPresenter`.

**Phase 3: Integration & Testing (~45 mins - Collaborative)**

1.  **Action:** `git pull` frequently.
2.  **Root Component (`App.jsx`) Setup:**
    *   **Action:** Coordinate on modifying `src/App.jsx`. Wrap with `observer`. Import presenters, model, auth utils.
    *   **Action:** Implement conditional rendering based on `myQuicaModel.user`:
        *   `undefined`: Loading...
        *   `null`: `<AuthPresenter />`
        *   `object`: Render main view including Welcome, Profile (`JSON.stringify(myQuicaModel.userProfile)`), **`<GroceryListPresenter />`**, **`<CartPresenter />`**, and Sign Out button.
    *   **Checkpoint:** App integrates auth, grocery list, and cart display based on shared model state.
3.  **Testing & Debugging:**
    *   **Action:** Run `npm run dev`.
    *   **Test:** Sign in via Google. Profile loads? Grocery list loads (items should come from Simple Grocery API, prices simulated by Bhavya)?
    *   **Test:** Click "Add to Cart" on several items. Does the `<CartPresenter />` display update correctly? Check model state via logs or React DevTools if needed.
    *   **Test:** Sign out. Sign back in. Is the cart empty (because Bhavya's `clearUserData` clears it)?
    *   **Action:** Debug UI (`observer` wraps, props, rendering logic). Communicate with Bhavya about model state issues.

**Phase 4: Deploy & Document (~15-30 mins - Collaborative)**

1.  **Action:** Coordinate build & deploy (Firebase Hosting). Get URL.
2.  **README.md:**
    *   **Action:** Detail UI components, Presenters, `App.jsx` logic, Google Sign-in flow, **Simple Grocery Store API** usage, mention **frontend cart** implementation for now, planned work (API cart integration, orders, roles, UI polish).
    *   **Action:** Commit & push final code/README.

**Key Dependencies on Bhavya:**

*   Need `firebaseConfig.js` (with Google Auth enabled) & exported `auth`.
*   Need `QuicaModel.js` with state (`user`, `userProfile`, `groceryItems`, `cart`, `isLoading`, `errorMessage`) and actions (`setUser`, `setUserProfile`, `loadGroceryItems`, `addToCart`, `clearUserData`).
*   Need `persistence.js` correctly updating `user`/`userProfile` in the model on Google sign-in.
*   Need `groceryAPI.js` correctly fetching from Simple Grocery API (`GET /products`) and *simulating prices* so `loadGroceryItems` provides usable data.
*   Need `addToCart` action in the model to work correctly.
