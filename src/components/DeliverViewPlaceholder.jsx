const DeliverViewPlaceholder = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-lg font-semibold">Delivery Mode</h2>
          <button
            className="px-4 py-2 rounded-full bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200"
            disabled
          >
            Activate Delivery Mode
          </button>
        </div>
      </div>

      {/* Your Deliveries Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Your Deliveries</h3>
        <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
          No active deliveries
        </div>
      </div>

      {/* Available Orders Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Available Orders</h3>
        <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
          No orders available for pickup
        </div>
      </div>
    </div>
  );
};

export default DeliverViewPlaceholder;
