import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import GroceryListView from '../components/requester/GroceryListView';
import OngoingOrderBannerView from '../components/requester/OngoingOrderBannerView'; // Import the new banner view
import { myQuicaModel } from '../model/QuicaModel.js';

const GroceryListPresenter = observer(() => {
  useEffect(() => {
    if (myQuicaModel.groceryItems.length === 0 && myQuicaModel.user) {
      myQuicaModel.loadGroceryItems('pizza');  // Using example query from Spoonacular docs
    }
  }, [myQuicaModel.user]);

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
