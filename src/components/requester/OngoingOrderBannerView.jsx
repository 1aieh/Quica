import React from 'react';

// Maps internal status codes to user-friendly text and badge colors
const statusMap = {
  Unassigned: { text: "Finding Rider", color: "bg-yellow-500" }, // Added Unassigned
  Assigned: { text: "Heading to ICA", color: "bg-blue-500" },    // Updated text
  PickedUp: { text: "Coming to You", color: "bg-green-500" },   // Updated text and color
  ArrivedAtApartment: { text: "Rider Arrived", color: "bg-green-600" },
  Delivered: { text: "Delivered", color: "bg-green-800" },
  // Add other statuses here if needed for future expansion (e.g., Delivering, Arrived)
};

function OngoingOrderBannerView({ order }) {
  if (!order) {
    return null; // Don't render anything if there's no active order
  }

  const statusInfo = statusMap[order.status] || { text: order.status, color: "bg-gray-500" };
  const itemCount = order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;

  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-4 w-full border border-blue-200">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Your Ongoing Order</h3>
          <p className="text-sm text-gray-600">
            {itemCount} item{itemCount !== 1 ? 's' : ''} - Total: {order.totalPrice?.toFixed(2) || 'N/A'} SEK
          </p>
        </div>
        <div className={`text-sm font-medium px-3 py-1 rounded-full text-white ${statusInfo.color}`}>
          {statusInfo.text}
        </div>
      </div>
      {/* Optional: Add a link/button to view full order details */}
      {/* <button className="text-blue-600 hover:underline text-sm mt-2">View Details</button> */}
    </div>
  );
}

export default OngoingOrderBannerView;
