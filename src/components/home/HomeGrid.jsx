import React, { useRef, useEffect, useState } from "react";
import MenuCard from "./HomeCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../../firebase";


function MenuGrid() {
  const [foodMenu, setFoodMenu] = useState([]);
  const scrollRef = useRef(null);
  const firstNamee = localStorage.getItem("firstName") || "Guest";

  
  
  
  useEffect(() => {
  const fetchMenu = async () => {
    const querySnapshot = await getDocs(collection(db, "Inventory"));
    const items = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setFoodMenu(items.slice(0, 5));
  };

  

  fetchMenu();

  
}, []);

  const handleScroll = (direction) => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const cardWidth = scrollContainer.offsetWidth;
    const currentScroll = scrollContainer.scrollLeft;
    
    const newScroll = direction === "left" 
      ? currentScroll - cardWidth 
      : currentScroll + cardWidth;

    scrollContainer.scrollTo({
      left: newScroll,
      behavior: "smooth",
    });
  };

  return (
    <div className="max-w-[1050px] mx-auto px-4 py-8 relative">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-coffee-900 text-4xl sm:text-3xl lg:text-4xl font-bold mb-2">
          Hello, {firstNamee}!
        </h1> 
        <p className="text-coffee-600 text-sm sm:text-base lg:text-lg">
          Food Options for you!
        </p>
      </div>

      {/* Desktop Grid */}
      <div className="hidden lg:grid grid-cols-5 gap-4">
        {foodMenu.map((item) => (
          <Link to={`/menu/product-details/${item.id}`} key={item.id}>
            <MenuCard name={item.name} price={`${item.price}`} img={item.img} />
          </Link>
        ))}
      </div>

      {/* Mobile Scroll */}
      <div className="flex items-center lg:hidden relative">
        <button
          onClick={() => handleScroll("left")}
          className="absolute left-0 z-10 bg-coffee-700 text-white rounded-full shadow p-2 hover:bg-coffee-800 transition-colors"
        >
          <ChevronLeft size={18} />
        </button>

        <div ref={scrollRef} className="flex w-full overflow-hidden mx-8">
          <div className="flex transition-transform duration-300 ease-out">
            {foodMenu.map((item) => (
              <div key={item.id} className="w-[calc((100vw-96px)/2)] px-2 flex-shrink-0">
                <Link to={`/menu/product-details/${item.id}`}>
                  <MenuCard name={item.name} price={`${item.price}`} img={item.img} />
                </Link>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => handleScroll("right")}
          className="absolute right-0 z-10 bg-coffee-700 text-white rounded-full shadow p-2 hover:bg-coffee-800 transition-colors"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

export default MenuGrid;
