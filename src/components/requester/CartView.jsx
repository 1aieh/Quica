const CartView = ({ items = [], onRemoveFromCart, onPlaceOrder, isLoading }) => {
  // Calculate total using rawPrice
  const total = items.reduce((sum, item) => sum + item.rawPrice, 0);

  if (isLoading) {
    return <div className="text-center">Placing order...</div>;
  }

  if (!items.length) {
    return <div className="text-gray-500">Your cart is empty</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Your Cart</h2>
      <ul className="divide-y divide-gray-200">
        {items.map((item) => (
          <li
            key={item.id}
            className="py-4 flex items-center justify-between"
          >
            <div className="flex items-center">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-md mr-4"
                  onError={(e) => {
                    e.target.onerror = null; // Prevent infinite loop
                    e.target.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="; // Placeholder image
                  }}
                />
              ) : (
                <img
                  src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-md mr-4"
                />
              )}
              <div>
                <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                <p className="text-sm text-gray-500">
                  {item.price} x {item.quantity || 1} = SEK {((parseFloat(item.price) || 0) * (item.quantity || 1)).toFixed(2)}
                </p>
              </div>
            </div>
            <button
              onClick={() => onRemoveFromCart(item)}
              className="ml-4 px-3 py-1 text-sm font-medium text-red-600 border border-red-600 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
      <div className="pt-4 border-t border-gray-200">
        <p className="text-lg font-semibold mb-4">Total: SEK {total.toFixed(2)}</p>
        <button
          onClick={() => onPlaceOrder()}
          disabled={!items.length || isLoading} // Disable if cart is empty or placing order
          className={`w-full bg-green-600 text-white px-6 py-3 rounded-md font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors ${!items.length || isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? 'Placing order...' : 'Place Order'}
        </button>
      </div>
    </div>
  );
};

export default CartView;
