import React, { useState, useEffect } from "react";
import { Heart, X } from "lucide-react";
import { Link } from "react-router-dom";
import { db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import MenuCard from "../home/HomeCard";

function MyFavorites() {
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      const favoritesArr = localStorage.getItem("favorites");
      
      if (!favoritesArr) {
        setFavoriteProducts([]);
        setLoading(false);
        return;
      }

      const favoriteIds = JSON.parse(favoritesArr);
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

    // Listen for storage changes (when favorites are updated)
    const handleStorageChange = () => {
      fetchFavorites();
    };

    window.addEventListener("storage", handleStorageChange);
    
    // Custom event for same-tab updates
    window.addEventListener("favoritesUpdated", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("favoritesUpdated", handleStorageChange);
    };
  }, []);

  const removeFavorite = (productId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const favoritesArr = localStorage.getItem("favorites");
    if (!favoritesArr) return;

    const favorites = JSON.parse(favoritesArr);
    const updatedFavorites = favorites.filter((id) => id !== productId);
    localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
    
    // Update state
    setFavoriteProducts((prev) => prev.filter((p) => p.id !== productId));
    
    // Dispatch custom event
    window.dispatchEvent(new Event("favoritesUpdated"));
  };

  if (loading) {
    return (
      <div className="flex flex-col bg-coffee-50 rounded-xl min-h-[500px] border border-coffee-200">
        <div className="px-4 sm:px-6 lg:px-8 pt-6 lg:pt-8 pb-4 border-b border-coffee-200">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl text-coffee-900 font-bold">
            My Favorites
          </h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-coffee-600">Loading favorites...</div>
        </div>
      </div>
    );
  }

  if (favoriteProducts.length === 0) {
    return (
      <div className="flex flex-col bg-coffee-50 rounded-xl min-h-[500px] border border-coffee-200">
        <div className="px-4 sm:px-6 lg:px-8 pt-6 lg:pt-8 pb-4 border-b border-coffee-200">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl text-coffee-900 font-bold">
            My Favorites
          </h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] p-4">
          <div className="w-32 h-32 sm:w-40 sm:h-40 bg-coffee-100 rounded-full flex items-center justify-center mb-6">
            <Heart size={64} className="text-coffee-400" />
          </div>
          <div className="text-coffee-800 text-sm sm:text-base text-center max-w-md">
            Add your favorites here so you can access them quickly when craving strikes!
          </div>
          <Link
            to="/menu"
            className="mt-6 px-6 py-3 bg-coffee-700 text-white rounded-lg font-semibold hover:bg-coffee-800 transition-colors text-sm sm:text-base"
          >
            Browse Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-coffee-50 rounded-xl min-h-[500px] border border-coffee-200">
      <div className="px-4 sm:px-6 lg:px-8 pt-6 lg:pt-8 pb-4 border-b border-coffee-200">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl text-coffee-900 font-bold">
          My Favorites
        </h1>
        <p className="text-coffee-600 mt-2">
          {favoriteProducts.length} {favoriteProducts.length === 1 ? "item" : "items"}
        </p>
      </div>
      
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
          {favoriteProducts.map((product) => (
            <div key={product.id} className="relative">
              <Link to={`/menu/product-details/${product.id}`}>
                <MenuCard 
                  name={product.name} 
                  price={product.price} 
                  img={product.img} 
                />
              </Link>
              <button
                onClick={(e) => removeFavorite(product.id, e)}
                className="cursor-pointer absolute top-2 left-2 z-30 bg-white/90 hover:bg-red-500 text-coffee-800 hover:text-white rounded-full p-2 shadow-lg transition-all duration-200 group"
                title="Remove from favorites"
              >
                <X size={16} className="hover:rotate-90 transition-transform duration-200" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MyFavorites;