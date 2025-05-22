import React, { memo, useState, useEffect } from 'react';
import ImagePlaceholder from '../common/ImagePlaceholder';

const GroceryItemCard = memo(function GroceryItemCard({ item, onAddToCart }) {
  const [imageStatus, setImageStatus] = useState('loading');

  // Basic check for item data
  if (!item) {
    return null;
  }

  useEffect(() => {
    // Reset image status when item changes
    setImageStatus('loading');
  }, [item.imageUrl]);

  // Handle image loading
  const handleImageLoad = () => setImageStatus('loaded');
  const handleImageError = () => setImageStatus('error');
  // Format price as SEK with 2 decimal places
  const formatPrice = (price) => {
    if (!price && price !== 0) return 'Price N/A';
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return !isNaN(numPrice) ? `SEK ${numPrice.toFixed(2)}` : 'Price N/A';
  };
  const price = formatPrice(item.price);

  return (
    <div className="bg-white rounded-lg shadow-sm p-2 sm:p-3 flex flex-col items-center text-center w-full max-w-xs min-h-[16rem]">
      <div className="w-32 sm:w-40 h-32 sm:h-40 flex items-center justify-center mb-2 relative">
        {item.imageUrl && imageStatus === 'loading' && (
          <div className="absolute inset-0 bg-gray-100 rounded-md flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-400 rounded-full animate-spin"></div>
          </div>
        )}
        {item.imageUrl && imageStatus !== 'error' && (
          <img
            src={item.imageUrl}
            alt={item.name || 'Grocery item'}
            className={`max-w-full rounded-md max-h-full object-contain transition-opacity duration-200 ${
              imageStatus === 'loaded' ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        )}
        {(!item.imageUrl || imageStatus === 'error') && <ImagePlaceholder className="w-32 h-32" />}
      </div>
      <h3 className="font-medium text-sm mb-1 h-10 overflow-hidden line-clamp-2">{item.name || 'Unnamed Item'}</h3>
      <p className="text-gray-600 text-sm mb-4">{price}</p>
      <button
        onClick={() => onAddToCart(item)}
        className="mt-auto w-full bg-blue-50 text-blue-800 hover:bg-gray-50 text-xs font-medium py-1.5 px-10 border-blue-500 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 transition-all"
      >
        Add to Cart
      </button>
    </div>
  );
});

export default GroceryItemCard;
