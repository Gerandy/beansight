import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

function MenuCategories() {
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const categories = [
    { name: "Frappe", imgUrl: "/assets/icons/frappe.png" },
    { name: "Fruity Series", imgUrl: "/assets/icons/frappe.png" },
    { name: "Latte", imgUrl: "/assets/icons/latte.png" },
    { name: "Snacks", imgUrl: "/assets/icons/snacks.png" },
    { name: "Soda Series", imgUrl: "/assets/icons/soda.png" },
    { name: "Strawberry Series", imgUrl: "/assets/icons/stawberry.png" },
    { name: "Tea Series", imgUrl: "/assets/icons/tea.png" },
  ];

  // Card width for desktop (4 visible)
  const [cardWidth, setCardWidth] = useState(0);
  const desktopRowRef = useRef(null);

  useEffect(() => {
    const recalc = () => {
      if (desktopRowRef.current) {
        const available = desktopRowRef.current.clientWidth;
        const gap = 24 * 3; // 4 cards, 3 gaps
        setCardWidth(Math.floor((available - gap) / 4));
      }
    };
    recalc();
    window.addEventListener("resize", recalc);
    return () => window.removeEventListener("resize", recalc);
  }, []);

  // Desktop scroll handler
  const scrollDesktop = (dir) => {
    if (desktopRowRef.current) {
      desktopRowRef.current.scrollBy({
        left: dir === "right" ? cardWidth * 2 : -cardWidth * 2,
        behavior: "smooth",
      });
    }
  };

  const handleCategoryClick = (categoryName) => {
    navigate(`/menu?category=${encodeURIComponent(categoryName)}`);
  };

  return (
    <div className="max-w-[1050px] mx-auto py-2 sm:py-4 lg:py-6 relative">
      <div className="px-4">
        <h1 className="text-coffee-900 text-2xl sm:text-3xl lg:text-4xl font-bold">Menu</h1>
        <p className="text-coffee-700 mb-2 sm:mb-4 text-xs sm:text-base lg:text-lg">
          What are you craving for today?
        </p>
      </div>

      {/* Mobile: swipeable, 3 cards visible, no arrows */}
      <div className="lg:hidden relative px-4">
        <div className="flex overflow-x-auto gap-3 scrollbar-hide py-2 snap-x snap-mandatory">
          {categories.map((cat) => (
            <div
              key={cat.name}
              className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0 w-[calc((100vw-2rem-24px)/3)] snap-start"
              onClick={() => handleCategoryClick(cat.name)}
            >
              <div
                className="rounded-full flex items-center justify-center bg-white shadow-md"
                style={{ width: 80, height: 80 }}
              >
                <img
                  src={cat.imgUrl}
                  alt={cat.name}
                  style={{ width: 56, height: 56 }}
                />
              </div>
              <p className="mt-2 text-center font-bold text-coffee-900" style={{ fontSize: 12 }}>
                {cat.name}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop: scrollable row, 4 visible, arrows float */}
      <div className="hidden lg:block relative px-4">
        <button
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-10 h-10 bg-coffee-600 text-white shadow-md rounded-full cursor-pointer"
          onClick={() => scrollDesktop("left")}
          aria-label="Scroll left"
        >
          <ChevronLeft size={24} />
        </button>
        <div
          ref={desktopRowRef}
          className="flex overflow-x-auto gap-6 scrollbar-hide py-4"
          style={{ scrollBehavior: "smooth" }}
        >
          {categories.map((cat) => (
            <div
              key={cat.name}
              className="desktop-card flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0"
              style={{ width: `${cardWidth}px` }}
              onClick={() => handleCategoryClick(cat.name)}
            >
              <div
                className="rounded-full flex items-center justify-center bg-white shadow-md"
                style={{ width: 160, height: 160 }}
              >
                <img
                  src={cat.imgUrl}
                  alt={cat.name}
                  style={{ width: 96, height: 96 }}
                />
              </div>
              <p className="mt-3 text-center font-bold text-coffee-900" style={{ fontSize: 18 }}>
                {cat.name}
              </p>
            </div>
          ))}
        </div>
        <button
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-10 h-10 bg-coffee-600 text-white shadow-md rounded-full cursor-pointer"
          onClick={() => scrollDesktop("right")}
          aria-label="Scroll right"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
}

export default MenuCategories;
