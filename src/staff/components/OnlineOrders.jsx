import React, { useState, useEffect, useMemo } from "react";
import { db } from "../../firebase";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { X, Package, User, MapPin, Clock, Phone, Mail } from "lucide-react";

export default function OnlineOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("Active");
  const [search, setSearch] = useState("");
  const [primarySort, setPrimarySort] = useState("placedAt");
  const [secondarySort, setSecondarySort] = useState("none");
  const [toast, setToast] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const getNextStatus = (currentStatus, orderType) => {
    const baseMap = {
      Pending: "Preparing",
      Preparing: orderType === "pickup" ? "Ready for PickUp" : "Delivering",
      "Ready for PickUp": "Completed",
      Delivering: "Completed",
      Completed: null,
    };
    return baseMap[currentStatus] || null;
  };

  const currency = (v) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      maximumFractionDigits: 0,
    }).format(v);

  const StatusBadge = ({ status }) => {
    const map = {
      Pending: "bg-coffee-300 text-coffee-800",
      Preparing: "bg-coffee-100 text-coffee-700",
      Delivering: "bg-yellow-500 text-white",
      "Ready for PickUp": "bg-green-400 text-white",
      Completed: "bg-green-500 text-white",
      Cancelled: "bg-red-100 text-red-700",
    };
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] sm:text-xs font-semibold ${
          map[status] || "bg-gray-100 text-gray-700"
        }`}
      >
        {status}
      </span>
    );
  };

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "orders"), (snapshot) => {
      const data = snapshot.docs.map((doc) => {
        const o = doc.data();
        return {
          id: doc.id,
          customer: o.user?.firstName || "Guest",
          customerDetails: o.user || {},
          shippingDetails: o.orderType || "sad",
          schedule: o.schedule?.now || "Time: "+o.schedule?.time + " Date: " + o.schedule?.date,
          paymentMethod: o.paymentMethod || "N/A",
          address: o.user?.address?.address || "",
          items:
            o.items?.map((i) => ({
              name: i.name,
              qty: i.quantity,
              price: i.price,
              size: i.size,
              addons: i.addons || [],
            })) || [],
          itemCount:
            o.items?.reduce((sum, i) => sum + (i.quantity || 0), 0) || 0,
          subtotal:
            o.items?.reduce(
              (sum, i) => sum + (i.price || 0) * (i.quantity || 0),
              0
            ) || 0,
          deliveryFee: o.deliveryFee || 0,
          total: o.total || 0,
          status: o.status || "Pending",
          placedAt: o.createdAt?.toDate?.() || new Date(),
        };
      });
      setOrders(data);
    });

    return () => unsub();
  }, []);

  const handleStatusChange = async (orderId, currentStatus, orderType) => {
    const newStatus = getNextStatus(currentStatus, orderType);
    if (!newStatus) return;

    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { status: newStatus });

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );

      setToast({
        message: `Order ${orderId} → ${newStatus}`,
        tone: ["Delivering", "Completed"].includes(newStatus)
          ? "success"
          : "info",
      });
      setTimeout(() => setToast(null), 2300);
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Failed to update order status.");
    }
  };

  const openOrderModal = (order) => {
    setSelectedOrder(order);
    setModalOpen(true);
  };

  const closeOrderModal = () => {
    setModalOpen(false);
    setSelectedOrder(null);
  };

  const compareForKey = (key, a, b) => {
    if (key === "placedAt") return new Date(b.placedAt) - new Date(a.placedAt);
    if (key === "total") return b.total - a.total;
    if (key === "customer") return a.customer.localeCompare(b.customer);
    if (key === "status") return a.status.localeCompare(b.status);
    return 0;
  };

  const visibleOrders = useMemo(() => {
    const s = search.trim().toLowerCase();

    const filtered = orders.filter((o) => {
      if (filter === "Active" && o.status === "Completed") return false;
      if (filter !== "All" && filter !== "Active" && o.status !== filter)
        return false;
      if (!s) return true;
      return (
        o.id.toLowerCase().includes(s) ||
        o.customer.toLowerCase().includes(s)
      );
    });

    return [...filtered].sort((a, b) => {
      const p = compareForKey(primarySort, a, b);
      if (p !== 0 || secondarySort === "none") return p;
      return compareForKey(secondarySort, a, b);
    });
  }, [orders, search, filter, primarySort, secondarySort]);

  const totalPages = Math.ceil(visibleOrders.length / itemsPerPage);
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return visibleOrders.slice(start, start + itemsPerPage);
  }, [visibleOrders, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, search, primarySort, secondarySort]);

  const formatTime = (iso) =>
    new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <div className="bg-coffee-50 rounded-xl shadow p-3 sm:p-5">
      <div className="flex flex-col gap-3 sm:gap-4 mb-4">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-coffee-800">
          📦 Online Orders
        </h2>
        <p className="text-xs sm:text-sm text-coffee-700">
          Manage incoming orders. Completed orders are hidden by default.
        </p>

        {/* Filters */}
        <div className="flex flex-col gap-3">
          <input
            placeholder="Search by ID or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white border border-coffee-200 rounded-md px-2 sm:px-3 py-2 text-xs sm:text-sm text-coffee-800 w-full"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="cursor-pointer bg-white border border-coffee-200 text-coffee-800 rounded-md px-2 sm:px-3 py-2 text-xs sm:text-sm shadow-sm"
            >
              <option value="Active">Active</option>
              <option value="All">All statuses</option>
              <option value="Pending">Pending</option>
              <option value="Preparing">Preparing</option>
              <option value="Delivering">Delivering</option>
              <option value="PickUp">Ready For Pickup</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            <select
              value={primarySort}
              onChange={(e) => setPrimarySort(e.target.value)}
              className="cursor-pointer bg-white border border-coffee-200 text-coffee-800 rounded-md px-2 sm:px-3 py-2 text-xs sm:text-sm shadow-sm"
            >
              <option value="placedAt">Sort: Newest</option>
              <option value="total">Sort: Total</option>
              <option value="customer">Sort: Customer</option>
              <option value="status">Sort: Status</option>
            </select>

            <select
              value={secondarySort}
              onChange={(e) => setSecondarySort(e.target.value)}
              className="cursor-pointer bg-white border border-coffee-200 text-coffee-800 rounded-md px-2 sm:px-3 py-2 text-xs sm:text-sm shadow-sm"
            >
              <option value="none">No secondary</option>
              <option value="placedAt">Then: Newest</option>
              <option value="total">Then: Total</option>
              <option value="customer">Then: Customer</option>
              <option value="status">Then: Status</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <label className="text-xs text-coffee-700">Show:</label>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="cursor-pointer bg-white border border-coffee-200 text-coffee-800 rounded-md px-2 py-1 text-xs shadow-sm"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
            <span className="text-xs text-coffee-700">
              Showing {Math.min((currentPage - 1) * itemsPerPage + 1, visibleOrders.length)} - {Math.min(currentPage * itemsPerPage, visibleOrders.length)} of {visibleOrders.length}
            </span>
          </div>
        </div>
      </div>

      {/* Orders */}
      {visibleOrders.length === 0 ? (
        <div className="py-8 sm:py-12 text-center text-coffee-700">
          <p className="mb-3 text-xs sm:text-sm">No active orders found.</p>
        </div>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="block lg:hidden space-y-3">
            {paginatedOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm border border-coffee-200 p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-medium text-sm text-coffee-800">{order.id}</div>
                    <div className="text-xs text-coffee-600">{formatTime(order.placedAt)}</div>
                  </div>
                  <StatusBadge status={order.status} />
                </div>

                <div className="space-y-2 text-xs sm:text-sm mb-3">
                  <div className="flex justify-between">
                    <span className="text-coffee-600">Customer:</span>
                    <span className="font-medium">{order.customer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-coffee-600">Items:</span>
                    <span className="font-medium">{order.itemCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-coffee-600">Total:</span>
                    <span className="font-semibold text-coffee-800">{currency(order.total)}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openOrderModal(order)}
                    className="cursor-pointer flex-1 px-3 py-2 text-xs bg-white border border-coffee-200 rounded-md hover:bg-coffee-100 text-coffee-800 font-semibold transition-colors"
                  >
                    View Details
                  </button>
                  {getNextStatus(order.status, order.shippingDetails) && (
                    <button
                      onClick={() => handleStatusChange(order.id, order.status, order.shippingDetails)}
                      className="cursor-pointer flex-1 px-3 py-2 text-xs bg-coffee-600 text-white rounded-md hover:bg-coffee-700 font-semibold transition-colors"
                    >
                      {getNextStatus(order.status, order.shippingDetails)}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-auto rounded-md border border-coffee-200">
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
                {paginatedOrders.map((order, idx) => (
                  <tr
                    key={order.id}
                    className={`border-t hover:bg-coffee-50 transition-colors ${
                      idx % 2 === 0 ? "bg-white" : "bg-coffee-50"
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-1">
                        <div className="font-medium text-coffee-800">{order.id}</div>
                        <div className="text-xs text-coffee-700">{formatTime(order.placedAt)}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">{order.customer}</td>
                    <td className="py-3 px-4 text-center">{order.itemCount}</td>
                    <td className="py-3 px-4 text-right font-medium text-coffee-800">
                      {currency(order.total)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openOrderModal(order)}
                          className="cursor-pointer px-3 py-1.5 text-xs bg-white border border-coffee-200 rounded-full hover:bg-coffee-100 text-coffee-800 font-semibold transition-colors shadow"
                        >
                          View Details
                        </button>
                        {getNextStatus(order.status, order.shippingDetails) && (
                          <button
                            onClick={() => handleStatusChange(order.id, order.status, order.shippingDetails)}
                            className="cursor-pointer px-3 py-1.5 text-xs bg-coffee-600 text-white rounded-full hover:bg-coffee-700 font-semibold shadow transition-colors"
                          >
                            Move to {getNextStatus(order.status, order.shippingDetails)}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 px-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="cursor-pointer w-full sm:w-auto px-4 py-2 text-xs sm:text-sm bg-white border border-coffee-200 rounded-md hover:bg-coffee-100 text-coffee-800 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ← Previous
              </button>

              <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto">
                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1;
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`cursor-pointer px-2 sm:px-3 py-1.5 text-xs sm:text-sm rounded-md font-semibold transition-colors ${
                          currentPage === page
                            ? "bg-coffee-600 text-white"
                            : "bg-white border border-coffee-200 text-coffee-800 hover:bg-coffee-100"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return (
                      <span key={page} className="text-coffee-700 text-xs">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="cursor-pointer w-full sm:w-auto px-4 py-2 text-xs sm:text-sm bg-white border border-coffee-200 rounded-md hover:bg-coffee-100 text-coffee-800 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {/* Order Details Modal */}
      {modalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-coffee-600 text-white p-4 sm:p-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Order Details
                </h3>
                <p className="text-xs sm:text-sm text-coffee-100 mt-1">
                  {formatDate(selectedOrder.placedAt)} at {formatTime(selectedOrder.placedAt)}
                </p>
              </div>
              <button
                onClick={closeOrderModal}
                className="cursor-pointer p-2 hover:bg-coffee-600 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto p-4 sm:p-6 space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-coffee-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <User className="w-4 h-4 text-coffee-600" />
                    <h4 className="font-semibold text-coffee-800">Customer Information</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-coffee-600">Name:</span>{" "}
                      <span className="font-medium text-coffee-900">
                        {selectedOrder.customerDetails.firstName} {selectedOrder.customerDetails.lastName}
                      </span>
                    </div>
                    {selectedOrder.customerDetails.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3 h-3 text-coffee-600" />
                        <span className="text-coffee-900">{selectedOrder.customerDetails.email}</span>
                      </div>
                    )}
                    {selectedOrder.customerDetails.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3 h-3 text-coffee-600" />
                        <span className="text-coffee-900">{selectedOrder.customerDetails.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-coffee-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-coffee-600" />
                    <h4 className="font-semibold text-coffee-800">Delivery Details</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-coffee-600">Type:</span>{" "}
                      <span className="font-medium text-coffee-900 bg-coffee-500 text-coffee-700 text-xs px-2 py-1 rounded-full capitalize ">
                        {selectedOrder.shippingDetails || "N/A"}
                      </span>
                    </div>
                    {selectedOrder.shippingDetails.type === "delivery" && (
                      <div>
                        <span className="text-coffee-600">Address:</span>{" "}
                        <span className="text-coffee-900">
                          {selectedOrder.shippingDetails.address || "N/A"}
                        </span>
                      </div>
                    )}
                    {selectedOrder.shippingDetails.type === "pickup" && (
                      <div>
                        <span className="text-coffee-600">Location:</span>{" "}
                        <span className="text-coffee-900">
                          {selectedOrder.shippingDetails.pickupLocation || "N/A"}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-coffee-600" />
                      <span className="bg-coffee-300 text-coffee-700 text-xs px-2 py-1 rounded-full">  
                        {selectedOrder.schedule === true ? "ASAP" : "Scheduled at: " + selectedOrder.schedule}    
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-coffee-600" />
                      <span className="text-coffee-900">
                        {selectedOrder.address || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Status & Payment */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-coffee-50 rounded-lg p-4">
                  <h4 className="font-semibold text-coffee-800 mb-2">Status</h4>
                  <StatusBadge status={selectedOrder.status} />
                </div>
                <div className="bg-coffee-50 rounded-lg p-4">
                  <h4 className="font-semibold text-coffee-800 mb-2">Payment Method</h4>
                  <span className="text-sm text-coffee-900 uppercase">
                    {selectedOrder.paymentMethod}
                  </span>
                </div>
              </div>

              {/* Items */}
              <div>
                <h4 className="font-semibold text-coffee-800 mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Order Items
                </h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="bg-coffee-50 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="font-medium text-coffee-900">{item.name}</div>
                          {item.size && (
                            <div className="text-xs text-coffee-600">Size: {item.size}</div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-coffee-900">
                            {currency(item.price * item.qty)}
                          </div>
                          <div className="text-xs text-coffee-600">
                            {currency(item.price)} × {item.qty}
                          </div>
                        </div>
                      </div>

                      {/* Add-ons */}
                      {item.addons && item.addons.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-coffee-200">
                          <div className="text-xs font-semibold text-coffee-700 mb-1">Add-ons:</div>
                          <div className="space-y-1">
                            {item.addons.map((addon, addonIdx) => (
                              <div key={addonIdx} className="flex justify-between text-xs text-coffee-600">
                                <span>
                                  • {addon.name} {addon.qty > 1 && `(×${addon.qty})`}
                                </span>
                                <span>{currency(addon.price * addon.qty)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-coffee-100 rounded-lg p-4">
                <h4 className="font-semibold text-coffee-800 mb-3">Order Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-coffee-600">Subtotal</span>
                    <span className="text-coffee-900">{currency(selectedOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-coffee-600">Delivery Fee</span>
                    <span className="text-coffee-900">{currency(selectedOrder.deliveryFee)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-coffee-300">
                    <span className="font-semibold text-coffee-800">Total</span>
                    <span className="font-bold text-coffee-900 text-lg">
                      {currency(selectedOrder.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-coffee-50 p-4 flex items-center justify-end gap-3 border-t border-coffee-200">
              <button
                onClick={closeOrderModal}
                className="cursor-pointer px-4 py-2 text-sm bg-white border border-coffee-200 rounded-lg hover:bg-coffee-100 text-coffee-800 font-semibold transition-colors"
              >
                Close
              </button>
              {getNextStatus(selectedOrder.status, selectedOrder.shippingDetails) && (
                <button
                  onClick={() => {
                    handleStatusChange(selectedOrder.id, selectedOrder.status, selectedOrder.shippingDetails);
                    closeOrderModal();
                  }}
                  className="cursor-pointer px-4 py-2 text-sm bg-coffee-600 text-white rounded-lg hover:bg-coffee-700 font-semibold transition-colors"
                >
                  Move to {getNextStatus(selectedOrder.status, selectedOrder.shippingDetails)}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`fixed right-4 bottom-6 left-4 sm:left-auto sm:max-w-sm z-50 rounded-lg px-4 py-2.5 shadow-lg text-xs sm:text-sm ${
            toast.tone === "success"
              ? "bg-green-600 text-white"
              : "bg-coffee-800 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
