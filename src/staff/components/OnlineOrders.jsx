import React, { useState } from "react";

export default function OnlineOrders() {
  const [orders, setOrders] = useState([
    { id: "O-1024", customer: "Maria", items: 2, total: 220, status: "Pending" },
    { id: "O-1025", customer: "Alex", items: 1, total: 120, status: "Preparing" },
  ]);

  const handleStatusChange = (id, newStatus) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
  };

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h2 className="text-xl font-semibold mb-4">📦 Online Orders</h2>
      {orders.length === 0 ? (
        <p className="text-gray-500 text-center">No online orders right now.</p>
      ) : (
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="py-2 px-3 text-left">Order ID</th>
              <th className="py-2 px-3 text-left">Customer</th>
              <th className="py-2 px-3">Items</th>
              <th className="py-2 px-3">Total</th>
              <th className="py-2 px-3">Status</th>
              <th className="py-2 px-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b hover:bg-gray-50">
                <td className="py-2 px-3">{order.id}</td>
                <td className="py-2 px-3">{order.customer}</td>
                <td className="py-2 px-3 text-center">{order.items}</td>
                <td className="py-2 px-3 text-center">₱{order.total}</td>
                <td className="py-2 px-3 text-center">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      order.status === "Pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : order.status === "Preparing"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="py-2 px-3 text-center">
                  {order.status === "Pending" && (
                    <button
                      onClick={() => handleStatusChange(order.id, "Preparing")}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      Accept
                    </button>
                  )}
                  {order.status === "Preparing" && (
                    <button
                      onClick={() => handleStatusChange(order.id, "Ready")}
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                    >
                      Mark Ready
                    </button>
                  )}
                  {order.status === "Ready" && (
                    <button
                      onClick={() => handleStatusChange(order.id, "Completed")}
                      className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700"
                    >
                      Complete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
