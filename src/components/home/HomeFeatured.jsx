import React, { useState, useEffect } from "react";
import MenuCard from "./HomeCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { Link } from "react-router-dom";

function MenuFeatured() {
  const [foodMenu, setFoodMenu] = useState([]);
  const [startIdx, setStartIdx] = useState(0);
  const visibleCount = 3; 
  const cardWidth = 200; 

  useEffect(() => {
    const fetchMenu = async () => {
      const querySnapshot = await getDocs(collection(db, "Inventory"));
      const menuItems = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFoodMenu(menuItems);
    };

    fetchMenu();
  }, []);

  const handleScroll = (direction) => {
    if (direction === "left" && startIdx > 0) {
      setStartIdx(startIdx - 1);
    }
    if (direction === "right" && startIdx < foodMenu.length - visibleCount) {
      setStartIdx(startIdx + 1);
    }
  };

  return (
    <div className="max-w-[1050px] mx-auto p-6 pb-6 relative"
      style={{
        marginBottom: '100px'
      }}>

      <h1 className="text-gray-950 text-4xl font-bold">Featured</h1>
      <p className="text-gray-950 mb-6">Discover your New Favorites here!</p>

      
      <div className="hidden lg:grid grid-cols-4 gap-6">
      {foodMenu.map((item) => (
       <Link to={`/menu/product-details/${item.id}`} key={item.id}>
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
            {foodMenu.map((item) => (
              <div key={item.id} style={{ width: `${cardWidth - 20}px` }}>
                <Link to={`/menu/product-details/${item.id}`}>
                <MenuCard
                  name={item.name}
                  price={item.price}
                  img={item.img}
                />
                </Link>
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

export default MenuFeatured;