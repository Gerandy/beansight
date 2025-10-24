import React, { useState } from "react";
import ProductGrid from "./components/ProductGrid";
import Cart from "./components/Cart";
import OrderSummary from "./components/OrderSummary";
import CategoryFilter from "./components/CategoryFilter";

export default function POSPage() {
  const [cartItems, setCartItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const handleAddToCart = (product) => {
    const exists = cartItems.find((i) => i.id === product.id);
    if (exists) {
      setCartItems(
        cartItems.map((i) =>
          i.id === product.id ? { ...i, qty: i.qty + 1 } : i
        )
      );
    } else {
      setCartItems([...cartItems, { ...product, qty: 1 }]);
    }
  };

  const handleQtyChange = (id, delta) => {
    setCartItems(
      cartItems.map((i) =>
        i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i
      )
    );
  };

  const handleRemove = (id) => setCartItems(cartItems.filter((i) => i.id !== id));

  return (
    <div className="flex flex-col md:flex-row h-full min-h-[calc(100vh-120px)] bg-coffee-50 text-coffee-900">
      {/* Left Section: Products */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto">
        <div className="mb-6">
          <CategoryFilter onSelect={setSelectedCategory} />
        </div>
        <ProductGrid category={selectedCategory} onAdd={handleAddToCart} />
      </div>

      {/* Right Section: Cart & Summary */}
      <div className="w-full md:w-1/3 bg-white shadow-lg border-t md:border-t-0 md:border-l border-coffee-200 p-4 md:p-6 flex flex-col rounded-t-2xl md:rounded-none">
        <div className="flex-1 overflow-y-auto mb-6">
          <Cart
            items={cartItems}
            onRemove={handleRemove}
            onChangeQty={handleQtyChange}
          />
        </div>
        <OrderSummary cartItems={cartItems} />
      </div>
    </div>
  );
}

