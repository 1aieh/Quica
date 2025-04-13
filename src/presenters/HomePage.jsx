import { observer } from "mobx-react-lite";
import { myQuicaModel } from "../model/QuicaModel";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/persistence";
import TopBar from "../components/TopBar";
import GroceryListPresenter from "./GroceryListPresenter";
import CartPresenter from "./CartPresenter";
import DelivererPresenter from "./DelivererPresenter";
import OrderPlacedView from "../components/requester/OrderPlacedView";

const HomePage = observer(() => {
  const handleModeChange = (mode) => {
    myQuicaModel.setViewMode(mode);
  };

  // Get user display name from model
  const userName = myQuicaModel.userProfile?.displayName || myQuicaModel.user?.displayName || 'User';

  // Handle sign out
  const handleSignOut = () => {
    signOut(auth).catch((error) => {
      console.error("Sign out error:", error);
      myQuicaModel.setError("Failed to sign out");
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar
        address={myQuicaModel.userProfile?.address || "No address set"}
        currentMode={myQuicaModel.viewMode}
        onModeChange={handleModeChange}
        userName={userName}
        onSignOut={handleSignOut}
      />
      
      <div className="max-w-7xl mx-auto px-2 py-6">
        {myQuicaModel.orderJustPlaced ? (
          <OrderPlacedView order={myQuicaModel.requesterOrders[myQuicaModel.requesterOrders.length - 1]} />
        ) : myQuicaModel.viewMode === 'order' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <GroceryListPresenter />
            </div>
            <div>
              <CartPresenter />
            </div>
          </div>
        ) : (
          <DelivererPresenter />
        )}
      </div>
    </div>
  );
});

export default HomePage;
