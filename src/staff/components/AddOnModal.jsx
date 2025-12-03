import React, { useState, useEffect } from "react";
import { X, Plus, Minus, Check } from "lucide-react";
import { collection, getDocs, getDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";

export default function AddOnModal({ product, onClose, onAddToCart }) {
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [addOns, setAddOns] = useState([]);
  const [loading, setLoading] = useState(true);

  // Prevent background scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Fetch add-ons from Firestore
  useEffect(() => {
  const fetchAddOns = async () => {
    try {
      const docRef = await getDoc(doc(db, "extra","addOns"));
      if (!docRef.exists()) {
        console.log("doesnt exist");
        return;
      }

      const data = docRef.data();
      const addOnsList = data.beverageAddOns || [];
      console.log(addOnsList);

      // Since this is ONLY beverage add-ons, just set it:
      setAddOns(addOnsList);
      setLoading(false);

    } catch (error) {
      console.error("Error fetching add-ons:", error);
    }
  };

  fetchAddOns();
}, [product.addOns]);


  // Initialize with first size or default sizes
  useEffect(() => {
    if (product.sizes && product.sizes.length > 0) {
      setSelectedSize(product.sizes[0]);
    } else {
      // Set default Dusk size if no sizes are defined
      setSelectedSize({ name: "Dusk", price: product.price });
    }
  }, [product]);

  const handleAddOnToggle = (addOn) => {
    const exists = selectedAddOns.find(a => a.id === addOn.id);
    
    if (exists) {
      if (addOn.allowMultiple) {
        // Increase quantity
        setSelectedAddOns(prev =>
          prev.map(a =>
            a.id === addOn.id ? { ...a, qty: a.qty + 1 } : a
          )
        );
      } else {
        // Remove if not allowing multiple
        setSelectedAddOns(prev => prev.filter(a => a.id !== addOn.id));
      }
    } else {
      // Add new
      setSelectedAddOns(prev => [...prev, { ...addOn, qty: 1 }]);
    }
  };

  const handleAddOnDecrease = (addOnId) => {
    setSelectedAddOns(prev => {
      const addon = prev.find(a => a.id === addOnId);
      if (addon.qty > 1) {
        return prev.map(a =>
          a.id === addOnId ? { ...a, qty: a.qty - 1 } : a
        );
      } else {
        return prev.filter(a => a.id !== addOnId);
      }
    });
  };

  const calculateTotal = () => {
    const basePrice = selectedSize ? selectedSize.price : product.price;
    const addOnsTotal = selectedAddOns.reduce(
      (sum, addon) => sum + (addon.price * addon.qty),
      0
    );
    return (basePrice + addOnsTotal) * quantity;
  };

  const handleConfirm = () => {
    const cartItem = {
      ...product,
      size: selectedSize?.name || null,
      price: selectedSize ? selectedSize.price : product.price,
      addons: selectedAddOns,
      qty: quantity,
      uniqueId: `${product.id}-${selectedSize?.name || 'default'}-${Date.now()}`,
    };
    
    onAddToCart(cartItem);
    onClose();
  };

  const canConfirm = selectedSize !== null;

  // Generate sizes array - use product sizes if available, otherwise use default Dusk/Dawn
  const sizesArray = product.sizes && product.sizes.length > 0 
    ? product.sizes 
    : [
        { name: "Dusk", price: product.price },
        { name: "Dawn", price: product.price + 20 }
      ];

  // Group add-ons by category
  const groupedAddOns = addOns.reduce((acc, addon) => {
    const category = addon.category || "Other";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(addon);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-coffee-700 text-white p-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">{product.name}</h3>
            <p className="text-sm text-coffee-100">Customize your order</p>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer p-2 hover:bg-coffee-600 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6 flex-1 scrollbar-hide">
          {/* Product Image */}
          {product.img && (
            <div className="w-full h-48 bg-coffee-100 rounded-xl overflow-hidden">
              <img
                src={product.img}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Size Selection - Only for Beverages and Meals */}
          {(product.category === "Beverage" ) && (
          <div>
            <h4 className="font-semibold text-coffee-800 mb-3">Select Size *</h4>
            <div className="grid grid-cols-2 gap-3">
              {sizesArray.map((size) => (
                <button
                  key={size.name}
                  onClick={() => setSelectedSize(size)}
                  className={`cursor-pointer p-3 rounded-lg border-2 transition-all ${
                    selectedSize?.name === size.name
                      ? "border-coffee-600 bg-coffee-50"
                      : "border-coffee-200 hover:border-coffee-400"
                  }`}
                >
                  <div className="font-medium text-coffee-900">{size.name}</div>
                  <div className="text-sm text-coffee-600">₱{size.price}</div>
                </button>
              ))}
            </div>
          </div>
          )}

          {/* Add-ons - Grouped by Category */}
          {loading ? (
            <div className="text-sm text-coffee-600">Loading add-ons...</div>
          ) : Object.keys(groupedAddOns).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(groupedAddOns)
                .filter(([category]) => category === product.category)
                .map(([category, items]) => (
                  <div key={category}>
                    <h4 className="font-semibold text-coffee-800 mb-3">
                      {category} Add-ons (Optional)
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {items.map((addon) => {
                        const selected = selectedAddOns.find(a => a.id === addon.id);
                        
                        return (
                          <button
                            key={addon.id}
                            onClick={() => handleAddOnToggle(addon)}
                            className={`p-4 rounded-xl border-2 transition-all text-left ${
                              selected
                                ? "border-coffee-600 bg-coffee-50"
                                : "border-coffee-200 bg-white hover:border-coffee-300"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <div className="font-semibold text-coffee-900 text-base mb-1">
                                  {addon.name}
                                </div>
                                <div className="text-sm text-coffee-600">
                                  +₱ {addon.price.toFixed(2)}
                                </div>
                              </div>
                              
                              <div className="flex-shrink-0">
                                {selected && addon.allowMultiple ? (
                                  <div className="flex items-center gap-1 bg-coffee-100 rounded-lg px-2 py-1">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleAddOnDecrease(addon.id);
                                      }}
                                      className="cursor-pointer w-5 h-5 rounded flex items-center justify-center hover:bg-coffee-200 transition"
                                    >
                                      <Minus className="w-3 h-3" />
                                    </button>
                                    <span className="w-6 text-center font-semibold text-xs">{selected.qty}</span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleAddOnToggle(addon);
                                      }}
                                      className="cursor-pointer w-5 h-5 rounded flex items-center justify-center hover:bg-coffee-200 transition"
                                    >
                                      <Plus className="w-3 h-3" />
                                    </button>
                                  </div>
                                ) : (
                                  <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition ${
                                    selected
                                      ? "border-coffee-600 bg-coffee-600"
                                      : "border-coffee-300 bg-white"
                                  }`}>
                                    {selected && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                                  </div>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
            </div>
          ) : null}


          {/* Quantity */}
          <div>
            <h4 className="font-semibold text-coffee-800 mb-3">Quantity</h4>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="cursor-pointer w-10 h-10 rounded-full bg-coffee-200 hover:bg-coffee-300 flex items-center justify-center transition"
              >
                <Minus className="w-5 h-5" />
              </button>
              <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="cursor-pointer w-10 h-10 rounded-full bg-coffee-600 hover:bg-coffee-700 text-white flex items-center justify-center transition"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-coffee-50 p-4 border-t border-coffee-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-coffee-700 font-medium">Total:</span>
            <span className="text-2xl font-bold text-coffee-900">₱{calculateTotal().toFixed(2)}</span>
          </div>
          <button
            onClick={handleConfirm}
            disabled={!canConfirm}
            className={`cursor-pointer w-full py-3 rounded-xl font-semibold transition ${
              canConfirm
                ? "bg-coffee-600 hover:bg-coffee-700 text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}