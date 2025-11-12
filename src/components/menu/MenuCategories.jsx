import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useRef, useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

function MenuCategories({ selected = "All", onSelect = () => {} }) {
  const [categories, setCategories] = useState(["All"]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // keep a local selected state so UI updates even if parent doesn't control it
  const [localSelected, setLocalSelected] = useState(selected);
  useEffect(() => {
    setLocalSelected(selected);
  }, [selected]);

  const scrollRef = useRef(null);
  const [showArrows, setShowArrows] = useState(false);

  const checkOverflow = () => {
    if (scrollRef.current) {
      const el = scrollRef.current;
      // add a small tolerance so tiny rounding differences don't show arrows
      setShowArrows(el.scrollWidth > el.clientWidth + 8);
    } else {
      setShowArrows(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const loadCategories = async () => {
      setLoading(true);
      setError(null);
      try {
        const snapshot = await getDocs(collection(db, "Inventory"));
        const catSet = new Set();
        snapshot.docs.forEach((doc) => {
          const c = doc.data()?.category;
          if (c) catSet.add(String(c));
        });
        const list = Array.from(catSet)
          .map((s) => String(s || "").trim())
          .filter(Boolean)
          .sort((a, b) =>
            a.localeCompare(b, undefined, { sensitivity: "base", numeric: true })
          );
        if (mounted) setCategories(["All", ...list]);
      } catch (err) {
        console.error("Failed to load categories:", err);
        if (mounted) setError(err?.message || String(err));
      } finally {
        if (mounted) setLoading(false);
        // ensure overflow check runs after DOM updates
        setTimeout(checkOverflow, 100);
      }
    };

    loadCategories();
    window.addEventListener("resize", checkOverflow);
    // initial check after mount
    setTimeout(checkOverflow, 120);
    return () => {
      mounted = false;
      window.removeEventListener("resize", checkOverflow);
    };
  }, []);

  useEffect(() => {
    // re-check overflow when categories change
    setTimeout(checkOverflow, 80);
  }, [categories]);

  const SCROLL_STEP = 240;
  const scroll = (direction) => {
    if (scrollRef.current) {
      const amount = direction === "left" ? -SCROLL_STEP : SCROLL_STEP;
      scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-[#FAE5D3] to-[#F8D2B5] shadow-sm border-b border-coffee-200 sticky top-16 z-20">
      {showArrows && (
        <button
          type="button"
          onClick={() => scroll("left")}
          aria-label="Scroll categories left"
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-coffee-700 text-white shadow-md p-2 rounded-full z-30 hover:bg-coffee-800 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}

      <div
        ref={scrollRef}
        className="flex justify-between space-x-6 overflow-x-hidden py-3 px-12 scroll-smooth bg-gradient-to-br from-[#FAE5D3] to-[#F8D2B5]"
      >
        {categories.map((cat, idx) => (
          <button
            key={idx}
            onClick={() => {
              setLocalSelected(cat);
              onSelect(cat);
            }}
            className={`text-sm font-medium whitespace-nowrap hover:cursor-pointer transition-colors ${
              localSelected === cat
                ? "text-coffee-900 font-bold border-b-2 border-coffee-900"
                : "text-coffee-700 hover:text-coffee-900"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Right arrow */}
      {showArrows && (
        <button
          type="button"
          onClick={() => scroll("right")}
          aria-label="Scroll categories right"
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-coffee-700 text-white shadow-md p-2 rounded-full z-30 hover:bg-coffee-800 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

export default MenuCategories;



