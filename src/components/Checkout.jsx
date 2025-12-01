import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { collection, doc, setDoc, serverTimestamp, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { CreditCard, Truck, Mail, CheckCircle, Trash2, Plus, Minus } from "lucide-react";

export default function Checkout() {
  const [userData, setUserData] = useState({});
  const [addresses, setAddresses] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
 

  const uid = localStorage.getItem("authToken");

  

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

  // Shipping state
  const [shipping, setShipping] = useState({
    type: "delivery",
    address: "",
    pickupLocation: "Main Branch - Kawit",
    schedule: "now",
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


  const [pickupTime, setPickupTime] = useState("now");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [payment, setPayment] = useState({ method: "cod" });

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setItems(storedCart);
  }, []);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = shipping.type === "delivery" ? 60 : 0;
  const grandTotal = subtotal + deliveryFee;

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

  const handleCheckout = async () => {
    if (!items.length) return alert("Cart is empty!");

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
      setSuccess({ id: orderId, eta: shipping.type === "delivery" ? "1-2 hours" : "Ready in 20–30 mins" });
      localStorage.removeItem("cart");
      setItems([]);
    } catch (err) {
      console.error(err);
      alert("Checkout failed.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen mt-16 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-black">Checkout</h1>
          <Link to="/menu">
            <button className="px-4 py-2 rounded-lg bg-yellow-950 text-white font-medium hover:bg-yellow-800">
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
                  <span className="text-sm text-gray-500">(₱60)</span>
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
                    onChange={() => setShipping({ ...shipping, type: 'pickup' })}
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
                        onChange={() => setShipping({ ...shipping, schedule: "later" })}
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
                    value={shipping.address}
                    onChange={(v) => setShipping({ ...shipping, address: v })}
                    placeholder="Street, House no."
                    required
                  />
                  <Input
                    label="City"
                    value={shipping.city}
                    onChange={(v) => setShipping({ ...shipping, city: v })}
                    required
                  />
                  <Input
                    label="Province"
                    value={shipping.province}
                    onChange={(v) => setShipping({ ...shipping, province: v })}
                  />
                  <Input
                    label="ZIP"
                    value={shipping.zip}
                    onChange={(v) => setShipping({ ...shipping, zip: v })}
                  />
                  <textarea
                    className="col-span-1 md:col-span-2 mt-2 p-3 border border-gray-200 rounded-lg"
                    placeholder="Delivery notes (optional)"
                    value={shipping.notes}
                    onChange={(e) => setShipping({ ...shipping, notes: e.target.value })}
                  />
                </div>
              )}

              {/* Pickup Section (unchanged) */}
              {shipping.type === 'pickup' && (
                <div className="mt-4 flex flex-col gap-3">
                  <p className="text-sm">Pickup location: <span className="font-medium">{shipping.pickupLocation}</span></p>

                  <div className="flex gap-4 mb-2">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="radio"
                        name="pickupTime"
                        value="now"
                        checked={pickupTime === "now"}
                        onChange={() => setPickupTime("now")}
                        className="accent-yellow-950"
                      />
                      Now
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="radio"
                        name="pickupTime"
                        value="later"
                        checked={pickupTime === "later"}
                        onChange={() => setPickupTime("later")}
                        className="accent-yellow-950"
                      />
                      Schedule
                    </label>
                  </div>

                  {pickupTime === "later" && (
                    <div className="flex gap-4">
                      <input
                        type="date"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        className="border rounded px-2 py-1 w-1/2"
                      />
                      <input
                        type="time"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
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

                <label className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border cursor-not-allowed ${payment.method === 'wallet' ? 'border-orange-400 bg-orange-50' : 'border-gray-200 text-gray-400'} opacity-50`}>
                  <input type="radio" name="pay" checked={payment.method === 'wallet'} onChange={() => setPayment({ method: 'wallet' })} className="hidden" disabled />
                  GCash / Paymaya (coming soon)
                </label>
              </div>
            </SectionCard>
          </div>

          {/* Right: summary */}
          <aside className="lg:col-span-4 text-black">
            <div className="lg:sticky lg:top-20 space-y-4">
              <div className="bg-white rounded-2xl p-5 shadow">
                <h3 className="text-lg font-semibold">Order Summary</h3>
                <div className="mt-3 space-y-3">
                  {items.map(it => (
                    <div key={it.id} className="flex items-center gap-3">
                      <img src={it.img} alt={it.name} className="w-16 h-16 rounded-lg object-cover" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{it.name}</div>
                            <div className="text-sm text-gray-500">₱{it.price.toFixed(2)}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => updateQty(it.id, -1)} className="p-1 border rounded cursor-pointer"><Minus size={14} /></button>
                            <div className="px-3">{it.quantity}</div>
                            <button onClick={() => updateQty(it.id, 1)} className="p-1 border rounded cursor-pointer"><Plus size={14} /></button>
                            <button onClick={() => removeItem(it.id)} className="ml-2 text-red-500 p-1 rounded cursor-pointer"><Trash2 size={14} /></button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <hr className="my-3" />
                <div className="text-sm text-gray-600 space-y-2">
                  <div className="flex justify-between"><span>Subtotal</span><span>₱{subtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>Delivery</span><span>₱{deliveryFee.toFixed(2)}</span></div>
                  <div className="flex justify-between font-semibold text-lg mt-2"><span>Total</span><span>₱{grandTotal.toFixed(2)}</span></div>
                </div>

                <button onClick={handleCheckout} disabled={loading} className="mt-4 w-full py-3 rounded-lg bg-yellow-950 text-white font-semibold disabled:opacity-50">
                  {loading ? "Processing..." : "Place Order"}
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
            <button onClick={handleCheckout} disabled={loading} className="px-6 py-3 rounded-lg bg-yellow-950 text-white font-semibold disabled:opacity-50">
              {loading ? "Processing..." : "Place Order"}
            </button>
          </div>
        </div>

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

function Input({ label, value, onChange, placeholder = '', required = false, icon = null }) {
  return (
    <label className="block">
      <div className="text-sm flex items-center gap-2 mb-1">
        {icon}
        <span className="font-medium">{label}{required && <span className="text-red-500 ml-1">*</span>}</span>
      </div>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-200" />
    </label>
  );
}
