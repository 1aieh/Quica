import { observer } from 'mobx-react-lite';
import GroceryListView from '../components/requester/GroceryListView';

import { myQuicaModel } from '../model/QuicaModel.js';
import { useEffect } from 'react';

const GroceryListPresenter = observer(() => {
  useEffect(() => {
    if (myQuicaModel.groceryItems.length === 0 && myQuicaModel.user) {
      myQuicaModel.loadGroceryItems('pizza');  // Using example query from Spoonacular docs
    }
  }, [myQuicaModel.user]);

  const handleAddToCart = (item) => {
    myQuicaModel.addToCart(item);
  };

  return (
    <div className="min-h-[300px]">
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
