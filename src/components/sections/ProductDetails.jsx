import { useParams, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useCart } from "../CartContext";
import { Coffee, Info, Ruler, ShoppingBag, ArrowLeft } from "lucide-react";
import logo from "../../assets/ahjinlogo.png";
import MenuCard from "../home/HomeCard"; // Import the MenuCard component

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("Dusk");

  // Example suggested products (replace with actual fetch if needed)
  const suggestedProducts = [
    { name: "Latte", price: 120, img: logo },
    { name: "Cappuccino", price: 130, img: logo },
    { name: "Espresso", price: 100, img: logo },
  ];

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, "Inventory", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() });
        } else {
          console.warn("Product not found in Firestore");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;

    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.img || logo,
      size: selectedSize,
    };

    addToCart(cartItem);
  };

  if (!product)
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FCDEC0] to-[#E5B299] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7D5A50] mx-auto mb-4"></div>
          <p className="text-[#7D5A50] font-medium">Loading product...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br mt-15 text-[#7D5A50]">
      <div className="max-w-6xl mx-auto py-12 px-6">
        {/* Product Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg flex flex-col lg:flex-row overflow-hidden">
          {/* LEFT — Product Image & Info */}
          <div className="lg:w-1/2 flex flex-col items-center justify-center p-10 bg-gradient-to-br from-[#FCECDC] to-[#FCDEC0] relative">
            {/* Back Button - Moved to upper left */}
            <button
              className="absolute top-4 left-4 text-[#7D5A50] hover:text-[#5C4036] transition"
              onClick={() => navigate(-1)}
              aria-label="Back to Menu"
            >
              <ArrowLeft size={24} />
            </button>

            {/* Decorative Blur Circle */}
            <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-[#E5B299] rounded-full blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2"></div>

            <div className="relative z-10 flex flex-col items-center">
              <img
                src={product.img || logo}
                alt={product.name}
                className="w-72 h-72 object-contain rounded-2xl shadow-md"
              />
              <h2 className="text-3xl font-extrabold mt-6 text-[#7D5A50]">
                {product.name}
              </h2>
              <p className="text-2xl font-semibold mt-2">₱ {Number(product.price).toFixed(2)}</p>
              <p className="text-sm text-[#B4846C] italic mt-1">
                Rich and creamy espresso blend
              </p>

              {/* Quantity Selector */}
              <div className="flex items-center mt-6 bg-[#e9c8a8] rounded-full shadow-inner overflow-hidden">
                <button
                  className="px-4 py-2 text-2xl text-[#7D5A50] hover:bg-[#E5B299] transition"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  −
                </button>
                <span className="px-6 py-2 text-lg font-semibold bg-white text-[#7D5A50]">
                  {quantity}
                </span>
                <button
                  className="px-4 py-2 text-2xl text-[#7D5A50] hover:bg-[#E5B299] transition"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                className="mt-8 flex items-center gap-2 bg-[#7D5A50] hover:bg-[#5C4036] transition-all duration-200 text-white font-bold px-10 py-3 rounded-full text-lg shadow-md hover:scale-105 active:scale-95"
                onClick={handleAddToCart}
              >
                <ShoppingBag size={20} />
                Add to My Bag
              </button>
            </div>
          </div>

          {/* RIGHT — Product Information */}
          <div className="lg:w-1/2 p-10 text-[#4A352E] flex flex-col justify-center">
            <h3 className="text-2xl font-bold mb-6">Product Information</h3>

            <div className="space-y-5">
              <div className="bg-[#FCDEC0]/50 p-4 rounded-xl shadow-sm flex items-center gap-3">
                <Coffee className="w-5 h-5 text-[#7D5A50]" />
                <p><strong>Category:</strong> {product.category || "Uncategorized"}</p>
              </div>

              {product.description && (
                <div className="bg-[#FCDEC0]/50 p-4 rounded-xl shadow-sm flex items-start gap-3">
                  <Info className="w-5 h-5 text-[#7D5A50] mt-1" />
                  <p><strong>Description:</strong> {product.description}</p>
                </div>
              )}

              <div className="bg-[#FCDEC0]/50 p-4 rounded-xl shadow-sm flex items-start gap-3">
                <Ruler className="w-5 h-5 text-[#7D5A50] mt-1" />
                <div>
                  <label className="block font-semibold mb-3">Dusk and Dawn Sizes</label>
                  <div className="flex gap-4">
                    {["Dusk", "Dawn"].map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`px-6 py-2 rounded-full font-semibold transition-all ${
                          selectedSize === size
                            ? "bg-[#7D5A50] text-white shadow-md"
                            : "bg-white text-[#7D5A50] border border-[#7D5A50] hover:bg-[#FCDEC0]"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* You May Also Like - Moved to bottom of right container */}
            <div className="mt-12">
              <h4 className="text-xl font-semibold mb-4 text-[#7D5A50]">
                You may also like
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {suggestedProducts.map((item, index) => (
                  <MenuCard
                    key={index}
                    name={item.name}
                    price={item.price}
                    img={item.img}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
