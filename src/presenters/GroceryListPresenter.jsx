import { observer } from 'mobx-react-lite';
import GroceryListView from '../components/requester/GroceryListView';

// TODO: Import model once Bhavya provides it
// import { myQuicaModel } from '../model/QuicaModel';

const GroceryListPresenter = observer(() => {
  // TODO: Implement once model is available
  // useEffect(() => {
  //   if (myQuicaModel.groceryItems.length === 0 && myQuicaModel.user) {
  //     myQuicaModel.loadGroceryItems();
  //   }
  // }, [myQuicaModel.user]);

  // const isLoading = myQuicaModel.isLoading;
  // const error = myQuicaModel.errorMessage;
  // const items = myQuicaModel.groceryItems;

  const handleAddToCart = (item) => {
    // TODO: Implement once model is available
    console.log('Adding to cart (waiting for model):', item);
    // myQuicaModel.addToCart(item);
  };

  // TODO: Replace with actual model state
  const mockItems = [
    { id: '1', name: 'Milk', price: 3.99 },
    { id: '2', name: 'Bread', price: 2.49 },
    { id: '3', name: 'Eggs', price: 4.99 },
  ];

  // TODO: Add loading/error states once model is available
  return (
    <div>
      {/* {isLoading && <div>Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {!isLoading && !error && ( */}
        <GroceryListView
          items={mockItems}
          onAddToCart={handleAddToCart}
        />
      {/* )} */}
    </div>
  );
});

export default GroceryListPresenter;
