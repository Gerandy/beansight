import React, { useEffect, useState } from "react";
import { getDoc, setDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";
import { 
  Settings, 
  ShoppingCart, 
  CreditCard, 
  Receipt, 
  Clock, 
  DollarSign, 
  Tag, 
  Percent,
  Upload,
  X,
  Check,
  AlertCircle,
  Info,
  Save,
  RotateCcw
} from "lucide-react";

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
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm cursor-pointer animate-fadeIn" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 relative transform transition-all" 
        onClick={e => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 text-coffee-400 hover:text-coffee-700 transition"
          onClick={onClose}
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-coffee-600 flex-shrink-0 mt-0.5" />
          <div className="text-coffee-800 text-sm leading-relaxed">{text}</div>
        </div>
      </div>
    </div>
  );
}

export default function StorePreferences() {
  // Day order for proper sequence
  const dayOrder = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  const dayNames = {
    mon: 'Monday',
    tue: 'Tuesday', 
    wed: 'Wednesday',
    thu: 'Thursday',
    fri: 'Friday',
    sat: 'Saturday',
    sun: 'Sunday'
  };

  // State declarations
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
  const [paymentMethods, setPaymentMethods] = useState({
    cash: true,
    gcash: true,
  });
  const [discountRules, setDiscountRules] = useState([
    { 
      enabled: false,
      name: "",
      type: "percentage",
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
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [tooltipText, setTooltipText] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Shared styles
  const inputClass = "w-full p-3 rounded-xl border-2 border-coffee-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 transition placeholder:text-coffee-400 text-coffee-900 font-medium hover:border-coffee-300";
  
  const sectionClass = "bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-coffee-100 hover:shadow-xl transition-shadow";
  
  const labelClass = "block font-semibold mb-2 text-coffee-800 flex items-center gap-2";

  // Helper functions
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

  const handleCutoffTimeChange = (day, time) => {
    setCutoffTimes({ ...cutoffTimes, [day]: { ...cutoffTimes[day], time } });
  };

  const handleCutoffDayToggle = (day, enabled) => {
    setCutoffTimes({ ...cutoffTimes, [day]: { ...cutoffTimes[day], enabled } });
  };

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

  const handleGcashQRUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrors({...errors, gcashQR: "Please upload an image file"});
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setErrors({...errors, gcashQR: "Image size must be less than 5MB"});
        return;
      }

      setGcashQRImage(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setGcashQRPreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      const newErrors = {...errors};
      delete newErrors.gcashQR;
      setErrors(newErrors);
    }
  };

  const removeGcashQR = () => {
    setGcashQRImage(null);
    setGcashQRPreview("");
  };

  const validate = () => {
    const newErrors = {};
    if (minOrder < 0) newErrors.minOrder = "Minimum order must be zero or more.";
    if (taxOn && (taxRate < 0 || taxRate > 100)) newErrors.taxRate = "Tax rate must be between 0 and 100.";
    
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

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 4000);
  };

  const handleSave = async () => {
    if (!validate()) {
      showMessage("Please fix the errors before saving", "error");
      return;
    }
    
    setSaving(true);
    try {
      // Simulate save to Firebase
      await setDoc(doc(db, "settings", "storePref"),{
        discountRules: discountRules,
        minOrder: minOrder,
        onlineOrder: onlineOrdering,
        orderType: orderType,
        paymentMet: paymentMethods,
        storeOpen: storeOpenTime,
        storeTime: cutoffTimes,
        taxRate: taxRate

      }
    )

      showMessage("✓ Settings saved successfully!", "success");
    } catch (err) {
      showMessage("Failed to save settings. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm("Are you sure you want to reset all settings to defaults?")) return;
    
    try {
      const docSnap = await getDoc(doc(db, "settings", "storePref"));
      const data = docSnap.data();
      
      setTaxRate(data?.taxRate || "");
      setMinOrder(data?.minOrder || 0);
      setCutoffTimes(convertToNewFormat(data?.storeTime));
      setStoreOpenTime(data?.storeOpenTime || "00:00");
      setOrderType(data?.orderType || { pickup: true, delivery: true });
      setOnlineOrdering(data?.onlineOrder ?? true);
      setPaymentMethods(data?.paymentMet || { cash: true, gcash: true });
      setDiscountRules([data?.discountRules || { enabled: false, name: "", type: "percentage", amount: "", minSpend: "" }]);
      setReceiptHeader("");
      setReceiptFooter("");
      setGcashQRImage(null);
      setGcashQRPreview("");
      setErrors({});
      
      showMessage("Settings reset to defaults", "success");
    } catch (err) {
      showMessage("Failed to reset settings", "error");
    }
  };

  const showTooltip = text => {
    setTooltipText(text);
    setTooltipOpen(true);
  };

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      try {
        const docSnap = await getDoc(doc(db, "settings", "storePref"));
        if (!docSnap.exists()) {
          console.log("Settings document does not exist");
          return;
        }
        
        const data = docSnap.data();
        setTaxRate(data.taxRate || "");
        setMinOrder(data.minOrder || 0);
        setOnlineOrdering(data.onlineOrder ?? true);
        setCutoffTimes(convertToNewFormat(data.storeTime));
        setStoreOpenTime(data.storeOpen || "00:00");
        setOrderType(data.orderType || { pickup: true, delivery: true });
        setPaymentMethods(data.paymentMet || { cash: true, gcash: true });
        setDiscountRules(data.discountRules || [{ enabled: false, name: "", type: "percentage", amount: "", minSpend: "" }]);
      } catch (err) {
        console.error("Error loading settings:", err);
        showMessage("Failed to load settings", "error");
      } finally {
        setLoading(false);
      }
    };
    
    loadSettings();
  }, []);

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto pt-8 px-4 pb-12">
        <div className="animate-pulse space-y-6">
          <div className="h-12 bg-gray-200 rounded-lg w-1/3"></div>
          <div className="h-6 bg-gray-200 rounded w-2/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2].map(i => (
              <div key={i} className="bg-white rounded-2xl p-8 space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto pt-8 px-4 pb-12">
      <ModalTooltip open={tooltipOpen} text={tooltipText} onClose={() => setTooltipOpen(false)} />
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-coffee-600 p-3 rounded-xl">
            <Settings className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-4xl font-extrabold text-coffee-900">Store Preferences</h2>
        </div>
        <p className="text-coffee-600 text-lg leading-relaxed max-w-3xl">
          Configure your store's operational settings. These preferences control how customers interact with your business and how orders are processed. Click <Info className="w-4 h-4 inline text-coffee-600" /> icons for detailed explanations.
        </p>
      </div>

      {/* Message Toast */}
      {message.text && (
        <div 
          className={`mb-6 flex items-center gap-3 p-4 rounded-xl shadow-lg border-l-4 ${
            message.type === "error" 
              ? "bg-red-50 text-red-800 border-red-500" 
              : "bg-green-50 text-green-800 border-green-500"
          } animate-fadeIn`}
          role="alert"
        >
          {message.type === "error" ? (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <Check className="w-5 h-5 flex-shrink-0" />
          )}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Ordering Preferences */}
        <div className={sectionClass}>
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-coffee-100 p-2 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-coffee-700" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-coffee-900">Ordering</h3>
              <p className="text-coffee-600 text-sm">Customer order settings</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Online Ordering Toggle */}
            <div className="bg-coffee-50 rounded-xl p-4 border-2 border-coffee-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={onlineOrdering}
                    onChange={e => setOnlineOrdering(e.target.checked)}
                    className="accent-coffee-700 w-6 h-6 cursor-pointer rounded"
                    id="onlineOrdering"
                  />
                  <label htmlFor="onlineOrdering" className="text-coffee-900 font-semibold cursor-pointer flex items-center gap-2">
                    Enable Online Ordering
                    <button
                      type="button"
                      className="text-coffee-600 hover:text-coffee-800 transition"
                      onClick={() => showTooltip(help.onlineOrdering)}
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  </label>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${onlineOrdering ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                  {onlineOrdering ? 'ACTIVE' : 'DISABLED'}
                </span>
              </div>
            </div>

            {/* Store Opening Time */}
            <div>
              <label className={labelClass}>
                <Clock className="w-5 h-5 text-coffee-600" />
                Store Opening Time
                <button
                  type="button"
                  className="text-coffee-600 hover:text-coffee-800 transition"
                  onClick={() => showTooltip(help.cutoffTimes)}
                >
                  <Info className="w-4 h-4" />
                </button>
              </label>
              <p className="text-sm text-coffee-600 mb-3">Same opening time applies to all days</p>
              <input
                type="time"
                value={storeOpenTime}
                onChange={e => setStoreOpenTime(e.target.value)}
                className={inputClass + " text-center text-lg font-mono"}
              />
            </div>

            {/* Order Cutoff Times */}
            <div>
              <label className={labelClass}>
                <Clock className="w-5 h-5 text-coffee-600" />
                Daily Order Cut-off Times
                <button
                  type="button"
                  className="text-coffee-600 hover:text-coffee-800 transition"
                  onClick={() => showTooltip(help.cutoffTimes)}
                >
                  <Info className="w-4 h-4" />
                </button>
              </label>
              <p className="text-sm text-coffee-600 mb-3">Set latest order acceptance time per day. Uncheck closed days.</p>
              <div className="space-y-2">
                {dayOrder.map((day) => (
                  <div key={day} className={`flex items-center gap-3 p-3 rounded-lg border-2 transition ${cutoffTimes[day].enabled ? 'bg-white border-coffee-200' : 'bg-gray-50 border-gray-200'}`}>
                    <input
                      type="checkbox"
                      checked={cutoffTimes[day].enabled}
                      onChange={e => handleCutoffDayToggle(day, e.target.checked)}
                      className="accent-coffee-700 w-5 h-5 cursor-pointer rounded"
                      id={`cutoff-${day}`}
                    />
                    <label htmlFor={`cutoff-${day}`} className="font-semibold text-coffee-800 w-24 cursor-pointer">
                      {dayNames[day]}
                    </label>
                    <input
                      type="time"
                      value={cutoffTimes[day].time}
                      onChange={e => handleCutoffTimeChange(day, e.target.value)}
                      disabled={!cutoffTimes[day].enabled}
                      className={`flex-1 p-2 text-center rounded-lg border-2 font-mono transition ${
                        cutoffTimes[day].enabled 
                          ? 'border-coffee-200 bg-white text-coffee-900 cursor-text' 
                          : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Minimum Order */}
            <div>
              <label className={labelClass} htmlFor="minOrder">
                <DollarSign className="w-5 h-5 text-coffee-600" />
                Minimum Order Amount
                <button
                  type="button"
                  className="text-coffee-600 hover:text-coffee-800 transition"
                  onClick={() => showTooltip(help.minOrder)}
                >
                  <Info className="w-4 h-4" />
                </button>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-coffee-700 font-bold">₱</span>
                <input
                  type="number"
                  value={minOrder}
                  min={0}
                  onChange={e => setMinOrder(e.target.value)}
                  className={inputClass + " pl-10"}
                  id="minOrder"
                  placeholder="e.g. 100"
                />
              </div>
              {errors.minOrder && (
                <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.minOrder}
                </p>
              )}
            </div>

            {/* Order Types */}
            <div>
              <label className={labelClass}>
                <ShoppingCart className="w-5 h-5 text-coffee-600" />
                Supported Order Types
                <button
                  type="button"
                  className="text-coffee-600 hover:text-coffee-800 transition"
                  onClick={() => showTooltip(help.orderType)}
                >
                  <Info className="w-4 h-4" />
                </button>
              </label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {[
                  { key: "pickup", label: "Pickup", icon: "🏪" },
                  { key: "delivery", label: "Delivery", icon: "🚚" }
                ].map(type => (
                  <label key={type.key} className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${
                    orderType[type.key] 
                      ? 'border-coffee-500 bg-coffee-50' 
                      : 'border-gray-200 bg-gray-50'
                  }`}>
                    <input
                      type="checkbox"
                      checked={orderType[type.key]}
                      onChange={e => setOrderType(o => ({ ...o, [type.key]: e.target.checked }))}
                      className="accent-coffee-700 w-5 h-5 cursor-pointer rounded"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{type.icon}</span>
                        <span className="font-semibold text-coffee-900">{type.label}</span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Preferences */}
        <div className={sectionClass}>
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-coffee-100 p-2 rounded-lg">
              <CreditCard className="w-6 h-6 text-coffee-700" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-coffee-900">Transactions</h3>
              <p className="text-coffee-600 text-sm">Payment & pricing settings</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Payment Methods */}
            <div>
              <label className={labelClass}>
                <CreditCard className="w-5 h-5 text-coffee-600" />
                Accepted Payment Methods
                <button
                  type="button"
                  className="text-coffee-600 hover:text-coffee-800 transition"
                  onClick={() => showTooltip(help.paymentMethods)}
                >
                  <Info className="w-4 h-4" />
                </button>
              </label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {[
                  { key: "cash", label: "Cash", icon: "💵" },
                  { key: "gcash", label: "GCash", icon: "💳" }
                ].map(method => (
                  <label key={method.key} className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${
                    paymentMethods[method.key] 
                      ? 'border-coffee-500 bg-coffee-50' 
                      : 'border-gray-200 bg-gray-50'
                  }`}>
                    <input
                      type="checkbox"
                      checked={paymentMethods[method.key]}
                      onChange={e => setPaymentMethods(pm => ({ ...pm, [method.key]: e.target.checked }))}
                      className="accent-coffee-700 w-5 h-5 cursor-pointer rounded"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{method.icon}</span>
                        <span className="font-semibold text-coffee-900">{method.label}</span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Discount Rules */}
            <div>
              <label className={labelClass}>
                <Tag className="w-5 h-5 text-coffee-600" />
                Automatic Discounts
                <button
                  type="button"
                  className="text-coffee-600 hover:text-coffee-800 transition"
                  onClick={() => showTooltip(help.discountRules)}
                >
                  <Info className="w-4 h-4" />
                </button>
              </label>
              <p className="text-sm text-coffee-600 mb-4">
                Reward customers automatically when they spend a certain amount
              </p>
              
              <div className={`space-y-4 ${discountRules.length > 2 ? 'max-h-[400px] overflow-y-auto pr-2' : ''}`}>
                {discountRules.map((rule, idx) => (
                  <div key={idx} className="bg-gradient-to-br from-coffee-50 to-coffee-100 rounded-xl p-5 border-2 border-coffee-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={rule.enabled}
                          onChange={e => handleDiscountRuleChange(idx, "enabled", e.target.checked)}
                          className="accent-coffee-700 w-5 h-5 cursor-pointer rounded"
                          id={`discount-enabled-${idx}`}
                        />
                        <label htmlFor={`discount-enabled-${idx}`} className="font-bold text-coffee-900 cursor-pointer flex items-center gap-2">
                          <Tag className="w-4 h-4" />
                          Discount #{idx + 1}
                        </label>
                        {rule.enabled && <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">ACTIVE</span>}
                      </div>
                      {discountRules.length > 1 && (
                        <button
                          type="button"
                          className="text-red-600 hover:text-red-700 transition"
                          onClick={() => removeDiscountRule(idx)}
                          title="Delete discount"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>

                    {rule.enabled && (
                      <div className="space-y-3 pl-8">
                        <div>
                          <label className="block text-sm font-semibold text-coffee-800 mb-1">
                            Discount Name
                          </label>
                          <input
                            type="text"
                            value={rule.name}
                            onChange={e => handleDiscountRuleChange(idx, "name", e.target.value)}
                            className={inputClass}
                            placeholder="e.g., Big Spender Reward"
                          />
                          {errors[`discount_${idx}_name`] && (
                            <p className="text-red-600 text-xs mt-1">{errors[`discount_${idx}_name`]}</p>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-semibold text-coffee-800 mb-1">Type</label>
                            <select
                              value={rule.type}
                              onChange={e => handleDiscountRuleChange(idx, "type", e.target.value)}
                              className={inputClass + " cursor-pointer"}
                            >
                              <option value="percentage">Percentage %</option>
                              <option value="fixed">Fixed Amount ₱</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-coffee-800 mb-1">
                              {rule.type === "percentage" ? "Percent" : "Amount"}
                            </label>
                            <div className="relative">
                              <input
                                type="number"
                                value={rule.amount}
                                min={0}
                                max={rule.type === "percentage" ? 100 : undefined}
                                onChange={e => handleDiscountRuleChange(idx, "amount", e.target.value)}
                                className={inputClass + " pr-10"}
                                placeholder={rule.type === "percentage" ? "10" : "50"}
                              />
                              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-coffee-700 font-bold">
                                {rule.type === "percentage" ? "%" : "₱"}
                              </span>
                            </div>
                            {errors[`discount_${idx}_amount`] && (
                              <p className="text-red-600 text-xs mt-1">{errors[`discount_${idx}_amount`]}</p>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-coffee-800 mb-1">
                            Minimum Spend Required
                          </label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-coffee-700 font-bold">₱</span>
                            <input
                              type="number"
                              value={rule.minSpend}
                              min={0}
                              onChange={e => handleDiscountRuleChange(idx, "minSpend", e.target.value)}
                              className={inputClass + " pl-10"}
                              placeholder="500"
                            />
                          </div>
                          {errors[`discount_${idx}_minSpend`] && (
                            <p className="text-red-600 text-xs mt-1">{errors[`discount_${idx}_minSpend`]}</p>
                          )}
                        </div>

                        {rule.name && rule.amount && rule.minSpend && (
                          <div className="bg-white border-2 border-green-300 rounded-lg p-3 mt-3">
                            <p className="text-sm text-green-800">
                              <Check className="w-4 h-4 inline mr-1" />
                              <span className="font-bold">{rule.name}:</span> Get {rule.type === "percentage" ? `${rule.amount}%` : `₱${rule.amount}`} off on orders ₱{rule.minSpend}+
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
                className="w-full bg-coffee-700 text-white px-4 py-3 rounded-xl font-semibold shadow-md hover:bg-coffee-800 transition mt-4 flex items-center justify-center gap-2"
                onClick={addDiscountRule}
              >
                <Tag className="w-5 h-5" />
                Add Another Discount
              </button>
            </div>

            {/* Tax Settings */}
            <div>
              <label className={labelClass}>
                <Percent className="w-5 h-5 text-coffee-600" />
                Tax / VAT Settings
                <button
                  type="button"
                  className="text-coffee-600 hover:text-coffee-800 transition"
                  onClick={() => showTooltip(help.taxOn)}
                >
                  <Info className="w-4 h-4" />
                </button>
              </label>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 bg-coffee-50 p-3 rounded-lg border-2 border-coffee-200">
                  <input
                    type="checkbox"
                    checked={taxOn}
                    onChange={e => setTaxOn(e.target.checked)}
                    className="accent-coffee-700 w-5 h-5 cursor-pointer rounded"
                    id="taxOn"
                  />
                  <label htmlFor="taxOn" className="font-semibold text-coffee-900 cursor-pointer">
                    Enable Tax/VAT
                  </label>
                </div>
                {taxOn && (
                  <div className="flex-1 relative">
                    <input
                      type="number"
                      value={taxRate}
                      min={0}
                      max={100}
                      onChange={e => setTaxRate(e.target.value)}
                      className={inputClass + " pr-10"}
                      placeholder="12"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-coffee-700 font-bold">%</span>
                  </div>
                )}
              </div>
              {errors.taxRate && (
                <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.taxRate}
                </p>
              )}
            </div>

            {/* Receipt Settings */}
            <div className="space-y-4">
              <div>
                <label className={labelClass} htmlFor="receiptHeader">
                  <Receipt className="w-5 h-5 text-coffee-600" />
                  Receipt Header
                  <button
                    type="button"
                    className="text-coffee-600 hover:text-coffee-800 transition"
                    onClick={() => showTooltip(help.receiptHeader)}
                  >
                    <Info className="w-4 h-4" />
                  </button>
                </label>
                <input
                  type="text"
                  value={receiptHeader}
                  onChange={e => setReceiptHeader(e.target.value)}
                  className={inputClass}
                  id="receiptHeader"
                  placeholder="Thank you for your purchase!"
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="receiptFooter">
                  <Receipt className="w-5 h-5 text-coffee-600" />
                  Receipt Footer
                  <button
                    type="button"
                    className="text-coffee-600 hover:text-coffee-800 transition"
                    onClick={() => showTooltip(help.receiptFooter)}
                  >
                    <Info className="w-4 h-4" />
                  </button>
                </label>
                <input
                  type="text"
                  value={receiptFooter}
                  onChange={e => setReceiptFooter(e.target.value)}
                  className={inputClass}
                  id="receiptFooter"
                  placeholder="Visit us again soon!"
                />
              </div>
            </div>

            {/* GCash QR Code */}
            <div>
              <label className={labelClass}>
                <Upload className="w-5 h-5 text-coffee-600" />
                GCash QR Code
                <button
                  type="button"
                  className="text-coffee-600 hover:text-coffee-800 transition"
                  onClick={() => showTooltip(help.gcashQR)}
                >
                  <Info className="w-4 h-4" />
                </button>
              </label>
              <p className="text-sm text-coffee-600 mb-3">
                Upload your GCash QR code for customer payments
              </p>
              
              {!gcashQRPreview ? (
                <div className="border-2 border-dashed border-coffee-300 rounded-xl p-8 text-center hover:border-coffee-500 hover:bg-coffee-50 transition cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleGcashQRUpload}
                    className="hidden"
                    id="gcashQRUpload"
                  />
                  <label htmlFor="gcashQRUpload" className="cursor-pointer">
                    <Upload className="w-12 h-12 text-coffee-400 mx-auto mb-3" />
                    <p className="text-coffee-700 font-semibold mb-1">Click to upload QR code</p>
                    <p className="text-coffee-500 text-sm">PNG, JPG up to 5MB • 300x300px recommended</p>
                  </label>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-coffee-50 to-coffee-100 rounded-xl p-5 border-2 border-coffee-300">
                  <div className="flex items-start gap-4">
                    <img 
                      src={gcashQRPreview} 
                      alt="GCash QR Code" 
                      className="w-32 h-32 object-contain rounded-xl border-2 border-coffee-400 bg-white"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Check className="w-5 h-5 text-green-600" />
                        <p className="text-coffee-900 font-bold">QR Code Uploaded</p>
                      </div>
                      <p className="text-coffee-600 text-sm mb-3">
                        Customers will see this QR code for GCash payments
                      </p>
                      <div className="flex gap-2">
                        <label htmlFor="gcashQRUpload" className="bg-coffee-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-coffee-800 transition cursor-pointer flex items-center gap-2">
                          <Upload className="w-4 h-4" />
                          Replace
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
                          className="bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-200 transition flex items-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {errors.gcashQR && (
                <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.gcashQR}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-end mt-8">
        <button
          className="bg-gray-200 text-gray-700 px-8 py-3 rounded-xl font-bold shadow-md hover:bg-gray-300 transition flex items-center justify-center gap-2 disabled:opacity-50"
          onClick={handleReset}
          disabled={saving}
        >
          <RotateCcw className="w-5 h-5" />
          Reset to Defaults
        </button>
        <button
          className="bg-coffee-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-coffee-800 hover:shadow-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Settings
            </>
          )}
        </button>
      </div>
    </div>
  );
}