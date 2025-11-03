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
    <div className="relative bg-coffee-50 shadow-sm border-b border-coffee-200 sticky top-16 z-20">
      {showArrows && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-coffee-700 text-white shadow-md p-2 rounded-full z-30 hover:bg-coffee-800 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}

      <div
        ref={scrollRef}
        className="flex justify-between space-x-6 overflow-x-hidden py-3 px-12 scroll-smooth bg-coffee-50"
      >
        {categories.map((cat, idx) => (
          <button
            key={idx}
            className="text-sm font-medium text-coffee-700 hover:text-coffee-900 whitespace-nowrap hover:cursor-pointer transition-colors"
          >
            {cat}
          </button>
        ))}
      </div>

      {showArrows && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-coffee-700 text-white shadow-md p-2 rounded-full z-30 hover:bg-coffee-800 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

export default MenuCategories;



