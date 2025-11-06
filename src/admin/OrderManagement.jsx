import React, { useState } from "react";
import {
  Download,
  Eye,
  Trash2,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  Coffee,
  PackageCheck,
  Timer,
  ArrowUpDown,
} from "lucide-react";

const initialOrders = [
  { id: 1, type: "Online", status: "Cancelled", customer: "Alice", items: ["Latte"], date: "2025-10-13 09:15" },
  { id: 2, type: "Walk-in", status: "Cancelled", customer: "Bob", items: ["Espresso", "Muffin"], date: "2025-10-13 09:30" },
  { id: 3, type: "Online", status: "Completed", customer: "Charlie", items: ["Cappuccino"], date: "2025-10-13 10:00" },
  { id: 4, type: "Walk-in", status: "Cancelled", customer: "Daisy", items: ["Mocha"], date: "2025-09-20 11:45" },
  { id: 5, type: "Online", status: "Completed", customer: "Eve", items: ["Americano"], date: "2025-08-05 08:00" },
];

const statusColors = {
  Cancelled: "bg-red-100 text-red-700",
  Completed: "bg-coffee-700 text-white",
};

export default function OrderManagement() {
  const [orders, setOrders] = useState(initialOrders);
  const [typeFilter, setTypeFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("None");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const typeFilteredOrders =
    typeFilter === "All" ? orders : orders.filter((o) => o.type === typeFilter);

  const searchedOrders = typeFilteredOrders.filter((o) =>
    o.customer.toLowerCase().includes(search.toLowerCase())
  );

  // 🧭 Sorting Logic
  const sortedOrders = [...searchedOrders].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);

    switch (sortBy) {
      case "Month":
        return dateB.getMonth() - dateA.getMonth();
      case "Day":
        return dateB.getDate() - dateA.getDate();
      case "Time":
        return dateB.getTime() - dateA.getTime();
      default:
        return 0;
    }
  });

  const totalPages = Math.ceil(sortedOrders.length / pageSize);
  const paginatedOrders = sortedOrders.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const toggleSelectOrder = (id) =>
    setSelectedOrders((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );

  const toggleSelectAll = () => {
    const visibleIds = paginatedOrders.map((o) => o.id);
    const allSelected = visibleIds.every((id) => selectedOrders.includes(id));
    setSelectedOrders(
      allSelected
        ? selectedOrders.filter((id) => !visibleIds.includes(id))
        : [...selectedOrders, ...visibleIds.filter((id) => !selectedOrders.includes(id))]
    );
  };

  const handleExportCSV = () => {
    const header = ["ID", "Type", "Customer", "Items", "Date/Time"];
    const rows = sortedOrders.map((o) => [
      o.id,
      o.type,
      o.customer,
      o.items.join("; "),
      o.date,
    ]);
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
    if (window.confirm("Delete this order?"))
      setOrders((prev) => prev.filter((o) => o.id !== id));
  };

  const handleBulkDelete = () => {
    if (selectedOrders.length === 0) return;
    if (window.confirm(`Delete ${selectedOrders.length} selected orders?`)) {
      setOrders((prev) => prev.filter((o) => !selectedOrders.includes(o.id)));
      setSelectedOrders([]);
    }
  };

  const totalStats = {
    total: orders.length,
    cancelled: orders.filter((o) => o.status === "Cancelled").length,
    completed: orders.filter((o) => o.status === "Completed").length,
  };

  return (
    <div className="min-h-screen p-8 text-coffee-900">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-lg border border-coffee-200 p-8">
        <h2 className="text-3xl font-bold mb-8 text-center text-coffee-800 flex items-center justify-center gap-2">
          <Coffee className="w-7 h-7 text-coffee-600" /> Order Management
        </h2>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-coffee-50 border border-coffee-200 rounded-xl p-4 flex items-center gap-3">
            <PackageCheck className="text-coffee-600" />
            <div>
              <p className="text-sm text-coffee-700">Total Orders</p>
              <p className="text-2xl font-bold">{totalStats.total}</p>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <Timer className="text-red-600" />
            <div>
              <p className="text-sm text-red-700">Cancelled</p>
              <p className="text-2xl font-bold">{totalStats.cancelled}</p>
            </div>
          </div>

          <div className="bg-coffee-600 text-white rounded-xl p-4 flex items-center gap-3">
            <PackageCheck />
            <div>
              <p className="text-sm">Completed</p>
              <p className="text-2xl font-bold">{totalStats.completed}</p>
            </div>
          </div>
        </div>

        {/* Filters + Sort */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div className="flex flex-wrap gap-3 items-center">
            <Filter className="text-coffee-700 w-5 h-5" />

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border border-coffee-200 bg-coffee-50 text-coffee-800 rounded-xl px-3 py-2 focus:ring-2 focus:ring-coffee-400"
            >
              <option value="All">All Types</option>
              <option value="Online">Online</option>
              <option value="Walk-in">Walk-in</option>
            </select>

            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-coffee-400 w-4 h-4" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search customer..."
                className="pl-10 border border-coffee-200 bg-coffee-50 text-coffee-800 rounded-xl px-3 py-2 focus:ring-2 focus:ring-coffee-400"
              />
            </div>

            <div className="flex items-center gap-2">
              <ArrowUpDown className="text-coffee-600 w-5 h-5" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-coffee-200 bg-coffee-50 text-coffee-800 rounded-xl px-3 py-2 focus:ring-2 focus:ring-coffee-400"
              >
                <option value="None">No Sort</option>
                <option value="Month">Month</option>
                <option value="Day">Day</option>
                <option value="Time">Time</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-coffee-600 hover:bg-coffee-700 text-white px-5 py-2 rounded-xl font-semibold shadow transition"
          >
            <Download size={18} /> Export CSV
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-coffee-200 shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-coffee-100 text-coffee-800">
              <tr>
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={
                      paginatedOrders.length > 0 &&
                      paginatedOrders.every((o) =>
                        selectedOrders.includes(o.id)
                      )
                    }
                    onChange={toggleSelectAll}
                  />
                </th>
                {["ID", "Type", "Customer", "Items", "Date/Time", "Actions"].map(
                  (h) => (
                    <th key={h} className="px-4 py-3 font-semibold">
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan="10"
                    className="text-center py-6 font-medium text-coffee-700"
                  >
                    No orders found.
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order, i) => (
                  <tr
                    key={order.id}
                    className={`${
                      i % 2 === 0 ? "bg-white" : "bg-coffee-50"
                    } hover:bg-coffee-100 transition`}
                  >
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
                    <td className="px-4 py-3">{order.date}</td>
                    <td className="px-4 py-3 flex gap-2">
                      <button
                        onClick={() => handleShowDetails(order)}
                        className="flex items-center gap-1 bg-coffee-100 border border-coffee-200 hover:bg-coffee-200 px-3 py-1 rounded-lg text-sm font-medium transition"
                      >
                        <Eye size={14} /> View
                      </button>
                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        className="flex items-center gap-1 bg-red-100 border border-red-200 hover:bg-red-200 px-3 py-1 rounded-lg text-sm font-medium transition"
                      >
                        <Trash2 size={14} /> Delete
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
              className={`flex items-center gap-1 px-4 py-2 border border-coffee-300 rounded-xl bg-coffee-100 hover:bg-coffee-200 transition ${
                page === 1 ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <ChevronLeft size={16} /> Prev
            </button>
            <span className="font-medium">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className={`flex items-center gap-1 px-4 py-2 border border-coffee-300 rounded-xl bg-coffee-100 hover:bg-coffee-200 transition ${
                page === totalPages ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && selectedOrder && (
        <div
          className="fixed inset-0 backdrop-blur-md bg-coffee-900/40 flex justify-center items-center z-50"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white text-coffee-900 rounded-2xl shadow-xl p-8 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold mb-4 text-center text-coffee-700">
              Order Details
            </h3>
            <div className="space-y-3 text-sm">
              <p><strong>ID:</strong> {selectedOrder.id}</p>
              <p><strong>Type:</strong> {selectedOrder.type}</p>
              <p><strong>Customer:</strong> {selectedOrder.customer}</p>
              <p><strong>Items:</strong> {selectedOrder.items.join(", ")}</p>
              
              <div>
                <strong>Status:</strong>
                <select
                  value={selectedOrder.status}
                  onChange={(e) =>
                    setSelectedOrder((prev) => ({ ...prev, status: e.target.value }))
                  }
                  className={`ml-2 border border-coffee-200 bg-coffee-50 text-coffee-800 rounded-xl px-3 py-1 focus:ring-2 focus:ring-coffee-400`}
                >
                  <option value="Cancelled">Cancelled</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

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