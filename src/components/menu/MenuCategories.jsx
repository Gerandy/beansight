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
    <div className="relative bg-coffee-50 shadow-sm border-b border-coffee-200 sticky top-16 z-20">
      {/* Left arrow */}
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

      {/* Category list */}
      <nav aria-label="Menu categories" className="overflow-hidden">
        <div
          ref={scrollRef}
          className="flex items-center gap-3 overflow-x-auto whitespace-nowrap py-3 px-4 scroll-smooth"
          // ensure pointer events are enabled on the scroll container
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {loading ? (
            <div className="text-sm text-coffee-600">Loading categories...</div>
          ) : error ? (
            <div className="text-sm text-red-600">Error loading categories</div>
          ) : (
            categories.map((cat) => {
              const active = cat === localSelected;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setLocalSelected(cat);
                    try { onSelect(cat); } catch (e) { /* ignore */ }
                  }}
                  aria-pressed={active}
                  // ensure the button receives pointer events and shows pointer cursor
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 cursor-pointer pointer-events-auto
                    ${
                      active
                        ? "bg-coffee-500 text-white border border-coffee-500 shadow-sm transform scale-105"
                        : "bg-white text-coffee-800 border border-coffee-100 hover:bg-coffee-50"
                    }`}
                >
                  {/* optional icon for the "All" pill */}
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center ${active ? "bg-white/20" : "bg-coffee-100"}`}>
                    {/* simple dot instead of separate icon */}
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="4" cy="4" r="3" fill={active ? "#ffffff" : "#7b5a44"} />
                    </svg>
                  </span>
                  <span className="whitespace-nowrap">{cat}</span>
                </button>
              );
            })
          )}
        </div>
      </nav>

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



