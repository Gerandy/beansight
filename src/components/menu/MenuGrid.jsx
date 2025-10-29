import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "../../firebase"; 
import { collection, getDocs } from "firebase/firestore";


function MenuGrid() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "Inventory"));
        const fetchedItems = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(fetchedItems);
      } catch (error) {
        console.error("Error fetching inventory:", error);
      }
    };

    fetchInventory();
  }, []);

  return (
    <div className="max-w-6xl mx-auto mt-15 px-4 py-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((p) => (
          <div
            key={p.id}
            className="border rounded-xl shadow-sm p-3 flex flex-col relative bg-white"
          >
            {p.isNew && (
              <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                New
              </span>
            )}

            <img
              src={p.img}
              alt={p.name}
              className="h-32 object-contain mx-auto"
            />

            <h3 className="mt-3 font-medium text-gray-900 text-sm md:text-base">
              {p.name}
            </h3>
            <p className="font-semibold text-black text-sm md:text-base">
              ₱ {p.price}.00
            </p>

            <button
              className="mt-auto bg-yellow-950 text-white font-semibold py-2 px-4 rounded-xl hover:cursor-pointer transition-transform"
              onClick={() => navigate(`/menu/product-details/${p.id}`)}
            >
              Order
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MenuGrid;
