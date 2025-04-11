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
    <div>
      {myQuicaModel.isLoading && <div>Loading...</div>}
      {myQuicaModel.errorMessage && (
        <div className="text-red-500">{myQuicaModel.errorMessage}</div>
      )}
      {!myQuicaModel.isLoading && !myQuicaModel.errorMessage && (
        <>
          {myQuicaModel.groceryItems.length === 0 ? (
            <div className="text-gray-500 p-4">No grocery items found. Please try again later.</div>
          ) : (
            <GroceryListView
              items={myQuicaModel.groceryItems}
              onAddToCart={handleAddToCart}
            />
          )}
        </>
      )}
    </div>
  );
});

export default GroceryListPresenter;
