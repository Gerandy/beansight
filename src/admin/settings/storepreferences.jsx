import React, { useState } from "react";

const help = {
  onlineOrdering: "Allow customers to place orders online through your website or app.",
  cutoffTimes: "Set the latest time you accept orders for each day.",
  minOrder: "The minimum amount required for an order to be accepted.",
  maxOrder: "The maximum amount allowed for a single order.",
  autoAccept: "Automatically accept incoming orders without manual approval.",
  prepTime: "Estimated time needed to prepare each order.",
  orderType: "Choose which order types your store supports.",
  orderNotification: "How you want to be notified about new orders.",
  orderScheduling: "Allow customers to schedule orders for a future date/time.",
  paymentMethods: "Select payment methods you accept. You can add a custom method. These apply to all transactions in your system, not just POS.",
  autoPrint: "Automatically print a receipt when an order is accepted.",
  discountRules: "Set rules for automatic discounts (e.g. 10% off for orders over ₱1000). These rules apply to all orders, not just POS.",
  taxOn: "Enable or disable tax/VAT calculation for all sales.",
  taxRate: "Set the percentage rate for tax/VAT applied to all transactions.",
  receiptHeader: "Text or info shown at the top of printed receipts.",
  receiptFooter: "Text or info shown at the bottom of printed receipts.",
  lowStock: "Set the quantity at which an item is considered low in stock.",
  autoDisableOOS: "Automatically hide items that are out of stock from customers.",
  lowStockAlert: "Choose how you want to be notified when stock is low.",
  inventorySync: "Sync your inventory with external systems (e.g. POS, ERP).",
  restockReminder: "Set reminders for items that need to be restocked.",
  bulkThreshold: "Update the low-stock threshold for multiple items at once."
};

// Modal Tooltip Component
function ModalTooltip({ open, text, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm">
      <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-6 max-w-sm w-full relative">
        <button
          className="absolute top-2 right-3 text-coffee-700 text-xl font-bold"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <div className="text-coffee-900 text-base">{text}</div>
      </div>
    </div>
  );
}

export default function StorePreferences() {
  // Ordering Preferences
  const [onlineOrdering, setOnlineOrdering] = useState(true);
  const [cutoffTimes, setCutoffTimes] = useState({
    mon: "21:00",
    tue: "21:00",
    wed: "21:00",
    thu: "21:00",
    fri: "22:00",
    sat: "22:00",
    sun: "20:00",
  });
  const [minOrder, setMinOrder] = useState(0);
  const [maxOrder, setMaxOrder] = useState(0);
  const [autoAccept, setAutoAccept] = useState(false);
  const [prepTime, setPrepTime] = useState(15);
  const [orderType, setOrderType] = useState({
    pickup: true,
    delivery: true,
  });
  const [orderNotification, setOrderNotification] = useState({
    email: true,
    sms: false,
    app: true,
  });
  const [orderScheduling, setOrderScheduling] = useState(false);

  // System-wide Transaction Preferences
  const [paymentMethods, setPaymentMethods] = useState({
    cash: true,
    card: true,
    ewallet: false,
    custom: "",
  });
  const [autoPrint, setAutoPrint] = useState(false);
  const [discountRules, setDiscountRules] = useState([{ rule: "" }]);
  const [taxOn, setTaxOn] = useState(true);
  const [taxRate, setTaxRate] = useState(12);
  const [receiptHeader, setReceiptHeader] = useState("");
  const [receiptFooter, setReceiptFooter] = useState("");

  // Inventory Preferences
  const [lowStock, setLowStock] = useState(5);
  const [autoDisableOOS, setAutoDisableOOS] = useState(true);
  const [lowStockAlert, setLowStockAlert] = useState({
    email: true,
    sms: false,
  });
  const [inventorySync, setInventorySync] = useState(false);
  const [restockReminder, setRestockReminder] = useState("");
  const [bulkThreshold, setBulkThreshold] = useState("");

  // Tooltip modal state
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [tooltipText, setTooltipText] = useState("");

  // Shared input style
  const inputClass =
    "w-full p-3 rounded-xl border border-coffee-200 bg-coffee-50 shadow-soft-lg focus:outline-none focus:ring-2 focus:ring-coffee-400 transition placeholder:text-coffee-400 text-coffee-900 font-medium";

  const sectionClass =
    "bg-white rounded-2xl shadow-soft-xl p-8 border border-coffee-100 flex flex-col mb-8";

  const labelClass = "block font-medium mb-2 text-coffee-700";

  // Discount rules handler
  const handleDiscountRuleChange = (idx, value) => {
    const updated = [...discountRules];
    updated[idx].rule = value;
    setDiscountRules(updated);
  };

  const addDiscountRule = () => setDiscountRules([...discountRules, { rule: "" }]);
  const removeDiscountRule = idx => setDiscountRules(discountRules.filter((_, i) => i !== idx));

  // Save/Reset/Preview handlers
  const handleSave = () => {
    alert("Preferences saved!");
  };
  const handleReset = () => {
    window.location.reload();
  };
  const handlePreview = () => {
    alert("Preview not implemented.");
  };

  // Tooltip trigger
  const showTooltip = text => {
    setTooltipText(text);
    setTooltipOpen(true);
  };

  return (
    <div className="w-full max-w-6xl mx-auto pt-8">
      <ModalTooltip open={tooltipOpen} text={tooltipText} onClose={() => setTooltipOpen(false)} />
      <h2 className="text-3xl font-bold mb-8 flex items-center gap-3 text-coffee-900">
        <span role="img" aria-label="settings">⚙️</span> Store Preferences
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Ordering Preferences */}
        <div className={sectionClass}>
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-coffee-800">
            <span role="img" aria-label="order">🛒</span> Ordering Preferences
          </h3>
          <div className="flex flex-col gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={onlineOrdering}
                onChange={e => setOnlineOrdering(e.target.checked)}
                className="accent-coffee-700 w-5 h-5"
                id="onlineOrdering"
              />
              <label htmlFor="onlineOrdering" className="ml-3 text-coffee-900 font-medium">
                Enable online ordering
                <button
                  type="button"
                  className="ml-2 text-xs text-coffee-400"
                  onClick={() => showTooltip(help.onlineOrdering)}
                  aria-label="Help"
                >ⓘ</button>
              </label>
            </div>
            <div>
              <label className={labelClass}>
                Order cut-off time (per day)
                <button
                  type="button"
                  className="ml-2 text-xs text-coffee-400"
                  onClick={() => showTooltip(help.cutoffTimes)}
                  aria-label="Help"
                >ⓘ</button>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(cutoffTimes).map(([day, value]) => (
                  <div key={day} className="flex items-center gap-2">
                    <span className="capitalize w-12">{day}</span>
                    <input
                      type="time"
                      value={value}
                      onChange={e => setCutoffTimes({ ...cutoffTimes, [day]: e.target.value })}
                      className={inputClass + " max-w-xs"}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className={labelClass} htmlFor="minOrder">
                Minimum order amount
                <button
                  type="button"
                  className="ml-2 text-xs text-coffee-400"
                  onClick={() => showTooltip(help.minOrder)}
                  aria-label="Help"
                >ⓘ</button>
              </label>
              <input
                type="number"
                value={minOrder}
                min={0}
                onChange={e => setMinOrder(e.target.value)}
                className={inputClass + " max-w-xs"}
                id="minOrder"
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="maxOrder">
                Maximum order amount
                <button
                  type="button"
                  className="ml-2 text-xs text-coffee-400"
                  onClick={() => showTooltip(help.maxOrder)}
                  aria-label="Help"
                >ⓘ</button>
              </label>
              <input
                type="number"
                value={maxOrder}
                min={0}
                onChange={e => setMaxOrder(e.target.value)}
                className={inputClass + " max-w-xs"}
                id="maxOrder"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={autoAccept}
                onChange={e => setAutoAccept(e.target.checked)}
                className="accent-coffee-700 w-5 h-5"
                id="autoAccept"
              />
              <label htmlFor="autoAccept" className="ml-3 text-coffee-900 font-medium">
                Auto-accept orders
                <button
                  type="button"
                  className="ml-2 text-xs text-coffee-400"
                  onClick={() => showTooltip(help.autoAccept)}
                  aria-label="Help"
                >ⓘ</button>
              </label>
            </div>
            <div>
              <label className={labelClass} htmlFor="prepTime">
                Preparation time (minutes)
                <button
                  type="button"
                  className="ml-2 text-xs text-coffee-400"
                  onClick={() => showTooltip(help.prepTime)}
                  aria-label="Help"
                >ⓘ</button>
              </label>
              <select
                value={prepTime}
                onChange={e => setPrepTime(Number(e.target.value))}
                className={inputClass + " max-w-xs"}
                id="prepTime"
              >
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>
                Order types
                <button
                  type="button"
                  className="ml-2 text-xs text-coffee-400"
                  onClick={() => showTooltip(help.orderType)}
                  aria-label="Help"
                >ⓘ</button>
              </label>
              <div className="flex gap-6 mt-2">
                {["pickup", "delivery"].map(type => (
                  <label key={type} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={orderType[type]}
                      onChange={e => setOrderType(o => ({ ...o, [type]: e.target.checked }))}
                      className="accent-coffee-700 w-5 h-5"
                    />
                    <span className="capitalize">{type}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className={labelClass}>
                Order notification
                <button
                  type="button"
                  className="ml-2 text-xs text-coffee-400"
                  onClick={() => showTooltip(help.orderNotification)}
                  aria-label="Help"
                >ⓘ</button>
              </label>
              <div className="flex gap-6 mt-2">
                {["email", "sms", "app"].map(method => (
                  <label key={method} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={orderNotification[method]}
                      onChange={e => setOrderNotification(n => ({ ...n, [method]: e.target.checked }))}
                      className="accent-coffee-700 w-5 h-5"
                    />
                    <span className="capitalize">{method}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={orderScheduling}
                onChange={e => setOrderScheduling(e.target.checked)}
                className="accent-coffee-700 w-5 h-5"
                id="orderScheduling"
              />
              <label htmlFor="orderScheduling" className="ml-3 text-coffee-900 font-medium">
                Allow order scheduling
                <button
                  type="button"
                  className="ml-2 text-xs text-coffee-400"
                  onClick={() => showTooltip(help.orderScheduling)}
                  aria-label="Help"
                >ⓘ</button>
              </label>
            </div>
          </div>
        </div>

        {/* System-wide Transaction Preferences */}
        <div className={sectionClass}>
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-coffee-800">
            <span role="img" aria-label="system">💳</span> Transaction Preferences
          </h3>
          <div className="flex flex-col gap-4">
            <div>
              <label className={labelClass}>
                Payment methods
                <button
                  type="button"
                  className="ml-2 text-xs text-coffee-400"
                  onClick={() => showTooltip(help.paymentMethods)}
                  aria-label="Help"
                >ⓘ</button>
              </label>
              <div className="flex gap-6 mt-2">
                {["cash", "card", "ewallet"].map(method => (
                  <label key={method} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={paymentMethods[method]}
                      onChange={e => setPaymentMethods(pm => ({ ...pm, [method]: e.target.checked }))}
                      className="accent-coffee-700 w-5 h-5"
                    />
                    <span className="capitalize">{method}</span>
                  </label>
                ))}
                <input
                  type="text"
                  value={paymentMethods.custom}
                  onChange={e => setPaymentMethods(pm => ({ ...pm, custom: e.target.value }))}
                  className={inputClass + " max-w-xs"}
                  placeholder="Custom method"
                />
              </div>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={autoPrint}
                onChange={e => setAutoPrint(e.target.checked)}
                className="accent-coffee-700 w-5 h-5"
                id="autoPrint"
              />
              <label htmlFor="autoPrint" className="ml-3 text-coffee-900 font-medium">
                Auto-print receipt
                <button
                  type="button"
                  className="ml-2 text-xs text-coffee-400"
                  onClick={() => showTooltip(help.autoPrint)}
                  aria-label="Help"
                >ⓘ</button>
              </label>
            </div>
            <div>
              <label className={labelClass}>
                Discount rules
                <button
                  type="button"
                  className="ml-2 text-xs text-coffee-400"
                  onClick={() => showTooltip(help.discountRules)}
                  aria-label="Help"
                >ⓘ</button>
              </label>
              {discountRules.map((dr, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={dr.rule}
                    onChange={e => handleDiscountRuleChange(idx, e.target.value)}
                    className={inputClass}
                    placeholder="e.g. 10% off for orders > ₱1000"
                  />
                  <button
                    type="button"
                    className="bg-coffee-200 px-3 py-1 rounded-xl text-coffee-900 font-bold"
                    onClick={() => removeDiscountRule(idx)}
                    disabled={discountRules.length === 1}
                  >
                    −
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="bg-coffee-700 text-white px-4 py-1 rounded-xl font-semibold shadow hover:bg-coffee-800 transition"
                onClick={addDiscountRule}
              >
                + Add Rule
              </button>
            </div>
            <div>
              <label className={labelClass}>
                Tax/VAT ON
                <button
                  type="button"
                  className="ml-2 text-xs text-coffee-400"
                  onClick={() => showTooltip(help.taxOn)}
                  aria-label="Help"
                >ⓘ</button>
              </label>
              <div className="flex items-center gap-4">
                {taxOn && (
                  <input
                    type="number"
                    value={taxRate}
                    min={0}
                    max={100}
                    onChange={e => setTaxRate(e.target.value)}
                    className={inputClass + " max-w-xs"}
                    placeholder="Tax Rate (%)"
                  />
                )}
                <input
                  type="checkbox"
                  checked={taxOn}
                  onChange={e => setTaxOn(e.target.checked)}
                  className="accent-coffee-700 w-5 h-5"
                  id="taxOn"
                />
                {taxOn && (
                  <button
                    type="button"
                    className="ml-2 text-xs text-coffee-400"
                    onClick={() => showTooltip(help.taxRate)}
                    aria-label="Help"
                  >ⓘ</button>
                )}
              </div>
            </div>
            <div>
              <label className={labelClass}>
                Receipt header
                <button
                  type="button"
                  className="ml-2 text-xs text-coffee-400"
                  onClick={() => showTooltip(help.receiptHeader)}
                  aria-label="Help"
                >ⓘ</button>
              </label>
              <input
                type="text"
                value={receiptHeader}
                onChange={e => setReceiptHeader(e.target.value)}
                className={inputClass}
                placeholder="Header text"
              />
            </div>
            <div>
              <label className={labelClass}>
                Receipt footer
                <button
                  type="button"
                  className="ml-2 text-xs text-coffee-400"
                  onClick={() => showTooltip(help.receiptFooter)}
                  aria-label="Help"
                >ⓘ</button>
              </label>
              <input
                type="text"
                value={receiptFooter}
                onChange={e => setReceiptFooter(e.target.value)}
                className={inputClass}
                placeholder="Footer text"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Save/Reset/Preview */}
      <div className="flex gap-4 mt-8 justify-end">
        <button
          className="bg-coffee-700 text-white px-6 py-2 rounded-xl font-semibold shadow hover:bg-coffee-800 transition"
          onClick={handleSave}
        >
          Save
        </button>
        <button
          className="bg-coffee-200 text-coffee-900 px-6 py-2 rounded-xl font-semibold shadow hover:bg-coffee-300 transition"
          onClick={handleReset}
        >
          Reset
        </button>
        <button
          className="bg-coffee-400 text-white px-6 py-2 rounded-xl font-semibold shadow hover:bg-coffee-500 transition"
          onClick={handlePreview}
        >
          Preview
        </button>
      </div>
    </div>
  );
}