import React, { useState, useEffect, useMemo } from "react";
import { db } from "../../firebase";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";

export default function OnlineOrders() {
  const [orders, setOrders] = useState([]);
  const [expanded, setExpanded] = useState([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [primarySort, setPrimarySort] = useState("placedAt");
  const [secondarySort, setSecondarySort] = useState("none");
  const [toast, setToast] = useState(null);

  // Next status mapping
  const nextStatusMap = {
    Pending: "Preparing",
    Preparing: "Delivering",
    Delivering: "Completed",
    Completed: null
  };

  // Currency formatter
  const currency = (v) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      maximumFractionDigits: 0
    }).format(v);

  // Status badge component
  const StatusBadge = ({ status }) => {
    const map = {
      Pending: "bg-coffee-300 text-coffee-800",
      Preparing: "bg-coffee-100 text-coffee-700",
      Delivering: "bg-yellow-500 text-white",
      Completed: "bg-green-500 text-white",
      Cancelled: "bg-red-100 text-red-700"
    };
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
          map[status] || "bg-gray-100 text-gray-700"
        }`}
      >
        {status}
      </span>
    );
  };

  // Fetch live orders from Firestore
  useEffect(() => {
    const ordersCol = collection(db, "orders");
    const unsubscribe = onSnapshot(ordersCol, (snapshot) => {
      const data = snapshot.docs.map((doc) => {
        const o = doc.data();
        return {
          id: doc.id,
          customer: o.user?.firstName || "Guest",
          items: o.items?.map((i) => ({ name: i.name, qty: i.quantity })) || [],
          itemCount: o.items?.reduce((sum, i) => sum + i.quantity, 0) || 0,
          total: o.items?.reduce((sum, i) => sum + i.price * i.quantity, 0) || 0,
          status: o.status || "Pending",
          placedAt: o.createdAt?.toDate?.() || new Date()
        };
      });
      setOrders(data);
    });

    return () => unsubscribe();
  }, []);

  // Update order status
  const handleStatusChange = async (orderId, currentStatus) => {
    const newStatus = nextStatusMap[currentStatus];
    if (!newStatus) return;

    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { status: newStatus });

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );

      setToast({
        message: `Order ${orderId} → ${newStatus}`,
        tone: ["Delivering", "Completed"].includes(newStatus) ? "success" : "info"
      });
      setTimeout(() => setToast(null), 2300);
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Failed to update order status.");
    }
  };

  // Toggle expand
  const toggleExpand = (id) =>
    setExpanded((e) => (e.includes(id) ? e.filter((x) => x !== id) : [...e, id]));

  // Sorting helpers
  const compareForKey = (key, a, b) => {
    if (key === "placedAt") return new Date(b.placedAt) - new Date(a.placedAt);
    if (key === "total") return b.total - a.total;
    if (key === "customer") return a.customer.localeCompare(b.customer);
    if (key === "status") return a.status.localeCompare(b.status);
    return 0;
  };

  // Filtered + sorted orders
  const visibleOrders = useMemo(() => {
    const s = search.trim().toLowerCase();
    const filtered = orders.filter((o) => {
      if (filter !== "All" && o.status !== filter) return false;
      if (!s) return true;
      return o.id.toLowerCase().includes(s) || o.customer.toLowerCase().includes(s);
    });

    return [...filtered].sort((a, b) => {
      const p = compareForKey(primarySort, a, b);
      if (p !== 0 || secondarySort === "none") return p;
      return compareForKey(secondarySort, a, b);
    });
  }, [orders, search, filter, primarySort, secondarySort]);

  const formatTime = (iso) => new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const formatDateTime = (iso) => new Date(iso).toLocaleString();

  return (
    <div className="bg-coffee-50 rounded-xl shadow p-3 sm:p-5">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-4">
        <h2 className="text-xl sm:text-2xl font-semibold text-coffee-800">📦 Online Orders</h2>
        <p className="text-xs sm:text-sm text-coffee-700">Manage incoming orders from online channels.</p>

        {/* Search & Filters */}
        <div className="flex flex-col gap-3">
          <input
            aria-label="Search orders"
            placeholder="Search by id or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white border border-coffee-200 rounded-md px-2 py-1.5 text-sm text-coffee-800 w-full"
          />
          <div className="flex flex-col sm:flex-row gap-2">
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="flex-1 bg-white border border-coffee-200 text-coffee-800 rounded-md px-3 py-2 text-xs sm:text-sm shadow-sm">
              <option value="All">All statuses</option>
              <option value="Pending">Pending</option>
              <option value="Preparing">Preparing</option>
              <option value="Delivering">Delivering</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            <select value={primarySort} onChange={(e) => setPrimarySort(e.target.value)} className="flex-1 bg-white border border-coffee-200 text-coffee-800 rounded-md px-3 py-2 text-xs sm:text-sm shadow-sm">
              <option value="placedAt">Sort: Newest</option>
              <option value="total">Sort: Total</option>
              <option value="customer">Sort: Customer</option>
              <option value="status">Sort: Status</option>
            </select>

            <select value={secondarySort} onChange={(e) => setSecondarySort(e.target.value)} className="flex-1 bg-white border border-coffee-200 text-coffee-800 rounded-md px-3 py-2 text-xs sm:text-sm shadow-sm">
              <option value="none">No secondary</option>
              <option value="placedAt">Then: Newest</option>
              <option value="total">Then: Total</option>
              <option value="customer">Then: Customer</option>
              <option value="status">Then: Status</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      {visibleOrders.length === 0 ? (
        <div className="py-12 text-center text-coffee-700">
          <p className="mb-3 text-sm">No orders match your filters.</p>
        </div>
      ) : (
        <div className="overflow-auto rounded-md border border-coffee-200">
          <table className="w-full text-sm">
            <thead className="bg-coffee-100 text-coffee-800">
              <tr>
                <th className="py-3 px-4 text-left">Order</th>
                <th className="py-3 px-4 text-left">Customer</th>
                <th className="py-3 px-4 text-center">Items</th>
                <th className="py-3 px-4 text-right">Total</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleOrders.map((order, idx) => (
                <React.Fragment key={order.id}>
                  <tr className={`border-t hover:bg-coffee-50 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-coffee-50"}`}>
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-1">
                        <div className="font-medium text-coffee-800">{order.id}</div>
                        <div className="text-xs text-coffee-700">{formatTime(order.placedAt)}</div>
                      </div>
                    </td>

                    <td className="py-3 px-4">{order.customer}</td>
                    <td className="py-3 px-4 text-center">{order.itemCount}</td>
                    <td className="py-3 px-4 text-right font-medium text-coffee-800">{currency(order.total)}</td>
                    <td className="py-3 px-4 text-center"><StatusBadge status={order.status} /></td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => toggleExpand(order.id)}
                          className="px-3 py-1.5 text-xs bg-white border border-coffee-200 rounded-full hover:bg-coffee-100 text-coffee-800 font-semibold transition-colors shadow"
                        >
                          {expanded.includes(order.id) ? "Hide" : "Details"}
                        </button>
                        {nextStatusMap[order.status] && (
                          <button
                            onClick={() => handleStatusChange(order.id, order.status)}
                            className="px-3 py-1.5 text-xs bg-coffee-600 text-white rounded-full hover:bg-coffee-700 font-semibold shadow transition-colors"
                          >
                            Move to {nextStatusMap[order.status]}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>

                  {expanded.includes(order.id) && (
                    <tr className="bg-coffee-50">
                      <td colSpan="6" className="py-3 px-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-coffee-700">
                          <div>
                            <div className="text-xs font-semibold mb-2 text-coffee-800">Items</div>
                            <ul className="space-y-1">
                              {order.items.map((it, i) => (
                                <li key={i} className="flex justify-between">
                                  <span>{it.name}</span>
                                  <span className="text-coffee-800 font-medium">x{it.qty}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <div className="text-xs font-semibold mb-2 text-coffee-800">Order Info</div>
                            <div className="text-xs">Placed: {formatDateTime(order.placedAt)}</div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`fixed right-4 bottom-6 z-50 rounded-lg px-4 py-2.5 shadow-lg text-sm ${
            toast.tone === "success" ? "bg-green-600 text-white" : "bg-coffee-800 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
