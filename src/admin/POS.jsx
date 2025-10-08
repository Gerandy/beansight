import React, { useState } from "react";
import { Plus, Minus, Trash2 } from "lucide-react";

function POS() {
  const [menuItems] = useState([
    { id: 1, name: "Big Mac", price: 120, category: "Burger" },
    { id: 2, name: "McChicken", price: 110, category: "Burger" },
    { id: 3, name: "Large Fries", price: 65, category: "Sides" },
    { id: 4, name: "Coke (Medium)", price: 45, category: "Beverage" },
  ]);

  const [order, setOrder] = useState([]);

  const addToOrder = (item) => {
    const existing = order.find((o) => o.id === item.id);
    if (existing) {
      setOrder(
        order.map((o) =>
          o.id === item.id ? { ...o, quantity: o.quantity + 1 } : o
        )
      );
    } else {
      setOrder([...order, { ...item, quantity: 1 }]);
    }
  };

  const increaseQty = (id) => {
    setOrder(
      order.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQty = (id) => {
    setOrder(
      order
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (id) => {
    setOrder(order.filter((item) => item.id !== id));
  };

  const total = order.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleCheckout = () => {
    if (order.length === 0) return alert("No items in order!");
    alert(`Order placed successfully! Total: ₱${total}`);
    setOrder([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Point of Sale</h1>

      <div className="grid grid-cols-3 gap-6">
        {/* Menu Items */}
        <div className="col-span-2 bg-white p-5 rounded-2xl shadow">
          <h2 className="text-lg font-semibold mb-4">Menu</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => addToOrder(item)}
                className="border rounded-xl p-4 hover:bg-yellow-50 text-center transition"
              >
                <div className="text-lg font-bold">{item.name}</div>
                <div className="text-gray-600 text-sm">₱{item.price}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Current Order */}
        <div className="bg-white p-5 rounded-2xl shadow">
          <h2 className="text-lg font-semibold mb-4">Current Order</h2>
          {order.length === 0 ? (
            <p className="text-gray-500 text-sm">No items yet</p>
          ) : (
            <ul className="space-y-3">
              {order.map((item) => (
                <li
                  key={item.id}
                  className="flex justify-between items-center border-b pb-2"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      ₱{item.price} × {item.quantity}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => decreaseQty(item.id)}
                      className="p-1 rounded hover:bg-gray-100"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="text-sm font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => increaseQty(item.id)}
                      className="p-1 rounded hover:bg-gray-100"
                    >
                      <Plus size={16} />
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1 rounded hover:bg-red-100"
                    >
                      <Trash2 size={16} className="text-red-500" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-5 border-t pt-3">
            <div className="flex justify-between font-semibold text-gray-700 mb-3">
              <span>Total:</span>
              <span>₱{total}</span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-white font-medium py-2 rounded-lg transition"
            >
              Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default POS;
