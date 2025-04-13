import AdminOrderCard from './AdminOrderCard';

const AdminPanelView = ({ orders, onDeleteOrder }) => {
  // Split orders into "No Rider" and "Rider Assigned" groups
  const unassignedOrders = orders.filter(order => order.status === 'Unassigned');
  const assignedOrders = orders.filter(order => ['Assigned', 'PickedUp'].includes(order.status))
    // Sort assigned orders: PickedUp after Assigned, then by createdAt within each status
    .sort((a, b) => {
      if (a.status === b.status) {
        return b.createdAt.toMillis() - a.createdAt.toMillis();
      }
      return a.status === 'PickedUp' ? 1 : -1;
    });

  return (
    <div className="min-h-full bg-gray-50 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold text-gray-900">Active Orders</h1>
          <div className="text-sm text-gray-500">
            {orders.length} orders in system
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* No Rider Column */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="text-sm font-medium text-gray-900 mb-3 flex items-center justify-between">
              <span>Awaiting Rider</span>
              <span className="text-gray-500">
                {unassignedOrders.length}
              </span>
            </h2>
            <div className="space-y-3">
              {unassignedOrders.map(order => (
                <AdminOrderCard
                  key={order.id}
                  order={order}
                  onDelete={onDeleteOrder}
                />
              ))}
              {unassignedOrders.length === 0 && (
                <p className="text-gray-500 text-sm">No unassigned orders</p>
              )}
            </div>
          </div>

          {/* Rider Assigned Column */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="text-sm font-medium text-gray-900 mb-3 flex items-center justify-between">
              <span>With Rider</span>
              <span className="text-gray-500">
                {assignedOrders.length}
              </span>
            </h2>
            <div className="space-y-3">
              {assignedOrders.map(order => (
                <AdminOrderCard
                  key={order.id}
                  order={order}
                  onDelete={onDeleteOrder}
                />
              ))}
              {assignedOrders.length === 0 && (
                <p className="text-gray-500 text-sm">No assigned orders</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanelView;
