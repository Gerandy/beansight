import React from "react";
import { RotateCcw, Coffee } from "lucide-react";

const categories = ["All", "Drinks", "Meals", "Bakery", "Desserts"];

export default function CategoryFilter({ selected = "All", onSelect = () => {} }) {
  return (
    <div className="mb-6 flex items-center flex-wrap gap-2">
      {categories.map((c) => {
        const active = c === selected;
        return (
          <button
            key={c}
            onClick={() => onSelect(c)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 ease-in-out
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
      })}

      {/* Reset Button */}
      <button
        onClick={() => onSelect("All")}
        className="ml-auto flex items-center gap-1 text-sm text-coffee-600 hover:text-coffee-800 transition-all"
        title="Reset category"
      >
        <RotateCcw className="w-4 h-4" />
        <span className="hidden sm:inline">Reset</span>
      </button>
    </div>
  );
}

