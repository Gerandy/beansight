function MenuGrid() {
  const products = [
    {
      id: 1,
      name: "McCafé Cereal Milk Iced Latte",
      price: 130,
      img: "/images/latte.png",
      isNew: true,
    },
    {
      id: 2,
      name: "McCafé Cereal Milk Iced Coffee",
      price: 83,
      img: "/images/icedcoffee.png",
      isNew: true,
    },
    {
      id: 3,
      name: "McCafé Cereal Milk Premium Roast Coffee",
      price: 73,
      img: "/images/roastcoffee.png",
      isNew: true,
    },
    {
      id: 4,
      name: "Golden Chicken Curry Fillet with Fries Medium Meal",
      price: 181,
      img: "/images/chickenmeal.png",
      isNew: false,
    },
        {
      id: 4,
      name: "Golden Chicken Curry Fillet with Fries Medium Meal",
      price: 181,
      img: "/images/chickenmeal.png",
      isNew: false,
    },
        {
      id: 4,
      name: "Golden Chicken Curry Fillet with Fries Medium Meal",
      price: 181,
      img: "/images/chickenmeal.png",
      isNew: false,
    },
        {
      id: 4,
      name: "Golden Chicken Curry Fillet with Fries Medium Meal",
      price: 181,
      img: "/images/chickenmeal.png",
      isNew: false,
    },
            {
      id: 4,
      name: "Golden Chicken Curry Fillet with Fries Medium Meal",
      price: 181,
      img: "/images/chickenmeal.png",
      isNew: false,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto mt-15 px-4 py-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((p) => (
          <div
            key={p.id}
            className="border rounded-xl shadow-sm p-3 flex flex-col relative bg-white"
          >
            
            {p.isNew && (
              <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                New
              </span>
            )}

            
            <img
              src={p.img}
              alt={p.name}
              className="h-32 object-contain mx-auto"
            />

            
            <h3 className="mt-3 font-medium text-gray-900 text-sm md:text-base">
              {p.name}
            </h3>
            <p className="font-semibold text-black text-sm md:text-base">
              ₱ {p.price}.00
            </p>

            
            <button className="mt-auto bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 px-4 rounded-xl">
              Order
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MenuGrid;

