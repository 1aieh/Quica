const GroceryListView = ({ items = [], onAddToCart }) => {
  if (!items.length) {
    return <div className="text-gray-500">No items available</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Grocery Items</h2>
      <ul className="divide-y divide-gray-200">
        {items.map((item) => (
          <li
            key={item.id}
            className="py-4 flex items-center justify-between"
          >
            <div>
              <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
              {item.price && (
                <p className="text-sm text-gray-500">SEK {item.price.toFixed(2)}</p>
              )}
            </div>
            <button
              onClick={() => onAddToCart(item)}
              className="ml-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add to Cart
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GroceryListView;
