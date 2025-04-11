// TODO: Import model once Bhavya provides it
// import { observer } from 'mobx-react-lite';
// import { myQuicaModel } from './model/QuicaModel';
// import { signOut } from 'firebase/auth';
// import { auth } from './firebase/persistence';
import AuthPresenter from './presenters/AuthPresenter';
import GroceryListPresenter from './presenters/GroceryListPresenter';
import CartPresenter from './presenters/CartPresenter';

function App() {
  // TODO: Once model is available, wrap App with observer and use myQuicaModel.user
  // const user = myQuicaModel.user;
  // const userProfile = myQuicaModel.userProfile;
  const user = null; // Temporary - will come from model

  // TODO: Implement once auth is available
  // const handleSignOut = () => {
  //   signOut(auth).catch(console.error);
  // };

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
              {/* {userProfile && (
                <pre className="mt-2 text-sm text-gray-600">
                  {JSON.stringify(userProfile, null, 2)}
                </pre>
              )} */}
            </div>
            <button 
              onClick={() => console.log('Sign out clicked (waiting for auth)')} 
              className="px-4 py-2 text-sm text-gray-600 border rounded hover:bg-gray-50"
            >
              Sign Out
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <GroceryListPresenter />
            </div>
            <div>
              <CartPresenter />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
