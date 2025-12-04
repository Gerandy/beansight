import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { collection, doc, setDoc, serverTimestamp, onSnapshot, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { calculateDeliveryFeeUtil } from "../utils/calculateDeliveryFee";
import { CreditCard, Truck, Mail, CheckCircle, Trash2, Plus, Minus, Package, ChevronDown, ChevronUp } from "lucide-react";
import { useCart } from "./CartContext";
import { loadGoogleMaps } from "../utils/loadGoogleMaps";



export default function Checkout() {
  const [userData, setUserData] = useState({});
  const [addresses, setAddresses] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState();
  const [success, setSuccess] = useState(null);
  const [expandedItems, setExpandedItems] = useState({});
  const [deliveryFees, setDeliveryFee] = useState(0);
  const uid = localStorage.getItem("authToken");
  const [settings, setSettings] = useState(0);
  const { clearCart } = useCart(); // ← get clearCart from context
  const [qr, setQr] = useState("");
  
  
  useEffect(() => {
      const loadSettings = async () => {
        setLoading(true);
        try {
          const docRef = await getDoc(doc(db, "settings", "mapRadius"));
          if (docRef.exists()) {
            const data = docRef.data();
            setSettings(data);
          }
        } catch (err) {
          console.error("Error loading settings:", err);
        } finally {
          setLoading(false);
        }
      };
  
      loadSettings();
    }, []); 


  
    const [storeTime, setStoreTime] = useState({});
    const [showGcashModal, setShowGcashModal] = useState(false);

    const [orderType, setOrderType] = useState({
      delivery: true,
      pickup: true
    });
    const [taxRate, setTaxRate] = useState(0);
    const [onlineOrder, setOnlineOrder] = useState(true);
    const [paymentMet, setPaymentMet] = useState(false);
    const [minOrder, setMinOrder] = useState(0);
    const [open, setOpen] = useState(false);
    useEffect(()=>{
    const loadStorePref = async () =>{
      const docRef = await getDoc(doc(db, "settings", "storePref"));
      if(!docRef.exists()) return;
      const data = docRef.data();
      // set individual fields from storePref document (guarding against missing keys)
      setPaymentMet(!!data.paymentMethods);
      setOnlineOrder(!!data.onlineOrder);
      setTaxRate(Number(data.taxRate ?? 0));
      setOpen(Boolean(data.storeOpen));
      setOrderType(data.orderType ?? orderType);
      setMinOrder(data.minOrder ?? minOrder);
      setStoreTime(data.storeTime ?? {});
      setQr(data.qr);

      // Debug logs for troubleshooting
      
    }
    loadStorePref();
  },[])
    console.log("PRICESSS",deliveryFees);
    
  
    
  

  // Fetch user document and addresses subcollection in real-time
  useEffect(() => {
    if (!uid) return;

    const userRef = doc(db, "users", uid);
    const unsubUser = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        setUserData(docSnap.data());
      }
    });

    const addressesRef = collection(db, "users", uid, "addresses");
    const unsubAddresses = onSnapshot(addressesRef, (snapshot) => {
      const addrData = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setAddresses(addrData);
    });

    return () => {
      unsubUser();
      unsubAddresses();
    };
  }, [uid]);

  const defaultAddress = addresses?.find(addr => addr.isDefault);

  // Shipping state (unified)
  const [shipping, setShipping] = useState({
    type: "delivery",
    address: "",
    pickupLocation: "Main Branch - Kawit",
    schedule: "now", // "now" or "later"
    scheduledDate: "",
    scheduledTime: ""
  });

  // Update shipping when default address changes
  useEffect(() => {
    if (defaultAddress) {
      setShipping(s => ({
        ...s,
        address: defaultAddress?.details,

      }));
    }
  }, [defaultAddress]);


  const [payment, setPayment] = useState({ method: "cod" });

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setItems(storedCart);
  }, []);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  // normalize min order value (support either number or { minOrder: number })
  const minOrderValue = Number(minOrder?.minOrder ?? minOrder ?? 0);

  const grandTotal = subtotal + (settings.feeType === "flat" ? settings.flatFee : deliveryFees);

  useEffect(() => {
    // 1. Check if it's pickup. If so, set fee to 0 and stop.
    if (shipping.type === "pickup") {
        setDeliveryFee(0);
        return; // IMPORTANT: Exit the effect early!
    }

    // 2. Only proceed with delivery calculation if:
    //    a) shipping.type is 'delivery'
    //    b) defaultAddress is available
    if (shipping.type === "delivery" && defaultAddress) {
        const handleDeliveryCalculation = async (lat, long) => {
            try {
                // Hardcoded origin is acceptable for this calculation if necessary
                const origin = "14.4427288619125,120.9102805815219"; 
                const destination = `${lat},${long}`;
                // Assuming calculateDeliveryFeeUtil is an async function that works
                const { fee } = await calculateDeliveryFeeUtil(origin, destination);
                setDeliveryFee(fee);
                // Note: Removed the call to the non-existent calculateDeliveryFee(fee, type);
            } catch (error) {
                console.error("Delivery calculation failed:", error);
                setDeliveryFee(0); // Set a sensible default/error fee
            }
        };

        handleDeliveryCalculation(defaultAddress.lat, defaultAddress.long);
    } else {
        // Fallback for when defaultAddress is not yet loaded for delivery type
        setDeliveryFee(0); 
    }

}, [defaultAddress, shipping.type]); // Dependencies remain correct


  // Recalculate delivery fee when shipping type changes
 


  const updateQty = (id, delta) => {
    const updated = items.map(item =>
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    );
    setItems(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const removeItem = (id) => {
    const updated = items.filter(item => item.id !== id);
    setItems(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const toggleItemDetails = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const handleCheckout = async () => {
    if (!items.length) return alert("Cart is empty!");
    if (subtotal < minOrderValue) return alert(`Minimum order is ₱${minOrderValue.toFixed(2)}. Add more items to continue.`);
    
    if (shipping.type === "delivery" && (!shipping.address )) {
      return alert("Please fill out all delivery fields.");
    }

    setLoading(true);
    const orderId = `ORD-${Date.now().toString().slice(-6)}`;

    const orderData = {
      id: orderId,
      uid,
      user: {
        uid,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData?.number || "",
        address: shipping.type === "delivery" ? shipping : {}
      },
      items,
      total: grandTotal,
      status: "Pending",
      createdAt: serverTimestamp(),
      paymentMethod: payment.method,
      orderType: shipping.type,
      schedule: shipping.schedule === "later" ? { date: shipping.scheduledDate, time: shipping.scheduledTime } : { now: true },
      completedAt: new Date().toISOString(),
    };

    try {
      const orderRef = doc(collection(db, "orders"), orderId);
      await setDoc(orderRef, orderData);

      // Clear cart everywhere (context + local storage + local state)
      clearCart();                // ← empties CartSidebar immediately
      localStorage.removeItem("cart");
      setItems([]);

      setSuccess({ id: orderId, eta: shipping.type === "delivery" ? "1-2 hours" : "Ready in 20–30 mins" });
    } catch (err) {
      console.error(err);
      alert("Checkout failed.");
    }

    setLoading(false);
  };

  // Check if store is open (uses storePref.storeTime map)
  const isStoreOpen = () => {
  try {
    
    // 1. If storeOpen flag is false → always closed
    if (!open) {
      return false;
    }

    // 2. Prepare current time
    const now = new Date();
    const dayIndex = now.getDay(); // 0 = Sun
    const hh = now.getHours().toString().padStart(2, "0");
    const mm = now.getMinutes().toString().padStart(2, "0");
    const currentTime = `${hh}:${mm}`;

    const dayKeys = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    const todayKey = dayKeys[dayIndex];

    
    const today = storeTime?.[todayKey];

    // 3. If no config or disabled → closed
    if (!today || today.enabled === false) {
      
      return false;
    }

    // 4. If no opening hours provided → treat as always open
    if (!today.time) {
      
      return true;
    }

    const cutoff = today.time;
   

    // 5. Check if current time is before or at cutoff
    const openNow = currentTime <= cutoff;
 

    return openNow;
  } catch (err) {
    console.error("isStoreOpen() Error:", err);
    // Safe fallback
    return true;
  }
};


  const storeOpen = isStoreOpen(); // computed, not state
  

  return (
    
    <div className="min-h-screen mt-16 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-black">CHECKOUT</h1>
          <Link to="/menu">
            <button className="cursor-pointer px-4 py-2 rounded-lg bg-yellow-950 text-white font-medium hover:bg-yellow-800">
              Continue shopping
            </button>
          </Link>
        </header>

        {/* Grid: forms + summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: forms */}
          <div className="lg:col-span-8 space-y-6">
            {/* Contact info */}
            <SectionCard title="Contact information" icon={<Mail size={18} />}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input label="Full name" value={`${userData?.firstName || ""} ${userData?.lastName || ""}`} />
                <Input label="Email" value={userData?.email || ""} required />
                <Input label="Phone" value={userData?.contactNumber || ""} required />
              </div>
            </SectionCard>

            {/* Shipping */}
            <SectionCard title="Shipping & pickup" icon={<Truck size={18} />}>
              <div className="flex gap-3">
                <label
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer ${
                    shipping.type === 'delivery' ? 'border-orange-400 bg-orange-50' : 'border-gray-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="shiptype"
                    checked={shipping.type === 'delivery'}
                    onChange={() => setShipping({ ...shipping, type: 'delivery' })}
                    className="hidden"
                  />
                  <span className="font-medium">Delivery</span>
                  <span className="text-sm text-gray-500">₱{shipping.type === 'delivery' ? deliveryFees.toFixed(2) : '0.00'}</span>
                </label>

                <label
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer ${
                    shipping.type === 'pickup' ? 'border-orange-400 bg-orange-50' : 'border-gray-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="shiptype"
                    checked={shipping.type === 'pickup'}
                    onChange={() => {
                      setShipping({ ...shipping, type: 'pickup' });
                      setDeliveryFee(0); // Reset delivery fee for pickup
                    }}
                    className="hidden"
                  />
                  <span className="font-medium">Pickup</span>
                </label>
              </div>

              {/* Delivery Section */}
              {shipping.type === 'delivery' && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Delivery: Now or Schedule */}
                  <div className="col-span-1 md:col-span-2 flex gap-4">
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="deliverySchedule"
                        value="now"
                        checked={shipping.schedule === "now"}
                        onChange={() => setShipping({ ...shipping, schedule: "now", scheduledDate: "", scheduledTime: "" })}
                        className="accent-yellow-950"
                      />
                      Now
                    </label>
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="deliverySchedule"
                        value="later"
                        checked={shipping.schedule === "later"}
                        onChange={() => {
                          setShipping({ ...shipping, schedule: "later" });
                          // Recalculate delivery fee when scheduling changes
                        }}
                        className="accent-yellow-950"
                      />
                      Schedule
                    </label>
                  </div>

                  {shipping.schedule === "later" && (
                    <>
                      <input
                        type="date"
                        value={shipping.scheduledDate}
                        onChange={(e) => setShipping({ ...shipping, scheduledDate: e.target.value })}
                        className="border rounded px-2 py-1 w-1/2 cursor"
                      />
                      <input
                        type="time"
                        value={shipping.scheduledTime}
                        onChange={(e) => setShipping({ ...shipping, scheduledTime: e.target.value })}
                        className="border rounded px-2 py-1 w-1/2 cursor"
                      />
                    </>
                  )}

                 <Input
                    label="Address"
                    value={shipping.address || ""}
                    onChange={(v) => setShipping({ ...shipping, address: v })}
                    placeholder="Street, House no."
                    required
                    readOnly={true}  // now this will work!
                  />

                  
                  
                  <textarea
                    className="col-span-1 md:col-span-2 mt-2 p-3 border border-gray-200 rounded-lg"
                    placeholder="Delivery notes (optional)"
                    value={shipping.notes}
                    onChange={(e) => setShipping({ ...shipping, notes: e.target.value })}
                  />
                </div>
              )}

              {/* Pickup Section */}
              {shipping.type === 'pickup' && (
                <div className="mt-4 flex flex-col gap-3">
                  <p className="text-sm">Pickup location: <span className="font-medium">{shipping.pickupLocation}</span></p>

                  <div className="flex gap-4 mb-2">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="radio"
                        name="pickupTime"
                        value="now"
                        checked={shipping.schedule === "now"}
                        onChange={() => setShipping({ ...shipping, schedule: "now", scheduledDate: "", scheduledTime: "" })}
                        className="accent-yellow-950"
                      />
                      Now
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="radio"
                        name="pickupTime"
                        value="later"
                        checked={shipping.schedule === "later"}
                        onChange={() => setShipping({ ...shipping, schedule: "later" })}
                        className="accent-yellow-950"
                      />
                      Schedule
                    </label>
                  </div>

                  {shipping.schedule === "later" && (
                    <div className="flex gap-4">
                      <input
                        type="date"
                        value={shipping.scheduledDate}
                        onChange={(e) => setShipping({ ...shipping, scheduledDate: e.target.value })}
                        className="border rounded px-2 py-1 w-1/2"
                      />
                      <input
                        type="time"
                        value={shipping.scheduledTime}
                        onChange={(e) => setShipping({ ...shipping, scheduledTime: e.target.value })}
                        className="border rounded px-2 py-1 w-1/2"
                      />
                    </div>
                  )}

                  <div className="w-full h-64 rounded-lg overflow-hidden border border-gray-200">
                    <iframe
                      title="Pickup Location"
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      style={{ border: 0 }}
                      src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBGvh2aLua0lajoAnSJjRm0S-XUVSof6RY&q=Sol-ace Café&zoom=19`}
                      allowFullScreen
                    />
                  </div>

                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=Sol-ace+Café`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-4 py-2 bg-yellow-950 text-white rounded-lg hover:bg-yellow-800 transition"
                  >
                    Get Directions
                  </a>
                </div>
              )}
            </SectionCard>

            {/* Payment */}
            <SectionCard title="Payment" icon={<CreditCard size={18} />}>
              <div className="flex gap-3">
                <label className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer ${payment.method === 'cod' ? 'border-orange-400 bg-orange-50' : 'border-gray-200'}`}>
                  <input type="radio" name="pay" checked={payment.method === 'cod'} onChange={() => setPayment({ method: 'cod' })} className="hidden" />
                  Cash on delivery
                </label>

                <label className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer ${payment.method === 'wallet' ? 'border-orange-400 bg-orange-50' : 'border-gray-200'} `}>
                  <input type="radio" name="pay" checked={payment.method === 'wallet'} onChange={() => {
                      setPayment({ method: 'wallet' });
                      setShowGcashModal(true); // ← OPEN MODAL HERE
                    }} className="hidden"/>
                  GCash / Paymaya 
                </label>
              </div>
            </SectionCard>
          </div>

          {/* Right: summary */}
          <aside className="lg:col-span-4 text-black">
            <div className="lg:sticky lg:top-20 space-y-4">
              <div className="bg-white rounded-2xl p-5 shadow">
                <h3 className="text-lg font-semibold mb-3">Order Summary</h3>
                {/* Added max-height and overflow-y-auto with custom scrollbar */}
                <div className="mt-3 space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
                  {items.map(it => {
                    const isExpanded = expandedItems[it.id];
                    const hasAddons = it.addons && it.addons.length > 0;
                    
                    return (
                      <div key={it.id} className="border-b border-gray-100 pb-3 last:border-0">
                        <div className="flex items-start gap-3">
                          <img src={it.img} alt={it.name} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <div className="font-medium text-sm">{it.name}</div>
                                {it.size && (
                                  <div className="text-xs text-gray-500 mt-0.5">Size: {it.size}</div>
                                )}
                                
                                {/* View Details Button */}
                                {hasAddons && (
                                  <button
                                    onClick={() => toggleItemDetails(it.id)}
                                    className="text-xs text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1 mt-1 transition"
                                  >
                                    {isExpanded ? (
                                      <>
                                        Hide Details <ChevronUp className="w-3 h-3" />
                                      </>
                                    ) : (
                                      <>
                                        View Details <ChevronDown className="w-3 h-3" />
                                      </>
                                    )}
                                  </button>
                                )}

                                {/* Display Add-ons - Collapsible */}
                                {hasAddons && isExpanded && (
                                  <div className="mt-2 bg-orange-50 rounded-lg p-2 animate-slideDown">
                                    <div className="flex items-center gap-1 text-xs font-medium text-orange-700 mb-1">
                                      <Package size={12} />
                                      Add-ons:
                                    </div>
                                    {it.addons.map((addon, idx) => (
                                      <div key={idx} className="flex justify-between text-xs text-gray-600 ml-4 py-0.5">
                                        <span>
                                          • {addon.name} {addon.qty > 1 && <span className="text-gray-400">(×{addon.qty})</span>}
                                        </span>
                                        <span className="font-medium text-orange-600">
                                          +₱{(addon.price * addon.qty).toFixed(2)}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                <div className="flex items-center justify-between mt-2">
                                  <div className="text-sm text-gray-600">
                                    ₱{it.price.toFixed(2)} × {it.quantity}
                                  </div>
                                  <div className="font-semibold text-sm">
                                    ₱{(it.price * it.quantity).toFixed(2)}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 mt-2">
                              <div className="flex items-center gap-1 bg-gray-100 rounded-md">
                                <button 
                                  onClick={() => updateQty(it.id, -1)} 
                                  className="p-1.5 hover:bg-gray-200 rounded-l-md cursor-pointer transition"
                                >
                                  <Minus size={14} />
                                </button>
                                <div className="px-3 text-sm font-medium">{it.quantity}</div>
                                <button 
                                  onClick={() => updateQty(it.id, 1)} 
                                  className="p-1.5 hover:bg-gray-200 rounded-r-md cursor-pointer transition"
                                >
                                  <Plus size={14} />
                                </button>
                              </div>
                              <button 
                                onClick={() => removeItem(it.id)} 
                                className="ml-auto text-red-500 p-1.5 rounded hover:bg-red-50 cursor-pointer transition"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <hr className="my-4" />
                <div className="text-sm text-gray-600 space-y-2">
                  <div className="flex justify-between"><span>Subtotal</span><span>₱{subtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>Delivery</span><span>₱{deliveryFees.toFixed(2)}</span></div>
                  <div className="flex justify-between font-semibold text-lg mt-2 pt-2 border-t border-gray-200">
                    <span>Total</span>
                    <span>₱{grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={loading || subtotal < minOrderValue || !storeOpen}
                  className="mt-4 w-full py-3 rounded-lg bg-yellow-950 text-white font-semibold disabled:opacity-50 hover:bg-yellow-800 transition cursor-pointer"
                >
                  {loading
                    ? "Processing..."
                    : !storeOpen
                    ? "Store is Closed"
                    : subtotal < minOrderValue
                      ? `Minimum order ₱${minOrderValue.toFixed(2)}`
                      : "Place Order"}
                      
                </button>
              </div>
            </div>
          </aside>
        </div>

        {/* Mobile sticky bar */}
        <div className="fixed inset-x-0 bottom-0 p-3 bg-white shadow-md lg:hidden z-30">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Total</div>
              <div className="font-semibold">₱{grandTotal.toFixed(2)}</div>
            </div>
            <button
              onClick={handleCheckout}
              disabled={loading || subtotal < minOrderValue || !storeOpen}
              className="px-6 py-3 rounded-lg bg-yellow-950 text-white font-semibold disabled:opacity-50"
            >
              {loading ? "Processing..." : !storeOpen ? "Store Closed" : subtotal < minOrderValue ? `Min ₱${minOrderValue.toFixed(2)}` : "Place Order"}
            </button>
          </div>
        </div>
        <AnimatePresence>
  {showGcashModal && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[999]"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-white p-6 rounded-xl shadow-xl w-[90%] max-w-sm text-center relative"
      >
        <h2 className="text-xl font-bold mb-4">GCash Payment</h2>

        {/* --- QR CODE IMAGE PLACEHOLDER --- */}
        <div className="w-full flex justify-center mb-4">
          <div className="w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
            <span className="text-gray-500 text-sm">
              <img
  src={qr}
  alt="GCash QR"
  className="w-48 h-48 object-cover rounded-lg"
/>
            </span>
          </div>
        </div>

        {/* --- TOTAL AMOUNT --- */}
        <p className="text-lg font-semibold mb-6">
          Total: <span className="text-green-600">₱{grandTotal}</span>
        </p>

        {/* --- CLOSE BUTTON --- */}
        <button
          onClick={() => {
          setShowGcashModal(false);
          handleCheckout(); // <-- Trigger place order here too
        }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-full"
        >
          Done
        </button>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

        {/* Success Modal */}
        <AnimatePresence>
          {success && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/40" onClick={() => setSuccess(null)} />
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative z-50 bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-green-500" />
                  <div>
                    <h3 className="text-xl font-semibold">Order confirmed</h3>
                    
                    <div className="text-sm text-gray-500">Order #{success.id} — {success.eta}</div>
                  </div>
                </div>
                <div className="mt-4 text-sm">You can track your order in the Orders page.</div>
                <div className="mt-6 flex justify-end">
                  <Link to="/orders" className="px-4 py-2 rounded-md bg-yellow-950 text-white">View order</Link>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            max-height: 0;
          }
          to {
            opacity: 1;
            max-height: 200px;
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
        
        /* Custom scrollbar styles */
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 10px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </div>
  );
}

// Helper components
function SectionCard({ title, children, icon }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-orange-50 rounded-md text-orange-600">{icon}</div>
        <h3 className="font-semibold">{title}</h3>
      </div>
      <div>{children}</div>
    </div>
  );
}

function Input({ label, value, onChange, placeholder = '', required = false, icon = null, readOnly = false, disabled = false }) {
  return (
    <label className="block">
      <div className="text-sm flex items-center gap-2 mb-1">
        {icon}
        <span className="font-medium">{label}{required && <span className="text-red-500 ml-1">*</span>}</span>
      </div>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}       // ← add this
        disabled={disabled}       // ← optional
        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-200"
      />
    </label>
  );
}

