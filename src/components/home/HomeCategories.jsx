import { useState, useRef, useEffect } from "react";
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

  const GAP_PX = 32; // gap-8 (bigger spacing like the reference)
  const [visibleCount, setVisibleCount] = useState(
    typeof window !== "undefined" && window.innerWidth >= 1024 ? 5 : 3
  );
  const [startIdx, setStartIdx] = useState(0);
  const [cardWidth, setCardWidth] = useState(0);
  const viewportRef = useRef(null);

  const recalc = () => {
    const vp = viewportRef.current;
    if (!vp) return;

    const isDesktop = window.innerWidth >= 1024; // lg
    const nextVisible = isDesktop ? 5 : 3;

    // exact width so only 'nextVisible' items fit in the viewport
    const available = vp.clientWidth;
    const widthPerCard = Math.floor(
      (available - GAP_PX * (nextVisible - 1)) / nextVisible
    );

    setVisibleCount(nextVisible);
    setCardWidth(widthPerCard);

    const newMaxStart = Math.max(0, categories.length - nextVisible);
    setStartIdx((s) => Math.min(s, newMaxStart)); // clamp after resize
  };

  useEffect(() => {
    recalc();
    const onResize = () => requestAnimationFrame(recalc);
    window.addEventListener("resize", onResize);

    const ro = new ResizeObserver(onResize);
    if (viewportRef.current) ro.observe(viewportRef.current);

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

  const translateX = -(startIdx * (cardWidth + GAP_PX));
  const isDesktop = typeof window !== "undefined" && window.innerWidth >= 1024;

  return (
    <div className="max-w-[1050px] mx-auto px-4 py-6 relative">
      <h1 className="text-gray-950 text-4xl sm:text-3xl lg:text-4xl font-bold">Menu</h1>
      <p className="text-gray-700 mb-4 text-sm sm:text-base lg:text-lg">
        What are you craving for today?
      </p>

      <div className="flex items-center">
        <button
          onClick={() => handleScroll("left")}
          className="rounded-full shadow p-2 mr-2 bg-[#6e4a2d] text-white disabled:opacity-40"
          aria-label="Scroll left"
          disabled={startIdx === 0}
        >
          <ChevronLeft size={18} />
        </button>

        <div
          ref={viewportRef}
          className="relative w-full overflow-hidden"
          style={{ height: isDesktop ? 230 : 160 }}
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
                className="flex flex-col items-center select-none"
                style={{ width: `${cardWidth}px` }}
              >
                {/* Yellow circle like reference; larger on desktop */}
                <div
                  className="rounded-full flex items-center justify-center bg-white"
                  style={{
                    width: isDesktop ? 160 : 96,
                    height: isDesktop ? 160 : 96,
                  }}
                >
                  <img
                    src={cat.img}
                    alt={cat.name}
                    style={{
                      width: isDesktop ? 96 : 56,
                      height: isDesktop ? 96 : 56,
                    }}
                  />
                </div>
                <p
                  className="mt-3 text-center font-bold text-gray-900"
                  style={{ fontSize: isDesktop ? 18 : 14, lineHeight: 1.2 }}
                >
                  {cat.name}
                </p>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => handleScroll("right")}
          className="rounded-full shadow p-2 ml-2 bg-[#6e4a2d] text-white disabled:opacity-40"
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