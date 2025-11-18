// src/staff/components/OrderSummary.jsx
import React, { useMemo, useState } from "react";
import { db } from "../../firebase";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import {
  CreditCard,
  Smartphone,
  DollarSign,
  Printer,
  Trash2,
  CheckCircle,
  User,
  Percent,
} from "lucide-react";


export default function OrderSummary({ cartItems = [], onComplete = () => {}, onClear = () => {} }) {

  const [paymentType, setPaymentType] = useState("cash");
  const [cashGiven, setCashGiven] = useState("");
  const [discountType, setDiscountType] = useState("none"); 
  const [tip, setTip] = useState(0);
  const [customerName, setCustomerName] = useState("");

  
  const discountTypes = {
    none: { label: "No Discount", value: 0 },
    senior: { label: "Senior Citizen", value: 20 },
    pwd: { label: "PWD", value: 20 },
  };
  const normalizedCart = cartItems.map(item => ({
  ...item,
  quantity: item.quantity ?? item.qty ?? 1,
  }));

  // COMPUTATIONS
 const subtotal = useMemo(
  () => normalizedCart.reduce((s, it) => s + Number(it.price) * Number(it.quantity), 0),
  [normalizedCart]
);

  const discountAmount = (subtotal * discountTypes[discountType].value) / 100;
  const tipAmount = (subtotal * tip) / 100;
  const total = subtotal - discountAmount + tipAmount; 
  const change = Number(cashGiven || 0) - total;

  // ACTIONS
  const handleComplete = async () => {
  if (cartItems.length === 0) return alert("Cart is empty");
  if (paymentType === "cash" && Number(cashGiven || 0) < total)
    return alert("Cash given is less than total");

  const orderId = `POS-${Date.now().toString().slice(-6)}`;
  const username = {customerName,uid:"walk-in"};

  const orderData = {
    id: orderId,
    source: "POS", // 🔵 distinguish POS vs online checkout
    items: normalizedCart,
    user: username,
    subtotal,
    discountType,
    discountAmount,
    tip,
    total,
    paymentType,
    cashGiven: paymentType === "cash" ? Number(cashGiven) : null,
    // customerName: customerName || "Walk-in Customer",
    status: "Completed",
    createdAt: serverTimestamp(),
    completedAt: new Date().toISOString(),
  };

  try {
    // 🔥 Save to Firestore just like online checkout
    const ref = doc(collection(db, "orders"), orderId);
    await setDoc(ref, orderData);

    alert("Sale recorded successfully!");
    onComplete(orderData);
  } catch (err) {
    console.error(err);
    alert("Failed to save order.");
  }
};


  const handlePrint = () => window.print();
  const handleClear = () => onClear?.();


  const renderDiscountSection = () => (
    <div className="flex justify-between items-center">
      <span className="text-[var(--color-coffee-700)] flex items-center gap-1">
        <Percent size={14} /> Discount
      </span>
      <div className="flex items-center gap-2">
        <select
          value={discountType}
          onChange={(e) => setDiscountType(e.target.value)}
          className="border border-[var(--color-coffee-200)] rounded-md px-2 py-1 text-sm"
        >
          {Object.entries(discountTypes).map(([key, { label }]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
        <span className="text-[var(--color-coffee-600)]">
          -₱{discountAmount.toFixed(2)}
        </span>
      </div>
    </div>
  );

  return (
    <div className="border-t pt-5 mt-4 text-[var(--color-coffee-900)]">
      {/* Customer Info */}
      <div className="mb-4">
        <label className="text-sm font-medium flex items-center gap-2 text-[var(--color-coffee-700)]">
          <User size={16} /> Customer Name
        </label>
        <input
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Enter customer name"
          className="w-full border border-[var(--color-coffee-200)] rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-[var(--color-coffee-400)] focus:outline-none mt-1"
        />
      </div>

      {/* Breakdown */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-[var(--color-coffee-700)]">Subtotal</span>
          <span className="font-medium">₱{subtotal.toFixed(2)}</span>
        </div>

        {renderDiscountSection()}

        <div className="flex justify-between items-center border-t border-[var(--color-coffee-200)] pt-3 mt-3">
          <span className="text-lg font-semibold text-[var(--color-coffee-800)]">
            Total
          </span>
          <span className="text-lg font-semibold text-[var(--color-coffee-800)]">
            ₱{total.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Payment Options */}
      <div className="mt-4">
        <label className="text-sm text-[var(--color-coffee-700)] font-medium mb-2 block">
          Payment Method
        </label>
        <div className="flex gap-2">
          {[
            { key: "cash", label: "Cash", icon: <DollarSign size={14} /> },
            { key: "card", label: "Card", icon: <CreditCard size={14} /> },
            { key: "gcash", label: "GCash", icon: <Smartphone size={14} /> },
          ].map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setPaymentType(key)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm border transition-all duration-150 ${
                paymentType === key
                  ? "bg-[var(--color-coffee-600)] text-white"
                  : "bg-white border-[var(--color-coffee-300)] hover:bg-[var(--color-coffee-100)]"
              }`}
            >
              {icon} {label}
            </button>
          ))}
        </div>

        {paymentType === "cash" && (
          <div className="mt-3">
            <input
              value={cashGiven}
              onChange={(e) =>
                setCashGiven(e.target.value.replace(/[^0-9.]/g, ""))
              }
              placeholder="Cash given"
              className="w-full border border-[var(--color-coffee-200)] rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-[var(--color-coffee-400)] focus:outline-none"
            />
            <div className="mt-2 text-sm text-[var(--color-coffee-700)]">
              Change:{" "}
              <span
                className={`font-semibold ${
                  change < 0
                    ? "text-red-600"
                    : "text-[var(--color-coffee-700)]"
                }`}
              >
                ₱{change < 0 ? "0.00" : change.toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="mt-5 space-y-2">
        <button
          onClick={handleComplete}
          className="w-full flex items-center justify-center gap-2 bg-[var(--color-coffee-600)] text-white py-2 rounded-md hover:bg-[var(--color-coffee-700)] transition-all duration-150 shadow-sm"
        >
          <CheckCircle size={16} /> Complete Sale
        </button>

        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 border border-[var(--color-coffee-400)] text-[var(--color-coffee-700)] py-2 rounded-md hover:bg-[var(--color-coffee-100)] transition-all duration-150"
          >
            <Printer size={16} /> Print
          </button>
          <button
            onClick={handleClear}
            className="flex-1 flex items-center justify-center gap-2 border border-[var(--color-coffee-400)] text-[var(--color-coffee-700)] py-2 rounded-md hover:bg-[var(--color-coffee-100)] transition-all duration-150"
          >
            <Trash2 size={16} /> Clear
          </button>
        </div>
      </div>

      {/* Order ID Preview */}
      <div className="text-xs text-[var(--color-coffee-500)] mt-4 text-center">
        Order ID: POS-{Date.now().toString().slice(-6)}
      </div>
      <div className="text-xs text-[var(--color-coffee-400)] text-center">
        {new Date().toLocaleString()}
      </div>
    </div>
  );
}