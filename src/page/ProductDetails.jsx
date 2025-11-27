import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "../../firebase"; 
import { doc, getDoc } from "firebase/firestore";

function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("Medium");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, "inventory", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() });
        } else {
          console.error("Product not found");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };

    fetchProduct();
  }, [id]);

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-coffee-300 border-t-coffee-700 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-coffee-700 text-lg font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-coffee-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm">
          <ol className="flex items-center gap-2 text-coffee-600">
            <li><a href="/" className="hover:text-coffee-800">Home</a></li>
            <li>/</li>
            <li><a href="/menu" className="hover:text-coffee-800">Menu</a></li>
            <li>/</li>
            <li className="text-coffee-800 font-medium">{product.name}</li>
          </ol>
        </nav>

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-2 gap-12 bg-white rounded-3xl shadow-soft-xl p-8 md:p-12">
          
          {/* Left: Image Section */}
          <div className="space-y-6">
            <div className="relative bg-gradient-to-br from-coffee-50 to-coffee-100 rounded-2xl p-8 aspect-square flex items-center justify-center overflow-hidden group">
              <img
                src={product.img}
                alt={product.name}
                className="max-h-full max-w-full object-contain transform group-hover:scale-110 transition-transform duration-500"
              />
              {/* Badge */}
              {product.category && (
                <span className="absolute top-4 left-4 bg-coffee-700 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                  {product.category}
                </span>
              )}
            </div>
            
            {/* Thumbnail Gallery (if you have multiple images) */}
            {/* <div className="grid grid-cols-4 gap-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="bg-coffee-100 rounded-lg aspect-square cursor-pointer hover:ring-2 ring-coffee-600 transition"></div>
              ))}
            </div> */}
          </div>

          {/* Right: Product Info */}
          <div className="flex flex-col">
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold text-coffee-900 mb-4 leading-tight">
                {product.name}
              </h1>
              
              <div className="flex items-baseline gap-4 mb-6">
                <span className="text-4xl font-bold text-coffee-700">
                  ₱{Number(product.price).toFixed(2)}
                </span>
                {/* Optional: Show old price if on sale */}
                {/* <span className="text-xl text-coffee-400 line-through">₱120.00</span> */}
              </div>

              {/* Rating & Reviews */}
              <div className="flex items-center gap-4 mb-8 pb-8 border-b border-coffee-200">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-yellow-400" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                    </svg>
                  ))}
                </div>
                <span className="text-coffee-600 text-sm">4.8 (234 reviews)</span>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-coffee-900 mb-3">Description</h3>
                <p className="text-coffee-600 leading-relaxed">
                  {product.description || "A perfect blend of rich espresso and velvety steamed milk, topped with a layer of smooth foam. Our signature Cappuccino delivers the perfect balance of bold coffee flavor and creamy texture."}
                </p>
              </div>

              {/* Size Options */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-coffee-900 mb-4">Size</h3>
                <div className="flex gap-3">
                  {["Small", "Medium", "Large"].map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                        selectedSize === size
                          ? "bg-coffee-700 text-white shadow-lg scale-105"
                          : "bg-coffee-100 text-coffee-700 hover:bg-coffee-200"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-coffee-900 mb-4">Quantity</h3>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 rounded-xl bg-coffee-100 hover:bg-coffee-200 text-coffee-800 font-bold text-xl transition flex items-center justify-center"
                  >
                    −
                  </button>
                  <span className="text-2xl font-bold text-coffee-900 min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-12 rounded-xl bg-coffee-100 hover:bg-coffee-200 text-coffee-800 font-bold text-xl transition flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Add to Cart Button */}
            <div className="space-y-3">
              <button className="w-full bg-coffee-700 hover:bg-coffee-800 text-white py-4 px-8 rounded-xl font-bold text-lg shadow-soft-lg hover:shadow-soft-xl transition-all transform hover:scale-[1.02] active:scale-[0.98]">
                Add to Bag - ₱{(product.price * quantity).toFixed(2)}
              </button>
              <button className="w-full border-2 border-coffee-700 text-coffee-700 hover:bg-coffee-50 py-4 px-8 rounded-xl font-bold text-lg transition-all">
                Add to Favorites
              </button>
            </div>
          </div>
        </div>

        {/* Additional Info Tabs */}
        <div className="mt-12 bg-white rounded-3xl shadow-soft-lg p-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-coffee-50 rounded-2xl">
              <div className="text-3xl mb-3">☕</div>
              <h4 className="font-bold text-coffee-900 mb-2">Premium Quality</h4>
              <p className="text-sm text-coffee-600">100% Arabica beans, ethically sourced</p>
            </div>
            <div className="text-center p-6 bg-coffee-50 rounded-2xl">
              <div className="text-3xl mb-3">🚚</div>
              <h4 className="font-bold text-coffee-900 mb-2">Fast Delivery</h4>
              <p className="text-sm text-coffee-600">Ready in 10-15 minutes</p>
            </div>
            <div className="text-center p-6 bg-coffee-50 rounded-2xl">
              <div className="text-3xl mb-3">✨</div>
              <h4 className="font-bold text-coffee-900 mb-2">Fresh Daily</h4>
              <p className="text-sm text-coffee-600">Made fresh with every order</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
