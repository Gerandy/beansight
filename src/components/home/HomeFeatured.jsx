import React, { useRef, useEffect, useState } from "react";
import MenuCard from "./HomeCard";
import { Link } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

function MenuFeatured() {
  const [foodMenu, setFoodMenu] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchMenu = async () => {
      const querySnapshot = await getDocs(collection(db, "Inventory"));
      const items = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      // Filter to only include new items (assuming 'isNew' field exists in Firestore)
      const newItems = items.filter((item) => item.isNew);
      setFoodMenu(newItems.slice(0, 5));
    };

    fetchMenu();
  }, []);

  return (
    <div className="max-w-[1050px] mx-auto px-4 py-6 relative">
      {/* Header */}
      <h1 className="text-coffee-900 text-4xl sm:text-3xl lg:text-4xl font-bold">
        Featured
      </h1>
      <p className="text-coffee-700 mb-4 text-sm sm:text-base lg:text-lg">
        Discover what might be your next favorites
      </p>

      {/* Desktop Grid */}
      <div className="hidden lg:grid grid-cols-5 gap-4">
        {foodMenu.map((item) => (
          <Link to={`/menu/product-details/${item.id}`} key={item.id}>
            <MenuCard
              name={item.name}
              price={`${item.price}`}
              img={item.img}
              isNew={item.isNew}
            />
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
              <MenuCard
                name={item.name}
                price={`${item.price}`}
                img={item.img}
                isNew={item.isNew}
              />
            </Link>
          </div>
        ))}
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

export default MenuFeatured;