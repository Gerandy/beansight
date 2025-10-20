import React, { useState } from "react";

const initialOrders = [
  { id: 1, type: "Online", status: "Pending", customer: "Alice", items: ["Latte"], date: "2025-10-13 09:15" },
  { id: 2, type: "Walk-in", status: "Preparing", customer: "Bob", items: ["Espresso", "Muffin"], date: "2025-10-13 09:30" },
  { id: 3, type: "Online", status: "Completed", customer: "Charlie", items: ["Cappuccino"], date: "2025-10-13 10:00" },
];

const statuses = ["Pending", "Preparing", "Completed"];
const statusColors = {
  Pending: "bg-coffee-200 text-coffee-900",
  Preparing: "bg-coffee-400 text-white",
  Completed: "bg-coffee-600 text-white",
};

export default function OrderManagement() {
  const [orders, setOrders] = useState(initialOrders);
  const [filter, setFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [page, setPage] = useState(1);
  const pageSize = 5;

  // Filtering
  const filteredOrders = filter === "All" ? orders : orders.filter((o) => o.status === filter);
  const typeFilteredOrders = typeFilter === "All" ? filteredOrders : filteredOrders.filter((o) => o.type === typeFilter);
  const searchedOrders = typeFilteredOrders.filter((o) => o.customer.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(searchedOrders.length / pageSize);
  const paginatedOrders = searchedOrders.slice((page - 1) * pageSize, page * pageSize);

  // Select logic
  const toggleSelectOrder = (id) =>
    setSelectedOrders((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));

  const toggleSelectAll = () => {
    const visibleIds = paginatedOrders.map((o) => o.id);
    const allSelected = visibleIds.every((id) => selectedOrders.includes(id));
    setSelectedOrders(
      allSelected
        ? selectedOrders.filter((id) => !visibleIds.includes(id))
        : [...selectedOrders, ...visibleIds.filter((id) => !selectedOrders.includes(id))]
    );
  };

  const handleStatusChange = (id, newStatus) => {
    const order = orders.find((o) => o.id === id);
    if (order.status === newStatus) return;
    if (window.confirm(`Change status from "${order.status}" to "${newStatus}"?`)) {
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o)));
    }
  };

  const handleExportCSV = () => {
    const header = ["ID", "Type", "Customer", "Items", "Status", "Date/Time"];
    const rows = searchedOrders.map((o) => [o.id, o.type, o.customer, o.items.join("; "), o.status, o.date]);
    const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "orders.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShowDetails = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  const handleDeleteOrder = (id) => {
    if (window.confirm("Delete this order?")) setOrders((prev) => prev.filter((o) => o.id !== id));
  };

  const handleBulkDelete = () => {
    if (selectedOrders.length === 0) return;
    if (window.confirm(`Delete ${selectedOrders.length} selected orders?`)) {
      setOrders((prev) => prev.filter((o) => !selectedOrders.includes(o.id)));
      setSelectedOrders([]);
    }
  };

  const handleBulkStatusUpdate = () => {
    if (selectedOrders.length === 0) return;
    const newStatus = prompt("Enter new status (Pending, Preparing, Completed):");
    if (newStatus && statuses.includes(newStatus)) {
      setOrders((prev) => prev.map((o) => (selectedOrders.includes(o.id) ? { ...o, status: newStatus } : o)));
      setSelectedOrders([]);
    } else if (newStatus) alert("Invalid status!");
  };

  return (
    <div className="min-h-screen p-8 bg-coffee-100 text-coffee-900">
      <div className="max-w-7xl mx-auto rounded-2xl bg-white shadow-soft-xl border border-coffee-100 p-8">
        <h2 className="text-3xl font-bold mb-8 text-center text-coffee-800">☕ Order Management</h2>

        {/* Filters */}
        <div className="flex flex-wrap justify-between gap-4 mb-6 items-center">
          <div className="flex flex-wrap gap-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-coffee-200 bg-coffee-50 text-coffee-800 rounded-xl px-3 py-2 focus:ring-2 focus:ring-coffee-400"
            >
              <option value="All">All Statuses</option>
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border border-coffee-200 bg-coffee-50 text-coffee-800 rounded-xl px-3 py-2 focus:ring-2 focus:ring-coffee-400"
            >
              <option value="All">All Types</option>
              <option value="Online">Online</option>
              <option value="Walk-in">Walk-in</option>
            </select>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Customer"
              className="border border-coffee-200 bg-coffee-50 text-coffee-800 rounded-xl px-3 py-2 focus:ring-2 focus:ring-coffee-400"
            />
          </div>

          <button
            onClick={handleExportCSV}
            className="bg-coffee-600 hover:bg-coffee-700 text-white px-5 py-2 rounded-xl font-semibold shadow transition"
          >
            ⬇️ Export CSV
          </button>
        </div>

        {/* Bulk Actions */}
        {selectedOrders.length > 0 && (
          <div className="flex gap-3 mb-4">
            <button
              onClick={handleBulkDelete}
              className="bg-red-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-red-600 transition"
            >
              🗑️ Delete Selected ({selectedOrders.length})
            </button>
            <button
              onClick={handleBulkStatusUpdate}
              className="bg-coffee-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-coffee-600 transition"
            >
              🔁 Update Status
            </button>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-coffee-200 shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-coffee-100 text-coffee-800">
              <tr>
                <th className="px-4 py-3 font-semibold border-b border-coffee-200">
                  <input
                    type="checkbox"
                    checked={paginatedOrders.length > 0 && paginatedOrders.every((o) => selectedOrders.includes(o.id))}
                    onChange={toggleSelectAll}
                  />
                </th>
                {["ID", "Type", "Customer", "Items", "Status", "Date/Time", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 font-semibold border-b border-coffee-200">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center py-6 font-medium text-coffee-700">
                    No orders found.
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-coffee-50 transition border-b border-coffee-100">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(order.id)}
                        onChange={() => toggleSelectOrder(order.id)}
                      />
                    </td>
                    <td className="px-4 py-3 font-medium">{order.id}</td>
                    <td className="px-4 py-3">{order.type}</td>
                    <td className="px-4 py-3">{order.customer}</td>
                    <td className="px-4 py-3">{order.items.join(", ")}</td>
                    <td className="px-4 py-3">
                      <span className={`${statusColors[order.status]} px-3 py-1 rounded-full text-xs font-semibold`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">{order.date}</td>
                    <td className="px-4 py-3 flex gap-2">
                      <button
                        onClick={() => handleShowDetails(order)}
                        className="bg-coffee-100 border border-coffee-200 hover:bg-coffee-200 px-3 py-1 rounded-lg text-sm font-medium transition"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        className="bg-red-100 border border-red-200 hover:bg-red-200 px-3 py-1 rounded-lg text-sm font-medium transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className={`px-4 py-2 border border-coffee-300 rounded-xl bg-coffee-100 hover:bg-coffee-200 transition ${
                page === 1 ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Prev
            </button>
            <span className="font-medium">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className={`px-4 py-2 border border-coffee-300 rounded-xl bg-coffee-100 hover:bg-coffee-200 transition ${
                page === totalPages ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 backdrop-blur-md bg-coffee-900/30 bg-gradient-to-br from-coffee-900/20 to-coffee-700/10 flex justify-center items-center z-50" onClick={handleCloseModal}>
          <div
            className="bg-white text-coffee-900 rounded-2xl shadow-soft-xl p-8 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold mb-4 text-center text-coffee-700">Order Details</h3>
            <div className="space-y-2 text-sm">
              <p><strong>ID:</strong> {selectedOrder.id}</p>
              <p><strong>Type:</strong> {selectedOrder.type}</p>
              <p><strong>Customer:</strong> {selectedOrder.customer}</p>
              <p><strong>Items:</strong> {selectedOrder.items.join(", ")}</p>
              <p>
                <strong>Status:</strong>{" "}
                <span className={`${statusColors[selectedOrder.status]} px-3 py-1 rounded-full text-xs font-semibold`}>
                  {selectedOrder.status}
                </span>
              </p>
              <p><strong>Date/Time:</strong> {selectedOrder.date}</p>
            </div>
            <button
              onClick={handleCloseModal}
              className="mt-6 w-full bg-coffee-600 hover:bg-coffee-700 text-white py-2 rounded-xl font-semibold transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}