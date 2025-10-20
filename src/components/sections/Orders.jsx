import React from "react";

const Orders = ({ orders = [] }) => {
  const hasOrders = orders && orders.length > 0;

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gradient-to-br py-10 px-6">
      {!hasOrders ? (
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-3">🛒</div>
          <h2 className="text-2xl font-semibold mb-2">
            You haven't placed any orders yet.
          </h2>
          <p className="text-gray-600">
            Browse the menu and place your first order!
          </p>
        </div>
      ) : (
        <div className="w-full max-w-4xl bg-white rounded-3xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-yellow-900 mb-6 text-center">
            Your Orders
          </h2>

          <div className="flex flex-col gap-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="p-5 border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition bg-yellow-50/40"
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-lg text-gray-900">
                    Order #{order.id}
                  </h3>
                  <span
                    className={`text-sm font-semibold px-3 py-1 rounded-full ${
                      order.status === "Delivered"
                        ? "bg-green-100 text-green-700"
                        : order.status === "Pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <p className="text-gray-700">
                    <span className="font-medium">Item:</span> {order.item}
                  </p>
                  <p className="text-yellow-700 font-semibold">
                    ₱{order.total?.toFixed(2) || "0.00"}
                  </p>
                </div>

                <p className="text-gray-500 text-sm mt-2">
                  Placed on {new Date(order.date).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
