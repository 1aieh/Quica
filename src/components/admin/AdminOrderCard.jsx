const AdminOrderCard = ({ order, onDelete }) => {
  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
  
  // Format timestamp in a more compact way
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate();
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit'
      }).format(date);
    }
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <div className="space-y-2">
        {/* Header: Order ID and Delete */}
        <div className="flex justify-between items-start">
          <div>
            <div className="text-gray-500 text-sm">Order #{order.id.slice(-6)}</div>
            <div className="font-medium text-sm">{order.requesterName || 'Unknown'}</div>
          </div>
          <button
            onClick={() => onDelete(order.id)}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Delete
          </button>
        </div>

        {/* Order Info */}
        <div className="text-sm space-y-1">
          <div className="flex justify-between text-gray-600 items-center">
            <div className="flex items-center space-x-2">
              <span>{totalItems} items</span>
              <span>•</span>
              <span>{formatDate(order.createdAt)}</span>
            </div>
            <span className={`px-2 py-0.5 rounded ${
              order.status === 'Unassigned' ? 'bg-yellow-100 text-yellow-800' :
              order.status === 'Assigned' ? 'bg-blue-100 text-blue-800' :
              'bg-green-100 text-green-800'
            }`}>
              {order.status}
            </span>
          </div>
          {order.delivererName && (
            <div className="text-gray-500">
              Rider: {order.delivererName}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOrderCard;
