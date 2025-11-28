import React, { useEffect, useState } from "react";
import { RotateCcw, Coffee } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

export default function CategoryFilter({ selected = "All", onSelect = () => {} }) {
  const [categories, setCategories] = useState(["All"]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
        const list = Array.from(catSet).sort();
        if (mounted) setCategories(["All", ...list]);
      } catch (err) {
        console.error("Failed to load categories:", err);
        if (mounted) setError(err?.message || String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadCategories();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="mb-6 flex items-center flex-wrap gap-2">
      {loading ? (
        <div className="text-sm text-coffee-600">Loading categories...</div>
      ) : error ? (
        <div className="text-sm text-red-600">Error loading categories</div>
      ) : (
        categories.map((c) => {
          const active = c === selected;
          return (
            <button
              key={c}
              onClick={() => onSelect(c)}
              className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 ease-in-out
              ${
                active
                  ? "bg-coffee-500 text-white border-coffee-500 shadow-md scale-105"
                  : "bg-coffee-50 text-coffee-700 border-coffee-200 hover:bg-coffee-100 hover:shadow-sm"
              }`}
            >
              <Coffee className={`w-4 h-4 ${active ? "opacity-100" : "opacity-60"}`} />
              {c}
            </button>
          );
        })
      )}

      {/* Reset Button */}
      <button
        onClick={() => onSelect("All")}
        className="cursor-pointer ml-auto flex items-center gap-1 text-sm text-coffee-600 hover:text-coffee-800 transition-all"
        title="Reset category"
      >
        <RotateCcw className="w-4 h-4" />
        <span className="hidden sm:inline">Reset</span>
      </button>
    </div>
  );
}

