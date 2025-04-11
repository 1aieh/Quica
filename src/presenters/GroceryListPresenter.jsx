import { observer } from 'mobx-react-lite';
import GroceryListView from '../components/requester/GroceryListView';

import { myQuicaModel } from '../model/QuicaModel.js';
import { useEffect } from 'react';

const GroceryListPresenter = observer(() => {
  useEffect(() => {
    if (myQuicaModel.groceryItems.length === 0 && myQuicaModel.user) {
      // TODO: Uncomment once loadGroceryItems is implemented by Bhavya
      // myQuicaModel.loadGroceryItems();
      
      // For now, set some mock items directly
      myQuicaModel.setGroceryItems([
        { id: '1', name: 'Milk', price: 3.99 },
        { id: '2', name: 'Bread', price: 2.49 },
        { id: '3', name: 'Eggs', price: 4.99 },
      ]);
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
        <GroceryListView
          items={myQuicaModel.groceryItems}
          onAddToCart={handleAddToCart}
        />
      )}
    </div>
  );
});

export default GroceryListPresenter;
