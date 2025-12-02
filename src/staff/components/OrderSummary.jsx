// src/staff/components/OrderSummary.jsx
import React, { useMemo, useState } from "react";
import { db } from "../../firebase";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import ThermalReceipt from "../../components/ThermalReceipt";
import {
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
  const [showReceipt, setShowReceipt] = useState(false);
  const [savedOrder, setSavedOrder] = useState(null);

  const discountTypes = {
    none: { label: "No Discount", value: 0 },
    senior: { label: "Senior Citizen", value: 20 },
    pwd: { label: "PWD", value: 20 },
  };

  const normalizedCart = cartItems.map((item) => ({
    ...item,
    quantity: item.quantity ?? item.qty ?? 1,
  }));

  const subtotal = useMemo(
    () => normalizedCart.reduce((s, it) => s + Number(it.price) * Number(it.quantity), 0),
    [normalizedCart]
  );

  const discountAmount = (subtotal * discountTypes[discountType].value) / 100;
  const tipAmount = (subtotal * tip) / 100;
  const total = subtotal - discountAmount + tipAmount;
  const change = Number(cashGiven || 0) - total;

  const handleComplete = async () => {
    if (cartItems.length === 0) return alert("Cart is empty");
    if (paymentType === "cash" && Number(cashGiven || 0) < total)
      return alert("Cash given is less than total");

    const orderId = `POS-${Date.now().toString().slice(-6)}`;
    const username = { customerName, uid: "walk-in" };

    const orderData = {
      id: orderId,
      source: "POS",
      items: normalizedCart,
      user: username,
      subtotal,
      discountType,
      discountAmount,
      tip,
      total,
      paymentType,
      cashGiven: paymentType === "cash" ? Number(cashGiven) : null,
      status: "Completed",
      createdAt: serverTimestamp(),
      completedAt: new Date().toISOString(),
    };

    try {
      const ref = doc(collection(db, "orders"), orderId);
      await setDoc(ref, orderData);

      setSavedOrder(orderData);
      setShowReceipt(true);

      onComplete(orderData);
      onClear();
    } catch (err) {
      console.error(err);
      alert("Failed to save order.");
    }
  };

  const handlePrint = () => {
    if (savedOrder) setShowReceipt(true);
  };
  const handleClear = () => onClear?.();

  return (
    <div className="border-t border-[var(--color-coffee-200)] pt-3 sm:pt-4 mt-3 sm:mt-4 text-[var(--color-coffee-900)]">
      {/* Customer Info */}
      <div className="mb-3 sm:mb-4">
        <label className="text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2 text-[var(--color-coffee-700)] mb-1.5">
          <User size={14} className="sm:w-4 sm:h-4" /> Customer Name
        </label>
        <input
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Enter customer name"
          className="w-full border border-[var(--color-coffee-200)] rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-coffee-400)]"
        />
      </div>

      {/* Breakdown */}
      <div className="space-y-2 text-xs sm:text-sm mb-3 sm:mb-4">
        <div className="flex justify-between">
          <span className="text-[var(--color-coffee-700)]">Subtotal</span>
          <span className="font-medium text-[var(--color-coffee-800)]">₱{subtotal.toFixed(2)}</span>
        </div>

        {/* Discount */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <span className="text-[var(--color-coffee-700)] flex items-center gap-1">
            <Percent size={12} className="sm:w-3.5 sm:h-3.5" /> Discount
          </span>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value)}
              className="cursor-pointer flex-1 sm:flex-initial border border-[var(--color-coffee-200)] rounded-md px-2 py-1 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-coffee-400)]"
            >
              {Object.entries(discountTypes).map(([key, { label }]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
            <span className="text-[var(--color-coffee-600)] text-xs sm:text-sm whitespace-nowrap">
              -₱{discountAmount.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center border-t border-[var(--color-coffee-200)] pt-2 sm:pt-3 mt-2 sm:mt-3">
          <span className="text-base sm:text-lg font-semibold text-[var(--color-coffee-800)]">
            Total
          </span>
          <span className="text-base sm:text-lg font-semibold text-[var(--color-coffee-800)]">
            ₱{total.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Payment Options */}
      <div className="mb-3 sm:mb-4">
        <label className="text-xs sm:text-sm text-[var(--color-coffee-700)] font-medium mb-2 block">
          Payment Method
        </label>
        <div className="flex gap-2">
          {[
            { key: "cash", label: "Cash", icon: <DollarSign size={14} /> },
          ].map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setPaymentType(key)}
              className={`cursor-pointer flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-2 rounded-md text-xs sm:text-sm border transition-all duration-150 ${
                paymentType === key
                  ? "bg-[var(--color-coffee-600)] text-white border-[var(--color-coffee-600)]"
                  : "bg-white border-[var(--color-coffee-300)] text-[var(--color-coffee-700)] hover:bg-[var(--color-coffee-100)]"
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
              className="w-full border border-[var(--color-coffee-200)] rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-coffee-400)]"
            />
            <div className="mt-2 text-xs sm:text-sm text-[var(--color-coffee-700)]">
              Change:{" "}
              <span
                className={`font-semibold ${
                  change < 0 ? "text-red-600" : "text-[var(--color-coffee-700)]"
                }`}
              >
                ₱{change < 0 ? "0.00" : change.toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="space-y-2">
        <button
          onClick={handleComplete}
          className="cursor-pointer w-full flex items-center justify-center gap-2 bg-[var(--color-coffee-600)] text-white py-2 sm:py-2.5 rounded-md hover:bg-[var(--color-coffee-700)] transition-all duration-150 shadow-sm text-xs sm:text-sm font-medium active:scale-98"
        >
          <CheckCircle size={14} className="sm:w-4 sm:h-4" /> Complete Sale
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handlePrint}
            className="cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 border border-[var(--color-coffee-400)] text-[var(--color-coffee-700)] py-2 sm:py-2.5 rounded-md hover:bg-[var(--color-coffee-100)] transition-all duration-150 text-xs sm:text-sm font-medium active:scale-98"
          >
            <Printer size={14} className="sm:w-4 sm:h-4" /> 
            <span className="hidden sm:inline">Print</span>
          </button>
          <button
            onClick={handleClear}
            className="cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 border border-[var(--color-coffee-400)] text-[var(--color-coffee-700)] py-2 sm:py-2.5 rounded-md hover:bg-[var(--color-coffee-100)] transition-all duration-150 text-xs sm:text-sm font-medium active:scale-98"
          >
            <Trash2 size={14} className="sm:w-4 sm:h-4" /> 
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>

      {/* THERMAL RECEIPT MODAL */}
      {showReceipt && savedOrder && (
        <ThermalReceipt
          items={savedOrder.items}
          total={savedOrder.total}
          subtotal={savedOrder.subtotal}
          discount={savedOrder.discountAmount}
          discountType={savedOrder.discountType}
          tip={savedOrder.tip}
          date={savedOrder.completedAt}
          orderId={savedOrder.id}
          customer={savedOrder.user.customerName}
          onClose={() => setShowReceipt(false)}
        />
      )}
    </div>
  );
}
