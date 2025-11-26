import React, { useRef, useEffect, useState } from "react";
import MenuCard from "./HomeCard";
import { Link } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

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

      {/* Mobile Swiper */}
      <div
        ref={scrollRef}
        className="lg:hidden flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-2"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {foodMenu.map((item) => (
          <div
            key={item.id}
            className="flex-shrink-0 w-[calc(47vw-16px)] snap-start"
          >
            <Link to={`/menu/product-details/${item.id}`}>
              <MenuCard name={item.name} price={`${item.price}`} img={item.img} />
            </Link>
          </div>
        ))}
      </div>

      <style >{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

export default MenuGrid;
