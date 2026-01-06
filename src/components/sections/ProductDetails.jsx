import { useParams, useNavigate } from "react-router-dom";
import React, { useState, useEffect, useMemo } from "react";
import { doc, getDoc,collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { useCart } from "../CartContext";
import { Coffee, Info, Ruler, ShoppingBag, ArrowLeft, Heart, PlusCircle, Plus, Minus, HelpCircle, X } from "lucide-react";
import logo from "../../assets/ahjinlogo.png";
import HomeCard from "../home/HomeCard";

// Define add-ons catalogs





function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("Dusk");
  const [isFavorite, setIsFavorite] = useState(false);
  const [flyImage, setFlyImage] = useState(null);
  const [selectedAddOns, setSelectedAddOns] = useState({}); // { addonId: qty }
  const [beverageAddOns, setBeverageAddOns]= useState([]); 
  const [foodAddOns, setfoodAddOns] = useState([]);
  const [upSizeFee, setUpSizeFee] = useState(10);

   const [suggestedBeverages, setSuggestedBeverages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [infoModal, setInfoModal] = useState({ isOpen: false, title: "", message: "" });

  useEffect(() => {
  if (!product) return; // wait until product is loaded

  const fetchSuggested = async () => {
    setLoading(true);
    try {
      const colRef = collection(db, "Inventory");
      const snapshot = await getDocs(colRef);

      const allItems = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Filter opposite category
      const recommended = allItems.filter(item => {
        if (product.category === "Beverage") return item.category !== "Beverage";
        if (product.category === "Meal") return item.category === "Beverage";
        return true; // fallback: include all
      }).filter(item => item.id !== product.id); // exclude current product

      // Shuffle and pick 3
      const shuffled = recommended.sort(() => 0.5 - Math.random());
      const limited = shuffled.slice(0, 3);

      setSuggestedBeverages(limited);
    } catch (err) {
      console.error("Error fetching suggested items:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchSuggested();
}, [product]); // run after product is loaded


useEffect(()=>{
    const loadStorePref = async () =>{
      const docRef = await getDoc(doc(db, "settings", "storePref"));
      if(!docRef.exists()){"no data";return}
      const data = docRef.data();

      setUpSizeFee(data.upSizeFee);
 
 
  
    }
    loadStorePref();

    },[])



  useEffect(()=> {
    const fetchProduct = async () =>{
      const docRef = await getDoc(doc(db, "extra", "addOns"));
      const getSettings = await getDoc(doc(db, "settings", "storePref"));
      if(!docRef.exists()){console.log("data not exist");return}
      const data = docRef.data();
      const settings = getSettings.data();

      setBeverageAddOns(data.beverageAddOns);
      setfoodAddOns(data.foodAddOns);
      setUpSizeFee(settings.upSizeFee);


    }
    fetchProduct();

  },[])

  // Fetch product and favorites
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, "Inventory", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) setProduct({ id: docSnap.id, ...docSnap.data() });
        else console.warn("Product not found");
      } catch (err) {
        console.error("Error fetching product:", err);
      }
    };

    fetchProduct();

    const savedFavorites = localStorage.getItem("favorites");
    if (savedFavorites) {
      const favoritesArray = JSON.parse(savedFavorites);
      setIsFavorite(favoritesArray.includes(id));
    }
  }, [id]);

  const toggleFavorite = () => {
    const savedFavorites = localStorage.getItem("favorites");
    let favoritesArray = savedFavorites ? JSON.parse(savedFavorites) : [];

    if (isFavorite) favoritesArray = favoritesArray.filter(favId => favId !== id);
    else favoritesArray.push(id);

    localStorage.setItem("favorites", JSON.stringify(favoritesArray));
    setIsFavorite(!isFavorite);
  };

  const fmt = (n) => Number(n).toFixed(2);

  // Determine product type flags (safe with optional chaining)
  const isBeverage = product?.category === "Beverage"; // Remove && product?.sizes === true
  const isBeverages = product?.category === "Beverage";
  const isFood = product?.category === "Meal" || product?.allowExtraRice === true;

  // Build current add-ons catalog based on product type - BEFORE early return
  const addOnsCatalog = useMemo(() => {
    let list = [];
    if (isBeverage && beverageAddOns.length > 0) {
      list = beverageAddOns.filter(a => a.category === "Beverage");
    }
    if (isFood && beverageAddOns.length > 0) {
      list = [...list, ...beverageAddOns.filter(a => a.category === "Meal")];
    }
    return list;
  }, [isBeverage, isFood, beverageAddOns, foodAddOns]);

  // Calculate add-ons total and prices - BEFORE early return
  const perItemAddOnsTotal = addOnsCatalog.reduce(
    (sum, a) => sum + (selectedAddOns[a.id] || 0) * a.price,
    0
  );
  
  const sizePrice = product ? (selectedSize === "Dawn" ? Number(product.price) + upSizeFee : Number(product.price)) : 0;
  const unitPrice = product ? sizePrice + perItemAddOnsTotal : 0;
  const totalPrice = unitPrice * Number(quantity);

  // Early return AFTER all hooks
  if (!product)
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FCDEC0] to-[#E5B299] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7D5A50] mx-auto mb-4"></div>
          <p className="text-[#7D5A50] font-medium">Loading product...</p>
        </div>
      </div>
    );

  // Helpers
  const toggleAddOn = (id) => {
    setSelectedAddOns(prev => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = 1; // default qty 1
      return next;
    });
  };

  const setAddOnQty = (id, qty) => {
    setSelectedAddOns(prev => {
      const n = Math.max(0, qty | 0);
      const next = { ...prev };
      if (n === 0) delete next[id];
      else next[id] = n;
      return next;
    });
  };

  const handleAddToCart = () => {
    if (!product) return;

    const addons = addOnsCatalog
      .filter(a => selectedAddOns[a.id])
      .map(a => ({ id: a.id, name: a.name, price: a.price, qty: selectedAddOns[a.id] }));

    const cartItem = {
      id: product.id,
      name: product.name,
      price: unitPrice, // unit price already includes size + add-ons
      basePrice: Number(product.price),
      addons,
      img: product.img || logo,
      size: selectedSize,
      category: product.category,
    };

    // Add exactly "quantity" in one call
    addToCart(cartItem, Number(quantity));

    triggerFlyToCart();
  };

  // Animation function
  const triggerFlyToCart = () => {
    const productImg = document.getElementById("product-img");
    const cartIcon = document.getElementById("navbar-cart-icon");
    if (!productImg || !cartIcon) return;

    const imgRect = productImg.getBoundingClientRect();
    const cartRect = cartIcon.getBoundingClientRect();

    const flyImg = document.createElement("img");
    flyImg.src = product.img || logo;
    flyImg.style.position = "fixed";
    flyImg.style.left = imgRect.left + "px";
    flyImg.style.top = imgRect.top + "px";
    flyImg.style.width = imgRect.width + "px";
    flyImg.style.height = imgRect.height + "px";
    flyImg.style.zIndex = 9999;
    flyImg.style.transition = "all 0.8s cubic-bezier(.42,.01,.56,1.02)";
    flyImg.style.borderRadius = "16px";
    document.body.appendChild(flyImg);

    setTimeout(() => {
      flyImg.style.left = cartRect.left + "px";
      flyImg.style.top = cartRect.top + "px";
      flyImg.style.width = "40px";
      flyImg.style.height = "40px";
      flyImg.style.opacity = "0.2";
    }, 10);

    setTimeout(() => {
      document.body.removeChild(flyImg);
    }, 900);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br mt-15 text-[#7D5A50]">
      <div className="max-w-6xl mx-auto py-6 md:py-12 px-3 sm:px-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-3xl shadow-lg flex flex-col lg:flex-row overflow-hidden">
          {/* LEFT - Image & Controls */}
          <div className="lg:w-1/2 items-center justify-center p-4 sm:p-6 md:p-10 bg-gradient-to-br from-[#FCECDC] to-[#FCDEC0] relative">
            <button
              className="absolute top-2 left-2 sm:top-4 sm:left-4 text-[#7D5A50] hover:text-[#5C4036] transition cursor-pointer z-20 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-md"
              onClick={() => navigate(-1)}
              aria-label="Back"
            >
              <ArrowLeft size={20} className="sm:w-6 sm:h-6" />
            </button>

            <button
              onClick={toggleFavorite}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-white/90 backdrop-blur-sm p-2 sm:p-3 rounded-full shadow-md hover:bg-white transition-all duration-200 active:scale-90 z-20 cursor-pointer"
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart className={`w-5 h-5 sm:w-6 sm:h-6 transition-all duration-200 ${isFavorite ? "fill-red-500 text-red-500" : "text-[#7D5A50] hover:text-red-500"}`} />
            </button>

            <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-[#E5B299] rounded-full blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2"></div>

            <div className="relative z-10 flex flex-col items-center">
              <div
                id="product-img"
                className="w-48 h-48 sm:w-60 sm:h-60 md:w-72 md:h-72 aspect-square bg-coffee-50 rounded-xl md:rounded-2xl shadow-md overflow-hidden"
              >
                <img src={product.img || logo} alt={product.name} className="w-full h-full object-cover" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold mt-4 sm:mt-6 text-center px-2">{product.name}</h2>
              <p className="text-xl sm:text-2xl font-semibold mt-2">₱ {fmt(product.price)}</p>
              {product.description && <p className="text-xs sm:text-sm text-[#B4846C] italic mt-1 text-center px-2">{product.description}</p>}

              {/* Quantity Selector */}
              <div className="flex flex-col items-center mt-4 sm:mt-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs sm:text-sm font-medium text-coffee-800">Quantity</span>
                  <button 
                    onClick={() => setInfoModal({ isOpen: true, title: "Quantity", message: "Select how many items you want to add to your bag" })}
                    className="cursor-pointer hover:text-[#5C4036] transition-colors"
                    aria-label="Quantity info"
                  >
                    <HelpCircle size={16} className="sm:w-[18px] sm:h-[18px] text-[#7D5A50]" />
                  </button>
                </div>
                <div className="flex items-center bg-[#e9c8a8] rounded-full shadow-inner overflow-hidden">
                  <button className="px-3 sm:px-4 py-1.5 sm:py-2 text-xl sm:text-2xl hover:bg-[#E5B299] cursor-pointer active:bg-[#D4A574]" onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                  <span className="px-4 sm:px-6 py-1.5 sm:py-2 text-base sm:text-lg font-semibold bg-white min-w-[3rem] text-center">{quantity}</span>
                  <button className="px-3 sm:px-4 py-1.5 sm:py-2 text-xl sm:text-2xl hover:bg-[#E5B299] cursor-pointer active:bg-[#D4A574]" onClick={() => setQuantity(quantity + 1)}>+</button>
                </div>
              </div>

              <button
                className="mt-4 sm:mt-8 flex items-center justify-center gap-2 bg-[#7D5A50] hover:bg-[#5C4036] transition-all duration-200 text-white font-bold px-6 sm:px-10 py-2.5 sm:py-3 rounded-full text-sm sm:text-lg shadow-md hover:scale-105 active:scale-95 cursor-pointer w-full max-w-sm"
                onClick={() => {handleAddToCart(); setQuantity(1);}}
                aria-label="Add to cart"
              >
                <ShoppingBag size={18} className="sm:w-5 sm:h-5" />
                <span className="whitespace-nowrap">Add to Bag — ₱ {fmt(totalPrice)}</span>
              </button>
            </div>
          </div>
          {/* RIGHT - Product Info */}
          <div className="lg:w-1/2 p-4 sm:p-6 md:p-10 text-[#4A352E] flex flex-col lg:max-h-screen lg:overflow-hidden">
            <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 lg:flex-shrink-0">Product Information</h3>
            <div className="space-y-3 sm:space-y-5 lg:overflow-y-auto lg:pr-2 scrollbar-thin scrollbar-thumb-[#E5B299] scrollbar-track-[#FCDEC0]/30 hover:scrollbar-thumb-[#D4A574]">

              {/* Category */}
              <div className="bg-[#FCDEC0]/50 p-3 sm:p-4 rounded-lg sm:rounded-xl shadow-sm flex items-center gap-2 sm:gap-3">
                <Coffee className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <p className="text-sm sm:text-base"><strong>Category:</strong> {product.category || "Uncategorized"}</p>
              </div>

              {/* Description */}
              {product.description && (
                <div className="bg-[#FCDEC0]/50 p-3 sm:p-4 rounded-lg sm:rounded-xl shadow-sm flex items-start gap-2 sm:gap-3">
                  <Info className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 sm:mt-1 flex-shrink-0" />
                  <p className="text-sm sm:text-base"><strong>Description:</strong> {product.description}</p>
                </div>
              )}

              {/* Sizes - Only for Beverages */}
              {isBeverage && (
                <div className="bg-[#FCDEC0]/50 p-3 sm:p-4 rounded-lg sm:rounded-xl shadow-sm flex items-start gap-2 sm:gap-3">
                  <Ruler className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 sm:mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <label className="text-sm sm:text-base font-semibold">Sizes</label>
                      <button 
                        onClick={() => setInfoModal({ isOpen: true, title: "Sizes", message: "Dusk (16 oz) is our regular size. Dawn (22 oz) is larger and costs extra" })}
                        className="cursor-pointer hover:text-[#5C4036] transition-colors"
                        aria-label="Sizes info"
                      >
                        <HelpCircle size={16} className="sm:w-[18px] sm:h-[18px] text-[#7D5A50]" />
                      </button>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      {[
                        { name: "Dusk", oz: 16, price: product.price },
                        { name: "Dawn", oz: 22, price: product.price+ upSizeFee}
                      ].map(size => (
                        <button
                          key={size.name}
                          type="button"
                          onClick={() => {
                            setSelectedSize(size.name);
                          }}
                          className={`cursor-pointer px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm rounded-full font-semibold transition-all flex-1 whitespace-nowrap ${selectedSize === size.name ? "bg-[#7D5A50] text-white shadow-md" : "bg-white text-[#7D5A50] border border-[#7D5A50] hover:bg-[#FCDEC0]"}`}
                        >
                          <span className="hidden sm:inline">{size.name} ({size.oz} oz) ₱{Number(size.price).toFixed(2)}</span>
                          <span className="sm:hidden">{size.name}<br/>₱{Number(size.price).toFixed(2)}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Add-ons */}
              {(isBeverages || isFood) && (
                <div className="bg-[#FCDEC0]/50 p-3 sm:p-4 rounded-lg sm:rounded-xl shadow-sm">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-sm sm:text-base font-semibold">Add-ons</span>
                    <button 
                      onClick={() => setInfoModal({ isOpen: true, title: "Add-ons", message: "Customize your order! Add-on prices are per item and will multiply by your quantity" })}
                      className="cursor-pointer hover:text-[#5C4036] transition-colors"
                      aria-label="Add-ons info"
                    >
                      <HelpCircle size={16} className="sm:w-[18px] sm:h-[18px] text-[#7D5A50]" />
                    </button>
                    <span className="ml-auto text-xs sm:text-sm text-[#7D5A50]">
                      Per item
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    {addOnsCatalog.map(a => {
                      const qty = selectedAddOns[a.id] || 0;
                      const checked = qty > 0;
                      const multiple = a.allowMultiple === true;
                      return (
                        <div
                          key={a.id}
                          className={`flex items-center justify-between p-2 sm:p-3 rounded-lg border ${checked ? "border-[#7D5A50] bg-white" : "border-[#E5B299] bg-[#FFF8EF]"}`}
                        >
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-sm sm:text-base font-medium truncate">{a.name}</span>
                            <span className="text-xs sm:text-sm text-[#B4846C]">+₱ {fmt(a.price)}</span>
                          </div>

                          {multiple ? (
                            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                              <button
                                type="button"
                                onClick={() => setAddOnQty(a.id, qty - 1)}
                                className="p-1.5 sm:p-2 rounded-full bg-[#F5E3D2] hover:bg-[#EED7C3] active:bg-[#D4A574]"
                                aria-label={`Decrease ${a.name}`}
                              >
                                <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                              </button>
                              <span className="w-6 sm:w-8 text-center text-sm sm:text-base font-semibold">{qty}</span>
                              <button
                                type="button"
                                onClick={() => setAddOnQty(a.id, qty + 1)}
                                className="p-1.5 sm:p-2 rounded-full bg-[#F5E3D2] hover:bg-[#EED7C3] active:bg-[#D4A574]"
                                aria-label={`Increase ${a.name}`}
                              >
                                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                              </button>
                            </div>
                          ) : (
                            <label className="inline-flex items-center gap-2 cursor-pointer flex-shrink-0">
                              <input
                                type="checkbox"
                                className="cursor-pointer accent-[#7D5A50] w-4 h-4 sm:w-5 sm:h-5"
                                checked={checked}
                                onChange={() => toggleAddOn(a.id)}
                                aria-label={`Toggle ${a.name}`}
                              />
                            </label>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-white rounded-lg text-xs sm:text-sm text-[#7D5A50]">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Subtotal per item:</span>
                      <span className="text-base sm:text-lg font-bold">₱ {fmt(unitPrice)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* You May Also Like */}
                <div className="mt-6 sm:mt-8 md:mt-12">
                  <h4 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">You may also like</h4>
                  {loading ? (
                    <div className="flex justify-center py-6 sm:py-8">
                      <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-[#7D5A50]"></div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
                      {suggestedBeverages.map(item => (
                        <HomeCard
                          key={item.id}
                          name={item.name}
                          price={item.price}
                          img={item.img}
                          onClick={() => navigate(`/menu/product-details/${item.id}`)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              

            </div>
          </div>
        </div>
      </div>
      {/* Info Modal */}
      {infoModal.isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setInfoModal({ isOpen: false, title: "", message: "" })}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-dropdown"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg sm:text-xl font-bold text-[#7D5A50]">{infoModal.title}</h3>
              <button
                onClick={() => setInfoModal({ isOpen: false, title: "", message: "" })}
                className="text-[#7D5A50] hover:text-[#5C4036] transition-colors p-1 hover:bg-[#FCDEC0] rounded-full"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-sm sm:text-base text-[#4A352E] leading-relaxed">{infoModal.message}</p>
            <button
              onClick={() => setInfoModal({ isOpen: false, title: "", message: "" })}
              className="mt-6 w-full bg-[#7D5A50] hover:bg-[#5C4036] text-white font-semibold py-2.5 rounded-full transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}    </div>
  );
}

export default ProductDetails;
