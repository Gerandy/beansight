import React, { useEffect, useState, useMemo } from "react";
import { Search, PlusCircle, Star, PackageX } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase"; 

export default function ProductGrid({ category = "All", onAdd = () => {} }) {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]); // ✅ now fetched

  useEffect(() => {
    const loadInventory = async () => {
      const snapshot = await getDocs(collection(db, "inventory"));

      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setProducts(items);
    };

    loadInventory();
  }, []);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchCategory = category === "All" || p.category === category;
      const matchSearch = p.item?.toLowerCase().includes(search.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [products, category, search]);


  return (
    <div className="text-coffee-900">
      {/* Search + Count */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
        <div className="relative w-full sm:flex-1">
          <Search className="absolute left-3 top-2.5 text-coffee-500 w-4 h-4" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search product..."
            className="w-full border border-coffee-200 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-coffee-400 bg-white shadow-sm transition-all"
          />
        </div>
        <div className="text-sm text-coffee-600 font-medium">
          Showing {filtered.length}
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
        {filtered.map((p) => (
          <div
            key={p.id}
            className="relative bg-coffee-100 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 p-4 flex flex-col group"
          >
            {/* Badge */}
            {p.bestseller && (
              <div className="absolute top-2 left-2 bg-coffee-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                <Star className="w-3 h-3" /> Bestseller
              </div>
            )}

            {/* Product Image */}
            <div className="w-full aspect-square bg-coffee-200 rounded-xl overflow-hidden flex items-center justify-center">
              {p.image ? (
                <img
                  src={p.image}
                  alt={p.name}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="text-coffee-500 text-sm">No Image</div>
              )}
            </div>

            {/* Product Details */}
            <div className="mt-3 flex-1">
              <h3>{p.name}</h3>
              <p>{p.category}</p>
            </div>

            {/* Price + Add Button */}
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm font-semibold text-coffee-800">
                ₱{Number(p.price).toFixed(2)}
              </div>
              <button
                onClick={() => onAdd(p)}
                className="flex items-center gap-1 px-3 py-1.5 bg-coffee-500 text-white rounded-md text-xs sm:text-sm hover:bg-coffee-600 active:scale-95 transition-all shadow-sm"
              >
                <PlusCircle className="w-4 h-4" /> Add
              </button>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {filtered.length === 0 && (
          <div className="col-span-full text-center text-coffee-500 py-10 flex flex-col items-center gap-2">
            <PackageX className="w-8 h-8" />
            <p>No products found</p>
          </div>
        )}
      </div>
    </div>
  );
}


