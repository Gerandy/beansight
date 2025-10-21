import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Coffee } from "lucide-react";
import logo from "../../assets/ahjinlogo.png";
import { useCart } from "../CartContext";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [size, setSize] = useState("medium");
  const [drink, setDrink] = useState("americano");
  const [quantity, setQuantity] = useState(1);
  const [drinkIdx, setDrinkIdx] = useState(0);

  const { addToCart } = useCart();

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

    addToCart(cartItem);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br  text-coffee-900">
      <div className="max-w-6xl mx-auto py-10 px-6">
        <button
          className="mb-6 flex items-center text-coffee-600 hover:text-coffee-700 font-medium transition"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft size={20} className="mr-1" />
          Back to Menu
        </button>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* LEFT — Product Image + Info */}
          <div className="flex-1 bg-white rounded-2xl shadow-[var(--shadow-soft-xl)] p-8 flex flex-col items-center">
            <img
              src={product.image}
              alt={product.name}
              className="w-72 h-72 object-contain rounded-xl shadow-md"
            />
            <h2 className="text-3xl font-bold mt-6 text-coffee-900">
              {product.name}
            </h2>
            <p className="text-2xl font-semibold text-coffee-600 mt-2">
              ₱ {product.price.toFixed(2)}
            </p>

            {/* Quantity Selector */}
            <div className="flex items-center mt-6 bg-coffee-100 rounded-full overflow-hidden">
              <button
                className="px-4 py-2 text-2xl text-coffee-800 hover:bg-coffee-200"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                −
              </button>
              <span className="px-6 py-2 text-lg font-semibold bg-white text-coffee-800">
                {quantity}
              </span>
              <button
                className="px-4 py-2 text-2xl text-coffee-800 hover:bg-coffee-200"
                onClick={() => setQuantity(quantity + 1)}
              >
                +
              </button>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className="mt-6 bg-coffee-700 hover:bg-coffee-800 text-white font-bold px-10 py-3 rounded-full text-lg shadow-md transition transform hover:scale-105"
            >
              Add to My Bag
            </button>
          </div>

          {/* RIGHT — Customization */}
          <div className="flex-1 bg-white rounded-2xl shadow-[var(--shadow-soft-lg)] p-8">
            <h3 className="font-bold text-2xl mb-4 text-coffee-900">
              Customize your Order
            </h3>

            {/* Size Options */}
            <div className="mb-10">
              <h4 className="font-semibold text-lg mb-3 text-coffee-800">
                Meal Size
              </h4>
              <div className="flex flex-wrap gap-4">
                {["solo", "medium", "large"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`px-5 py-3 rounded-xl border-2 text-base font-medium transition ${
                      size === s
                        ? "border-coffee-600 bg-coffee-100 text-coffee-700"
                        : "border-coffee-200 hover:border-coffee-400"
                    }`}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Drink Options */}
            <div className="mb-10">
              <h4 className="font-semibold text-lg mb-3 text-coffee-800">
                Choose your Drink
              </h4>
              <div className="flex items-center">
                <button
                  className="p-2 rounded-full bg-coffee-100 hover:bg-coffee-200 mr-2 disabled:opacity-40"
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
                            ? "border-coffee-600 bg-coffee-100"
                            : "border-coffee-100 hover:border-coffee-300"
                        }`}
                      >
                        <img
                          src={d.img}
                          alt={d.name}
                          className="w-20 h-20 mx-auto mb-2 object-contain"
                        />
                        <p className="font-medium text-sm text-coffee-800">
                          {d.name}
                        </p>
                        {d.isNew && (
                          <span className="text-xs text-coffee-600 font-semibold">
                            NEW
                          </span>
                        )}
                      </div>
                    ))}
                </div>
                <button
                  className="p-2 rounded-full bg-coffee-100 hover:bg-coffee-200 ml-2 disabled:opacity-40"
                  onClick={() => setDrinkIdx(drinkIdx + 1)}
                  disabled={!canScrollRight}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            {/* Drink Size Options */}
            <div>
              <h4 className="font-semibold text-lg mb-3 text-coffee-800">
                Drink Size
              </h4>
              <div className="flex gap-6 flex-wrap">
                {product.sizes.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => setSize(s.id)}
                    className={`cursor-pointer border-2 rounded-xl p-4 min-w-[120px] text-center transition transform hover:scale-105 ${
                      size === s.id
                        ? "border-coffee-600 bg-coffee-100"
                        : "border-coffee-200 hover:border-coffee-400"
                    }`}
                  >
                    <div className="w-10 h-16 bg-coffee-50 rounded mx-auto mb-2"></div>
                    <p className="font-semibold text-coffee-800">{s.name}</p>
                    <p className="text-xs text-coffee-500">
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