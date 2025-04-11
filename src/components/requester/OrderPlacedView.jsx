const OrderPlacedView = ({ order }) => {
  return (
    <div className="text-center py-12">
      <h1 className="text-3xl font-bold text-green-600 mb-4">Order placed successfully!</h1>
      <p className="text-xl text-gray-600 mb-6">We're finding a rider who can deliver your groceries</p>
      
      {/* Display Order Details */}
      {order && (
        <div className="mt-6 p-4 border border-gray-200 rounded-md bg-gray-50 text-left max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold mb-2">Order Details:</h3>
          <pre className="text-sm text-gray-700 whitespace-pre-wrap break-words">
            {JSON.stringify(order, null, 2)}
          </pre>
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
