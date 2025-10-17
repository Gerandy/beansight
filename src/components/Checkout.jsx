import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";


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
  // steps: 0 - Info, 1 - Shipping, 2 - Payment, 3 - Review
  const [step, setStep] = useState(0);
  const [items, setItems] = useState(SAMPLE_ITEMS);
  const [promo, setPromo] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  const [info, setInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
  });

  const [shipping, setShipping] = useState({
    type: "delivery", // or pickup
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

  const subtotal = useMemo(() => items.reduce((s, it) => s + it.price * it.qty, 0), [items]);
  const discount = appliedPromo ? appliedPromo.amount : 0;
  const deliveryFee = shipping.type === "delivery" ? 60 : 0;
  const tax = Math.round((subtotal - discount + deliveryFee) * 0.12);
  const total = subtotal - discount + deliveryFee + tax;

  function updateQty(id, delta) {
    setItems(items.map(i => i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i));
  }

  function removeItem(id) {
    setItems(items.filter(i => i.id !== id));
  }

  function applyPromo() {
    // demo promo rules
    if (!promo) return;
    const p = promo.trim().toUpperCase();
    if (p === "BILAO10") {
      setAppliedPromo({ code: p, amount: Math.round(subtotal * 0.10) });
    } else if (p === "SHIPPINGFREE") {
      setAppliedPromo({ code: p, amount: deliveryFee });
    } else {
      setAppliedPromo({ code: p, amount: 0, invalid: true });
    }
  }

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
                <button className="px-4 py-2 rounded-lg bg-orange-500 text-white font-medium shadow-md hover:bg-orange-600 active:scale-95 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-transform">
                    Continue shopping
                </button>
            </Link>

          </div>
        </header>

        {/* container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* left: forms */}
          <div className="lg:col-span-8 text-black space-y-6">
            <Stepper step={step} setStep={setStep} />

            {/* Info */}
            <SectionCard title="Contact information" icon={<Mail size={18} />}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input label="Full name" value={info.fullName} onChange={v => setInfo({ ...info, fullName: v })} required icon={<User size={16} />} />
                <Input label="Email" value={info.email} onChange={v => setInfo({ ...info, email: v })} required icon={<Mail size={16} />} />
                <Input label="Phone" value={info.phone} onChange={v => setInfo({ ...info, phone: v })} required icon={<MapPin size={16} />} />
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
                  <Input label="Address" value={shipping.address} onChange={v => setShipping({ ...shipping, address: v })} placeholder="Street, House no." required icon={<MapPin size={16} />} />
                  <Input label="City" value={shipping.city} onChange={v => setShipping({ ...shipping, city: v })} required />
                  <Input label="Province" value={shipping.province} onChange={v => setShipping({ ...shipping, province: v })} />
                  <Input label="ZIP" value={shipping.zip} onChange={v => setShipping({ ...shipping, zip: v })} />
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

            {/* Review (summary + place order) */}
            <div className="flex items-center text-black justify-between gap-3">
              <div className="text-sm text-gray-500">Not ready to place order? You can save your cart and continue later.</div>
              <div className="flex items-center gap-3">
                <button onClick={() => { setStep(Math.max(0, step - 1)); }} className="px-4 py-2 rounded-md border border-gray-200">Back</button>
                <button onClick={() => { if (step < 3) setStep(s => Math.min(3, s + 1)); else placeOrder(); }} disabled={!infoValid || !shippingValid || (step === 3 && !paymentValid)} className={`px-4 py-2 rounded-md font-semibold ${step < 3 ? 'bg-white border border-orange-400 text-orange-600' : 'bg-orange-600 text-white'} ${(!infoValid || !shippingValid || (step === 3 && !paymentValid)) ? 'opacity-60 cursor-not-allowed' : 'hover:brightness-95'}`}>
                  {step < 3 ? 'Continue' : loading ? 'Placing order...' : 'Place order'}
                </button>
              </div>
            </div>

          </div>

          {/* right: summary */}
          <aside className="text-black lg:col-span-4">
            <div className="sticky top-6 space-y-4">
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
                            <div className="px-3">{it.qty}</div>
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
                  <div className="flex justify-between"><span>Subtotal</span><span>₱{subtotal.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Discount</span><span>- ₱{discount.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Delivery</span><span>₱{deliveryFee.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Tax (12%)</span><span>₱{tax.toLocaleString()}</span></div>
                  <div className="flex justify-between font-semibold text-lg mt-2"><span>Total</span><span>₱{total.toLocaleString()}</span></div>
                </div>

                <div className="mt-4">
                  <div className="flex gap-2">
                    <input value={promo} onChange={e => setPromo(e.target.value)} placeholder="Promo code" className="flex-1 p-2 border border-gray-200 rounded-md" />
                    <button onClick={applyPromo} className="px-3 py-2 rounded-md bg-orange-600 text-white">Apply</button>
                  </div>
                  {appliedPromo && <div className={`mt-2 text-sm ${appliedPromo.invalid ? 'text-red-500' : 'text-green-600'}`}>{appliedPromo.invalid ? 'Invalid code' : `Applied ${appliedPromo.code} — ₱${appliedPromo.amount}`}</div>}
                </div>

                <div className="mt-4 flex gap-2">
                  <button onClick={() => { setStep(0); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="flex-1 px-3 py-2 rounded-md border border-gray-200">Edit details</button>
                  <button onClick={() => { setStep(3); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="px-3 py-2 rounded-md bg-orange-600 text-white">Checkout</button>
                </div>
              </div>

              {/* trust badges */}
              <div className="bg-white p-4 rounded-lg shadow flex items-center gap-3 text-sm">
                <CheckCircle className="text-green-500" />
                <div>
                  <div className="font-medium">Secure checkout</div>
                  <div className="text-gray-500">We use TLS encryption — your payment is safe.</div>
                </div>
              </div>

              {/* upsell example */}
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-sm font-medium">Add-on suggestion</div>
                <div className="mt-2 flex items-center gap-3">
                  <img src="https://images.unsplash.com/photo-1543352634-8f3c12a4b9ba?q=80&w=400&auto=format&fit=crop&ixlib=rb-4.0.3&s=example" className="w-16 h-16 rounded-lg object-cover" />
                  <div className="flex-1">
                    <div>Leche Flan (Slice)</div>
                    <div className="text-sm text-gray-500">Add for ₱65</div>
                  </div>
                  <button className="px-3 py-2 rounded-md border border-gray-200">Add</button>
                </div>
              </div>

            </div>
          </aside>
        </div>

        {/* mobile sticky bar */}
        <div className="fixed inset-x-0 bottom-0 p-3 bg-white shadow-md lg:hidden">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Total</div>
              <div className="font-semibold">₱{total.toLocaleString()}</div>
            </div>
            <div>
              <button onClick={() => { setStep(3); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="px-6 py-3 rounded-lg bg-orange-600 text-white font-semibold">Place order</button>
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
                <div className="mt-4 text-sm">We've emailed a receipt to <span className="font-medium">{info.email}</span>. You can track your order in the Orders page.</div>
                <div className="mt-6 flex justify-end gap-3">
                  <button onClick={() => setSuccess(null)} className="px-4 py-2 rounded-md border">Close</button>
                  <a href="#" className="px-4 py-2 rounded-md bg-orange-600 text-white">View order</a>
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

// -----------------------------
// Small reusable components
// -----------------------------
function Stepper({ step, setStep }) {
  const labels = ["Contact", "Shipping", "Payment", "Review"];
  return (
    <div className="bg-white rounded-2xl p-4 shadow flex items-center gap-4">
      {labels.map((lab, i) => (
        <div key={lab} className="flex items-center gap-3">
          <button onClick={() => setStep(i)} className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center ${i <= step ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-600'}`}>{i + 1}</button>
          <div className="hidden md:block">
            <div className={`text-sm ${i <= step ? 'font-semibold text-gray-900' : 'text-gray-400'}`}>{lab}</div>
            <div className="text-xs text-gray-400">{i === step ? 'In progress' : i < step ? 'Done' : 'Pending'}</div>
          </div>
          {i < labels.length - 1 && <div className={`w-6 h-[2px] ${i < step ? 'bg-orange-600' : 'bg-gray-200'} hidden md:block`} />}
        </div>
      ))}
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
