import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import logo from "../../assets/ahjinlogo.png";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [size, setSize] = useState("medium");
  const [drink, setDrink] = useState("americano");
  const [quantity, setQuantity] = useState(1);
  const [drinkIdx, setDrinkIdx] = useState(0);

  // Example product data
  const product = {
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

  // Carousel logic for drinks
  const visibleDrinks = 3;
  const canScrollLeft = drinkIdx > 0;
  const canScrollRight = drinkIdx < product.drinks.length - visibleDrinks;

  return (
    <div className="text-black min-h-screen mt-13">
      <div className="max-w-6xl mx-auto py-8 px-4">
        <button
          className="mb-4 flex items-center text-gray-700 hover:underline"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft size={20} className="mr-1" />
          Back to Menu
        </button>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 flex flex-col items-center bg-white rounded-2xl shadow p-8">
            <img src={product.image} alt={product.name} className="w-80 h-80 object-contain" />
            <h2 className="text-2xl font-bold mt-4">{product.name}</h2>
            <p className="text-xl font-semibold mb-2">₱ {product.price.toFixed(2)}</p>

            <div className="flex items-center mt-3 mb-4">
              <button
                className="px-3 py-1 border rounded-l text-xl"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >-</button>
              <span className="px-4 text-lg">{quantity}</span>
              <button
                className="px-3 py-1 border rounded-r text-xl"
                onClick={() => setQuantity(quantity + 1)}
              >+</button>
            </div>

            <button className="mt-2 bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-8 py-3 rounded-full text-lg shadow">
              Add to My Bag
            </button>
          </div>


          <div className="flex-1 bg-white rounded-2xl shadow p-8">

            <h3 className="font-bold mb-2">Customize your Order</h3>
            <div className="flex gap-6 mb-6">
              <label className="flex items-center gap-2 text-lg">
                <input
                  type="radio"
                  name="size"
                  value="large"
                  checked={size === "large"}
                  onChange={() => setSize("large")}
                />
                Large
              </label>
              <label className="flex items-center gap-2 text-lg">
                <input
                  type="radio"
                  name="size"
                  value="medium"
                  checked={size === "medium"}
                  onChange={() => setSize("medium")}
                />
                Medium
              </label>
              <label className="flex items-center gap-2 text-lg">
                <input
                  type="radio"
                  name="size"
                  value="solo"
                  checked={size === "solo"}
                  onChange={() => setSize("solo")}
                />
                Solo
              </label>
            </div>

            <h3 className="font-bold mb-2">Choose your Drink</h3>
            <div className="flex items-center mb-6">
              <button
                className="p-1 rounded-full bg-gray-200 mr-2 disabled:opacity-50"
                onClick={() => setDrinkIdx(drinkIdx - 1)}
                disabled={!canScrollLeft}
              >
                <ChevronLeft size={20} />
              </button>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.drinks.slice(drinkIdx, drinkIdx + visibleDrinks).map((d) => (
                  <div
                    key={d.id}
                    onClick={() => setDrink(d.id)}
                    className={`cursor-pointer border rounded-xl p-2 min-w-[120px] text-center transition ${
                      drink === d.id ? "border-yellow-500 bg-yellow-50" : "border-gray-200"
                    }`}
                  >
                    <img src={d.img} alt={d.name} className="w-20 h-20 mx-auto mb-2" />
                    <p className="text-sm">{d.name}</p>
                    {d.isNew && (
                      <span className="text-xs text-red-500 font-bold">New</span>
                    )}
                  </div>
                ))}
              </div>
              <button
                className="p-1 rounded-full bg-gray-200 ml-2 disabled:opacity-50"
                onClick={() => setDrinkIdx(drinkIdx + 1)}
                disabled={!canScrollRight}
              >
                <ChevronRight size={20} />
              </button>
            </div>

            
            <h3 className="font-bold mb-2">Choose your Drink Size</h3>
            <div className="flex gap-6">
              {product.sizes.map((s) => (
                <div
                  key={s.id}
                  onClick={() => setSize(s.id)}
                  className={`cursor-pointer border rounded-xl p-4 min-w-[100px] text-center transition ${
                    size === s.id ? "border-yellow-500 bg-yellow-50" : "border-gray-200"
                  }`}
                >
                  <div className="w-10 h-16 bg-gray-200 rounded mx-auto mb-2"></div>
                  <p className="font-semibold">{s.name}</p>
                  <p className="text-xs text-gray-500">(+₱{s.extra})</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
