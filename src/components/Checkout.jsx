import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useData } from "../datafetcher";
import { collection, addDoc, serverTimestamp, doc, setDoc  } from "firebase/firestore";
import { db } from "../firebase";


import {
  CreditCard,
  Truck,
  MapPin,
  User,
  Mail,
  CheckCircle,
  Percent,
  Trash2,
  Plus,
  Minus,
  Eye,
} from "lucide-react";


  






const SAMPLE_ITEMS = [
  {
    id: 1,
    name: "Bilao Fiesta (Large)",
    price: 880,
    qty: 1,
    img: "https://images.unsplash.com/photo-1604908177074-5c3e6ae2b2a6?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=example",
  },
  {
    id: 2,
    name: "Extra Rice (1kg)",
    price: 120,
    qty: 2,
    img: "https://images.unsplash.com/photo-1546069901-eacef0df6022?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=example",
  },
];


export default function Checkout() {

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
   const [qrData, setQrData] = useState(null); // 🟢 this stores PayMongo QR response

  
  const [qrPayment, setQrPayment] = useState(null);


  const [info, setInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
  });

  
  const {  userData  } = useData();
  

  const defaultAddress = userData.addresses?.find(addr => addr.isDefault);
  const contactNum = userData.contactNumber?.[0];

  const firstName = userData?.firstName || "";
  const lastName = userData?.lastName || "";
  const email = userData?.email || ""; 


   const handleCheckout = async () => {
  if (!items.length) return alert("Cart is empty!");
  setLoading(true);

  const uid = localStorage.getItem("authToken");
  const orderId = `ORD-${Date.now().toString().slice(-6)}`;

  const orderData = {
    id: orderId,
    uid,
    user: {
      uid,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      phone: contactNum?.number || "",
      address: defaultAddress || {},
    },
    items,
    total: grandTotal,
    status: "Pending",
    createdAt: serverTimestamp(),
    completedAt: new Date().toISOString(),
    paymentMethod: payment.method,
  };

  try {
    // Save to Firestore
    const orderRef = doc(collection(db, "orders"), orderId);
    await setDoc(orderRef, orderData);

    // 👇 XENDIT PAYMENT
    if (payment.method === "wallet") {
      const res = await fetch("http://localhost:3001/create-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: grandTotal,
          orderId,
          description: "Sol-Ace Order Payment"
        })
      });

      const data = await res.json();

      if (data.invoiceUrl) {
        window.location.href = data.invoiceUrl; // redirect to GCash checkout
        return;
      } else {
        alert("Payment error. Check backend.");
      }
    }

    // For COD or CARD (placeholder)
    setSuccess({ id: orderId, eta: shipping.type === "delivery" ? "1-2 hours" : "Ready in 20–30 mins" });
    localStorage.removeItem("cart");

  } catch (err) {
    console.error(err);
    alert("Checkout failed.");
  }

  setLoading(false);
};





    

   
   
  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      setItems(JSON.parse(storedCart));
    }
  }, []);

  

useEffect(() => {
  const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
  setItems(savedCart);
}, []);

const subtotal = items.reduce(
  (sum, item) => sum + item.price * item.quantity,
  0
);

const discount = 0;
const deliveryFee = 50;
const grandTotal = subtotal - discount + deliveryFee;

  

function updateQty(id, delta) {
  const updated = items.map(item =>
    item.id === id
      ? { ...item, quantity: Math.max(1, (item.quantity || 1) + delta) }
      : item
  );
  setItems(updated);
}



const removeItem = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  

  const [shipping, setShipping] = useState({
    type: "delivery", 
    address: "",
    city: "",
    province: "",
    zip: "",
    notes: "",
    pickupLocation: "Main Branch - Kawit",
  });

  const [payment, setPayment] = useState({ method: "card", cardNumber: "", expiry: "", cvv: "", saveCard: false });

  // simple validations
  const infoValid = info.fullName.trim() && /@/.test(info.email) && /^\+?[0-9]{7,}$/.test(info.phone);
  const shippingValid = shipping.type === "pickup" ? true : (shipping.address.trim() && shipping.city.trim());
  const paymentValid = payment.method === "card" ? (payment.cardNumber.replace(/\s/g, '').length >= 12 && payment.cvv.length >= 3) : true;

  // const subtotal = useMemo(() => items.reduce((s, it) => s + it.price * it.qty, 0), [items]);
  // const discount = appliedPromo ? appliedPromo.amount : 0;
  // const deliveryFee = shipping.type === "delivery" ? 60 : 0;
  // const tax = Math.round((subtotal - discount + deliveryFee) * 0.5);
  // const total = subtotal - discount + deliveryFee + tax;


 

  // function applyPromo() {
  //   // demo promo rules
  //   if (!promo) return;
  //   const p = promo.trim().toUpperCase();
  //   if (p === "BILAO10") {
  //     setAppliedPromo({ code: p, amount: Math.round(subtotal * 0.10) });
  //   } else if (p === "SHIPPINGFREE") {
  //     setAppliedPromo({ code: p, amount: deliveryFee });
  //   } else {
  //     setAppliedPromo({ code: p, amount: 0, invalid: true });
  //   }
  // }

  async function placeOrder() {
    if (!infoValid || !shippingValid || !paymentValid) {
      // quick guard
      alert("Please complete required fields before placing the order.");
      return;
    }

    setLoading(true);
    // simulate API call
    await new Promise(r => setTimeout(r, 1400));
    setLoading(false);

    const orderId = `ORD-${Date.now().toString().slice(-6)}`;
    setSuccess({ id: orderId, eta: shipping.type === "delivery" ? `1-2 hours` : `Ready in 20–30 mins` });

    // reset cart or keep as history depending on your needs
    // setItems([]);
  }

  // Small confetti-like component (CSS based)
  function ConfettiLite() {
    return (
      <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
        <div className="absolute inset-0">
          {[...Array(18)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: -20, x: 0, opacity: 1 }}
              animate={{ y: 700, rotate: Math.random() * 360, opacity: 0 }}
              transition={{ duration: 1.6 + Math.random() * 0.6, delay: Math.random() * 0.6 }}
              className={`absolute w-2 h-3 bg-orange-400 rounded-sm`}
              style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 10}%`, background: `hsl(${Math.random() * 360} 90% 60%)` }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    
    <div className="min-h-screen mt-16 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <header className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo192.png" alt="logo" className="w-10 h-10 rounded-full shadow" />
            <div>
              <h1 className="text-2xl text-black font-bold">Sol-Ace — Checkout</h1>
              <p className="text-sm text-gray-500">Checkout Here!  · Support: +63 912 345 6789</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-3 text-sm">
            
           <Link to="/menu">
                <button className="px-4 py-2 rounded-lg bg-yellow-950 text-white font-medium shadow-md hover:bg-yellow-950 active:scale-95 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-transform">
                    Continue shopping
                </button>
            </Link>

          </div>
        </header>
        
        {/* container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* right: summary - Shows first on mobile */}
          <aside className="text-black lg:col-span-4 order-first lg:order-last">
            <div className="lg:sticky lg:top-20 space-y-4">
              <div className="bg-white rounded-2xl p-5 shadow">
                <h3 className="text-lg font-semibold">Order Summary</h3>
                <div className="mt-3 space-y-3">
                  {items.map(it => (
                    <div key={it.id} className="flex items-center gap-3">
                      <img src={it.img} alt="item" className="w-16 h-16 rounded-lg object-cover" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{it.name}</div>
                            <div className="text-sm text-gray-500">₱{it.price.toLocaleString()}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => updateQty(it.id, -1)} className="p-1 rounded border border-gray-200"><Minus size={14} /></button>
                            <div className="px-3">{it.quantity}</div>
                            <button onClick={() => updateQty(it.id, +1)} className="p-1 rounded border border-gray-200"><Plus size={14} /></button>
                            <button onClick={() => removeItem(it.id)} className="ml-2 text-red-500 p-1 rounded"><Trash2 size={14} /></button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <hr className="my-3" />

                <div className="text-sm text-gray-600 space-y-2">
                  <div className="flex justify-between"><span>Subtotal</span><span>₱{subtotal}</span></div>
                  {/* <div className="flex justify-between"><span>Discount</span><span>- ₱{}</span></div> */}
                  <div className="flex justify-between"><span>Delivery</span><span>₱{deliveryFee}</span></div>
                  <div className="flex justify-between font-semibold text-lg mt-2"><span>Total</span><span>₱{grandTotal}</span></div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button onClick={ handleCheckout } className="hidden lg:block px-3 py-2 w-full rounded-md bg-yellow-950 text-white">Checkout</button>
                </div>
              </div>

              

            </div>
          </aside>

          {/* left: forms - Shows second on mobile */}
          <div className="lg:col-span-8 text-black space-y-6 order-last lg:order-first">

            {/* Info */}
            <SectionCard title="Contact information" icon={<Mail size={18} />}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input label="Full name" value={`${userData?.firstName || ""} ${userData?.lastName || ""}`}   icon={<User size={16} />} />
                <Input label="Email" value={userData?.email || ""}  required icon={<Mail size={16} />} />
                <Input label="Phone" value={contactNum?.number || "" }  required icon={<MapPin size={16} />} />
              </div>
              <div className="mt-2 text-sm text-gray-500">We’ll send order updates to this email and number.</div>
            </SectionCard>

            {/* Shipping */}
            <SectionCard title="Shipping & pickup" icon={<Truck size={18} />}>
              <div className="flex gap-3">
                <label className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${shipping.type === 'delivery' ? 'border-orange-400 bg-orange-50' : 'border-gray-200'}`}>
                  <input type="radio" name="shiptype" checked={shipping.type === 'delivery'} onChange={() => setShipping({ ...shipping, type: 'delivery' })} className="hidden" />
                  <span className="font-medium">Delivery</span>
                  <span className="text-sm text-gray-500">(₱60)</span>
                </label>
                <label className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${shipping.type === 'pickup' ? 'border-orange-400 bg-orange-50' : 'border-gray-200'}`}>
                  <input type="radio" name="shiptype" checked={shipping.type === 'pickup'} onChange={() => setShipping({ ...shipping, type: 'pickup' })} className="hidden" />
                  <span className="font-medium">Pickup</span>
                  <span className="text-sm text-gray-500">({shipping.pickupLocation})</span>
                </label>
              </div>

              {shipping.type === 'delivery' ? (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input label="Address" value={defaultAddress?.details} onChange={v => setShipping({ ...shipping, address: v })} placeholder="Street, House no." required  icon={<MapPin size={16} />} />
                  <Input label="City" value={defaultAddress?.city} onChange={v => setShipping({ ...shipping, city: v })} required />
                  <Input label="Province" value={defaultAddress?.province} onChange={v => setShipping({ ...shipping, province: v })} />
                  <Input label="ZIP" value={defaultAddress?.zipcode} onChange={v => setShipping({ ...shipping, zip: v })} />
                  <textarea className="col-span-1 md:col-span-2 mt-2 p-3 border border-gray-200 rounded-lg" placeholder="Delivery notes (optional)" value={shipping.notes} onChange={e => setShipping({ ...shipping, notes: e.target.value })} />
                </div>
              ) : (
                <div className="mt-4">
                  <p className="text-sm">Pickup location: <span className="font-medium">{shipping.pickupLocation}</span></p>
                  <div className="mt-3 p-3 border border-dashed border-gray-200 rounded-lg">Map placeholder — embed your map here.</div>
                </div>
              )}
            </SectionCard>

            {/* Payment */}
            <SectionCard title="Payment" icon={<CreditCard size={18} />}>
              <div className="flex gap-3">
                <label className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${payment.method === 'card' ? 'border-orange-400 bg-orange-50' : 'border-gray-200'}`}>
                  <input type="radio" name="pay" checked={payment.method === 'card'} onChange={() => setPayment({ ...payment, method: 'card' })} className="hidden" />
                  Card
                </label>
                <label className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${payment.method === 'cod' ? 'border-orange-400 bg-orange-50' : 'border-gray-200'}`}>
                  <input type="radio" name="pay" checked={payment.method === 'cod'} onChange={() => setPayment({ ...payment, method: 'cod' })} className="hidden" />
                  Cash on delivery
                </label>
                <label className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${payment.method === 'wallet' ? 'border-orange-400 bg-orange-50' : 'border-gray-200'}`}>
                  <input type="radio" name="pay" checked={payment.method === 'wallet'} onChange={() => setPayment({ ...payment, method: 'wallet' })} className="hidden" />
                  GCash / Paymaya
                </label>
              </div>

              {payment.method === 'card' && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Input label="Card number" value={payment.cardNumber} onChange={v => setPayment({ ...payment, cardNumber: v })} placeholder="1234 5678 9012 3456" />
                  <Input label="Expiry" value={payment.expiry} onChange={v => setPayment({ ...payment, expiry: v })} placeholder="MM/YY" />
                  <Input label="CVV" value={payment.cvv} onChange={v => setPayment({ ...payment, cvv: v })} placeholder="***" />
                  <label className="flex items-center gap-2 col-span-1 md:col-span-3">
                    <input type="checkbox" checked={payment.saveCard} onChange={e => setPayment({ ...payment, saveCard: e.target.checked })} />
                    <span className="text-sm">Save card for future purchases</span>
                  </label>
                </div>
              )}
            </SectionCard>

          </div>
        </div>

        {/* mobile sticky bar */}
        <div className="fixed inset-x-0 bottom-0 p-3 bg-white shadow-md lg:hidden z-30">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Total</div>
              <div className="font-semibold">₱{grandTotal.toLocaleString()}</div>
            </div>
            <div>
              <button 
                onClick={handleCheckout} 
                disabled={loading}
                className="px-6 py-3 rounded-lg bg-yellow-950 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Checkout'}
              </button>
            </div>
          </div>
        </div>

        {/* success modal */}
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
                <div className="mt-6 flex justify-end gap-3">
                  <a href="/orders" className="px-4 py-2 rounded-md bg-yellow-950 text-white">View order</a>
                </div>
              </motion.div>
              <ConfettiLite />
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

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
