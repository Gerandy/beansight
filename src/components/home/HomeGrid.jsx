import React, { useRef, useEffect, useState } from "react";
import MenuCard from "./HomeCard";
import { Link } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

function MenuGrid() {
  const [foodMenu, setFoodMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSwipeHint, setShowSwipeHint] = useState(true);
  const scrollRef = useRef(null);
  const firstNamee = localStorage.getItem("firstName") || "Guest";

  // Hide swipe hint after user scrolls
  useEffect(() => {
    const handleScroll = () => {
      if (scrollRef.current && scrollRef.current.scrollLeft > 10) {
        setShowSwipeHint(false);
      }
    };

    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll);
      return () => scrollElement.removeEventListener('scroll', handleScroll);
    }
  }, [foodMenu]);

  useEffect(() => {
    const fetchMenu = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "Inventory"));
        const items = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFoodMenu(items.slice(0, 5));
      } catch (error) {
        console.error("Error fetching menu items:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  return (
    <div className="max-w-[1050px] mx-auto px-4 pt-4 sm:pt-6 lg:pt-8 sm:pb-3 lg:pb-1 relative">
      {/* Header */}
      {loading ? (
        <div className="mb-4 sm:mb-6 animate-pulse">
          <div className="h-8 sm:h-10 bg-gray-200 rounded w-48 sm:w-64 mb-2"></div>
          <div className="h-4 sm:h-6 bg-gray-200 rounded w-36 sm:w-48"></div>
        </div>
      ) : (
        <div className="mb-4 sm:mb-6">
          <h1 className="text-coffee-900 text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">
            Hello, {firstNamee}!
          </h1>
          <p className="text-coffee-600 text-xs sm:text-sm lg:text-lg">
            Food Options for you!
          </p>
        </div>
      )}

      {loading ? (
        <>
          {/* Desktop Skeleton Grid */}
          <div className="hidden lg:grid grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, idx) => (
              <MenuCard key={idx} isLoading={true} />
            ))}
          </div>

          {/* Mobile Skeleton Swiper */}
          <div className="lg:hidden flex gap-3 overflow-x-hidden px-1">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className="flex-shrink-0 w-[calc(47vw-12px)]"
              >
                <MenuCard isLoading={true} />
              </div>
            ))}
          </div>
        </>
      ) : foodMenu.length > 0 ? (
        <>
          {/* Desktop Grid */}
          <div className="hidden lg:grid grid-cols-5 gap-4">
            {foodMenu.map((item) => (
              <Link to={`/menu/product-details/${item.id}`} key={item.id}>
                <MenuCard
                  name={item.name}
                  price={`${item.price}`}
                  img={item.img}
                  isLoading={false}
                />
              </Link>
            ))}
          </div>

          {/* Mobile Swiper */}
          <div
            ref={scrollRef}
            className="lg:hidden flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-1"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {foodMenu.map((item) => (
              <div
                key={item.id}
                className="flex-shrink-0 w-[43%] snap-start"
              >
                <Link to={`/menu/product-details/${item.id}`}>
                  <MenuCard
                    name={item.name}
                    price={`${item.price}`}
                    img={item.img}
                    isLoading={false}
                  />
                </Link>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-coffee-600 text-lg">No menu items available at the moment.</p>
        </div>
      )}

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

export default MenuGrid;
