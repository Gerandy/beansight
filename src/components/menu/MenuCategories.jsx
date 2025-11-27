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
      }
    };

    loadCategories();
  }, []);

  return (
    <div className="relative bg-gradient-to-br from-[#FAE5D3] to-[#F8D2B5] shadow-sm border-b border-coffee-200 sticky top-16 z-20">
      <div
        ref={scrollRef}
        className={`flex space-x-6 py-3 px-2 sm:px-8 lg:px-16 scroll-smooth bg-gradient-to-br from-[#FAE5D3] to-[#F8D2B5] scrollbar-hide w-full min-w-0 overflow-x-auto`}
        style={{
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {categories.map((cat, idx) => (
          <button
            key={idx}
            onClick={() => {
              setLocalSelected(cat);
              onSelect(cat);
            }}
            className={`text-sm font-medium whitespace-nowrap hover:cursor-pointer transition-colors px-4 py-2 rounded-full min-w-[120px] w-32 text-center ${
              localSelected === cat
                ? "text-coffee-700 font-bold border-b-2 border-coffee-500 bg-white"
                : "text-coffee-700 hover:text-coffee-800"
            }`}
            style={{
              scrollSnapAlign: "center",
            }}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}

export default MenuCategories;



