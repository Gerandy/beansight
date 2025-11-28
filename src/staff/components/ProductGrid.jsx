import React, { useEffect, useState, useMemo } from "react";
import { Search, PlusCircle, Star, PackageX } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase"; 

export default function ProductGrid({ category = "All", onAdd = () => {} }) {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  useEffect(() => {
    const loadInventory = async () => {
      setLoading(true);
      setError(null);
      try {
        const snapshot = await getDocs(collection(db, "Inventory"));
        console.log("Inventory snapshot size:", snapshot.size);
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log("Loaded items:", items);
        setProducts(items);
      } catch (err) {
        console.error("Failed to load inventory:", err);
        setError(err?.message || String(err));
      } finally {
        setLoading(false);
      }
    };

    loadInventory();
  }, []);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchCategory = category === "All" || p.category === category;
      const text = (p.name || p.item || "").toString().toLowerCase();
      const matchSearch = text.includes(search.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [products, category, search]);

  // 📄 Pagination logic
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, category]);

  return (
    <div className="text-coffee-900">
      {loading && <div className="text-sm text-coffee-600">Loading inventory...</div>}
      {error && <div className="text-sm text-red-600">Error loading inventory: {error}</div>}
      
      {/* Search + Count */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
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

      {/* Items per page selector */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <label className="text-xs text-coffee-700">Show:</label>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="cursor-pointer bg-white border border-coffee-200 text-coffee-800 rounded-md px-2 py-1 text-xs shadow-sm"
          >
            <option value={8}>8</option>
            <option value={12}>12</option>
            <option value={24}>24</option>
            <option value={48}>48</option>
          </select>
        </div>
        <span className="text-xs text-coffee-700">
          Page {currentPage} of {totalPages || 1} • {Math.min((currentPage - 1) * itemsPerPage + 1, filtered.length)}-{Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length}
        </span>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 mb-6">
        {paginatedProducts.map((p) => (
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
              {p.img ? (
                <img
                  src={p.img}
                  alt={p.name}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="text-coffee-500 text-sm">No Image</div>
              )}
            </div>

            {/* Product Details */}
            <div className="mt-3 flex-1">
              <h3 className="text-sm font-medium text-coffee-800">{p.name}</h3>
            </div>

            {/* Price + Add Button */}
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm font-semibold text-coffee-800">
                ₱{Number(p.price).toFixed(2)}
              </div>
             <button
              onClick={() => {
                if (!p.availability) return; 
                  onAdd(p);
              }}
              disabled={!p.availability}
              className={`cursor-pointer flex items-center gap-1 px-3 py-1.5 rounded-md text-xs sm:text-sm active:scale-95 transition-all shadow-sm
                ${
                  p.availability
                    ? "bg-coffee-500 text-white hover:bg-coffee-600"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
            >
              <PlusCircle className="w-4 h-4" /> Add
            </button>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {paginatedProducts.length === 0 && (
          <div className="col-span-full text-center text-coffee-500 py-10 flex flex-col items-center gap-2">
            <PackageX className="w-8 h-8" />
            <p>No products found</p>
          </div>
        )}
      </div>

      {/* 📄 Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="cursor-pointer px-4 py-2 text-sm bg-white border border-coffee-200 rounded-md hover:bg-coffee-100 text-coffee-800 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ← Previous
          </button>

          <div className="flex items-center gap-2">
            {[...Array(totalPages)].map((_, i) => {
              const page = i + 1;
              // Show first, last, current, and adjacent pages
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`cursor-pointer px-3 py-1.5 text-sm rounded-md font-semibold transition-colors ${
                      currentPage === page
                        ? "bg-coffee-600 text-white"
                        : "bg-white border border-coffee-200 text-coffee-800 hover:bg-coffee-100"
                    }`}
                  >
                    {page}
                  </button>
                );
              } else if (page === currentPage - 2 || page === currentPage + 2) {
                return (
                  <span key={page} className="text-coffee-700">
                    ...
                  </span>
                );
              }
              return null;
            })}
          </div>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="cursor-pointer px-4 py-2 text-sm bg-white border border-coffee-200 rounded-md hover:bg-coffee-100 text-coffee-800 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}


