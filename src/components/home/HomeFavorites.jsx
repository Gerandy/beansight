import React, { useState } from "react";
import MenuCard from "./HomeCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

function Favorites() {
  const favorites = []; 
  const [startIdx, setStartIdx] = useState(0);

  const visibleCount = 3; 
  const cardWidth = 200; 

  const handleScroll = (direction) => {
    if (direction === "left" && startIdx > 0) {
      setStartIdx(startIdx - 1);
    }
    if (direction === "right" && startIdx < foodMenu.length - visibleCount) {
      setStartIdx(startIdx + 1);
    }
  };

  if (favorites.length === 0) {
    return (
      <div className="max-w-[1050px] mx-auto p-6 relative">
        <h1 className="text-gray-950 text-4xl sm:text-3xl lg:text-4xl font-bold">Favorites</h1>
        <div className="bg-white rounded-xl shadow p-4 items-center">
            <p className="text-gray-950 mb-6 text-center">Add your favorites!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[950px] mx-auto p-6 relative">
      <h1 className="text-gray-950 text-4xl font-bold">Favorites</h1>
      <p className="text-gray-950 mb-6">Your favorite foods!</p>

      <div className="hidden lg:grid grid-cols-4 gap-6">
        {favorites.map((favorite, index) => (
          <MenuCard key={index} name={favorite.name} price={favorite.price} img={favorite.img} />
        ))}
      </div>
    </div>
  );
}

export default Favorites;