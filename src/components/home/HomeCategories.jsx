import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

function MenuCategories() {
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  // Static categories
  const categories = [
    { name: "Frappe", imgUrl: "/assets/icons/frappe.png" },
    { name: "Fruity Series", imgUrl: "/assets/icons/frappe.png" },
    { name: "Latte", imgUrl: "/assets/icons/latte.png" },
    { name: "Snacks", imgUrl: "/assets/icons/snacks.png" },
    { name: "Soda Series", imgUrl: "/assets/icons/soda.png" },
    { name: "Strawberry Series", imgUrl: "/assets/icons/stawberry.png" },
    { name: "Tea Series", imgUrl: "/assets/icons/tea.png" },

  ];

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    const scrollAmount = 300; // adjust as needed
    scrollRef.current.scrollBy({
      left: dir === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const handleCategoryClick = (categoryName) => {
    navigate(`/menu?category=${encodeURIComponent(categoryName)}`);
  };

  return (
    <div className="max-w-[1050px] mx-auto py-6 relative">
      <div className="px-4">
        <h1 className="text-coffee-900 text-4xl sm:text-3xl lg:text-4xl font-bold">Menu</h1>
        <p className="text-coffee-700 mb-4 text-sm sm:text-base lg:text-lg">
          What are you craving for today?
        </p>
      </div>

      <div className="relative px-4 flex items-center gap-2">
        <button
          onClick={() => scroll("left")}
          className="rounded-full shadow p-2 bg-coffee-700 text-white hover:bg-coffee-800 transition-colors flex-shrink-0"
        >
          <ChevronLeft size={18} />
        </button>

        <div
          ref={scrollRef}
          className="flex overflow-x-auto gap-6 scrollbar-hide py-4"
        >
          {categories.map((cat) => (
            <div
              key={cat.name}
              className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0"
              style={{ width: 140 }}
              onClick={() => handleCategoryClick(cat.name)}
            >
              <div
                className="rounded-full flex items-center justify-center bg-white shadow-md"
                style={{ width: 120, height:120 }}
              >
                <img
                  src={cat.imgUrl}
                  alt={cat.name}
                  style={{ width: 115, height: 115 }}
                />
              </div>
              <p className="mt-3 text-center font-bold text-coffee-900" style={{ fontSize: 14 }}>
                {cat.name}
              </p>
            </div>
          ))}
        </div>

        <button
          onClick={() => scroll("right")}
          className="rounded-full shadow p-2 bg-coffee-700 text-white hover:bg-coffee-800 transition-colors flex-shrink-0"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

export default MenuCategories;
