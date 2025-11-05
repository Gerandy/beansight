import { useParams, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useCart } from "../CartContext";
import logo from "../../assets/ahjinlogo.png";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("Medium"); // default size

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
      size: selectedSize, // include size
    };

    addToCart(cartItem);
  };

  if (!product) return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-coffee-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-700 mx-auto mb-4"></div>
        <p className="text-coffee-700 font-medium">Loading product...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-coffee-100 text-coffee-900">
      <div className="max-w-6xl mx-auto py-10 px-6">

        {/* Back Button */}
        <button
          className="mb-6 text-coffee-600 hover:text-coffee-700 font-medium transition"
          onClick={() => navigate(-1)}
        >
          ← Back to Menu
        </button>

        <div className="flex flex-col lg:flex-row gap-10">

          {/* LEFT — Image + Price + Quantity */}
          <div className="flex-1 bg-white rounded-2xl shadow p-8 flex flex-col items-center">
            <img
              src={product.img || logo}
              alt={product.name}
              className="w-72 h-72 object-contain rounded-xl shadow-md"
            />

            <h2 className="text-3xl font-bold mt-6">{product.name}</h2>
            <p className="text-2xl font-semibold mt-2">
              ₱ {Number(product.price).toFixed(2)}
            </p>

            {/* Quantity Selector */}
            <div className="flex items-center mt-6 bg-coffee-100 rounded-full overflow-hidden">
              <button
                className="px-4 py-2 text-2xl"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                −
              </button>
              <span className="px-6 py-2 text-lg font-semibold bg-white">
                {quantity}
              </span>
              <button
                className="px-4 py-2 text-2xl"
                onClick={() => setQuantity(quantity + 1)}
              >
                +
              </button>
            </div>

            {/* Add to Cart */}
            <button
              className="mt-6 bg-coffee-700 hover:bg-coffee-800 text-white font-bold px-10 py-3 rounded-full text-lg shadow-md transition"
              onClick={handleAddToCart}
            >
              Add to My Bag
            </button>
          </div>

          {/* RIGHT — Product Info / Category */}
          <div className="flex-1 bg-white rounded-2xl shadow p-8 text-coffee-800">
            <h3 className="text-xl font-bold mb-4">Product Information</h3>
            <div className="space-y-4">
              <p><strong className="text-coffee-700">Category:</strong> {product.category || "Uncategorized"}</p>
              {product.description && <p><strong className="text-coffee-700">Description:</strong> {product.description}</p>}
            </div>
            {/* Customization: Size */}
            <div className="mt-6">
              <label className="block font-semibold mb-2">Size</label>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="size"
                    value="Medium"
                    checked={selectedSize === "Medium"}
                    onChange={() => setSelectedSize("Medium")}
                  />
                  Medium
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="size"
                    value="Large"
                    checked={selectedSize === "Large"}
                    onChange={() => setSelectedSize("Large")}
                  />
                  Large
                </label>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
