import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import GroceryListView from '../components/requester/GroceryListView';
import OngoingOrderBannerView from '../components/requester/OngoingOrderBannerView';
import { myQuicaModel } from '../model/QuicaModel.js';

const GroceryListPresenter = observer(() => {
  useEffect(() => {
    if (myQuicaModel.groceryItems.length === 0 && 
        myQuicaModel.user && 
        (!myQuicaModel.userProfile?.delivererStatus || myQuicaModel.userProfile.delivererStatus !== 'active')) {
      myQuicaModel.loadGroceryItems('pizza');
    }
  }, [myQuicaModel.user, myQuicaModel.userProfile?.delivererStatus]);

  // Display a custom message when in active deliver mode
  if (myQuicaModel.userProfile?.delivererStatus === 'active') {
    return (
      <div className="min-h-[300px]">
        <div className="text-center p-4 text-gray-600">
          To place an order, deactivate deliver mode
        </div>
      </div>
    );
  }

  const handleAddToCart = (item) => {
    myQuicaModel.addToCart(item);
  };

  // Get the active order from the model's computed property
  const activeOrder = myQuicaModel.activeRequesterOrder;

  return (
    <div className="min-h-[300px]">
      {/* Conditionally render the banner if there's an active order */}
      {activeOrder && <OngoingOrderBannerView order={activeOrder} />}

      <GroceryListView
        items={myQuicaModel.groceryItems}
        onAddToCart={handleAddToCart}
        loading={myQuicaModel.isLoading}
        error={myQuicaModel.errorMessage}
      />
    </div>
  );
});

export default GroceryListPresenter;
