import React, { useState } from "react";
import MenuCard from "./HomeCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

function MenuGrid() {
  const foodMenu = [
    { id: 834, name: "Sige Sige", price: "₱175.00", img: "src/assets/ahjinlogo.png" },
    { id: 835, name: "Puto Tumbong", price: "₱145.00", img: "src/assets/ahjinlogo.png" },
    { id: 836, name: "Dinakdakan", price: "₱174.00", img: "src/assets/ahjinlogo.png" },
    { id: 837, name: "Longganigg*", price: "₱138.00", img: "src/assets/ahjinlogo.png" },
  ];

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

  return (
    <div className="max-w-[950px] mx-auto p-6 relative">
      <h1 className="text-gray-950 text-4xl font-bold">Hello, User!</h1>
      <p className="text-gray-950 mb-6">Food Options for you!</p>
      
      <div className="hidden lg:grid grid-cols-4 gap-6">
        {foodMenu.map((item, index) => (
          <Link to={`/menu/product-details/${item.id}/`} key={item.id}>
            <MenuCard
              name={item.name}
              price={item.price}
              img={item.img}
            />
          </Link>
        ))}
      </div>

      
      <div className="flex items-center lg:hidden">
        <button
          onClick={() => handleScroll("left")}
          className="bg-yellow-950 text-white rounded-full shadow p-2 mr-2 flex items-center justify-center"
          disabled={startIdx === 0}
        >
          <ChevronLeft size={20} />
        </button>

        <div
          className="relative w-full overflow-hidden"
          style={{
            maxWidth: `${visibleCount * cardWidth}px`,
            height: "auto",
          }}
        >
          <div 
            className="flex gap-6 transition-transform duration-300"
            style={{
              transform: `translateX(-${startIdx * cardWidth}px)`,
              width: `${foodMenu.length * cardWidth}px`,
            }}
          >
            {foodMenu.map((item, index) => (
              <div key={index} style={{ width: `${cardWidth - 20}px` }}>
                <MenuCard
                  name={item.name}
                  price={item.price}
                  img={item.img}
                />
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => handleScroll("right")}
          className="bg-yellow-950 text-white rounded-full shadow p-2 ml-2 flex items-center justify-center"
          disabled={startIdx >= foodMenu.length - visibleCount}
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}

export default MenuGrid;



