import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "../../firebase"; 
import { collection, getDocs } from "firebase/firestore";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";

function MenuGrid({ selectedCategory = "All" }) {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [favorites, setFavorites] = useState(new Set());
  const ITEMS_PER_PAGE = 8;

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true);
        const querySnapshot = await getDocs(collection(db, "Inventory"));
        const fetchedItems = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(fetchedItems);
      } catch (error) {
        console.error("Error fetching inventory:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
    
    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem("favorites");
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    }
  }, []);

  // Reset to page 1 when category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);

  const toggleFavorite = (productId, e) => {
    e.stopPropagation(); // Prevent card click
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
      } else {
        newFavorites.add(productId);
      }
      // Save to localStorage
      localStorage.setItem("favorites", JSON.stringify([...newFavorites]));
      return newFavorites;
      
    });
    
  };
  
    

  const filteredProducts = selectedCategory === "All" 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  // Calculate pagination
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto mt-15 px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="w-36 h-36 mb-5 rounded-xl overflow-hidden bg-gradient-to-br from-[#FFF5EB] to-[#FFE8D6] flex items-center justify-center relative z-10 shadow-sm">
              <div className="absolute inset-0 opacity-5 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1zbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iNCIgZmlsbD0iIzJFMUMxNCIvPgo8L3N2Zz4=')] bg-repeat"></div>
              <div className="h-40 bg-coffee-200 rounded-lg mb-3 relative z-10"></div>
              <div className="h-4 bg-coffee-200 rounded w-3/4 mb-2 relative z-10"></div>
              <div className="h-6 bg-coffee-200 rounded w-1/2 mb-3 relative z-10"></div>
              <div className="h-10 bg-coffee-200 rounded relative z-10"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-15 px-4 py-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
        {currentProducts.map((p) => (
          <div
            key={p.id}
            className="bg-white border-2 border-[#D4A574] rounded-2xl shadow-lg p-3 sm:p-6 flex flex-col relative hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer group overflow-hidden"
          >
            {/* Heart Icon for Favorites */}
            <button
              onClick={(e) => toggleFavorite(p.id, e)}
              className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-md z-15 hover:bg-white transition-all duration-200 active:scale-90"
              aria-label={favorites.has(p.id) ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart 
                className={`w-5 h-5 transition-all duration-200 ${
                  favorites.has(p.id) 
                    ? "fill-red-500 text-red-500" 
                    : "text-coffee-400 hover:text-red-500"
                }`}
              />
            </button>

            {p.isNew && (
              <span className="absolute top-3 right-3 bg-coffee-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-md z-15">
                New
              </span>
            )}

            <div className="w-full aspect-square rounded-xl flex items-center justify-center mb-3 sm:mb-5 overflow-hidden bg-gradient-to-br from-[#FFF5EB] to-[#FFE8D6] relative z-10 shadow-sm">
              <img
                src={p.img}
                alt={p.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>

            <h3 className="font-semibold text-[#4E342E] text-sm sm:text-base line-clamp-2 mb-1 sm:mb-2 min-h-[36px] sm:min-h-[44px] relative z-10 tracking-wide">
              {p.name}
            </h3>
            
            <p className="font-bold text-[#6B3E2E] text-lg sm:text-2xl mb-2 sm:mb-4 relative z-10">
              ₱{p.price}
            </p>

            <button
              className="w-full bg-coffee-700 text-white font-semibold py-2 px-3 sm:py-2.5 sm:px-4 rounded-lg hover:bg-coffee-800 active:scale-95 transition-all duration-200 relative z-10 text-base h-10 sm:h-12 flex items-center justify-center"
              onClick={() => navigate(`/menu/product-details/${p.id}`)}
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8 pb-6">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg bg-coffee-700 text-white disabled:bg-coffee-300 disabled:cursor-not-allowed hover:bg-coffee-800 transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex gap-2">
            {[...Array(totalPages)].map((_, idx) => {
              const pageNum = idx + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => goToPage(pageNum)}
                  className={`w-10 h-10 rounded-lg font-semibold transition-colors ${
                    currentPage === pageNum
                      ? "bg-coffee-700 text-white"
                      : "bg-coffee-100 text-coffee-700 hover:bg-coffee-200"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg bg-coffee-700 text-white disabled:bg-coffee-300 disabled:cursor-not-allowed hover:bg-coffee-800 transition-colors"
            aria-label="Next page"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}

export default MenuGrid;
