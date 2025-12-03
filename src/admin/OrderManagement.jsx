// OrderManagement.jsx
import React, { useEffect, useMemo, useState } from "react";
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

import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
  writeBatch,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase"; // adjust path if necessary

// helper to safely extract customer name from doc
const customerNameFromOrder = (o) => o.customer ||o.user?.customerName || o.customerName || (o.user && (o.user.firstName ? `${o.user.firstName} ${o.user.lastName || ""}`.trim() : o.user.email)) || "Anonymous" ;

export default function OrderManagement() {
  // local state
  const [orders, setOrders] = useState([]);
  const [typeFilter, setTypeFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("None");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState([]); // array of ids
  const [page, setPage] = useState(1);
  const pageSize = 5;

  // subscribe to orders collection (real-time)
  useEffect(() => {
    // order by createdAt desc if available, fallback to document id
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    // if your documents don't have createdAt field, you can replace above with:
    // const q = collection(db, "orders");

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((d) => {
          const docData = d.data() || {};
          return {
            id: d.id,
            // normalize fields used in UI
            type: docData.type || docData.source || "Online",
            status: docData.status || "Pending",
            customer: customerNameFromOrder(docData),
            items: Array.isArray(docData.items)
              ? docData.items.map((it) => (typeof it === "string" ? it : it.name || it.item || "")).filter(Boolean)
              : docData.items
              ? [String(docData.items)]
              : [],
               total: docData.total || 0,
            // prefer an explicit date field if present; try different possible fields
            date:
              docData.date ||
              (docData.completedAt ? new Date(docData.completedAt).toLocaleString() : null) ||
              (docData.createdAt && typeof docData.createdAt.toDate === "function"
                ? docData.createdAt.toDate().toLocaleString()
                : docData.createdAt || null),
            rawData: docData,
          };
        });
        setOrders(data);
      },
      (err) => {
        console.error("Orders onSnapshot error:", err);
      }
    );

    return () => unsub();
  }, []);
  

  // filtering + searching
  const filtered = useMemo(() => {
  const q = search.trim().toLowerCase();

  if (!q) return orders; // nothing typed → return all

  return orders.filter((order) => {
    const customer = order.customer?.toLowerCase() || "";
    const status = order.status?.toLowerCase() || "";
    const type = order.type?.toLowerCase() || "";
    const total = order.total?.toString() || "";
    const itemsArray = Array.isArray(order.items) ? order.items : [];

    return (
      customer.includes(q) ||
      status.includes(q) ||
      type.includes(q) ||
      total.includes(q) ||
      itemsArray.some((i) => (i?.toLowerCase() || "").includes(q))
    );
  });
}, [orders, search]);


  // pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginatedOrders = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages]);

  // stats
  const totalStats = useMemo(() => {
    const total = orders.length;
    const cancelled = orders.filter((o) => o.status === "Cancelled").length;
    const completed = orders.filter((o) => o.status === "Completed").length;
    return { total, cancelled, completed };
  }, [orders]);

  // helpers for selection
  const toggleSelectOrder = (id) =>
    setSelectedOrders((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));

  const toggleSelectAll = () => {
    const visibleIds = paginatedOrders.map((o) => o.id);
    const allSelected = visibleIds.every((id) => selectedOrders.includes(id));
    setSelectedOrders((prev) =>
      allSelected ? prev.filter((id) => !visibleIds.includes(id)) : [...prev, ...visibleIds.filter((id) => !prev.includes(id))]
    );
  };

  // export CSV using current filtered data
  const handleExportCSV = async () => {
    const header = ["ID", "Type", "Customer", "Items", "Date/Time", "Status"];
    const rows = filtered.map((o) => [o.id, o.type, o.customer, (o.items || []).join("; "), o.date || "", o.status]);
    const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // show modal / close modal
  const handleShowDetails = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  // update single order status in Firestore
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const ref = doc(db, "orders", orderId);
      await updateDoc(ref, { status: newStatus });
      // local state will update automatically via onSnapshot
    } catch (err) {
      console.error("Failed to update order status:", err);
      alert("Failed to update status. Check console.");
    }
  };

  // delete single order
  const handleDeleteOrder = async (id) => {
    if (!window.confirm("Delete this order?")) return;
    try {
      await deleteDoc(doc(db, "orders", id));
      // onSnapshot will update local orders
      setSelectedOrders((prev) => prev.filter((i) => i !== id));
    } catch (err) {
      console.error("Failed to delete order:", err);
      alert("Failed to delete order. Check console.");
    }
  };

  // bulk delete using a batch
  const handleBulkDelete = async () => {
    if (selectedOrders.length === 0) return;
    if (!window.confirm(`Delete ${selectedOrders.length} selected orders?`)) return;
    try {
      const batch = writeBatch(db);
      selectedOrders.forEach((id) => {
        batch.delete(doc(db, "orders", id));
      });
      await batch.commit();
      setSelectedOrders([]);
    } catch (err) {
      console.error("Bulk delete failed:", err);
      alert("Bulk delete failed. Check console.");
    }
  };

  // UI render
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
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              className="border border-coffee-200 bg-coffee-50 text-coffee-800 rounded-xl px-3 py-2 focus:ring-2 focus:ring-coffee-400"
            >
              <option value="All">All Types</option>
              <option value="Online">Online</option>
              <option value="POS">Walk-in</option>
            </select>

            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-coffee-400 w-4 h-4" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
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

          <div className="flex items-center gap-3">
            {selectedOrders.length > 0 && (
              <button onClick={handleBulkDelete} className="cursor-pointer px-4 py-2 rounded-xl bg-red-100 text-red-700 border border-red-200">
                Delete selected ({selectedOrders.length})
              </button>
            )}

            <button
              onClick={handleExportCSV}
              className="cursor-pointer flex items-center gap-2 bg-coffee-600 hover:bg-coffee-700 text-white px-5 py-2 rounded-xl font-semibold shadow transition"
            >
              <Download size={18} /> Export CSV
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-coffee-200 shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-coffee-100 text-coffee-800">
              <tr>
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={paginatedOrders.length > 0 && paginatedOrders.every((o) => selectedOrders.includes(o.id))}
                    onChange={toggleSelectAll}
                    className="cursor-pointer"
                  />
                </th>
                {["ID", "Type", "Customer", "Items", "Date/Time", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 font-semibold">
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
                paginatedOrders.map((order, i) => (
                  <tr key={order.id} className={`${i % 2 === 0 ? "bg-white" : "bg-coffee-50"} hover:bg-coffee-100 transition`}>
                    <td className="px-4 py-3">
                      <input type="checkbox" className="cursor-pointer" checked={selectedOrders.includes(order.id)} onChange={() => toggleSelectOrder(order.id)} />
                    </td>
                    <td className="px-4 py-3 font-medium">{order.id}</td>
                    <td className="px-4 py-3">{order.type}</td>
                    <td className="px-4 py-3">{order.customer}</td>
                    <td className="px-4 py-3">{(order.items || []).join(", ")}</td>
                    <td className="px-4 py-3">{order.date || "—"}</td>
                    <td className="px-4 py-3 flex gap-2">
                      <button
                        onClick={() => handleShowDetails(order)}
                        className="cursor-pointer flex items-center gap-1 bg-coffee-100 border border-coffee-200 hover:bg-coffee-200 px-3 py-1 rounded-lg text-sm font-medium transition"
                      >
                        <Eye size={14} /> View
                      </button>
                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        className="cursor-pointer flex items-center gap-1 bg-red-100 border border-red-200 hover:bg-red-200 px-3 py-1 rounded-lg text-sm font-medium transition"
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
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className={`flex items-center gap-1 px-4 py-2 border rounded-xl bg-coffee-100 hover:bg-coffee-200 ${page === 1 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
              <ChevronLeft size={16} /> Prev
            </button>
            <span className="font-medium">Page {page} of {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className={`flex items-center gap-1 px-4 py-2 border rounded-xl bg-coffee-100 hover:bg-coffee-200 ${page === totalPages ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
              Next <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 backdrop-blur-md bg-coffee-900/40 flex justify-center items-center z-50" onClick={handleCloseModal}>
          <div className="bg-white text-coffee-900 rounded-2xl shadow-xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold mb-4 text-center text-coffee-700">Order Details</h3>

            <div className="space-y-3 text-sm">
              <p><strong>ID:</strong> {selectedOrder.id}</p>
              <p><strong>Type:</strong> {selectedOrder.type}</p>
              <p><strong>Customer:</strong> {selectedOrder.customer}</p>
              <p><strong>Items:</strong> {(selectedOrder.items || []).join(", ")}</p>

              <div>
                <strong>Status:</strong>
                <select
                  value={selectedOrder.status}
                  onChange={async (e) => {
                    const newStatus = e.target.value;
                    // optimistic UI update
                    setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
                    await updateOrderStatus(selectedOrder.id, newStatus);
                  }}
                  className="ml-2 border border-coffee-200 bg-coffee-50 text-coffee-800 rounded-xl px-3 py-1 focus:ring-2 focus:ring-coffee-400"
                >
                  <option value="Cancelled">Cancelled</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <p><strong>Date/Time:</strong> {selectedOrder.date || "—"}</p>
              <p><strong>Total:</strong> {selectedOrder?.total }</p>
            </div>

            <div className="mt-6 flex gap-2">
              <button onClick={() => { handleDeleteOrder(selectedOrder.id); handleCloseModal(); }} className="cursor-pointer flex-1 bg-red-100 text-red-700 px-4 py-2 rounded-xl">Delete</button>
              <button onClick={handleCloseModal} className="cursor-pointer flex-1 bg-coffee-600 text-white px-4 py-2 rounded-xl">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
