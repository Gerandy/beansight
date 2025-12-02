import React, { useRef, useEffect, useState } from "react";
import MenuCard from "./HomeCard";
import { Link } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

function MenuFeatured() {
  const [foodMenu, setFoodMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchMenu = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "Inventory"));
        const items = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        // Filter to only include new items (assuming 'isNew' field exists in Firestore)
        const newItems = items.filter((item) => item.isNew);
        setFoodMenu(newItems.slice(0, 5));
      } catch (error) {
        console.error("Error fetching featured items:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  return (
    <div className="max-w-[1050px] mx-auto px-4 py-6 relative">
      {/* Header */}
      {loading ? (
        <div className="animate-pulse mb-4">
          <div className="h-10 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-6 bg-gray-200 rounded w-72"></div>
        </div>
      ) : (
        <>
          <h1 className="text-coffee-900 text-4xl sm:text-3xl lg:text-4xl font-bold">
            Featured
          </h1>
          <p className="text-coffee-700 mb-4 text-sm sm:text-base lg:text-lg">
            Discover what might be your next favorites
          </p>
        </>
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
          <div className="lg:hidden flex gap-4 overflow-x-hidden px-2">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className="flex-shrink-0 w-[calc(47vw-16px)]"
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
                  price={item.price}
                  img={item.img}
                  isNew={item.isNew}
                  isLoading={false}
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
                    price={item.price}
                    img={item.img}
                    isNew={item.isNew}
                    isLoading={false}
                  />
                </Link>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-coffee-600 text-lg">No featured items available at the moment.</p>
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

export default MenuFeatured;