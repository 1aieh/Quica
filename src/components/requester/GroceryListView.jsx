import { useState, useEffect } from 'react';

const GroceryListView = ({ items = [], onAddToCart }) => {
  const [sortedItems, setSortedItems] = useState([]);
  const [loadedImages, setLoadedImages] = useState(new Set());

  useEffect(() => {
    // Initialize sortedItems with the original items
    setSortedItems(items);
  }, [items]);

  const handleImageLoad = (itemId) => {
    setLoadedImages(prev => {
      const newSet = new Set(prev);
      newSet.add(itemId);
      return newSet;
    });

    // Re-sort items when an image loads successfully
    setSortedItems(prev => {
      return [...prev].sort((a, b) => {
        const aHasImage = loadedImages.has(a.id) || (a.image && loadedImages.has(a.id));
        const bHasImage = loadedImages.has(b.id) || (b.image && loadedImages.has(b.id));
        return bHasImage - aHasImage; // Items with images come first
      });
    });
  };

  if (!sortedItems.length) {
    return <div className="text-gray-500">No items available</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Grocery Items</h2>
      <ul className="divide-y divide-gray-200">
        {sortedItems.map((item) => (
          <li
            key={item.id}
            className="py-4 flex items-center justify-between"
          >
            <div className="flex items-center">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded-md mr-4"
                  onLoad={() => handleImageLoad(item.id)}
                  onError={() => {/* Don't add to loadedImages on error */}}
                />
              ) : (
                <div className="w-24 h-24 bg-gray-200 rounded-md mr-4 flex items-center justify-center">
                  <span className="text-gray-400">No image</span>
                </div>
              )}
              <div>
                <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                {item.price && (
                  <p className="text-sm text-gray-500">{item.price}</p>
                )}
              </div>
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
