import React, { useState, useEffect } from "react";
import MenuCard from "./HomeCard";
import { db } from "../../firebase"; 
import { doc, getDoc } from "firebase/firestore";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

function Favorites() {
  const favoritesArr = localStorage.getItem("favorites"); 
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const itemsPerPage = 5;

  // Animation state
  const [animDirection, setAnimDirection] = useState(null);

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

  // Handle carousel navigation with animation
  const handlePrev = () => {
    if (carouselIndex > 0) {
      setAnimDirection("left");
      setTimeout(() => {
        setCarouselIndex((i) => Math.max(i - 1, 0));
        setAnimDirection(null);
      }, 250);
    }
  };

  const handleNext = () => {
    if (carouselIndex < maxIndex) {
      setAnimDirection("right");
      setTimeout(() => {
        setCarouselIndex((i) => Math.min(i + 1, maxIndex));
        setAnimDirection(null);
      }, 250);
    }
  };

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

  // Carousel logic for desktop
  const showCarousel = favoriteProducts.length > itemsPerPage;
  const maxIndex = favoriteProducts.length - itemsPerPage;
  const visibleProducts = showCarousel
    ? favoriteProducts.slice(carouselIndex, carouselIndex + itemsPerPage)
    : favoriteProducts;

  return (
    <div className="max-w-[1050px] mx-auto px-4 py-8 relative">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-gray-950 text-4xl sm:text-3xl lg:text-4xl font-bold mb-2">
          Favorites
        </h1>
        <p className="text-gray-950 mb-6">Your New favorite foods!</p>
      </div>

      {/* Desktop Carousel */}
      <div className="hidden lg:flex items-center relative">
        {showCarousel && (
          <button
            className={`absolute left-[-40px] z-10 bg-coffee-600 rounded-full shadow p-2 hover:bg-coffee-700 text-white ${
              carouselIndex === 0 ? "cursor-not-allowed" : "cursor-pointer"
            }`}
            onClick={handlePrev}
            disabled={carouselIndex === 0}
            aria-label="Previous"
          >
            <ChevronLeft size={20} />
          </button>
        )}
        <div
          className={`grid grid-cols-5 gap-4 w-full transition-transform duration-300 ${
            animDirection === "left"
              ? "animate-slide-left"
              : animDirection === "right"
              ? "animate-slide-right"
              : ""
          }`}
        >
          {visibleProducts.map((product) => (
            <Link to={`/menu/product-details/${product.id}`} key={product.id}>
              <MenuCard name={product.name} price={product.price} img={product.img} />
            </Link>
          ))}
          {/* Fill empty columns if less than 5 */}
          {Array.from({ length: itemsPerPage - visibleProducts.length }).map((_, idx) => (
            <div key={`empty-${idx}`} />
          ))}
        </div>
        {showCarousel && (
          <button
            className={`absolute right-[-40px] z-10 bg-coffee-600 rounded-full shadow p-2 hover:bg-coffee-700 text-white ${
              carouselIndex >= maxIndex ? "cursor-not-allowed" : "cursor-pointer"
            }`}
            onClick={handleNext}
            disabled={carouselIndex >= maxIndex}
            aria-label="Next"
          >
            <ChevronRight size={20} />
          </button>
        )}
      </div>

      {/* Swiper for mobile */}
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

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .animate-slide-left {
          animation: slideLeft 0.25s;
        }
        .animate-slide-right {
          animation: slideRight 0.25s;
        }
        @keyframes slideLeft {
          0% { transform: translateX(0); }
          40% { transform: translateX(-30px); }
          100% { transform: translateX(0); }
        }
        @keyframes slideRight {
          0% { transform: translateX(0); }
          40% { transform: translateX(30px); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}

export default Favorites;
