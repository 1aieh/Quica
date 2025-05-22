import PropTypes from 'prop-types';

function AvailableOrderCard({ order, isAccepting, onAccept, formatPrice }) {
  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
  
  // Extract just the area/city from the full address for privacy, with a fallback
  let generalArea = "Location Unknown";
  if (order.requesterAddress && typeof order.requesterAddress === 'string') {
    try {
      generalArea = order.requesterAddress.split(',').slice(-2)[0].trim();
    } catch (e) {
      console.error("Error parsing address:", order.requesterAddress, e);
      // Keep default value if parsing fails
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-2 sm:p-4 w-full max-w-xs">
      <div className="space-y-3">
        {/* Header: Order ID and Total */}
        <div className="flex justify-between items-start">
          <div>
            <div className="text-gray-500 text-sm">Order #{order.id.slice(-6)}</div>
            <div className="font-semibold text-lg">{formatPrice(order.totalPrice)}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Items</div>
            <div className="font-medium">{totalItems}</div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="text-sm space-y-1">
          <div className="flex justify-between text-gray-600">
            <span>Deliver to:</span>
            <span>{generalArea}</span>
          </div>
          <div className="text-gray-500">
            {order.items.slice(0, 2).map((item, idx) => (
              <div key={idx}>
                {item.quantity}× {item.name}
              </div>
            ))}
            {order.items.length > 2 && (
              <div className="text-gray-400">
                +{order.items.length - 2} more items
              </div>
            )}
          </div>
        </div>

        {/* Accept Button */}
        <button
          onClick={onAccept}
          disabled={isAccepting}
          className={`w-full py-2 px-4 rounded-lg font-medium text-white
            ${isAccepting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-500 hover:bg-green-600 active:bg-green-700'
            }`}
        >
          {isAccepting ? 'Accepting...' : 'Accept Order'}
        </button>
      </div>
    </div>
  );
}

AvailableOrderCard.propTypes = {
  order: PropTypes.shape({
    id: PropTypes.string.isRequired,
    requesterAddress: PropTypes.string.isRequired,
    totalPrice: PropTypes.number.isRequired,
    items: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        quantity: PropTypes.number.isRequired,
      })
    ).isRequired,
  }).isRequired,
  isAccepting: PropTypes.bool.isRequired,
  onAccept: PropTypes.func.isRequired,
  formatPrice: PropTypes.func.isRequired
};

export default AvailableOrderCard;
