const CartView = ({ items = [], onRemoveFromCart }) => {
  // Calculate total using rawPrice
  const total = items.reduce((sum, item) => sum + item.rawPrice, 0);

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
              {item.image && (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-md mr-4"
                />
              )}
              <div>
                <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                <p className="text-sm text-gray-500">{item.price}</p>
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
        <p className="text-lg font-semibold">Total: SEK {total.toFixed(2)}</p>
      </div>
    </div>
  );
};

export default CartView;
