import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";
import { db, storage } from "../../firebase";

function MenuCategories({ onCategoryClick = () => {} }) {
  const [categories, setCategories] = useState([]);
  const GAP_PX = 32;
  const [visibleCount, setVisibleCount] = useState(
    typeof window !== "undefined" && window.innerWidth >= 1024 ? 4 : 3
  );
  const [startIdx, setStartIdx] = useState(0);
  const [cardWidth, setCardWidth] = useState(0);
  const desktopRef = useRef(null);
  const mobileRef = useRef(null);

  // Fetch categories from Firestore + Storage
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const snapshot = await getDocs(collection(db, "menuCategories"));
        const cats = [];

        for (const doc of snapshot.docs) {
          const data = doc.data();
          let imgUrl = "";

          if (data.img) {
            try {
              imgUrl = await getDownloadURL(ref(storage, data.img));
            } catch (err) {
              console.error(`Failed to load image for ${data.name}`, err);
            }
          }

          cats.push({ name: data.name, imgUrl });
        }

        setCategories(cats);
      } catch (err) {
        console.error("Failed to fetch menu categories", err);
      }
    };

    fetchCategories();
  }, []);

  const recalc = () => {
    const isDesktop = window.innerWidth >= 1024;
    const vp = isDesktop ? desktopRef.current : mobileRef.current;
    if (!vp) return;

    const nextVisible = isDesktop ? 4 : 3;
    const available = vp.clientWidth;
    const totalGaps = (nextVisible - 1) * GAP_PX;
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
    if (desktopRef.current) ro.observe(desktopRef.current);
    if (mobileRef.current) ro.observe(mobileRef.current);

    return () => {
      window.removeEventListener("resize", onResize);
      ro.disconnect();
    };
  }, [categories]);

  const maxStart = Math.max(0, categories.length - visibleCount);
  const handleScroll = (dir) => {
    setStartIdx((s) =>
      dir === "left" ? Math.max(0, s - visibleCount) : Math.min(maxStart, s + visibleCount)
    );
  };

  const translateX = -(startIdx * (cardWidth + GAP_PX));

  const renderCard = (cat, width, imgSize) => (
    <div
      key={cat.name}
      className="flex flex-col items-center select-none cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0"
      style={{ width }}
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
        style={{ width: imgSize, height: imgSize }}
      >
        {cat.imgUrl ? (
          <img
            src={cat.imgUrl}
            alt={cat.name}
            style={{ width: imgSize * 0.9, height: imgSize * 0.9 }}
          />
        ) : (
          <div className="w-12 h-12 bg-gray-300 rounded-full animate-pulse" />
        )}
      </div>
      <p className="mt-3 text-center font-bold text-coffee-900" style={{ fontSize: 18, lineHeight: 1.2 }}>
        {cat.name}
      </p>
    </div>
  );

  return (
    <div className="max-w-[1050px] mx-auto py-6 relative">
      <div className="px-4">
        <h1 className="text-coffee-900 text-4xl sm:text-3xl lg:text-4xl font-bold">Menu</h1>
        <p className="text-coffee-700 mb-4 text-sm sm:text-base lg:text-lg">
          What are you craving for today?
        </p>
      </div>

      {/* Desktop */}
      <div className="hidden lg:flex items-center gap-2 px-4">
        <button
          onClick={() => handleScroll("left")}
          className="rounded-full shadow p-2 bg-coffee-700 text-white disabled:opacity-40 hover:bg-coffee-800 transition-colors flex-shrink-0"
          aria-label="Scroll left"
          disabled={startIdx === 0}
        >
          <ChevronLeft size={18} />
        </button>

        <div ref={desktopRef} className="relative flex-1 overflow-hidden" style={{ height: 230 }}>
          <div className="flex transition-transform duration-300 ease-out" style={{ gap: `${GAP_PX}px`, transform: `translateX(${translateX}px)` }}>
            {categories.map((cat) => renderCard(cat, cardWidth, 160))}
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

      {/* Mobile */}
      <div className="lg:hidden relative px-4">
        <div ref={mobileRef} className="relative overflow-hidden" style={{ height: 180 }}>
          <div className="flex transition-transform duration-300 ease-out" style={{ gap: `${GAP_PX}px`, transform: `translateX(${translateX}px)` }}>
            {categories.map((cat) => renderCard(cat, cardWidth, 110))}
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
