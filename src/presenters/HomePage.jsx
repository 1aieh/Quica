import { observer } from "mobx-react-lite";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { myQuicaModel } from "../model/QuicaModel";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/persistence";
import TopBar from "../components/TopBar";
import GroceryListPresenter from "./GroceryListPresenter";
import CartPresenter from "./CartPresenter";
import DelivererPresenter from "./DelivererPresenter";
import OrderTrackingPresenter from "./OrderTrackingPresenter";
import AdminPanelPresenter from "./AdminPanelPresenter";
import ProfileSetupPresenter from "./ProfileSetupPresenter";

// This component contains the main layout that's shared between order view modes
const HomeLayout = ({ children }) => {
  const navigate = useNavigate();
  const userName = myQuicaModel.userProfile?.displayName || myQuicaModel.user?.displayName || 'User';
  const userEmail = myQuicaModel.user?.email;

  const handleModeChange = (mode) => {
    myQuicaModel.setViewMode(mode);
    navigate(`/${mode}`);
  };

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
        userEmail={userEmail}
        onSignOut={handleSignOut}
      />
      <div className="max-w-7xl mx-auto px-2 py-6">
        {children}
      </div>
    </div>
  );
};

// Display the grocery list and cart when no active order
const GroceryView = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
    <div className="md:col-span-2">
      <GroceryListPresenter />
    </div>
    <div>
      <CartPresenter />
    </div>
  </div>
);

// Order mode view that shows either tracking or grocery list
const OrderModeView = observer(() => {
  if (myQuicaModel.currentlyTrackedOrder) {
    return <OrderTrackingPresenter />;
  }
  return <GroceryView />;
});

const HomePage = observer(() => {
  // If profile is incomplete, show profile setup immediately
  if (!myQuicaModel.isProfileSetupComplete) {
    return <ProfileSetupPresenter />;
  }

  // Main application views - always within HomeLayout
  return (
    <HomeLayout>
      <Routes>
        <Route path="order" element={<OrderModeView />} />
        <Route path="deliver" element={<DelivererPresenter />} />
        <Route path="admin" element={<AdminPanelPresenter />} />
        <Route path="/" element={<Navigate to="/order" replace />} />
      </Routes>
    </HomeLayout>
  );
});

export default HomePage;
