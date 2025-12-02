import React, { useEffect, useState } from "react";
import {getDoc, setDoc, doc} from "firebase/firestore"
import { db } from "../../firebase";

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
  discountRules: "Create automatic discounts for your customers. For example: Give 10% off when they spend ₱500 or more. You can create multiple discount rules.",
  taxOn: "Enable or disable tax/VAT calculation for all sales.",
  taxRate: "Set the percentage rate for tax/VAT applied to all transactions.",
  receiptHeader: "Text or info shown at the top of printed receipts.",
  receiptFooter: "Text or info shown at the bottom of printed receipts.",
  gcashQR: "Upload your GCash QR code image. This will be shown to customers for GCash payments. Recommended size: 300x300 pixels or larger."
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
  // Day order for proper sequence
  const dayOrder = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

  // Ordering Preferences
  const [onlineOrdering, setOnlineOrdering] = useState(true);
  const [cutoffTimes, setCutoffTimes] = useState({
    mon: { time: "00:00", enabled: true },
    tue: { time: "00:00", enabled: true },
    wed: { time: "00:00", enabled: true },
    thu: { time: "00:00", enabled: true },
    fri: { time: "00:00", enabled: true },
    sat: { time: "00:00", enabled: true },
    sun: { time: "00:00", enabled: true },
  });
  const [storeOpenTime, setStoreOpenTime] = useState("00:00");

  const [minOrder, setMinOrder] = useState(0);

  const [orderType, setOrderType] = useState({
    pickup: true,
    delivery: true,
  });


  // System-wide Transaction Preferences
  const [paymentMethods, setPaymentMethods] = useState({
    cash: true,
    gcash: true,
  });

  const [discountRules, setDiscountRules] = useState([
    { 
      enabled: false,
      name: "",
      type: "percentage", // percentage or fixed
      amount: "",
      minSpend: ""
    }
  ]);
  const [taxOn, setTaxOn] = useState(true);
  const [taxRate, setTaxRate] = useState("");
  const [receiptHeader, setReceiptHeader] = useState("");
  const [receiptFooter, setReceiptFooter] = useState("");
  const [gcashQRImage, setGcashQRImage] = useState(null);
  const [gcashQRPreview, setGcashQRPreview] = useState("");

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

  // Handle time change for cutoff times
  const handleCutoffTimeChange = (day, time) => {
    setCutoffTimes({ ...cutoffTimes, [day]: { ...cutoffTimes[day], time } });
  };

  const handleCutoffDayToggle = (day, enabled) => {
    setCutoffTimes({ ...cutoffTimes, [day]: { ...cutoffTimes[day], enabled } });
  };

  // Discount rules handlers
  const handleDiscountRuleChange = (idx, field, value) => {
    const updated = [...discountRules];
    updated[idx][field] = value;
    setDiscountRules(updated);
  };

  const addDiscountRule = () => setDiscountRules([
    ...discountRules, 
    { 
      enabled: false,
      name: "",
      type: "percentage",
      amount: "",
      minSpend: ""
    }
  ]);

  const removeDiscountRule = idx => setDiscountRules(discountRules.filter((_, i) => i !== idx));

  // Handle GCash QR image upload
  const handleGcashQRUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors({...errors, gcashQR: "Please upload an image file"});
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({...errors, gcashQR: "Image size must be less than 5MB"});
        return;
      }

      setGcashQRImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setGcashQRPreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Clear any previous errors
      const newErrors = {...errors};
      delete newErrors.gcashQR;
      setErrors(newErrors);
    }
  };

  const removeGcashQR = () => {
    setGcashQRImage(null);
    setGcashQRPreview("");
  };

  // Validation
  const validate = () => {
    const newErrors = {};
    if (minOrder < 0) newErrors.minOrder = "Minimum order must be zero or more.";
    if (maxOrder < 0) newErrors.maxOrder = "Maximum order must be zero or more.";
    if (taxOn && (taxRate < 0 || taxRate > 100)) newErrors.taxRate = "Tax rate must be between 0 and 100.";
    
    // Validate discount rules
    discountRules.forEach((rule, idx) => {
      if (rule.enabled) {
        if (!rule.name) newErrors[`discount_${idx}_name`] = "Please give this discount a name";
        if (!rule.amount || rule.amount <= 0) newErrors[`discount_${idx}_amount`] = "Please enter discount amount";
        if (rule.type === "percentage" && rule.amount > 100) newErrors[`discount_${idx}_amount`] = "Percentage cannot exceed 100%";
        if (!rule.minSpend || rule.minSpend < 0) newErrors[`discount_${idx}_minSpend`] = "Please enter minimum spend amount";
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Helper function to convert cutoff times format
  const convertToNewFormat = (oldData) => {
    if (!oldData) return {
      mon: { time: "00:00", enabled: true },
      tue: { time: "00:00", enabled: true },
      wed: { time: "00:00", enabled: true },
      thu: { time: "00:00", enabled: true },
      fri: { time: "00:00", enabled: true },
      sat: { time: "00:00", enabled: true },
      sun: { time: "00:00", enabled: true },
    };
    
    const newFormat = {};
    dayOrder.forEach(day => {
      if (oldData[day]) {
        if (typeof oldData[day] === 'object' && oldData[day].time !== undefined) {
          newFormat[day] = oldData[day];
        } else {
          newFormat[day] = { time: oldData[day] || "00:00", enabled: true };
        }
      } else {
        newFormat[day] = { time: "00:00", enabled: true };
      }
    });
    return newFormat;
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
    
    setTaxRate(data?.taxRate || "");
    setMinOrder(data?.minOrder || 0);
    setCutoffTimes(convertToNewFormat(data?.storeTime));
    setStoreOpenTime(data?.storeOpenTime || "00:00");
    setStoreCloseTime(data?.storeCloseTime || "00:00");
    setOrderType(data?.orderType || { pickup: true, delivery: true });
    setOnlineOrdering(data?.onlineOrder ?? true);
    setPaymentMethods(data?.paymentMet || { cash: true, gcash: true });
    console.log("data",data.storeTime)
    
    setOrderScheduling(false);
    setAutoPrint(false);
    setDiscountRules([data.discountRules]);
    setTaxOn(true);
    setReceiptHeader("");
    setReceiptFooter("");
    setGcashQRImage(null);
    setGcashQRPreview("");
    setErrors({});
    setMessage("Fields reset to default.");
  };
  // Tooltip trigger
  const showTooltip = text => {
    setTooltipText(text);
    setTooltipOpen(true);
  };
  console.log(cutoffTimes);





 useEffect(() => {
  const loadSettings = async () => {
    const docSnap = await getDoc(doc(db, "settings", "storePref"));
    if (!docSnap.exists()) {
      console.log("data does not exists");
      return;
    };
    
    const data = docSnap.data();
    setTaxRate(data.taxRate || "");
    setMinOrder(data.minOrder || 0);
    setOnlineOrdering(data.onlineOrder);
    setCutoffTimes(convertToNewFormat(data.storeTime));
    setStoreOpenTime(data.storeOpen);
    setOrderType(data.orderType || { pickup: true, delivery: true });
    setOnlineOrdering(data.onlineOrder ?? true);
    setPaymentMethods(data.paymentMet || { cash: true, gcash: true });
    setDiscountRules(data.discountRules);
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
            
            {/* Separator */}
            <div className="border-t border-coffee-700 my-2"></div>
            
            <div>
              <label className={labelClass}>
                Store Hours
                <button
                  type="button"
                  className="ml-2 text-xs text-coffee-700 cursor-pointer"
                  onClick={() => showTooltip(help.cutoffTimes)}
                  aria-label="Help"
                >ⓘ</button>
              </label>
              <p className="text-sm text-coffee-600 mb-2">Set your store's opening (same for all days)</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-coffee-700 mb-1">Opens at:</label>
                  <input
                    type="time"
                    value={storeOpenTime}
                    onChange={e => setStoreOpenTime(e.target.value)}
                    className={inputClass + " text-center cursor-text"}
                  />
                </div>
              </div>
            </div>

            {/* Separator */}
            <div className="border-t border-coffee-700 my-2"></div>

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
              <p className="text-sm text-coffee-600 mb-2">Set the latest time to accept orders for each day. Uncheck days when your store is closed.</p>
              <div className="grid grid-cols-2 gap-2">
                {dayOrder.map((day) => (
                  <div key={day} className="bg-coffee-50 rounded-lg p-2 border border-coffee-200 flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={cutoffTimes[day].enabled}
                      onChange={e => handleCutoffDayToggle(day, e.target.checked)}
                      className="accent-coffee-700 w-4 h-4 cursor-pointer"
                      id={`cutoff-${day}`}
                    />
                    <label htmlFor={`cutoff-${day}`} className="font-medium text-coffee-800 text-sm w-12 cursor-pointer">
                      {day.charAt(0).toUpperCase() + day.slice(1)}
                    </label>
                    <input
                      type="time"
                      value={cutoffTimes[day].time}
                      onChange={e => handleCutoffTimeChange(day, e.target.value)}
                      disabled={!cutoffTimes[day].enabled}
                      className={`flex-1 p-1 text-sm rounded border border-coffee-200 bg-coffee-50 text-coffee-900 font-medium text-center ${!cutoffTimes[day].enabled ? 'opacity-50 cursor-not-allowed' : 'cursor-text'}`}
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
                className={inputClass + " max-w-xs cursor-text"}
                id="minOrder"
                placeholder="e.g. 100"
              />
              {errors.minOrder && (
                <span className="text-red-600 text-sm">{errors.minOrder}</span>
              )}
            </div>
            
            {/* Separator */}
            <div className="border-t border-coffee-700 my-2"></div>
            
            <div>
              <label className={labelClass}>
                Order types
                <button
                  type="button"
                  className="ml-2 text-xs text-coffee-700 cursor-pointer"
                  onClick={() => showTooltip(help.orderType)}
                  aria-label="Help"
                >ⓘ</button>
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

            {/* Separator */}
            <div className="border-t border-coffee-700 my-2"></div>

            {/* NEW: Improved Discount Rules */}
            <div>
              <label className={labelClass}>
                🎁 Automatic Discounts
                <button
                  type="button"
                  className="ml-2 text-xs text-coffee-700 cursor-pointer"
                  onClick={() => showTooltip(help.discountRules)}
                  aria-label="Help"
                >ⓘ</button>
              </label>
              <p className="text-sm text-coffee-600 mb-3">
                Give automatic discounts to customers who spend a certain amount. Example: "10% off for orders ₱500 and above"
              </p>
              
              {/* Scrollable container for discount rules - shows scrollbar after 3 rules */}
              <div className={`pr-2 mb-3 space-y-3 ${discountRules.length > 3 ? 'max-h-[300px] overflow-y-auto' : ''}`}>
                {discountRules.map((rule, idx) => (
                  <div key={idx} className="bg-coffee-50 rounded-xl p-4 border border-coffee-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={rule.enabled}
                          onChange={e => handleDiscountRuleChange(idx, "enabled", e.target.checked)}
                          className="accent-coffee-700 w-5 h-5 cursor-pointer"
                          id={`discount-enabled-${idx}`}
                        />
                        <label htmlFor={`discount-enabled-${idx}`} className="font-semibold text-coffee-800 cursor-pointer">
                          Discount #{idx + 1} {rule.enabled ? "✓" : "(Turn on to use)"}
                        </label>
                      </div>
                      {discountRules.length > 1 && (
                        <button
                          type="button"
                          className="bg-red-100 text-red-600 px-3 py-1 rounded-lg font-bold hover:bg-red-200 transition cursor-pointer"
                          onClick={() => removeDiscountRule(idx)}
                        >
                          Delete
                        </button>
                      )}
                    </div>

                    {rule.enabled && (
                      <div className="grid grid-cols-1 gap-3 pl-8">
                        {/* Discount Name */}
                        <div>
                          <label className="block text-sm font-medium text-coffee-700 mb-1">
                            Give this discount a name:
                          </label>
                          <input
                            type="text"
                            value={rule.name}
                            onChange={e => handleDiscountRuleChange(idx, "name", e.target.value)}
                            className={inputClass}
                            placeholder="e.g., Big Spender Discount"
                          />
                          {errors[`discount_${idx}_name`] && (
                            <span className="text-red-600 text-sm">{errors[`discount_${idx}_name`]}</span>
                          )}
                        </div>

                        {/* Discount Type and Amount */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-coffee-700 mb-1">
                              Discount type:
                            </label>
                            <select
                              value={rule.type}
                              onChange={e => handleDiscountRuleChange(idx, "type", e.target.value)}
                              className={inputClass + " cursor-pointer"}
                            >
                              <option value="percentage">Percentage (%)</option>
                              <option value="fixed">Fixed Amount (₱)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-coffee-700 mb-1">
                              {rule.type === "percentage" ? "Percentage:" : "Amount (₱):"}
                            </label>
                            <div className="relative">
                              <input
                                type="number"
                                value={rule.amount}
                                min={0}
                                max={rule.type === "percentage" ? 100 : undefined}
                                onChange={e => handleDiscountRuleChange(idx, "amount", e.target.value)}
                                className={inputClass}
                                placeholder={rule.type === "percentage" ? "e.g., 10" : "e.g., 50"}
                              />
                              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-coffee-700 font-bold">
                                {rule.type === "percentage" ? "%" : "₱"}
                              </span>
                            </div>
                            {errors[`discount_${idx}_amount`] && (
                              <span className="text-red-600 text-sm">{errors[`discount_${idx}_amount`]}</span>
                            )}
                          </div>
                        </div>

                        {/* Minimum Spend */}
                        <div>
                          <label className="block text-sm font-medium text-coffee-700 mb-1">
                            Customer must spend at least:
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              value={rule.minSpend}
                              min={0}
                              onChange={e => handleDiscountRuleChange(idx, "minSpend", e.target.value)}
                              className={inputClass}
                              placeholder="e.g., 500"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-coffee-700 font-bold">₱</span>
                          </div>
                          {errors[`discount_${idx}_minSpend`] && (
                            <span className="text-red-600 text-sm">{errors[`discount_${idx}_minSpend`]}</span>
                          )}
                        </div>

                        {/* Preview */}
                        {rule.name && rule.amount && rule.minSpend && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-2">
                            <p className="text-sm text-green-800 font-medium">
                              ✓ This will work like this: <br/>
                              <span className="font-bold">"{rule.name}"</span> - Get {rule.type === "percentage" ? `${rule.amount}%` : `₱${rule.amount}`} off when spending ₱{rule.minSpend} or more
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="bg-coffee-700 text-white px-4 py-2 rounded-xl font-semibold shadow hover:bg-coffee-800 transition cursor-pointer w-full"
                onClick={addDiscountRule}
              >
                + Add Another Discount
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

            {/* Separator */}
            <div className="border-t border-coffee-700 my-2"></div>

            {/* GCash QR Code Upload */}
            <div>
              <label className={labelClass}>
                💳 GCash QR Code
                <button
                  type="button"
                  className="ml-2 text-xs text-coffee-700 cursor-pointer"
                  onClick={() => showTooltip(help.gcashQR)}
                  aria-label="Help"
                >ⓘ</button>
              </label>
              <p className="text-sm text-coffee-600 mb-3">
                Upload your GCash QR code so customers can easily pay you through GCash
              </p>
              
              {!gcashQRPreview ? (
                <div className="border-2 border-dashed border-coffee-300 rounded-xl p-6 text-center hover:border-coffee-500 transition cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleGcashQRUpload}
                    className="hidden"
                    id="gcashQRUpload"
                  />
                  <label htmlFor="gcashQRUpload" className="cursor-pointer">
                    <div className="text-coffee-700 mb-2">
                      <span className="text-4xl">📱</span>
                    </div>
                    <p className="text-coffee-700 font-medium mb-1">Click to upload GCash QR code</p>
                    <p className="text-coffee-500 text-sm">PNG, JPG up to 5MB</p>
                  </label>
                </div>
              ) : (
                <div className="bg-coffee-50 rounded-xl p-4 border border-coffee-200">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <img 
                        src={gcashQRPreview} 
                        alt="GCash QR Code" 
                        className="w-32 h-32 object-contain rounded-lg border-2 border-coffee-300"
                      />
                    </div>
                    <div className="flex-grow">
                      <p className="text-coffee-800 font-medium mb-2">✓ GCash QR Code uploaded</p>
                      <p className="text-coffee-600 text-sm mb-3">
                        This QR code will be shown to customers for GCash payments
                      </p>
                      <div className="flex gap-2">
                        <label htmlFor="gcashQRUpload" className="bg-coffee-600 text-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-coffee-700 transition cursor-pointer">
                          Change Image
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleGcashQRUpload}
                          className="hidden"
                          id="gcashQRUpload"
                        />
                        <button
                          type="button"
                          onClick={removeGcashQR}
                          className="bg-red-100 text-red-600 px-3 py-1 rounded-lg text-sm font-medium hover:bg-red-200 transition cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {errors.gcashQR && (
                <span className="text-red-600 text-sm block mt-2">{errors.gcashQR}</span>
              )}
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
      </div>
    </div>
  );
}