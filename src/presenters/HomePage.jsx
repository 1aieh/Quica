import { observer } from "mobx-react-lite";
import { myQuicaModel } from "../model/QuicaModel";
import TopBar from "../components/TopBar";
import GroceryListPresenter from "./GroceryListPresenter";
import CartPresenter from "./CartPresenter";
import DeliverViewPlaceholder from "../components/DeliverViewPlaceholder";
import OrderPlacedView from "../components/requester/OrderPlacedView";

const HomePage = observer(() => {
  const handleModeChange = (mode) => {
    myQuicaModel.setViewMode(mode);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar
        address={myQuicaModel.userProfile?.address || "No address set"}
        currentMode={myQuicaModel.viewMode}
        onModeChange={handleModeChange}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
          <DeliverViewPlaceholder />
        )}
      </div>
    </div>
  );
});

export default HomePage;
