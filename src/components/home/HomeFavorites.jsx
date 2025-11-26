import React, { useState, useEffect } from "react";
import MenuCard from "./HomeCard";
import { db } from "../../firebase"; 
import { doc, getDoc } from "firebase/firestore";
import { Link } from "react-router-dom";

function Favorites() {
  const favoritesArr = localStorage.getItem("favorites"); 
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!favoritesArr) {
        setFavoriteProducts([]);
        setLoading(false);
        return;
      }

      const favoriteIds = JSON.parse(favoritesArr); // array of product IDs
      const products = [];

      for (const id of favoriteIds) {
        try {
          const docRef = doc(db, "Inventory", id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            products.push({ id: docSnap.id, ...docSnap.data() });
          }
        } catch (error) {
          console.error("Error fetching product:", error);
        }
      }

      setFavoriteProducts(products);
      setLoading(false);
    };

    fetchFavorites();
  }, [favoritesArr]);

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-600">Loading favorites...</div>
    );
  }

  if (favoriteProducts.length === 0) {
    return (
      <div className="max-w-[1050px] mx-auto p-6 relative">
        <h1 className="text-gray-950 text-4xl sm:text-3xl lg:text-4xl font-bold">Favorites</h1>
        <div className="bg-gradient-to-br from-[#FAE5D3] to-[#F8D2B5] rounded-xl shadow p-4 items-center">
          <p className="text-gray-950 mb-6 text-center">Add your favorites!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1050px] mx-auto px-4 py-8 relative">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-gray-950 text-4xl sm:text-3xl lg:text-4xl font-bold mb-2">
          Favorites
        </h1>
        <p className="text-gray-950 mb-6">Your New favorite foods!</p>
      </div>

      {/* Desktop Grid */}
      <div className={`hidden lg:grid ${favoriteProducts.length > 5 ? "grid-cols-5" : `grid-cols-${favoriteProducts.length}`} gap-4`}>
        {favoriteProducts.slice(0, 5).map((product) => (
          <Link to={`/menu/product-details/${product.id}`} key={product.id}>
            <MenuCard name={product.name} price={product.price} img={product.img} />
          </Link>
        ))}
      </div>

      {/* Swiper for mobile or >5 favorites */}
      {(favoriteProducts.length > 5 || window.innerWidth < 1024) && (
        <div
          className="lg:hidden flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-2"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {favoriteProducts.map((product) => (
            <div
              key={product.id}
              className="flex-shrink-0 w-[calc(47vw-16px)] snap-start"
            >
              <Link to={`/menu/product-details/${product.id}`}>
                <MenuCard name={product.name} price={product.price} img={product.img} />
              </Link>
            </div>
          ))}
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

export default Favorites;
