import React, { useState, useEffect } from "react";
import { X, Package, Clock, CheckCircle, ShoppingCart, RefreshCw } from "lucide-react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "../../firebase";
import { useNavigate } from "react-router-dom";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [activeTab, setActiveTab] = useState("current"); // 'current' or 'history'
  const navigate = useNavigate();

  // Live fetch orders from the global "orders" collection
 useEffect(() => {
  const uid = localStorage.getItem("authToken");
  if (!uid) {
    setLoading(false);
    return;
  }

  const ordersCol = query(collection(db, "orders"),("createdAt", "desc"));

  // Live listener
  const unsubscribe = onSnapshot(
    ordersCol,
    snapshot => {
      const data = snapshot.docs
        .map(doc => {
          const o = doc.data();

          // Check if user field exists and matches uid
          if (!o.user || o.user.uid !== uid) return null;

          return {
            id: doc.id,
            item: o.items?.map(i => i.name).join(", ") || "",
            quantity: o.items?.reduce((acc, i) => acc + i.quantity, 0) || 0,
            total: o.items?.reduce((acc, i) => acc + i.price * i.quantity, 0) || 0,
            status: o.status || "Pending",
            date: o.createdAt?.toDate ? o.createdAt.toDate() : new Date(),
            items: o.items || [],
          };
        })
        .filter(Boolean);

      setOrders(data);
      setLoading(false);
    },
    err => {
      console.error("Error fetching orders:", err);
      setLoading(false);
    }
  );

  return () => unsubscribe();
}, []);

  const hasOrders = orders.length > 0;
  const currentOrders = orders.filter(order => !["Delivered", "Completed"].includes(order.status));
  const pastOrders = orders.filter(order => ["Delivered", "Completed"].includes(order.status));

  let filteredOrders = activeTab === "current" ? currentOrders : pastOrders;
  if (filter !== "All") filteredOrders = filteredOrders.filter(order => order.status === filter);
  if (sortBy === "oldest") filteredOrders.reverse();

  const handleOrderClick = order => setSelectedOrder(order);
  const closeModal = () => setSelectedOrder(null);
  const reorder = order => alert(`Reordering ${order.item}!`);

  const getStatusIcon = status => {
    if (["Delivered", "Completed"].includes(status)) return <CheckCircle className="w-5 h-5" />;
    if (status === "Pending") return <Clock className="w-5 h-5" />;
    return <Package className="w-5 h-5" />;
  };

  return (
    <div className="min-h-[70vh] mt-20 py-10 px-6">
      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-coffee-600 mb-4"></div>
            <h2 className="text-2xl font-semibold text-coffee-800">Loading your orders...</h2>
          </div>
        </div>
      ) : !hasOrders ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center bg-white rounded-3xl shadow-soft-xl p-12 max-w-md">
            <ShoppingCart className="w-24 h-24 mx-auto mb-6 text-coffee-500" />
            <h2 className="text-3xl font-bold text-coffee-900 mb-3 logo-font">No Orders Yet</h2>
            <p className="text-coffee-700 text-lg mb-6">Start your coffee journey by placing your first order!</p>
            <button
              className="bg-coffee-600 hover:bg-coffee-700 text-white font-semibold px-8 py-3 rounded-2xl transition-all transform hover:scale-105 shadow-soft-lg cursor-pointer"
              onClick={() => navigate("/menu")}
            >
              Browse Menu
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-coffee-900 mb-2 logo-font">My Orders</h1>
            <p className="text-coffee-700">Track and manage your orders</p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-6 gap-4">
            <button
              onClick={() => setActiveTab("current")}
              className={`px-6 py-3 rounded-2xl font-semibold transition-all cursor-pointer ${
                activeTab === "current" ? "bg-coffee-600 text-white shadow-soft-lg" : "bg-white text-coffee-700 hover:bg-coffee-50 shadow-soft-lg"
              }`}
            >
              Current Orders ({currentOrders.length})
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-6 py-3 rounded-2xl font-semibold transition-all cursor-pointer ${
                activeTab === "history" ? "bg-coffee-600 text-white shadow-soft-lg" : "bg-white text-coffee-700 hover:bg-coffee-50 shadow-soft-lg"
              }`}
            >
              Order History ({pastOrders.length})
            </button>
          </div>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl shadow-soft-lg">
              <Package className="w-16 h-16 mx-auto mb-4 text-coffee-400" />
              <p className="text-coffee-600 text-lg">No orders found in this category</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredOrders.map((order, index) => (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl shadow-soft-lg hover:shadow-soft-xl transition-all p-6 border-l-4 border-coffee-500"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-xl text-coffee-900 mb-1 logo-font">Order #{order.id}</h3>
                      <p className="text-coffee-600 text-sm flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {new Date(order.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(order.status)}
                      <span
                        className={`text-sm font-semibold px-4 py-2 rounded-full flex items-center gap-2 ${
                          order.status === "Delivered" || order.status === "Completed"
                            ? "bg-green-100 text-green-700"
                            : order.status === "Pending"
                            ? "bg-coffee-200 text-coffee-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-coffee-200 pt-4 mb-4">
                    <p className="text-coffee-800 mb-2">
                      <span className="font-medium">Item:</span> {order.item}
                    </p>
                    <p className="text-coffee-800 mb-2">
                      <span className="font-medium">Quantity:</span> {order.quantity}
                    </p>
                    <p className="text-2xl font-bold text-coffee-700">
                      ₱{order.total?.toFixed(2) || "0.00"}
                    </p>
                  </div>

                  <div className="flex gap-3 flex-wrap">
                    <button
                      onClick={() => handleOrderClick(order)}
                      className="cursor-pointer flex-1 bg-coffee-600 hover:bg-coffee-700 text-white font-semibold px-6 py-2 rounded-xl transition-all shadow-soft-lg hover:shadow-soft-xl"
                    >
                      View Details
                    </button>

                    {["Delivered", "Completed"].includes(order.status) && (
                      <button
                        onClick={() => reorder(order)}
                        className="cursor-pointer flex-1 bg-coffee-500 hover:bg-coffee-600 text-white font-semibold px-6 py-2 rounded-xl transition-all flex items-center justify-center gap-2 shadow-soft-lg hover:shadow-soft-xl"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Reorder
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 backdrop-blur-md bg-coffee-900/30 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-soft-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideUp">
            <div className="sticky top-0 bg-coffee-600 text-white p-6 rounded-t-3xl flex justify-between items-center">
              <h2 className="text-2xl font-bold logo-font">Order Details</h2>
              <button onClick={closeModal} className="hover:bg-coffee-700 p-2 rounded-full transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-coffee-900 logo-font">Order #{selectedOrder.id}</h3>
                  <span
                    className={`text-sm font-semibold px-4 py-2 rounded-full flex items-center gap-2 ${
                      selectedOrder.status === "Delivered" || selectedOrder.status === "Completed"
                        ? "bg-green-100 text-green-700"
                        : "bg-coffee-200 text-coffee-800"
                    }`}
                  >
                    {getStatusIcon(selectedOrder.status)}
                    {selectedOrder.status}
                  </span>
                </div>

                <p className="text-coffee-700 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {new Date(selectedOrder.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              <div className="border-t border-coffee-200 pt-6">
                <h4 className="font-semibold text-lg mb-4 text-coffee-900 logo-font">Order Items</h4>
                {selectedOrder.items?.map((item, index) => (
                  <div key={index} className="flex justify-between items-center mb-3 pb-3 border-b border-coffee-100">
                    <div>
                      <p className="font-medium text-coffee-900">{item.name}</p>
                      <p className="text-sm text-coffee-600">Quantity: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-coffee-700">₱{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}

                <div className="mt-6 pt-4 border-t-2 border-coffee-300">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-coffee-900 logo-font">Total</span>
                    <span className="text-2xl font-bold text-coffee-700">₱{selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                {["Delivered", "Completed"].includes(selectedOrder.status) && (
                  <button
                    onClick={() => reorder(selectedOrder)}
                    className="cursor-pointer flex-1 bg-coffee-500 hover:bg-coffee-600 text-white font-semibold px-6 py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-soft-lg hover:shadow-soft-xl"
                  >
                    <RefreshCw className="w-5 h-5" />
                    Reorder
                  </button>
                )}
                <button
                  onClick={closeModal}
                  className="cursor-pointer flex-1 bg-coffee-200 hover:bg-coffee-300 text-coffee-900 font-semibold px-6 py-3 rounded-xl transition-all shadow-soft-lg hover:shadow-soft-xl"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
