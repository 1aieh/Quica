import PropTypes from 'prop-types';

function OngoingOrderCard({ order, formatPrice, onUpdateStatus, isUpdatingStatus, updateError }) {
  // Basic status display - can be enhanced later
  const getStatusColor = (status) => {
    switch (status) {
      case 'Assigned': return 'text-blue-600 bg-blue-100';
      case 'PickedUp': return 'text-purple-600 bg-purple-100';
      case 'Delivering': return 'text-orange-600 bg-orange-100';
      // Add more statuses as needed
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-2 sm:p-4 border-l-4 border-blue-500 w-full max-w-xs">
      <div className="space-y-3">
        {/* Header: Order ID and Status */}
        <div className="flex justify-between items-center">
          <div className="text-gray-500 text-sm">Order #{order.id.slice(-6)}</div>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
            {order.status || 'Unknown Status'}
          </span>
        </div>

        {/* Requester Info */}
        <div className="text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-500">Customer:</span>
            <span className="font-medium">{order.requesterName || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Address:</span>
            <span className="font-medium text-right">{order.requesterAddress || 'N/A'}</span>
          </div>
        </div>
        
        {/* Order Total */}
         <div className="flex justify-between items-center pt-2 border-t border-gray-100">
            <span className="text-gray-500 text-sm">Total:</span>
            <span className="font-semibold text-lg">{formatPrice(order.totalPrice)}</span>
          </div>

        {/* Action Button */}
        {order.status === 'Assigned' && (
          <div className="pt-3 border-t border-gray-100">
            <button
              onClick={() => onUpdateStatus(order.id, 'PickedUp')}
              disabled={isUpdatingStatus}
              className={`w-full py-2 px-4 rounded-lg font-medium text-white transition-colors
                ${isUpdatingStatus
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-purple-500 hover:bg-purple-600 active:bg-purple-700'
                }`}
            >
              {isUpdatingStatus ? 'Updating...' : 'Items Picked Up'}
            </button>
            {updateError && <p className="text-red-500 text-xs mt-1">{updateError}</p>}
          </div>
        )}
        {order.status === 'PickedUp' && (
          <div className="pt-3 border-t border-gray-100">
            <button
              onClick={() => onUpdateStatus(order.id, 'ArrivedAtApartment')}
              disabled={isUpdatingStatus}
              className={`w-full py-2 px-4 rounded-lg font-medium text-white transition-colors
                ${isUpdatingStatus
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-600 active:bg-green-700'
                }`}
            >
              {isUpdatingStatus ? 'Updating...' : 'Arrived at Apartment'}
            </button>
            {updateError && <p className="text-red-500 text-xs mt-1">{updateError}</p>}
          </div>
        )}
        {order.status === 'ArrivedAtApartment' && (
          <div className="pt-3 border-t border-gray-100">
            <button
              onClick={() => onUpdateStatus(order.id, 'Delivered')}
              disabled={isUpdatingStatus}
              className={`w-full py-2 px-4 rounded-lg font-medium text-white transition-colors
                ${isUpdatingStatus
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700'
                }`}
            >
              {isUpdatingStatus ? 'Updating...' : 'Mark as Delivered'}
            </button>
            {updateError && <p className="text-red-500 text-xs mt-1">{updateError}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

OngoingOrderCard.propTypes = {
  order: PropTypes.shape({
    id: PropTypes.string.isRequired,
    requesterAddress: PropTypes.string,
    requesterName: PropTypes.string,
    totalPrice: PropTypes.number.isRequired,
    status: PropTypes.string,
    items: PropTypes.array.isRequired, // Keep items for potential future display
  }).isRequired,
  formatPrice: PropTypes.func.isRequired,
  onUpdateStatus: PropTypes.func.isRequired,
  isUpdatingStatus: PropTypes.bool.isRequired,
  updateError: PropTypes.string,
};

export default OngoingOrderCard;
