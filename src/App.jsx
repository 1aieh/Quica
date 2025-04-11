import { useState } from 'react';
import GoogleSignInButton from './components/auth/GoogleSignInButton';
import GroceryListView from './components/requester/GroceryListView';
import CartView from './components/requester/CartView';

// Mock data for testing
const mockGroceryItems = [
  { id: '1', name: 'Milk', price: 3.99 * 10 },
  { id: '2', name: 'Bread', price: 2.49 * 10 },
  { id: '3', name: 'Eggs', price: 4.99 * 10},
];

const mockCartItems = [
  { id: '1', name: 'Milk', price: 3.99 * 10},
  { id: '2', name: 'Bread', price: 2.49 * 10},
];

function App() {
  const [cartItems, setCartItems] = useState(mockCartItems);

  const handleSignIn = () => {
    console.log('Sign in clicked!');
  };

  const handleAddToCart = (item) => {
    console.log('Adding to cart:', item);
    setCartItems([...cartItems, item]);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <GoogleSignInButton onSignIn={handleSignIn} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <GroceryListView 
            items={mockGroceryItems} 
            onAddToCart={handleAddToCart} 
          />
        </div>
        <div>
          <CartView cartItems={cartItems} />
        </div>
      </div>
    </div>
  );
}

export default App;
