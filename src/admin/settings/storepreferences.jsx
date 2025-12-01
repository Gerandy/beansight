import React, { useEffect, useState } from "react";
import {getDoc, setDoc, doc} from "firebase/firestore"
import { db } from "../../firebase";
import { exists } from "xendit-node";

const help = {
  onlineOrdering: "Allow customers to place orders online through your website or app.",
  cutoffTimes: "Set the latest time you accept orders for each day.",
  minOrder: "The smallest order amount you will accept from customers.",
  maxOrder: "The largest order amount you will accept from customers.",
  autoAccept: "Automatically accept incoming orders without manual approval.",
  prepTime: "Estimated time needed to prepare each order.",
  orderType: "Choose which order types your store supports (pickup or delivery).",
  orderNotification: "How you want to be notified about new orders.",
  orderScheduling: "Allow customers to schedule orders for a future date/time.",
  paymentMethods: "Select payment methods you accept. You can add a custom method. These apply to all transactions in your system.",
  autoPrint: "Automatically print a receipt when an order is accepted.",
  discountRules: "Set rules for automatic discounts (e.g. 10% off for orders over ₱1000). These rules apply to all orders.",
  taxOn: "Enable or disable tax/VAT calculation for all sales.",
  taxRate: "Set the percentage rate for tax/VAT applied to all transactions.",
  receiptHeader: "Text or info shown at the top of printed receipts.",
  receiptFooter: "Text or info shown at the bottom of printed receipts."
};

// Modal Tooltip Component
function ModalTooltip({ open, text, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm cursor-pointer" onClick={onClose}>
      <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-6 max-w-sm w-full relative" onClick={e => e.stopPropagation()}>
        <button
          className="absolute top-2 right-3 text-coffee-700 text-xl font-bold cursor-pointer"
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
    mon: "00:00",
    tue: "00:00",
    wed: "00:00",
    thu: "00:00",
    fri: "00:00",
    sat: "00:00",
    sun: "00:00",
  });
  const [openTimes, setopenTimes] = useState({
   open: "00:00"
  });
  const [minOrder, setMinOrder] = useState(0);
  const [maxOrder, setMaxOrder] = useState(0);
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
    gcash: true,
  });
  const [autoPrint, setAutoPrint] = useState(false);
  const [discountRules, setDiscountRules] = useState([{ rule: "" }]);
  const [taxOn, setTaxOn] = useState(true);
  const [taxRate, setTaxRate] = useState("");
  const [receiptHeader, setReceiptHeader] = useState("");
  const [receiptFooter, setReceiptFooter] = useState("");

  // Tooltip modal state
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [tooltipText, setTooltipText] = useState("");

  // Error and message state
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});

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

  // Validation
  const validate = () => {
    const newErrors = {};
    if (minOrder < 0) newErrors.minOrder = "Minimum order must be zero or more.";
    if (maxOrder < 0) newErrors.maxOrder = "Maximum order must be zero or more.";
    if (taxOn && (taxRate < 0 || taxRate > 100)) newErrors.taxRate = "Tax rate must be between 0 and 100.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save/Reset/Preview handlers
  const handleSave = () => {
    if (!validate()) {
      setMessage("");
      return;
    }
    setMessage("Preferences saved!");
  };
  const handleReset = async () => {
    const docSnap = await getDoc(doc(db, "settings", "storePref"));
   
    

    const data = docSnap.data();
    setTaxRate(data.taxRate);
    setMinOrder(data.minOrder);
    setCutoffTimes(data.storeTime);
    setopenTimes(data.storeOpen);
    setOrderType(data.orderType);
    setOnlineOrdering(data.onlineOrder);
    setPaymentMethods(data.paymentMet);
    

    

    setOrderScheduling(false);
    
    setAutoPrint(false);
    setDiscountRules([{ rule: "" }]);
    setTaxOn(true);
    
    setReceiptHeader("");
    setReceiptFooter("");
    setErrors({});
    setMessage("Fields reset to default.");
  };
  const handlePreview = () => {
    setMessage("Preview not implemented.");
  };

  // Tooltip trigger
  const showTooltip = text => {
    setTooltipText(text);
    setTooltipOpen(true);
  };

 useEffect(() => {
  const loadSettings = async () => {
    const docSnap = await getDoc(doc(db, "settings", "storePref"));
    if (!docSnap.exists()) {
      console.log("data does not exists");
      return;
    };

    const data = docSnap.data();
    setTaxRate(data.taxRate);
    setMinOrder(data.minOrder);
    setCutoffTimes(data.storeTime);
    setopenTimes(data.storeOpen);
    setOrderType(data.orderType);
  };
  
  loadSettings();
}, []);


  return (
    <div className="w-full max-w-6xl mx-auto pt-8">
      <ModalTooltip open={tooltipOpen} text={tooltipText} onClose={() => setTooltipOpen(false)} />
      <h2 className="text-3xl font-bold mb-2 flex items-center gap-3 text-coffee-900">
        <span role="img" aria-label="settings">⚙️</span> Store Preferences
      </h2>
      <p className="mb-8 text-coffee-700 text-base">
        Set your store’s preferences for ordering, payments, and receipts. These settings help customers order and pay easily. Click fields with <span className="text-coffee-700 font-bold">ⓘ</span> to have more info.
      </p>
      {message && (
        <div className="mb-4 text-coffee-700 font-medium" aria-live="polite">{message}</div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Ordering Preferences */}
        <div className={sectionClass}>
          <h3 className="text-xl font-semibold mb-2 text-coffee-800">Ordering Preferences</h3>
          <p className="mb-4 text-coffee-700 text-base">
            Set how customers can order from your store. These options help you control when and how orders are accepted.
          </p>
          ----------------------------------------
          <div className="flex flex-col gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={onlineOrdering}
                onChange={e => setOnlineOrdering(e.target.checked)}
                className="accent-coffee-700 w-5 h-5 cursor-pointer"
                id="onlineOrdering"
              />
              <label htmlFor="onlineOrdering" className="ml-3 text-coffee-900 font-medium cursor-pointer">
                Enable online ordering
                <button
                  type="button"
                  className="ml-2 text-xs text-coffee-700 cursor-pointer"
                  onClick={() => showTooltip(help.onlineOrdering)}
                  aria-label="Help"
                >ⓘ</button>
              </label>
            </div>
            ----------------------------------------
            <div>
              <label className={labelClass}>
                Store Open Hours (per day)
                <button
                  type="button"
                  className="ml-2 text-xs text-coffee-700 cursor-pointer"
                  onClick={() => showTooltip(help.cutoffTimes)}
                  aria-label="Help"
                >ⓘ</button>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(openTimes).map(([day, value]) => (
                  <div key={day} className="flex items-center gap-2">
                    <span className="capitalize w-12">{day}</span>
                    <input
                      type="time"
                      value={value}
                      onChange={e => setopenTimes({ ...openTimes, [day]: e.target.value })}
                      className={inputClass + " max-w-xs bg-coffee-50 border border-coffee-200 rounded-xl text-coffee-900 font-bold text-lg text-center cursor-text"} // <-- added cursor-text
                    />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className={labelClass}>
                Order cut-off time (per day)
                <button
                  type="button"
                  className="ml-2 text-xs text-coffee-700 cursor-pointer"
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
                      className={inputClass + " max-w-xs bg-coffee-50 border border-coffee-200 rounded-xl text-coffee-900 font-bold text-lg text-center cursor-text"} // <-- added cursor-text
                    />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className={labelClass} htmlFor="minOrder">
                Smallest order allowed
                <button
                  type="button"
                  className="ml-2 text-xs text-coffee-700 cursor-pointer"
                  onClick={() => showTooltip(help.minOrder)}
                  aria-label="Help"
                >ⓘ</button>
              </label>
              <input
                type="number"
                value={minOrder}
                min={0}
                onChange={e => setMinOrder(e.target.value)}
                className={inputClass + " max-w-xs cursor-text"} // <-- added cursor-text
                id="minOrder"
                placeholder="e.g. 100"
              />
              {errors.minOrder && (
                <span className="text-red-600 text-sm">{errors.minOrder}</span>
              )}
            </div>
            
            <div>
              <label className={labelClass}>
                Order types
                <button
                  type="button"
                  className="ml-2 text-xs text-coffee-700 cursor-pointer"
                  onClick={() => showTooltip(help.orderType)}
                  aria-label="Help"
                >ⓘ</button>--------------
              </label>
              <div className="flex gap-6 mt-2">
                {["pickup", "delivery"].map(type => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={orderType[type]}
                      onChange={e => setOrderType(o => ({ ...o, [type]: e.target.checked }))}
                      className="accent-coffee-700 w-5 h-5 cursor-pointer"
                    />
                    <span className="capitalize">{type}</span>
                  </label>
                ))}
              </div>
              -----------------------------
            </div>
          </div>
        </div>

        {/* System-wide Transaction Preferences */}
        <div className={sectionClass}>
          <h3 className="text-xl font-semibold mb-2 text-coffee-800">Transaction Preferences</h3>
          <p className="mb-4 text-coffee-700 text-base">
            Choose how payments, discounts, and receipts work for all orders in your store.
          </p>
          <div className="flex flex-col gap-4">
            <div>
              <label className={labelClass}>
                Payment methods
                <button
                  type="button"
                  className="ml-2 text-xs text-coffee-700 cursor-pointer"
                  onClick={() => showTooltip(help.paymentMethods)}
                  aria-label="Help"
                >ⓘ</button>
              </label>
              <div className="flex gap-6 mt-2">
                {["cash", "gcash"].map(method => (
                  <label key={method} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={paymentMethods[method]}
                      onChange={e => setPaymentMethods(pm => ({ ...pm, [method]: e.target.checked }))}
                      className="accent-coffee-700 w-5 h-5 cursor-pointer"
                    />
                    <span className="capitalize">{method}</span>
                  </label>
                ))}
                
              </div>
            </div>
            <div>
              <label className={labelClass}>
                Discount rules
                <button
                  type="button"
                  className="ml-2 text-xs text-coffee-700 cursor-pointer"
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
                    className="bg-coffee-200 px-3 py-1 rounded-xl text-red-600 font-bold cursor-pointer"
                    onClick={() => removeDiscountRule(idx)}
                    disabled={discountRules.length === 1}
                  >
                    x
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="bg-coffee-700 text-white px-4 py-1 rounded-xl font-semibold shadow hover:bg-coffee-800 transition cursor-pointer"
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
                  className="ml-2 text-xs text-coffee-700 cursor-pointer"
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
                  className="accent-coffee-700 w-5 h-5 cursor-pointer"
                  id="taxOn"
                />
                {taxOn && (
                  <button
                    type="button"
                    className="ml-2 text-xs text-coffee-700 cursor-pointer"
                    onClick={() => showTooltip(help.taxRate)}
                    aria-label="Help"
                  >ⓘ</button>
                )}
              </div>
              {errors.taxRate && (
                <span className="text-red-600 text-sm">{errors.taxRate}</span>
              )}
            </div>
            <div>
              <label className={labelClass}>
                Receipt header
                <button
                  type="button"
                  className="ml-2 text-xs text-coffee-700 cursor-pointer"
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
                  className="ml-2 text-xs text-coffee-700 cursor-pointer"
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
          className="bg-coffee-700 text-white px-6 py-2 rounded-xl font-semibold shadow hover:bg-coffee-800 transition cursor-pointer"
          onClick={handleSave}
        >
          Save
        </button>
        <button
          className="bg-coffee-200 text-coffee-900 px-6 py-2 rounded-xl font-semibold shadow hover:bg-coffee-300 transition cursor-pointer"
          onClick={handleReset}
        >
          Reset
        </button>
        <button
          className="bg-coffee-400 text-white px-6 py-2 rounded-xl font-semibold shadow hover:bg-coffee-500 transition cursor-pointer"
          onClick={handlePreview}
        >
          Preview
        </button>
      </div>
    </div>
  );
}