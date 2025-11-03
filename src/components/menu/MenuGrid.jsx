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
            <div key={i} className="border border-coffee-200 rounded-xl p-4 bg-coffee-50 animate-pulse">
              <div className="h-40 bg-coffee-200 rounded-lg mb-3"></div>
              <div className="h-4 bg-coffee-200 rounded w-3/4 mb-2"></div>
              <div className="h-6 bg-coffee-200 rounded w-1/2 mb-3"></div>
              <div className="h-10 bg-coffee-200 rounded"></div>
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
            className="border border-coffee-200 rounded-xl shadow-sm p-4 flex flex-col relative bg-coffee-50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
          >
            {p.isNew && (
              <span className="absolute top-3 left-3 bg-coffee-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm z-10">
                New
              </span>
            )}

            <div className="h-40 w-full bg-coffee-100 rounded-lg flex items-center justify-center mb-3 overflow-hidden">
              <img
                src={p.img}
                alt={p.name}
                className="h-32 w-32 object-contain group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            <h3 className="font-semibold text-coffee-900 text-sm md:text-base line-clamp-2 mb-2 min-h-[40px]">
              {p.name}
            </h3>
            
            <p className="font-bold text-coffee-800 text-lg md:text-xl mb-3">
              ₱{p.price}.00
            </p>

            <button
              className="w-full bg-coffee-700 text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-coffee-800 active:scale-95 transition-all duration-200"
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
