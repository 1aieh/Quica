const CartView = ({ cartItems = [] }) => {
  const total = cartItems.reduce((sum, item) => sum + (item.price || 0), 0);

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Cart</h2>
      {cartItems.length === 0 ? (
        <p className="text-gray-500">Your cart is empty</p>
      ) : (
        <div className="space-y-4">
          <ul className="divide-y divide-gray-200">
            {cartItems.map((item) => (
              <li key={item.id} className="py-2 flex justify-between">
                <span className="text-gray-800">{item.name}</span>
                {item.price && (
                  <span className="text-gray-600">SEK {item.price.toFixed(2)}</span>
                )}
              </li>
            ))}
          </ul>
          <div className="pt-4 border-t border-gray-200">
            <div className="flex justify-between font-medium">
              <span>Total:</span>
              <span>SEK {total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartView;
