import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

function MenuCategories() {
  const categories = [
    { name: "Featured", img: "src/assets/ahjinlogo.png" },
    { name: "Group Meals", img: "src/assets/ahjinlogo.png" },
    { name: "Breakfast", img: "src/assets/ahjinlogo.png" },
    { name: "Chicken", img: "src/assets/ahjinlogo.png" },
    { name: "Beverage", img: "src/assets/ahjinlogo.png" },
    { name: "Dessert", img: "src/assets/ahjinlogo.png" },
    { name: "Sides", img: "src/assets/ahjinlogo.png" },
    { name: "Drinks", img: "src/assets/ahjinlogo.png" },
    { name: "Value Meals", img: "src/assets/ahjinlogo.png" },
    { name: "Specials", img: "src/assets/ahjinlogo.png" },
  ];

  const [startIdx, setStartIdx] = useState(0);
  const visibleCount = 5;
  const cardWidth = 180;

  const handleScroll = (direction) => {
    if (direction === "left" && startIdx > 0) {
      setStartIdx(startIdx - 1);
    }
    if (direction === "right" && startIdx < categories.length - visibleCount) {
      setStartIdx(startIdx + 1);
    }
  };

  return (
    <div className="max-w-[950px] mx-auto p-6 relative">
      <h1 className="text-gray-950 text-4xl font-bold">Menu</h1>
      <p className="text-gray-950 mb-6">What are you craving for today?</p>
      <div className="flex items-center">
        <button
          onClick={() => handleScroll("left")}
          className="bg-yellow-950 rounded-full shadow p-2 mr-2 flex items-center justify-center"
          aria-label="Scroll left"
          disabled={startIdx === 0}
        >
          <ChevronLeft size={20} />
        </button>
        <div className="relative w-full overflow-hidden" style={{ maxWidth: `${visibleCount * cardWidth}px`, height: "140px" }}>
          <div
            className="flex gap-6 transition-transform duration-300"
            style={{
              transform: `translateX(-${startIdx * cardWidth}px)`,
              width: `${categories.length * cardWidth}px`,
            }}
          >
            {categories.map((cat) => (
              <div
                key={cat.name}
                className="flex flex-col items-center"
                style={{ width: "150px" }}
              >
                <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center">
                  <img src={cat.img} alt={cat.name} className="w-15 h-15" />
                </div>
                <p className="text-gray-950 font-bold mt-2">{cat.name}</p>
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={() => handleScroll("right")}
          className="bg-yellow-950 rounded-full shadow p-2 ml-2 flex items-center justify-center"
          aria-label="Scroll right"
          disabled={startIdx >= categories.length - visibleCount}
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}

export default MenuCategories;