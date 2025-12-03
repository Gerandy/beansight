import { useParams, useNavigate } from "react-router-dom";
import React, { useState, useEffect, useMemo } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useCart } from "../CartContext";
import { Coffee, Info, Ruler, ShoppingBag, ArrowLeft, Heart, PlusCircle, Plus, Minus } from "lucide-react";
import logo from "../../assets/ahjinlogo.png";
import HomeCard from "../home/HomeCard";

// Define add-ons catalogs



const suggestedBeverages = [
  { id: "latte", name: "Latte", price: 120, img: logo },
  { id: "cappuccino", name: "Cappuccino", price: 130, img: logo },
  { id: "espresso", name: "Espresso", price: 100, img: logo },
];

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

    addToCart({
      id: product.id,
      name: product.name,
      // price per unit including addons
      price: unitPrice,
      basePrice: Number(product.price),
      addons,
      quantity,
      img: product.img || logo,
      size: selectedSize,
      category: product.category,
    });
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
      <div className="max-w-6xl mx-auto py-12 px-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg flex flex-col lg:flex-row overflow-hidden">
          {/* LEFT - Image & Controls */}
          <div className="lg:w-1/2 items-center justify-center p-10 bg-gradient-to-br from-[#FCECDC] to-[#FCDEC0] relative">
            <button
              className="absolute top-4 left-4 text-[#7D5A50] hover:text-[#5C4036] transition cursor-pointer"
              onClick={() => navigate(-1)}
              aria-label="Back"
            >
              <ArrowLeft size={24} />
            </button>

            <button
              onClick={toggleFavorite}
              className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-md hover:bg-white transition-all duration-200 active:scale-90 z-20 cursor-pointer"
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart className={`w-6 h-6 transition-all duration-200 ${isFavorite ? "fill-red-500 text-red-500" : "text-[#7D5A50] hover:text-red-500"}`} />
            </button>

            <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-[#E5B299] rounded-full blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2"></div>

            <div className="relative z-10 flex flex-col items-center">
              <div
                id="product-img"
                className="w-72 h-72 aspect-square bg-coffee-50 rounded-2xl shadow-md overflow-hidden"
              >
                <img src={product.img || logo} alt={product.name} className="w-full h-full object-cover" />
              </div>
              <h2 className="text-3xl font-extrabold mt-6">{product.name}</h2>
              <p className="text-2xl font-semibold mt-2">₱ {fmt(product.price)}</p>
              {product.description && <p className="text-sm text-[#B4846C] italic mt-1">{product.description}</p>}

              {/* Quantity Selector */}
              <div className="flex items-center mt-6 bg-[#e9c8a8] rounded-full shadow-inner overflow-hidden">
                <button className="px-4 py-2 text-2xl hover:bg-[#E5B299] cursor-pointer" onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                <span className="px-6 py-2 text-lg font-semibold bg-white">{quantity}</span>
                <button className="px-4 py-2 text-2xl hover:bg-[#E5B299] cursor-pointer" onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>

              <button
                className="mt-8 flex items-center gap-2 bg-[#7D5A50] hover:bg-[#5C4036] transition-all duration-200 text-white font-bold px-10 py-3 rounded-full text-lg shadow-md hover:scale-105 active:scale-95 cursor-pointer"
                onClick={() => {handleAddToCart(); setQuantity(1);}}
                aria-label="Add to cart"
              >
                <ShoppingBag size={20} />
                Add to My Bag — ₱ {fmt(totalPrice)}
              </button>
            </div>
          </div>
          {/* RIGHT - Product Info */}
          <div className="lg:w-1/2 p-10 text-[#4A352E] flex flex-col justify-center">
            <h3 className="text-2xl font-bold mb-6">Product Information</h3>
            <div className="space-y-5">

              {/* Category */}
              <div className="bg-[#FCDEC0]/50 p-4 rounded-xl shadow-sm flex items-center gap-3">
                <Coffee className="w-5 h-5" />
                <p><strong>Category:</strong> {product.category || "Uncategorized"}</p>
              </div>

              {/* Description */}
              {product.description && (
                <div className="bg-[#FCDEC0]/50 p-4 rounded-xl shadow-sm flex items-start gap-3">
                  <Info className="w-5 h-5 mt-1" />
                  <p><strong>Description:</strong> {product.description}</p>
                </div>
              )}

              {/* Sizes - Only for Beverages */}
              {isBeverage && (
                <div className="bg-[#FCDEC0]/50 p-4 rounded-xl shadow-sm flex items-start gap-3">
                  <Ruler className="w-5 h-5 mt-1" />
                  <div>
                    <label className="block font-semibold mb-3">Dusk and Dawn Sizes</label>
                    <div className="flex gap-2 sm:gap-4">
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
                          className={`cursor-pointer px-4 sm:px-6 py-2 text-sm sm:text-base rounded-full font-semibold transition-all ${selectedSize === size.name ? "bg-[#7D5A50] text-white shadow-md" : "bg-white text-[#7D5A50] border border-[#7D5A50] hover:bg-[#FCDEC0]"}`}
                        >
                          {size.name} ({size.oz} oz) ₱{Number(size.price).toFixed(2)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Add-ons */}
              {(isBeverages || isFood) && (
                <div className="bg-[#FCDEC0]/50 p-4 rounded-xl shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <PlusCircle className="w-5 h-5" />
                    <span className="font-semibold">Add-ons</span>
                    <span className="ml-auto text-sm text-[#7D5A50]">
                      Per item add-ons
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {addOnsCatalog.map(a => {
                      const qty = selectedAddOns[a.id] || 0;
                      const checked = qty > 0;
                      const multiple = a.allowMultiple === true;
                      return (
                        <div
                          key={a.id}
                          className={`flex items-center justify-between p-3 rounded-lg border ${checked ? "border-[#7D5A50] bg-white" : "border-[#E5B299] bg-[#FFF8EF]"}`}
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">{a.name}</span>
                            <span className="text-sm text-[#B4846C]">+₱ {fmt(a.price)}</span>
                          </div>

                          {multiple ? (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setAddOnQty(a.id, qty - 1)}
                                className="p-2 rounded-full bg-[#F5E3D2] hover:bg-[#EED7C3]"
                                aria-label={`Decrease ${a.name}`}
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="w-8 text-center font-semibold">{qty}</span>
                              <button
                                type="button"
                                onClick={() => setAddOnQty(a.id, qty + 1)}
                                className="p-2 rounded-full bg-[#F5E3D2] hover:bg-[#EED7C3]"
                                aria-label={`Increase ${a.name}`}
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <label className=" inline-flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                className="cursor-pointer accent-[#7D5A50] w-5 h-5"
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

                  <div className="mt-4 text-sm text-[#7D5A50]">
                    <span className="font-semibold">Subtotal per item with add-ons:</span>{" "}
                    ₱ {fmt(unitPrice)}
                  </div>
                </div>
              )}

              {/* You May Also Like - Only for Beverages */}
              {isBeverages && (
                <div className="mt-12">
                  <h4 className="text-xl font-semibold mb-4">You may also like</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {suggestedBeverages.map(item => (
                      <HomeCard
                        key={item.id}
                        name={item.name}
                        price={item.price}
                        img={item.img}
                        onClick={() => navigate(`/product/${item.id}`)}
                      />
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
