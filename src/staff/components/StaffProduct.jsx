import React, { useState, useEffect, useMemo } from "react";
import { Filter, Search, Package } from "lucide-react";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";

export default function StaffProductManagement() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState("Newest");
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Realtime listener to Firestore "Inventory" collection
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "Inventory"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(data);
    });
    return () => unsub();
  }, []);

  // Toggle product availability
  const toggleAvailability = async (id, currentAvailability) => {
    try {
      const newStatus = !currentAvailability;
      const docRef = doc(db, "Inventory", id);
      await updateDoc(docRef, { availability: newStatus });
      console.log(`Updated availability ${id} → ${newStatus}`);
    } catch (err) {
      console.error("Error updating product:", err);
    }
  };

  // Reset filters and search
  const handleReset = () => {
    setSearch("");
    setFilter("All");
    setSort("Newest");
  };

  // Apply filters and search
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const q = search.toLowerCase();
        return (
          p.item?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
        );
      })
      .filter((p) => (filter === "All" ? true : p.category === filter))
      .sort((a, b) => {
        if (sort === "Newest") return b.createdAt?.seconds - a.createdAt?.seconds;
        if (sort === "Oldest") return a.createdAt?.seconds - b.createdAt?.seconds;
        if (sort === "Price: Low to High") return a.price - b.price;
        if (sort === "Price: High to Low") return b.price - a.price;
        return 0;
      });
  }, [products, search, filter, sort]);

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter, sort]);

  const availableCount = products.filter((p) => p.availability).length;

  return (
    <div className="p-3 sm:p-4 lg:p-6 min-h-screen text-[var(--color-coffee-800)]">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold flex items-center gap-2">
              <Package className="w-6 h-6 sm:w-7 sm:h-7" /> Products
            </h1>
            <p className="text-xs sm:text-sm text-[var(--color-coffee-700)] mt-1">
              View product availability and pricing details
            </p>
          </div>

          <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
            <div className="flex-1 sm:flex-initial bg-white shadow-sm rounded-lg sm:rounded-xl px-3 sm:px-5 py-2 sm:py-3 text-center border border-[var(--color-coffee-100)]">
              <p className="text-[10px] sm:text-xs text-[var(--color-coffee-600)]">Total</p>
              <p className="font-bold text-base sm:text-lg text-[var(--color-coffee-800)]">{products.length}</p>
            </div>
            <div className="flex-1 sm:flex-initial bg-white shadow-sm rounded-lg sm:rounded-xl px-3 sm:px-5 py-2 sm:py-3 text-center border border-[var(--color-coffee-100)]">
              <p className="text-[10px] sm:text-xs text-[var(--color-coffee-600)]">Available</p>
              <p className="font-bold text-base sm:text-lg text-green-600">{availableCount}</p>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-[var(--color-coffee-50)] rounded-xl border border-[var(--color-coffee-100)] p-3 sm:p-4 shadow-sm">
          <div className="flex flex-col gap-3">
            {/* Search Bar */}
            <div className="relative flex items-center w-full">
              <Search className="absolute left-3 text-[var(--color-coffee-600)] w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder="Search products, categories or descriptions..."
                className="w-full pl-9 sm:pl-10 pr-3 py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-white border border-[var(--color-coffee-200)] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-coffee-700)] placeholder:text-[var(--color-coffee-400)]"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Filters Row */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              <button className="cursor-pointer p-2 rounded-lg sm:rounded-xl bg-white border border-[var(--color-coffee-200)] hover:bg-[var(--color-coffee-100)] transition-colors">
                <Filter className="w-4 h-4 text-[var(--color-coffee-600)] mx-auto" />
              </button>

              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="cursor-pointer flex-1 sm:flex-initial px-3 py-2 rounded-lg sm:rounded-xl bg-white border border-[var(--color-coffee-200)] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-coffee-700)] text-[var(--color-coffee-800)]"
              >
                <option>All</option>
                <option>Beverage</option>
                <option>Dessert</option>
                <option>Meal</option>
              </select>

              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm text-[var(--color-coffee-700)] whitespace-nowrap">Sort by</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="cursor-pointer flex-1 px-3 py-2 rounded-lg sm:rounded-xl bg-white border border-[var(--color-coffee-200)] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-coffee-700)] text-[var(--color-coffee-800)]"
                >
                  <option>Newest</option>
                  <option>Oldest</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                </select>
              </div>

              <button
                onClick={handleReset}
                className="cursor-pointer px-4 py-2 text-xs sm:text-sm rounded-lg sm:rounded-xl bg-white border border-[var(--color-coffee-200)] text-[var(--color-coffee-700)] hover:bg-[var(--color-coffee-100)] transition-colors font-medium"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Items per page selector */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <label className="text-xs text-[var(--color-coffee-700)]">Show:</label>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="cursor-pointer bg-white border border-[var(--color-coffee-200)] text-[var(--color-coffee-800)] rounded-md px-2 py-1 text-xs shadow-sm"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
          <span className="text-xs text-[var(--color-coffee-700)]">
            Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredProducts.length)} - {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length}
          </span>
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block bg-white shadow-sm rounded-xl border border-[var(--color-coffee-100)] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-coffee-100)] text-[var(--color-coffee-800)] text-left">
              <tr>
                <th className="p-3 sm:p-4">ID</th>
                <th className="p-3 sm:p-4">Product Name</th>
                <th className="p-3 sm:p-4">Category</th>
                <th className="p-3 sm:p-4">Price</th>
                <th className="p-3 sm:p-4">Availability</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map((p, idx) => (
                <tr
                  key={p.id}
                  className={`border-t border-[var(--color-coffee-100)] hover:bg-[var(--color-coffee-50)] transition-all ${
                    idx % 2 === 0 ? 'bg-white' : 'bg-[var(--color-coffee-50)]'
                  }`}
                >
                  <td className="p-3 sm:p-4 text-[var(--color-coffee-600)]">{p.id}</td>
                  <td className="p-3 sm:p-4 font-medium text-[var(--color-coffee-800)]">{p.name}</td>
                  <td className="p-3 sm:p-4">{p.category}</td>
                  <td className="p-3 sm:p-4 font-medium">₱{p.price}</td>
                  <td className="p-3 sm:p-4">
                    <button
                      onClick={() => toggleAvailability(p.id, p.availability)}
                      className={`cursor-pointer px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                        p.availability
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-red-100 text-red-700 hover:bg-red-200"
                      }`}
                    >
                      {p.availability ? "Available" : "Not Available"}
                    </button>
                  </td>
                </tr>
              ))}

              {paginatedProducts.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-[var(--color-coffee-400)] italic">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile/Tablet Cards */}
        <div className="lg:hidden space-y-3">
          {paginatedProducts.length === 0 ? (
            <div className="text-center py-8 text-[var(--color-coffee-400)] italic">No products found.</div>
          ) : (
            paginatedProducts.map((p) => (
              <div key={p.id} className="bg-white rounded-lg shadow-sm border border-[var(--color-coffee-100)] p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm text-[var(--color-coffee-800)]">{p.name}</h3>
                    <p className="text-xs text-[var(--color-coffee-600)] mt-1">{p.category}</p>
                    <p className="text-[10px] text-[var(--color-coffee-500)] mt-1">ID: {p.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[var(--color-coffee-800)]">₱{p.price}</p>
                  </div>
                </div>

                <button
                  onClick={() => toggleAvailability(p.id, p.availability)}
                  className={`cursor-pointer w-full px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    p.availability
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-red-100 text-red-700 hover:bg-red-200"
                  }`}
                >
                  {p.availability ? "✓ Available" : "✕ Not Available"}
                </button>
              </div>
            ))
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 px-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="cursor-pointer w-full sm:w-auto px-4 py-2 text-xs sm:text-sm bg-white border border-[var(--color-coffee-200)] rounded-md hover:bg-[var(--color-coffee-50)] text-[var(--color-coffee-800)] font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ← Previous
            </button>

            <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto">
              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1;
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`cursor-pointer px-2 sm:px-3 py-1.5 text-xs sm:text-sm rounded-md font-semibold transition-colors ${
                        currentPage === page
                          ? "bg-[var(--color-coffee-600)] text-white"
                          : "bg-white border border-[var(--color-coffee-200)] text-[var(--color-coffee-800)] hover:bg-[var(--color-coffee-50)]"
                      }`}
                    >
                      {page}
                    </button>
                  );
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                  return (
                    <span key={page} className="text-[var(--color-coffee-700)] text-xs">
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
              className="cursor-pointer w-full sm:w-auto px-4 py-2 text-xs sm:text-sm bg-white border border-[var(--color-coffee-200)] rounded-md hover:bg-[var(--color-coffee-50)] text-[var(--color-coffee-800)] font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
