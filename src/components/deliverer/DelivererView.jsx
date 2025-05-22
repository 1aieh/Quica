import PropTypes from 'prop-types';
import AvailableOrderCard from './AvailableOrderCard';
import OngoingOrderCard from './OngoingOrderCard'; // Import the new component

function DelivererView({
  delivererStatus,
  availableOrders,
  delivererOrders, // Add new prop
  onToggleStatus,
  onAcceptOrder,
  acceptingOrderId,
  acceptOrderError,
  onUpdateStatus, // Add new prop
  updatingOrderStatusId, // Add new prop
  updateOrderStatusError // Add new prop
}) {
  const formatPrice = (price) => `$${Number(price).toFixed(2)}`;

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-6">
      <div className="max-w-lg w-full mx-auto space-y-6">
        {/* Delivery Mode Toggle */}
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h2 className="text-xl font-semibold mb-4">Delivery Mode</h2>
          <button
            onClick={onToggleStatus}
            className={`px-6 py-3 rounded-lg font-medium transition-colors
              ${delivererStatus === 'active'
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
          >
            {delivererStatus === 'active' ? 'Deactivate' : 'Activate'} Delivery Mode
          </button>
        </div>

        {/* Active Deliverer View */}
        {delivererStatus === 'active' ? (
          <div className="space-y-8"> {/* Increased spacing */}

            {/* Ongoing Deliveries Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Your Ongoing Deliveries</h2>
              {delivererOrders.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
                  You have no active deliveries.
                </div>
              ) : (
                <div className="space-y-4">
                  {delivererOrders.map(order => (
                    <OngoingOrderCard
                      key={order.id}
                      order={order}
                      formatPrice={formatPrice}
                      onUpdateStatus={onUpdateStatus}
                      isUpdatingStatus={order.id === updatingOrderStatusId}
                      updateError={order.id === updatingOrderStatusId ? updateOrderStatusError : null}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Separator */}
            <hr className="border-gray-200" />

            {/* Available Orders Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Available Orders</h2>

              {/* Show error if exists */}
              {acceptOrderError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                  {acceptOrderError}
                </div>
              )}

              {/* Order List */}
              {availableOrders.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
                  No orders available at the moment
                </div>
              ) : (
                <div className="space-y-4">
                  {availableOrders.map(order => (
                    <AvailableOrderCard
                      key={order.id}
                      order={order}
                      isAccepting={order.id === acceptingOrderId}
                      onAccept={() => onAcceptOrder(order.id)}
                      formatPrice={formatPrice}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
            Activate delivery mode to see available orders
          </div>
        )}
      </div>
    </div>
  );
}

// Define the shape for an order, used in both arrays
const orderShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  requesterAddress: PropTypes.string, // Make optional due to previous issue
  totalPrice: PropTypes.number.isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      quantity: PropTypes.number.isRequired,
    })
  ).isRequired,
  // Add other fields expected in delivererOrders if needed
  requesterName: PropTypes.string,
  status: PropTypes.string,
});

DelivererView.propTypes = {
  delivererStatus: PropTypes.oneOf(['active', 'inactive', null]),
  availableOrders: PropTypes.arrayOf(orderShape).isRequired,
  delivererOrders: PropTypes.arrayOf(orderShape).isRequired, // Add prop type for deliverer orders
  onToggleStatus: PropTypes.func.isRequired,
  onAcceptOrder: PropTypes.func.isRequired,
  acceptingOrderId: PropTypes.string,
  acceptOrderError: PropTypes.string,
  onUpdateStatus: PropTypes.func.isRequired, // Add prop type
  updatingOrderStatusId: PropTypes.string, // Add prop type
  updateOrderStatusError: PropTypes.string // Add prop type
};

export default DelivererView;
