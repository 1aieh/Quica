const formatPrice = (price) => {
  return new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(price);
};

const OrderPlacedView = ({ order }) => {
  return (
    <div className="text-center py-12">
      <h1 className="text-3xl font-bold text-green-600 mb-4">Order placed successfully!</h1>
      <p className="text-xl text-gray-600 mb-6">We're finding a rider who can deliver your groceries</p>
      
      {/* Display Order Details */}
      {order && (
        <div className="mt-6 p-4 border border-gray-200 rounded-md bg-gray-50 text-left max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold mb-2">Order Details:</h3>
          
          {/* Customer Information */}
          <div className="mb-4">
            <p><span className="font-medium">Name:</span> {order.requesterName}</p>
            <p><span className="font-medium">Address:</span> {order.requesterAddress}</p>
            <p><span className="font-medium">Phone:</span> {order.requesterPhone}</p>
            <p><span className="font-medium">Status:</span> {order.status}</p>
          </div>
          
          {/* Order Items */}
          <div className="mb-4">
            <h4 className="font-medium mb-2">Items:</h4>
            <div className="space-y-2">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">{item.name}</span>
                    <span className="text-gray-600 ml-2">x{item.quantity}</span>
                  </div>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="border-t pt-2 space-y-1">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatPrice(order.itemSubtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee:</span>
              <span>{formatPrice(order.deliveryFee)}</span>
            </div>
            <div className="flex justify-between font-semibold pt-1 border-t">
              <span>Total:</span>
              <span>{formatPrice(order.totalPrice)}</span>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8">
        <svg className="animate-spin mx-auto h-12 w-12 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    </div>
  );
};

export default OrderPlacedView;
