// src/staff/components/Cart.jsx
import React from "react";

export default function Cart({ items = [], onRemove = () => {}, onChangeQty = () => {} }) {
  return (
    <div className="flex-1 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-3">Current Order</h2>

      {items.length === 0 ? (
        <div className="text-center text-gray-400 py-12">No items in cart</div>
      ) : (
        <div className="space-y-3">
          {items.map((it) => (
            <div key={it.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
              <div className="flex-1">
                <div className="font-medium text-sm">{it.name}</div>
                <div className="text-xs text-gray-500">₱{Number(it.price).toFixed(2)}</div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onChangeQty(it.id, -1)}
                  className="px-2 py-1 bg-gray-200 rounded-sm"
                >
                  −
                </button>
                <div className="w-6 text-center">{it.qty}</div>
                <button
                  onClick={() => onChangeQty(it.id, 1)}
                  className="px-2 py-1 bg-gray-200 rounded-sm"
                >
                  +
                </button>
                <button
                  onClick={() => onRemove(it.id)}
                  className="ml-2 text-red-500 text-sm"
                  title="Remove"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
