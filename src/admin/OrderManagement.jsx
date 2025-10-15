import React, { useState } from "react";

const initialOrders = [
  {
    id: 1,
    type: "Online",
    status: "Pending",
    customer: "Alice",
    items: ["Latte"],
    date: "2025-10-13 09:15",
  },
  {
    id: 2,
    type: "Walk-in",
    status: "Preparing",
    customer: "Bob",
    items: ["Espresso", "Muffin"],
    date: "2025-10-13 09:30",
  },
  {
    id: 3,
    type: "Online",
    status: "Completed",
    customer: "Charlie",
    items: ["Cappuccino"],
    date: "2025-10-13 10:00",
  },
];

const statuses = ["Pending", "Preparing", "Completed"];
const statusColors = {
  Pending: "bg-yellow-300",
  Preparing: "bg-sky-300",
  Completed: "bg-green-300",
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

  // Filtering Logic
  const filteredOrders =
    filter === "All" ? orders : orders.filter((order) => order.status === filter);

  const typeFilteredOrders =
    typeFilter === "All"
      ? filteredOrders
      : filteredOrders.filter((order) => order.type === typeFilter);

  const searchedOrders = typeFilteredOrders.filter((order) =>
    order.customer.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(searchedOrders.length / pageSize);
  const paginatedOrders = searchedOrders.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  // Select/Deselect Logic
  const toggleSelectOrder = (id) => {
    setSelectedOrders((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

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
    if (
      window.confirm(
        `Are you sure you want to change status from "${order.status}" to "${newStatus}"?`
      )
    ) {
      setOrders((prev) =>
        prev.map((order) =>
          order.id === id ? { ...order, status: newStatus } : order
        )
      );
    }
  };

  const handleExportCSV = () => {
    const header = ["ID", "Type", "Customer", "Items", "Status", "Date/Time"];
    const rows = searchedOrders.map((order) => [
      order.id,
      order.type,
      order.customer,
      order.items.join("; "),
      order.status,
      order.date,
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((v) => `"${v}"`).join(","))
      .join("\n");
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
    if (window.confirm("Are you sure you want to delete this order?")) {
      setOrders((prev) => prev.filter((order) => order.id !== id));
    }
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
      setOrders((prev) =>
        prev.map((o) =>
          selectedOrders.includes(o.id) ? { ...o, status: newStatus } : o
        )
      );
      setSelectedOrders([]);
    } else if (newStatus) {
      alert("Invalid status entered!");
    }
  };

  return (
    <div className="min-h-screen p-8 text-black">
      <div className="rounded-2xl bg-white shadow-xl p-8 max-w-7xl mx-auto border border-gray-300">
        <h2 className="text-3xl font-bold mb-8 text-center">🧾 Order Management</h2>

        {/* Filters */}
        <div className="flex flex-wrap justify-between gap-4 mb-6 items-center">
          <div className="flex flex-wrap gap-4">
            {/* Status Filter */}
            <label className="flex items-center gap-2">
              <span className="font-medium">Filter by Status:</span>
              <select
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value);
                  setPage(1);
                }}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black"
              >
                <option value="All">All</option>
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>

            {/* Type Filter */}
            <label className="flex items-center gap-2">
              <span className="font-medium">Filter by Type:</span>
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setPage(1);
                }}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black"
              >
                <option value="All">All</option>
                <option value="Online">Online</option>
                <option value="Walk-in">Walk-in</option>
              </select>
            </label>

            {/* Search */}
            <label className="flex items-center gap-2">
              <span className="font-medium">Search Customer:</span>
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Enter name"
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black"
              />
            </label>
          </div>

          <button
            onClick={handleExportCSV}
            className="bg-white hover:bg-gray-100 border border-gray-400 font-semibold px-5 py-2 rounded-lg shadow-sm transition"
          >
            ⬇️ Export CSV
          </button>
        </div>

        {/* Bulk Actions */}
        {selectedOrders.length > 0 && (
          <div className="flex gap-3 mb-4">
            <button
              onClick={handleBulkDelete}
              className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition"
            >
              🗑️ Delete Selected ({selectedOrders.length})
            </button>
            <button
              onClick={handleBulkStatusUpdate}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 transition"
            >
              🔁 Update Status
            </button>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-300 shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 font-semibold border-b border-gray-300">
                  <input
                    type="checkbox"
                    checked={
                      paginatedOrders.length > 0 &&
                      paginatedOrders.every((o) => selectedOrders.includes(o.id))
                    }
                    onChange={toggleSelectAll}
                  />
                </th>
                {[
                  "ID",
                  "Type",
                  "Customer",
                  "Items",
                  "Status",
                  "Date/Time",
                  "Update Status",
                  "Details",
                  "Delete",
                ].map((head) => (
                  <th
                    key={head}
                    className="px-4 py-3 font-semibold border-b border-gray-300"
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center py-6 font-medium">
                    No orders found.
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 transition border-b border-gray-200"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(order.id)}
                        onChange={() => toggleSelectOrder(order.id)}
                      />
                    </td>
                    <td className="px-4 py-3">{order.id}</td>
                    <td className="px-4 py-3">{order.type}</td>
                    <td className="px-4 py-3">{order.customer}</td>
                    <td className="px-4 py-3">{order.items.join(", ")}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`${statusColors[order.status]} text-black px-3 py-1 rounded-full text-xs font-semibold`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">{order.date}</td>
                    <td className="px-4 py-3">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleStatusChange(order.id, e.target.value)
                        }
                        className="border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-black"
                      >
                        {statuses.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleShowDetails(order)}
                        className="border border-gray-400 bg-white hover:bg-gray-100 px-3 py-1 rounded-md text-sm font-medium transition"
                      >
                        View
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        className="border border-gray-400 bg-white hover:bg-red-100 px-3 py-1 rounded-md text-sm font-medium transition"
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
              className={`px-4 py-2 border border-gray-400 rounded-lg bg-white hover:bg-gray-100 transition ${
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
              className={`px-4 py-2 border border-gray-400 rounded-lg bg-white hover:bg-gray-100 transition ${
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
        <div
          className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white text-black rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold mb-4 text-center">Order Details</h3>
            <div className="space-y-2 text-sm">
              <p><strong>ID:</strong> {selectedOrder.id}</p>
              <p><strong>Type:</strong> {selectedOrder.type}</p>
              <p><strong>Customer:</strong> {selectedOrder.customer}</p>
              <p><strong>Items:</strong> {selectedOrder.items.join(", ")}</p>
              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={`${statusColors[selectedOrder.status]} px-3 py-1 rounded-full text-xs font-semibold`}
                >
                  {selectedOrder.status}
                </span>
              </p>
              <p><strong>Date/Time:</strong> {selectedOrder.date}</p>
            </div>
            <button
              onClick={handleCloseModal}
              className="mt-6 w-full border border-gray-400 bg-white hover:bg-gray-100 py-2 rounded-lg font-semibold transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
