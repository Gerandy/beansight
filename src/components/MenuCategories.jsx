import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState, useEffect } from "react";

function MenuCategories() {
  const categories = [
    "Featured",
    "Group Meals",
    "Chicken",
    "Burgers",
    "McSpaghetti",
    "Rice Bowls",
    "Desserts & Drinks",
    "McCafé",
    "Fries & Extras",
    "Happy Meal",
    "Sulit Busog Meals",
  ];

  const scrollRef = useRef(null);
  const [showArrows, setShowArrows] = useState(false);

  const checkOverflow = () => {
    if (scrollRef.current) {
      setShowArrows(scrollRef.current.scrollWidth > scrollRef.current.clientWidth);
    }
  };

  useEffect(() => {
    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, []);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = direction === "left" ? -clientWidth : clientWidth;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="relative bg-lime-50 shadow-sm border-b sticky top-16 z-20">
      {showArrows && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-lime-50 shadow-md p-2 rounded-full z-30"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
      )}

      <div
        ref={scrollRef}
        className="flex justify-between space-x-6 overflow-x-hidden py-3 px-12 scroll-smooth"
      >
        {categories.map((cat, idx) => (
          <button
            key={idx}
            className="text-sm font-medium text-gray-700 hover:text-yellow-950 whitespace-nowrap"
          >
            {cat}
          </button>
        ))}
      </div>

      {showArrows && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-lime-50 shadow-md p-2 rounded-full z-30"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      )}
    </div>
  );
}

export default MenuCategories;



