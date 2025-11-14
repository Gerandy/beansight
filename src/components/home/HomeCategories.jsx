import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

function MenuCategories({ onCategoryClick = () => {} }) {
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

  const GAP_PX = 32;
  const [visibleCount, setVisibleCount] = useState(
    typeof window !== "undefined" && window.innerWidth >= 1024 ? 4 : 3
  );
  const [startIdx, setStartIdx] = useState(0);
  const [cardWidth, setCardWidth] = useState(0);
  const desktopViewportRef = useRef(null);
  const mobileViewportRef = useRef(null);

  const recalc = () => {
    const isDesktop = window.innerWidth >= 1024;
    const vp = isDesktop ? desktopViewportRef.current : mobileViewportRef.current;
    if (!vp) return;

    const nextVisible = isDesktop ? 4 : 3;

    const available = vp.clientWidth;
    // Calculate total gap space between visible items
    const totalGaps = (nextVisible - 1) * GAP_PX;
    // Divide available space by visible count, accounting for gaps
    const widthPerCard = Math.floor((available - totalGaps) / nextVisible);

    setVisibleCount(nextVisible);
    setCardWidth(widthPerCard);

    const newMaxStart = Math.max(0, categories.length - nextVisible);
    setStartIdx((s) => Math.min(s, newMaxStart));
  };

  useEffect(() => {
    recalc();
    const onResize = () => requestAnimationFrame(recalc);
    window.addEventListener("resize", onResize);

    const ro = new ResizeObserver(onResize);
    if (desktopViewportRef.current) ro.observe(desktopViewportRef.current);
    if (mobileViewportRef.current) ro.observe(mobileViewportRef.current);

    return () => {
      window.removeEventListener("resize", onResize);
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const maxStart = Math.max(0, categories.length - visibleCount);

  const handleScroll = (dir) => {
    setStartIdx((s) =>
      dir === "left"
        ? Math.max(0, s - visibleCount)
        : Math.min(maxStart, s + visibleCount)
    );
  };

  // Calculate translateX including gaps
  const translateX = -(startIdx * (cardWidth + GAP_PX));

  return (
    <div className="max-w-[1050px] mx-auto py-6 relative">
      <div className="px-4">
        <h1 className="text-coffee-900 text-4xl sm:text-3xl lg:text-4xl font-bold">
          Menu
        </h1>
        <p className="text-coffee-700 mb-4 text-sm sm:text-base lg:text-lg">
          What are you craving for today?
        </p>
      </div>

      {/* Desktop layout - arrows beside carousel */}
      <div className="hidden lg:flex items-center gap-2 px-4">
        <button
          onClick={() => handleScroll("left")}
          className="rounded-full shadow p-2 bg-coffee-700 text-white disabled:opacity-40 hover:bg-coffee-800 transition-colors flex-shrink-0"
          aria-label="Scroll left"
          disabled={startIdx === 0}
        >
          <ChevronLeft size={18} />
        </button>

        <div
          ref={desktopViewportRef}
          className="relative flex-1 overflow-hidden"
          style={{ height: 230 }}
        >
          <div
            className="flex transition-transform duration-300 ease-out"
            style={{
              gap: `${GAP_PX}px`,
              transform: `translateX(${translateX}px)`,
            }}
          >
            {categories.map((cat) => (
              <div
                key={cat.name}
                className="flex flex-col items-center select-none cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0"
                style={{ 
                  width: `${cardWidth}px`,
                }}
                onClick={() => onCategoryClick(cat.name)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onCategoryClick(cat.name);
                  }
                }}
              >
                <div
                  className="rounded-full flex items-center justify-center bg-white shadow-md"
                  style={{
                    width: 160,
                    height: 160,
                  }}
                >
                  <img
                    src={cat.img}
                    alt={cat.name}
                    style={{
                      width: 96,
                      height: 96,
                    }}
                  />
                </div>
                <p
                  className="mt-3 text-center font-bold text-coffee-900"
                  style={{ fontSize: 18, lineHeight: 1.2 }}
                >
                  {cat.name}
                </p>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => handleScroll("right")}
          className="rounded-full shadow p-2 bg-coffee-700 text-white disabled:opacity-40 hover:bg-coffee-800 transition-colors flex-shrink-0"
          aria-label="Scroll right"
          disabled={startIdx >= maxStart}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Mobile layout - arrows overlap carousel */}
      <div className="lg:hidden relative px-4">
        <div
          ref={mobileViewportRef}
          className="relative overflow-hidden"
          style={{ height: 180 }}
        >
          <div
            className="flex transition-transform duration-300 ease-out"
            style={{
              gap: `${GAP_PX}px`,
              transform: `translateX(${translateX}px)`,
            }}
          >
            {categories.map((cat) => (
              <div
                key={cat.name}
                className="flex flex-col items-center select-none cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0"
                style={{ 
                  width: `${cardWidth}px`,
                }}
                onClick={() => onCategoryClick(cat.name)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onCategoryClick(cat.name);
                  }
                }}
              >
                <div
                  className="rounded-full flex items-center justify-center bg-white shadow-md"
                  style={{
                    width: 110,
                    height: 110,
                  }}
                >
                  <img
                    src={cat.img}
                    alt={cat.name}
                    style={{
                      width: 70,
                      height: 70,
                    }}
                  />
                </div>
                <p
                  className="mt-3 text-center font-bold text-coffee-900"
                  style={{ fontSize: 14, lineHeight: 1.2 }}
                >
                  {cat.name}
                </p>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => handleScroll("left")}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 rounded-full shadow p-2 bg-coffee-700 text-white disabled:opacity-40 hover:bg-coffee-800 transition-colors"
          aria-label="Scroll left"
          disabled={startIdx === 0}
        >
          <ChevronLeft size={18} />
        </button>

        <button
          onClick={() => handleScroll("right")}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 rounded-full shadow p-2 bg-coffee-700 text-white disabled:opacity-40 hover:bg-coffee-800 transition-colors"
          aria-label="Scroll right"
          disabled={startIdx >= maxStart}
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

export default MenuCategories;