import React, { useRef, useEffect, useState } from "react";
import MenuCard from "./HomeCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

function MenuGrid() {
  const [foodMenu, setFoodMenu] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchMenu = async () => {
      const querySnapshot = await getDocs(collection(db, "Inventory"));
      const items = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFoodMenu(items);
    };

    fetchMenu();
  }, []);

  const handleScroll = (direction) => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const scrollAmount = scrollContainer.offsetWidth * 0.8;
    scrollContainer.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <div className="max-w-[1050px] mx-auto px-4 py-6 relative">
      {/* Header */}
      <h1 className="text-gray-950 text-2xl sm:text-3xl font-bold">Hello, User!</h1>
      <p className="text-gray-700 mb-4 text-sm sm:text-base">Food Options for you!</p>

      {/* Desktop Grid */}
      <div className="hidden lg:grid grid-cols-4 gap-6">
        {foodMenu.map((item) => (
          <Link to={`/menu/product-details/${item.id}`} key={item.id}>
            <MenuCard
              name={item.name}
              price={`${item.price}`}
              img={item.img}
            />
          </Link>
        ))}
      </div>

      {/* Mobile Scroll */}
      <div className="flex items-center lg:hidden relative">
        <button
          onClick={() => handleScroll("left")}
          className="absolute left-0 z-10 bg-yellow-950 text-white rounded-full shadow p-2"
        >
          <ChevronLeft size={18} />
        </button>

        <div
          ref={scrollRef}
          className="flex overflow-x-auto gap-4 scroll-smooth no-scrollbar mx-8"
        >
          {foodMenu.map((item) => (
            <div key={item.id} className="min-w-[160px] flex-shrink-0">
              <Link to={`/menu/product-details/${item.id}`}>
                <MenuCard
                  name={item.name}
                  price={`{item.price}`}
                  img={item.img}
                />
              </Link>
            </div>
          ))}
        </div>

        <button
          onClick={() => handleScroll("right")}
          className="absolute right-0 z-10 bg-yellow-950 text-white rounded-full shadow p-2"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

export default MenuGrid;
