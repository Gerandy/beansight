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
        let items = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Filter to only include new items (assuming 'isNew' field exists in Firestore)
        let newItems = items.filter((item) => item.isNew);

        // Sort by availability: available items first
        const isAvailable = (it) => {
          if (it.availability !== undefined) return !!it.availability;
          if (it.available !== undefined) return !!it.available;
          return true;
        };

        newItems.sort((a, b) => Number(isAvailable(b)) - Number(isAvailable(a)));

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
    <div className="max-w-[1050px] mx-auto px-4 py-4 sm:py-6 relative">
      {/* Header */}
      {loading ? (
        <div className="animate-pulse mb-4 sm:mb-6">
          <div className="h-8 sm:h-10 bg-gray-200 rounded w-32 sm:w-48 mb-2"></div>
          <div className="h-4 sm:h-6 bg-gray-200 rounded w-48 sm:w-72"></div>
        </div>
      ) : (
        <>
          <h1 className="text-coffee-900 text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">
            Featured
          </h1>
          <p className="text-coffee-700 mb-3 sm:mb-4 text-xs sm:text-base lg:text-lg">
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

          {/* Tablet & Mobile Skeleton Swiper */}
          <div className="lg:hidden flex gap-3 overflow-x-hidden px-1">
            {Array.from({ length: 2 }).map((_, idx) => (
              <div
                key={idx}
                className="flex-shrink-0 w-[calc(50%-6px)]"
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
            {foodMenu.map((item) => {
              const available = item.availability !== undefined ? !!item.availability : (item.available !== undefined ? !!item.available : true);
              const card = (
                <MenuCard
                  name={item.name}
                  price={item.price}
                  img={item.img}
                  isNew={item.isNew}
                  isLoading={false}
                  available={available}
                />
              );

              return (
                <div key={item.id}>
                  {available ? (
                    <Link to={`/menu/product-details/${item.id}`}>{card}</Link>
                  ) : (
                    card
                  )}
                </div>
              );
            })}
          </div>

          {/* Tablet & Mobile Swiper - 2 cards visible */}
          <div
            ref={scrollRef}
            className="lg:hidden flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-1"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {foodMenu.map((item) => {
              const available = item.availability !== undefined ? !!item.availability : (item.available !== undefined ? !!item.available : true);
              const card = (
                <MenuCard
                  name={item.name}
                  price={item.price}
                  img={item.img}
                  isNew={item.isNew}
                  isLoading={false}
                  available={available}
                />
              );

              return (
                <div key={item.id} className="flex-shrink-0 w-[43%] snap-start">
                  {available ? (
                    <Link to={`/menu/product-details/${item.id}`}>{card}</Link>
                  ) : (
                    card
                  )}
                </div>
              );
            })}
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