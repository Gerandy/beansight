import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import logo from "../../assets/ahjinlogo.png";
import { useCart } from "../CartContext";
 

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [size, setSize] = useState("medium");
  const [drink, setDrink] = useState("americano");
  const [quantity, setQuantity] = useState(1);
  const [drinkIdx, setDrinkIdx] = useState(0);

  const { addToCart } = useCart(); // ✅ Get addToCart from context

  const product = {
    id,
    name: "Cheeseburger Meal",
    price: 206.0,
    image: logo,
    drinks: [
      { id: "americano", name: "Kape", img: logo },
      { id: "royal", name: "Royal", img: logo, isNew: true },
      { id: "coke", name: "Coke", img: logo },
      { id: "cokezero", name: "Coke Zero", img: logo },
      { id: "sprite", name: "Sprite", img: logo },
    ],
    sizes: [
      { id: "medium", name: "Medium", extra: 50 },
      { id: "large", name: "Large", extra: 70 },
    ],
  };

  const visibleDrinks = 3;
  const canScrollLeft = drinkIdx > 0;
  const canScrollRight = drinkIdx < product.drinks.length - visibleDrinks;

  // ✅ Handle Add to Cart
  const handleAddToCart = () => {
    const selectedSize = product.sizes.find((s) => s.id === size);
    const totalPrice = product.price + (selectedSize?.extra || 0);

    const cartItem = {
      id: `${product.id}-${size}-${drink}`,
      name: `${product.name} (${size}, ${drink})`,
      price: totalPrice,
      quantity,
      image: product.image,
    };

    addToCart(cartItem); // ✅ Add to cart context
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100 text-gray-800">
      <div className="max-w-6xl mx-auto py-10 px-6">
        <button
          className="mb-6 flex items-center text-yellow-600 hover:text-yellow-700 font-medium transition"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft size={20} className="mr-1" />
          Back to Menu
        </button>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* LEFT — Product Image + Basic Info */}
          <div className="flex-1 bg-white rounded-3xl shadow-lg p-8 flex flex-col items-center">
            <img
              src={product.image}
              alt={product.name}
              className="w-72 h-72 object-contain rounded-2xl shadow-md"
            />
            <h2 className="text-3xl font-bold mt-6 text-gray-900">
              {product.name}
            </h2>
            <p className="text-2xl font-semibold text-yellow-600 mt-2">
              ₱ {product.price.toFixed(2)}
            </p>

            {/* Quantity Selector */}
            <div className="flex items-center mt-6 bg-gray-100 rounded-full overflow-hidden shadow-inner">
              <button
                className="px-4 py-2 text-2xl text-gray-700 hover:bg-yellow-100"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                −
              </button>
              <span className="px-6 py-2 text-lg font-semibold bg-white">
                {quantity}
              </span>
              <button
                className="px-4 py-2 text-2xl text-gray-700 hover:bg-yellow-100"
                onClick={() => setQuantity(quantity + 1)}
              >
                +
              </button>
            </div>

            {/* ✅ Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className="mt-6 bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-10 py-3 rounded-full text-lg shadow-lg transition transform hover:scale-105"
            >
              Add to My Bag
            </button>
          </div>

          {/* RIGHT — Customization */}
          <div className="flex-1 bg-white rounded-3xl shadow-lg p-8">
            <h3 className="font-bold text-2xl mb-4 text-gray-900">
              Customize your Order
            </h3>

            {/* Size Options */}
            <div className="mb-10">
              <h4 className="font-semibold text-lg mb-3">Meal Size</h4>
              <div className="flex flex-wrap gap-4">
                {["solo", "medium", "large"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`px-5 py-3 rounded-xl border-2 text-base font-medium transition ${
                      size === s
                        ? "border-yellow-500 bg-yellow-100 text-yellow-700"
                        : "border-gray-200 hover:border-yellow-400"
                    }`}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Drink Options */}
            <div className="mb-10">
              <h4 className="font-semibold text-lg mb-3">Choose your Drink</h4>
              <div className="flex items-center">
                <button
                  className="p-2 rounded-full bg-gray-100 hover:bg-yellow-100 mr-2 disabled:opacity-40"
                  onClick={() => setDrinkIdx(drinkIdx - 1)}
                  disabled={!canScrollLeft}
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="flex gap-4 overflow-hidden">
                  {product.drinks
                    .slice(drinkIdx, drinkIdx + visibleDrinks)
                    .map((d) => (
                      <div
                        key={d.id}
                        onClick={() => setDrink(d.id)}
                        className={`cursor-pointer border-2 rounded-2xl p-4 min-w-[120px] text-center shadow-sm transition transform hover:scale-105 ${
                          drink === d.id
                            ? "border-yellow-500 bg-yellow-50"
                            : "border-gray-100"
                        }`}
                      >
                        <img
                          src={d.img}
                          alt={d.name}
                          className="w-20 h-20 mx-auto mb-2 object-contain"
                        />
                        <p className="font-medium text-sm">{d.name}</p>
                        {d.isNew && (
                          <span className="text-xs text-red-500 font-semibold">
                            NEW
                          </span>
                        )}
                      </div>
                    ))}
                </div>
                <button
                  className="p-2 rounded-full bg-gray-100 hover:bg-yellow-100 ml-2 disabled:opacity-40"
                  onClick={() => setDrinkIdx(drinkIdx + 1)}
                  disabled={!canScrollRight}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            {/* Drink Size Options */}
            <div>
              <h4 className="font-semibold text-lg mb-3">Drink Size</h4>
              <div className="flex gap-6 flex-wrap">
                {product.sizes.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => setSize(s.id)}
                    className={`cursor-pointer border-2 rounded-xl p-4 min-w-[120px] text-center transition transform hover:scale-105 ${
                      size === s.id
                        ? "border-yellow-500 bg-yellow-50"
                        : "border-gray-200 hover:border-yellow-300"
                    }`}
                  >
                    <div className="w-10 h-16 bg-gray-200 rounded mx-auto mb-2"></div>
                    <p className="font-semibold">{s.name}</p>
                    <p className="text-xs text-gray-500">
                      (+₱{s.extra.toFixed(0)})
                    </p>
                  </div>
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