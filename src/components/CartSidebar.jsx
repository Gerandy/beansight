import React, { useState, useEffect } from "react";

function CartSidebar({ cartOpen }) {
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [deliveryOption, setDeliveryOption] = useState("now");


  useEffect(() => {
    if (showDeliveryModal) {
      setTimeout(() => setModalVisible(true), 10);
    } else {
      setModalVisible(false);
    }
  }, [showDeliveryModal]);

  return (
    <div className="relative">
      <div
        className={`fixed right-0 w-95 h-[calc(100vh-4rem)] bg-white shadow-lg border-l border-gray-200 z-50 transform transition-transform duration-300 ${
          cartOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ top: '4rem' }}
      >
        <div className="p-3 m-3 flex items-center justify-between border-b border-gray-200 border rounded-b-none">
          <div>
            <div className="text-xs text-black">Cavite</div>
            <div className="font-bold text-sm text-black">Deliver (Friday, 10:41 PM)</div>
          </div>
          <button
            className="text-yellow-950 font-bold text-sm hover:underline"
            onClick={() => setShowDeliveryModal(true)}
          >
            Change
          </button>
        </div>

        <div className="flex flex-col items-center">
          <div className="p-4 flex justify-between items-center border-b">
            <h2 className="text-center font-bold text-lg text-black">My Bag</h2>
          </div>
          <div>
            <p className="text-center text-black">Your bag is empty. Add something from the menu.</p>
          </div>
        </div>
        <div className="absolute bottom-0 w-full p-4 border-t">
          <div className="flex justify-between">
            <span className="text-black">Subtotal</span>
            <span className="text-black">₱0.00</span>
          </div>
          <div className="flex justify-between">
            <span className="text-black">Delivery fee</span>
            <span className="text-black">₱0.00</span>
          </div>
          <div className="flex justify-between font-bold">
            <span className="text-black">Total</span>
            <span className="text-black">₱0.00</span>
          </div>
          <button className="mt-3 w-full bg-yellow-950 text-white py-2 rounded-lg font-bold disabled:opacity-50" disabled>
            Proceed to Checkout
          </button>
        </div>
      </div>

      {/* Delivery Modal */}
      {showDeliveryModal && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${modalVisible ? "opacity-100" : "opacity-0"}`}>
          <div
            className={`bg-white rounded-xl p-8 shadow-xl relative w-[600px] transform transition-all duration-300
              ${modalVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
          >
            {/* Close button */}
            <button
              className="absolute top-4 right-4 text-black text-xl"
              onClick={() => setShowDeliveryModal(false)}
            >
              &times;
            </button>
            {/* Modal content */}
            <div>
              <div className="flex max-w-full mb-6">
                <button className="bg-yellow-950 px-6 py-2 rounded-full font-bold mr-2 w-50">Delivery</button>
                <button className="bg-gray-200 text-black px-6 py-2 rounded-full font-bold mr-2 w-50">Pick-up</button>
                <button className="bg-gray-200 text-black px-6 py-2 rounded-full font-bold w-50">Send to Many</button>
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
              <button className="bg-yellow-950 w-full py-3 rounded-full font-bold mt-4">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartSidebar;