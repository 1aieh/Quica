import { observer } from 'mobx-react-lite';
import { myQuicaModel } from './model/QuicaModel.js';
import { signOut } from 'firebase/auth';
import { auth } from './firebase/persistence.js';
import AuthPresenter from './presenters/AuthPresenter';
import GroceryListPresenter from './presenters/GroceryListPresenter';
import CartPresenter from './presenters/CartPresenter';
import OrderPlacedView from './components/requester/OrderPlacedView'; // Import the new view

const App = observer(() => {
  const user = myQuicaModel.user;
  const userProfile = myQuicaModel.userProfile;
  const orderJustPlaced = myQuicaModel.orderJustPlaced; // Read the new state
  const latestOrder = myQuicaModel.requesterOrders.length > 0 
    ? myQuicaModel.requesterOrders[myQuicaModel.requesterOrders.length - 1] 
    : null; // Get the latest order

  console.log('App render - user state:', user);
  console.log('App render - userProfile:', userProfile);
  console.log('App render - orderJustPlaced:', orderJustPlaced);

  const handleSignOut = () => {
    signOut(auth).catch(console.error);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {user === undefined ? (
        <div>Loading...</div>
      ) : user === null ? (
        <AuthPresenter />
      ) : (
        <div>
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h2 className="text-xl">Welcome{user.displayName ? `, ${user.displayName}` : ''}!</h2>
              {userProfile && (
                <pre className="mt-2 text-sm text-gray-600">
                  {JSON.stringify(userProfile, null, 2)}
                </pre>
              )}
            </div>
            <button 
              onClick={handleSignOut}
              className="px-4 py-2 text-sm text-gray-600 border rounded hover:bg-gray-50"
            >
              Sign Out
            </button>
          </div>

          {/* Conditional rendering based on orderJustPlaced */}
          {orderJustPlaced ? (
            <OrderPlacedView order={latestOrder} /> // Pass the latest order as a prop
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <GroceryListPresenter />
              </div>
              <div>
                <CartPresenter />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export default App;
