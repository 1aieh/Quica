import React from 'react';
import GroceryItemCard from './GroceryItemCard';

function GroceryListView({ items = [], onAddToCart, loading, error }) {
  if (loading) {
    return <div className="text-center p-4">Loading groceries...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">Error loading groceries: {error}</div>;
  }

  if (!items || items.length === 0) {
    return <div className="text-center p-4 text-gray-500">No items available</div>;
  }

  return (
    <div className="p-4 h-full">
      <h2 className="text-xl font-semibold mb-4">Grocery Items</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <GroceryItemCard
            key={item.id}
            item={{
              ...item,
              imageUrl: item.image, // Map the image property to imageUrl for consistency
              price: typeof item.price === 'string' ? parseFloat(item.price) : item.price // Ensure price is a number
            }}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>
    </div>
  );
};

export default GroceryListView;
