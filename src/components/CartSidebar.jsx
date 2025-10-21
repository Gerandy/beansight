import React, { useState, useEffect } from "react";
import { useCart } from "./CartContext";
import { Link } from "react-router-dom";
import { X, Clock, Truck } from "lucide-react";

function CartSidebar({ cartOpen, onClose }) {
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [deliveryOption, setDeliveryOption] = useState("now");

  const { cart = [], removeFromCart, updateQuantity, total = 0 } = useCart() || {};
  const deliveryFee = cart.length > 0 ? 49 : 0;
  const grandTotal = total + deliveryFee;

  useEffect(() => {
    if (showDeliveryModal) {
      const timer = setTimeout(() => setModalVisible(true), 10);
      return () => clearTimeout(timer);
    } else {
      setModalVisible(false);
    }
  }, [showDeliveryModal]);

  return (
    <div className="relative">
      {/* SIDEBAR */}
      <div
        className={`fixed right-0 w-96 h-[calc(100vh-4rem)] bg-coffee-50 shadow-[var(--shadow-soft-xl)] border-l border-coffee-200 z-50 transform transition-transform duration-300 ${
          cartOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ top: "4rem" }}
      >
        {/* HEADER */}
        <div className="p-4 m-3 flex items-center justify-between border-b border-coffee-200 rounded-md">
          <div>
            <div className="text-xs text-coffee-600">Cavite</div>
            <div className="font-semibold text-sm text-coffee-800 flex items-center gap-1">
              <Truck size={14} />
              Deliver ({new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})
            </div>
          </div>
          <button
            className="text-coffee-700 font-semibold text-sm hover:text-coffee-800 transition"
            onClick={() => setShowDeliveryModal(true)}
          >
            Change
          </button>
        </div>

        {/* CART ITEMS */}
        <div className="flex flex-col h-[70%] overflow-y-auto px-4 pb-4">
          <h2 className="text-center font-bold text-lg text-coffee-900 border-b border-coffee-200 pb-2 mb-4">
            My Bag
          </h2>

          {cart.length === 0 ? (
            <p className="text-center text-coffee-700 mt-8 italic">
              Your bag is empty — add something delicious ☕
            </p>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between mb-4 border-b border-coffee-100 pb-3"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 rounded-lg object-cover shadow-sm"
                  />
                  <div>
                    <p className="font-semibold text-coffee-900">{item.name}</p>
                    <p className="text-sm text-coffee-600">
                      ₱{item.price ? item.price.toFixed(2) : "0.00"}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        className="border border-coffee-300 rounded px-2 text-coffee-700 hover:bg-coffee-100"
                        onClick={() =>
                          updateQuantity(item.id, Math.max(1, item.quantity - 1))
                        }
                      >
                        −
                      </button>
                      <span className="text-coffee-900 font-medium">{item.quantity}</span>
                      <button
                        className="border border-coffee-300 rounded px-2 text-coffee-700 hover:bg-coffee-100"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  className="text-red-500 font-semibold text-xs hover:underline"
                  onClick={() => removeFromCart(item.id)}
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>

        {/* TOTAL SECTION */}
        <div className="absolute bottom-0 w-full p-4 border-t border-coffee-200 bg-coffee-50/90 backdrop-blur-sm">
          <div className="flex justify-between text-coffee-800 mb-1">
            <span>Subtotal</span>
            <span>₱{total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-coffee-800 mb-1">
            <span>Delivery Fee</span>
            <span>₱{deliveryFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-coffee-900 mt-2">
            <span>Total</span>
            <span>₱{grandTotal.toFixed(2)}</span>
          </div>
          <Link to="/checkout">
            <button
              className={`mt-4 w-full py-3 rounded-xl font-semibold text-lg transition ${
                cart.length === 0
                  ? "bg-coffee-200 text-coffee-500 cursor-not-allowed"
                  : "bg-coffee-700 text-white hover:bg-coffee-800 shadow-[var(--shadow-soft-lg)]"
              }`}
              disabled={cart.length === 0}
            >
              Proceed to Checkout
            </button>
          </Link>
        </div>
      </div>

      {/* DELIVERY MODAL */}
      {showDeliveryModal && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${
            modalVisible ? "opacity-100" : "opacity-0"
          } bg-black/40 backdrop-blur-sm`}
        >
          <div
            className={`bg-white rounded-2xl p-8 shadow-[var(--shadow-soft-xl)] relative w-[600px] transform transition-all duration-300 ${
              modalVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
            }`}
          >
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 text-coffee-700 hover:text-coffee-900"
              onClick={() => setShowDeliveryModal(false)}
            >
              <X size={22} />
            </button>

            <div>
              <div className="flex max-w-full mb-6">
                <button className="bg-coffee-700 px-6 py-2 rounded-full font-semibold mr-2 text-white shadow-sm">
                  Delivery
                </button>
                <button className="bg-coffee-100 text-coffee-800 px-6 py-2 rounded-full font-semibold mr-2 hover:bg-coffee-200 transition">
                  Pick-up
                </button>
                <button className="bg-coffee-100 text-coffee-800 px-6 py-2 rounded-full font-semibold hover:bg-coffee-200 transition">
                  Send to Many
                </button>
              </div>

              <div className="text-coffee-900 mb-3 font-semibold flex items-center gap-2">
                <Clock size={18} />
                Choose Delivery Time
              </div>

              <div className="mb-4 flex flex-col text-coffee-800 gap-2">
                <label>
                  <input
                    type="radio"
                    name="deliveryTime"
                    value="now"
                    checked={deliveryOption === "now"}
                    onChange={() => setDeliveryOption("now")}
                    className="mr-2 accent-coffee-700"
                  />
                  Now
                </label>
                <label>
                  <input
                    type="radio"
                    name="deliveryTime"
                    value="later"
                    checked={deliveryOption === "later"}
                    onChange={() => setDeliveryOption("later")}
                    className="mr-2 accent-coffee-700"
                  />
                  Schedule for later
                </label>
              </div>

              {deliveryOption === "later" && (
                <div className="text-coffee-800 mb-6 flex gap-4">
                  <div>
                    <div className="text-xs text-coffee-600 mb-1">Date</div>
                    <input
                      type="text"
                      className="border border-coffee-200 rounded-lg px-3 py-2 text-sm bg-coffee-50"
                      value="Wed, Sep 24, 2025"
                      readOnly
                    />
                  </div>
                  <div>
                    <div className="text-xs text-coffee-600 mb-1">Time</div>
                    <input
                      type="text"
                      className="border border-coffee-200 rounded-lg px-3 py-2 text-sm bg-coffee-50"
                      value="6:23 pm"
                      readOnly
                    />
                  </div>
                </div>
              )}

              <button className="bg-coffee-700 w-full py-3 rounded-xl font-semibold text-white hover:bg-coffee-800 transition shadow-[var(--shadow-soft-lg)]">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartSidebar;
