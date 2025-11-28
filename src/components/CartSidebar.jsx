import React, { useState, useEffect } from "react";
import { useCart } from "./CartContext";
import { Link, useNavigate } from "react-router-dom";

function CartSidebar({ cartOpen, setCartOpen }) {
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [deliveryOption, setDeliveryOption] = useState("now");

  const { cart = [], removeFromCart, updateQuantity, totalPrice  = 0 } = useCart() || {};
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

  return (
    <div className="relative">
      {/* SIDEBAR */}
      <div
        className={`fixed top-16 right-0 w-full md:w-96 h-[calc(100vh-4rem)] bg-lime-50 shadow-lg border-l border-gray-200 z-40 transform transition-transform duration-300 ${
          cartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* HEADER */}
        <div className="p-3 m-3 flex items-center justify-between border-b border-gray-400 rounded-md">
          <div>
            <div className="text-xs text-black">Cavite</div>
            <div className="font-bold text-sm text-black">
              Deliver ({new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})
            </div>
          </div>
          <button
            className="text-yellow-950 font-bold text-sm hover:underline hover:cursor-pointer"
            onClick={() => navigate("/menu")}
          >
            Continue Ordering
          </button>
        </div>

        {/* CART ITEMS */}
        <div className="flex flex-col h-[calc(100%-180px)] overflow-y-auto px-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
          <h2 className="text-center font-bold text-lg text-black border-b border-gray-400 pb-2 mb-3">
            My Bag
          </h2>

          {cart.length === 0 ? (
            <p className="text-center text-gray-700 mt-4">
              Your bag is empty. Add something from the menu.
            </p>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between mb-4 border-b border-gray-400 pb-3"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={item.img}
                    alt={item.name}
                    className="w-16 h-16 rounded-md object-cover"
                  />
                  <div>
                    <p className="font-semibold text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-600">
                      ₱{item.price ? item.price.toFixed(2) : "0.00"}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        className="border rounded px-2 text-gray-800 cursor-pointer"
                        onClick={() =>
                          updateQuantity(item.id, Math.max(1, item.quantity - 1))
                        }
                      >
                        −
                      </button>
                      <span className="text-gray-800">{item.quantity}</span>
                      <button
                        className="border rounded px-2 text-gray-800 cursor-pointer"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  className="text-red-500 font-bold text-sm hover:underline cursor-pointer"
                  onClick={() => removeFromCart(item.id)}
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>

        {/* TOTAL SECTION */}
        <div className="absolute bottom-0 w-full p-4 border-t border-black bg-lime-50">
          <div className="flex justify-between">
            <span className="text-black">Subtotal</span>
            <span className="text-black">₱{totalPrice.toFixed(2)}</span>

          </div>
          <div className="flex justify-between">
            <span className="text-black">Delivery fee</span>
            <span className="text-black">₱{deliveryFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold">
            <span className="text-black">Total</span>
            <span className="text-black">₱{grandTotal.toFixed(2)}</span>
          </div>
          <Link to="/checkout">
              <button
                className={`mt-3 w-full py-2 rounded-lg font-bold transition cursor-pointer ${
                  cart.length === 0
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : "bg-yellow-950 text-white hover:bg-yellow-800"
                }`}
                disabled={cart.length === 0}
                onClick={() => setCartOpen(false)}
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
          } bg-black/40`}
        >
          <div
            className={`bg-white rounded-xl p-8 shadow-xl relative w-[600px] transform transition-all duration-300 ${
              modalVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
            }`}
          >
            {/* Close button */}
            <button
              className="absolute top-4 right-4 text-black text-xl"
              onClick={() => setShowDeliveryModal(false)}
            >
              &times;
            </button>

            {/* MODAL CONTENT */}
            <div>
              <div className="flex max-w-full mb-6">
                <button className="bg-yellow-950 px-6 py-2 rounded-full font-bold mr-2 text-white">
                  Delivery
                </button>
                <button className="bg-gray-200 text-black px-6 py-2 rounded-full font-bold mr-2">
                  Pick-up
                </button>
                <button className="bg-gray-200 text-black px-6 py-2 rounded-full font-bold">
                  Send to Many
                </button>
              </div>

              <div className="text-black mb-3 font-bold">Choose delivery time</div>
              <div className="mb-4 flex flex-col">
                <label className="text-black mr-4">
                  <input
                    type="radio"
                    name="deliveryTime"
                    value="now"
                    checked={deliveryOption === "now"}
                    onChange={() => setDeliveryOption("now")}
                  />{" "}
                  Now
                </label>
                <label className="text-black">
                  <input
                    type="radio"
                    name="deliveryTime"
                    value="later"
                    checked={deliveryOption === "later"}
                    onChange={() => setDeliveryOption("later")}
                  />{" "}
                  Schedule for later
                </label>
              </div>

              {deliveryOption === "later" && (
                <div className="text-black mb-4 flex gap-4">
                  <div>
                    <div className="text-xs text-black mb-1">Date</div>
                    <input
                      type="text"
                      className="border rounded px-2 py-1"
                      value="Wed, Sep 24, 2025"
                      readOnly
                    />
                  </div>
                  <div>
                    <div className="text-xs mb-1">Time</div>
                    <input
                      type="text"
                      className="text-black border rounded px-2 py-1"
                      value="6:23 pm"
                      readOnly
                    />
                  </div>
                </div>
              )}

              <button className="bg-yellow-950 w-full py-3 rounded-full font-bold text-white mt-4 hover:bg-yellow-800 transition">
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