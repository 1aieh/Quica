import PropTypes from 'prop-types';

function OrderTrackingView({ orderData, isCancelling, cancelError, onCancelOrder }) {
  if (!orderData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl">Loading order status...</div>
      </div>
    );
  }

  // Determine status message and background color based on order status
  let statusMessage = '';
  let statusBgColor = '';

  switch (orderData.status) {
    case 'Unassigned':
      statusMessage = 'Finding a rider for your order...';
      statusBgColor = 'bg-yellow-50';
      break;
    case 'Assigned':
      statusMessage = `${orderData.delivererName || 'Your rider'} is picking up your order`;
      statusBgColor = 'bg-blue-50';
      break;
    case 'PickedUp':
      statusMessage = `${orderData.delivererName || 'Your rider'} is on their way`;
      statusBgColor = 'bg-green-50';
      break;
    case 'Delivering':
      statusMessage = `${orderData.delivererName || 'Your rider'} is nearby`;
      statusBgColor = 'bg-green-100';
      break;
    case 'Delivered':
      statusMessage = 'Order delivered successfully!';
      statusBgColor = 'bg-green-200';
      break;
    case 'Cancelled':
      statusMessage = 'Order was cancelled';
      statusBgColor = 'bg-red-50';
      break;
    default:
      statusMessage = 'Updating order status...';
      statusBgColor = 'bg-gray-50';
  }

  const formatPrice = (price) => `$${Number(price).toFixed(2)}`;

  return (
    <div className={`min-h-screen ${statusBgColor} p-6`}>
      <div className="max-w-lg mx-auto space-y-6">
        {/* Status Header */}
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-2">Your Order Status</h1>
          <p className="text-xl">{statusMessage}</p>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Order Details</h2>
          
          {/* Items */}
          <div className="space-y-2 mb-4">
            {orderData.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <span>{item.quantity}x {item.name}</span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          {/* Order Totals */}
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatPrice(orderData.itemSubtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span>{formatPrice(orderData.deliveryFee)}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>{formatPrice(orderData.totalPrice)}</span>
            </div>
          </div>
        </div>

        {/* Delivery Info */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Delivery Information</h2>
          <div className="space-y-2">
            <div>
              <span className="font-medium">Deliver to: </span>
              <span>{orderData.requesterAddress}</span>
            </div>
            {orderData.delivererName && (
              <>
                <div>
                  <span className="font-medium">Rider: </span>
                  <span>{orderData.delivererName}</span>
                </div>
                {orderData.delivererPhone && (
                  <div>
                    <span className="font-medium">Rider Phone: </span>
                    <span>{orderData.delivererPhone}</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Cancel Button - Only show if status is Unassigned */}
        {orderData.status === 'Unassigned' && (
          <div className="text-center">
            <button
              onClick={onCancelOrder}
              disabled={isCancelling}
              className={`px-6 py-2 rounded-lg text-white font-medium
                ${isCancelling 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-red-500 hover:bg-red-600 active:bg-red-700'}
              `}
            >
              {isCancelling ? 'Cancelling...' : 'Cancel Order'}
            </button>
            {cancelError && (
              <p className="text-red-600 mt-2">{cancelError}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

OrderTrackingView.propTypes = {
  orderData: PropTypes.shape({
    id: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    items: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        quantity: PropTypes.number.isRequired,
        price: PropTypes.number.isRequired
      })
    ).isRequired,
    itemSubtotal: PropTypes.number.isRequired,
    deliveryFee: PropTypes.number.isRequired,
    totalPrice: PropTypes.number.isRequired,
    requesterAddress: PropTypes.string.isRequired,
    delivererName: PropTypes.string,
    delivererPhone: PropTypes.string
  }),
  isCancelling: PropTypes.bool.isRequired,
  cancelError: PropTypes.string,
  onCancelOrder: PropTypes.func.isRequired
};

export default OrderTrackingView;
