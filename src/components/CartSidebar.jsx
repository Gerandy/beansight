import React, { useState, useEffect } from "react";
import { useCart } from "./CartContext";
import { Link, useNavigate } from "react-router-dom";
import { X, ShoppingBag, Trash2, Plus, Minus, MapPin, Clock, Calendar, ChevronRight, ChevronDown, ChevronUp } from "lucide-react";

function CartSidebar({ cartOpen, setCartOpen }) {
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [deliveryOption, setDeliveryOption] = useState("now");
  const [expandedItems, setExpandedItems] = useState({}); // Track which items are expanded

  const { cart = [], removeFromCart, updateQuantity, totalPrice = 0 } = useCart() || {};
  const navigate = useNavigate();

  const deliveryFee = cart.length > 0 ? 49 : 0;
  const grandTotal = totalPrice + deliveryFee;

  useEffect(() => {
    if (showDeliveryModal) {
      const timer = setTimeout(() => setModalVisible(true), 10);
      return () => clearTimeout(timer);
    } else {
      setModalVisible(false);
    }
  }, [showDeliveryModal]);

  const toggleItemDetails = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  return (
    <div className="relative">
      {/* SIDEBAR */}
      <div
        className={`fixed top-16 right-0 w-full md:w-[420px] h-[calc(100vh-4rem)] bg-gradient-to-b from-coffee-50 to-coffee-100 shadow-2xl border-l border-coffee-200 z-40 transform transition-all duration-300 ${
          cartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* HEADER */}
        <div className="bg-gradient-to-r from-coffee-600 to-coffee-700 p-5 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-xs text-coffee-100 font-medium">Delivering to</div>
              <div className="font-bold text-base text-white flex items-center gap-2">
                Cavite
                <span className="text-xs font-normal bg-white/20 px-2 py-0.5 rounded-full">
                  {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          </div>
          <button
            className="text-white hover:bg-white/10 transition p-2 rounded-lg"
            onClick={() => setCartOpen(false)}
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CART ITEMS */}
        <div className="flex flex-col h-[calc(100%-280px)] overflow-y-auto px-5 py-4 scrollbar-thin scrollbar-thumb-coffee-300 scrollbar-track-transparent">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-coffee-200">
            <h2 className="font-bold text-xl text-coffee-800 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-coffee-600" />
              My Bag
              <span className="text-sm font-normal text-coffee-500">({cart.length})</span>
            </h2>
            <button
              className="cursor-pointer text-coffee-600 hover:text-coffee-700 font-medium text-sm flex items-center gap-1 transition"
              onClick={() => navigate("/menu")}
            >
              Add More <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="bg-coffee-100 p-6 rounded-full mb-4">
                <ShoppingBag className="w-12 h-12 text-coffee-400" />
              </div>
              <p className="text-coffee-700 font-medium mb-2">Your bag is empty</p>
              <p className="text-sm text-coffee-500 mb-4">Add items from the menu to get started</p>
              <button
                onClick={() => {
                  navigate("/menu");
                  setCartOpen(false);
                }}
                className="cursor-pointer bg-coffee-600 text-white px-6 py-2 rounded-full font-medium hover:bg-coffee-700 transition"
              >
                Browse Menu
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => {
                const isExpanded = expandedItems[item.uniqueCartItemId]; // Changed from item.id
                const hasAddons = item.addons && item.addons.length > 0;
                
                return (
                  <div
                    key={item.uniqueCartItemId} // Changed from item.id
                    className="bg-white rounded-xl p-4 shadow-sm border border-coffee-200 hover:shadow-md transition"
                  >
                    <div className="flex gap-3">
                      <img
                        src={item.img}
                        alt={item.name}
                        className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-semibold text-coffee-800 text-sm leading-tight">
                            {item.name}
                          </h3>
                          <button
                            className="text-red-500 hover:text-red-600 transition p-1"
                            onClick={() => removeFromCart(item.uniqueCartItemId)} // Changed
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {item.size && (
                          <span className="inline-block text-xs bg-coffee-200 text-coffee-700 px-2 py-0.5 rounded-full font-medium mb-2">
                            {item.size}
                          </span>
                        )}

                        {/* View Details Button */}
                        {hasAddons && (
                          <button
                            onClick={() => toggleItemDetails(item.uniqueCartItemId)} // Changed
                            className="text-xs text-coffee-600 hover:text-coffee-700 font-medium flex items-center gap-1 mb-2 transition"
                          >
                            {isExpanded ? (
                              <>
                                Hide Details <ChevronUp className="w-3 h-3" />
                              </>
                            ) : (
                              <>
                                View Details <ChevronDown className="w-3 h-3" />
                              </>
                            )}
                          </button>
                        )}

                        {/* Add-ons - Collapsible */}
                        {hasAddons && isExpanded && (
                          <div className="bg-coffee-50 rounded-lg p-2 mb-2 text-xs animate-slideDown">
                            <div className="font-medium text-coffee-700 mb-1">Add-ons:</div>
                            {item.addons.map((addon, idx) => (
                              <div key={idx} className="flex justify-between text-coffee-600 py-0.5">
                                <span>
                                  • {addon.name} {addon.qty > 1 && <span className="text-coffee-500">(×{addon.qty})</span>}
                                </span>
                                <span className="font-medium text-coffee-600">
                                  +₱{(addon.price * addon.qty).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex justify-between items-center mt-2">
                          <div className="flex items-center gap-2 bg-coffee-100 rounded-lg p-1">
                            <button
                              className="cursor-pointer p-1 hover:bg-white rounded transition"
                              onClick={() => updateQuantity(item.uniqueCartItemId, Math.max(1, item.quantity - 1))} // Changed
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3 h-3 text-coffee-700" />
                            </button>
                            <span className="text-sm font-semibold text-coffee-800 min-w-[20px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              className="cursor-pointer p-1 hover:bg-white rounded transition"
                              onClick={() => updateQuantity(item.uniqueCartItemId, item.quantity + 1)} // Changed
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3 h-3 text-coffee-700" />
                            </button>
                          </div>

                          <div className="text-right">
                            <div className="font-bold text-coffee-700 text-sm">
                              ₱{(item.price * item.quantity).toFixed(2)}
                            </div>
                            {item.basePrice && item.basePrice !== item.price && (
                              <div className="text-xs text-coffee-400 line-through">
                                ₱{(item.basePrice * item.quantity).toFixed(2)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* TOTAL SECTION */}
        <div className="absolute bottom-0 w-full bg-white border-t border-coffee-200 shadow-lg">
          <div className="p-5 space-y-3">
            <div className="flex justify-between text-sm text-coffee-600">
              <span>Subtotal</span>
              <span className="font-medium">₱{totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-coffee-600">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                Delivery fee
              </span>
              <span className="font-medium">₱{deliveryFee.toFixed(2)}</span>
            </div>
            <div className="pt-3 border-t border-coffee-200 flex justify-between font-bold text-lg">
              <span className="text-coffee-800">Total</span>
              <span className="text-coffee-600">₱{grandTotal.toFixed(2)}</span>
            </div>
            <Link to="/checkout">
              <button
                className={`cursor-pointer w-full py-3 rounded-xl font-bold text-base transition shadow-lg ${
                  cart.length === 0
                    ? "bg-coffee-200 text-coffee-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-coffee-600 to-coffee-700 text-white hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                }`}
                disabled={cart.length === 0}
                onClick={() => setCartOpen(false)}
              >
                Proceed to Checkout
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* DELIVERY MODAL */}
      {showDeliveryModal && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${
            modalVisible ? "opacity-100" : "opacity-0"
          } bg-black/50 backdrop-blur-sm`}
          onClick={() => setShowDeliveryModal(false)}
        >
          <div
            className={`bg-white rounded-2xl p-8 shadow-2xl relative w-[600px] max-w-[90vw] transform transition-all duration-300 ${
              modalVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-coffee-400 hover:text-coffee-600 transition p-2 hover:bg-coffee-50 rounded-lg"
              onClick={() => setShowDeliveryModal(false)}
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-bold text-coffee-800 mb-6">Delivery Options</h2>

            <div className="flex gap-3 mb-6">
              <button className="flex-1 bg-coffee-600 text-white px-6 py-3 rounded-xl font-semibold shadow-md hover:bg-coffee-700 transition">
                <MapPin className="w-4 h-4 inline mr-2" />
                Delivery
              </button>
              <button className="flex-1 bg-coffee-100 text-coffee-700 px-6 py-3 rounded-xl font-semibold hover:bg-coffee-200 transition">
                Pick-up
              </button>
              <button className="flex-1 bg-coffee-100 text-coffee-700 px-6 py-3 rounded-xl font-semibold hover:bg-coffee-200 transition">
                Send to Many
              </button>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold text-coffee-800 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Choose delivery time
              </h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition hover:bg-coffee-50 border-coffee-500 bg-coffee-100">
                  <input
                    type="radio"
                    name="deliveryTime"
                    value="now"
                    checked={deliveryOption === "now"}
                    onChange={() => setDeliveryOption("now")}
                    className="accent-coffee-600 w-4 h-4"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-coffee-800">Deliver Now</div>
                    <div className="text-sm text-coffee-600">~30 mins</div>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-4 border-2 border-coffee-200 rounded-xl cursor-pointer transition hover:bg-coffee-50">
                  <input
                    type="radio"
                    name="deliveryTime"
                    value="later"
                    checked={deliveryOption === "later"}
                    onChange={() => setDeliveryOption("later")}
                    className="accent-coffee-600 w-4 h-4"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-coffee-800">Schedule for Later</div>
                    <div className="text-sm text-coffee-600">Choose date & time</div>
                  </div>
                </label>
              </div>
            </div>

            {deliveryOption === "later" && (
              <div className="mb-6 bg-coffee-50 p-4 rounded-xl">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-coffee-700 mb-2 flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Date
                    </label>
                    <input
                      type="date"
                      className="w-full border border-coffee-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                      defaultValue="2025-09-24"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-coffee-700 mb-2 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Time
                    </label>
                    <input
                      type="time"
                      className="w-full border border-coffee-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                      defaultValue="18:23"
                    />
                  </div>
                </div>
              </div>
            )}

            <button className="w-full bg-gradient-to-r from-coffee-600 to-coffee-700 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition">
              Confirm Delivery
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            max-height: 0;
          }
          to {
            opacity: 1;
            max-height: 200px;
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default CartSidebar;