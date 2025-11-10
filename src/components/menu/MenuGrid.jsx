import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "../../firebase"; 
import { collection, getDocs } from "firebase/firestore";

function MenuGrid() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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
  }, []);

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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((p) => (
          <div
            key={p.id}
            className="bg-white border-2 border-[#D4A574] rounded-2xl shadow-lg p-6 flex flex-col relative hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer group overflow-hidden"
          >
            <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1zbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iNCIgZmlsbD0iIzJFMUMxNCIvPgo8L3N2Zz4=')] bg-repeat"></div>

            {p.isNew && (
              <span className="absolute top-3 right-3 bg-coffee-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-md z-15">
                New
              </span>
            )}

            <div className="w-full aspect-square rounded-xl flex items-center justify-center mb-5 overflow-hidden bg-gradient-to-br from-[#FFF5EB] to-[#FFE8D6] relative z-10 shadow-sm">
              <img
                src={p.img}
                alt={p.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>

            <h3 className="font-semibold text-[#4E342E] text-base md:text-base line-clamp-2 mb-2 min-h-[44px] relative z-10 tracking-wide">
              {p.name}
            </h3>
            
            <p className="font-bold text-[#6B3E2E] text-2xl mb-4 relative z-10">
              ₱{p.price}
            </p>

            <button
              className="w-full bg-coffee-700 text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-coffee-800 active:scale-95 transition-all duration-200 relative z-10"
              onClick={() => navigate(`/menu/product-details/${p.id}`)}
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MenuGrid;
