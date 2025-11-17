import React, { useState, useEffect, useMemo } from "react";
import { Filter, Search } from "lucide-react";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase"; // ✅ adjust path if needed

export default function StaffProductManagement() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState("Newest");
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // ✅ Realtime listener to Firestore "products" collection
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

  // ✅ Toggle product availability (update Firestore)
  const toggleAvailability = async (id, currentAvailability) => {
  try {
    // currentAvailability is TRUE or FALSE from Firestore
    const newStatus = !currentAvailability; // flip boolean

    const docRef = doc(db, "Inventory", id);
    await updateDoc(docRef, { availability: newStatus });

    console.log(`Updated availability ${id} → ${newStatus}`);
  } catch (err) {
    console.error("Error updating product:", err);
  }
};

  // ✅ Reset filters and search
  const handleReset = () => {
    setSearch("");
    setFilter("All");
    setSort("Newest");
  };

  // ✅ Apply filters and search
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

  // 📄 Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter, sort]);

  return (
    <div className="p-8 min-h-screen text-[#3c2a1e] bg-[#fffaf5]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-extrabold flex items-center gap-2">
              ☕ Products
            </h1>
            <p className="text-sm text-[#8c7a68]">
              View product availability and pricing details.
            </p>
          </div>

          <div className="flex gap-3">
            <div className="bg-white shadow-sm rounded-xl px-5 py-3 text-center">
              <p className="text-xs text-[#8c7a68]">Total items</p>
              <p className="font-bold text-lg">{products.length}</p>
            </div>
            <div className="bg-white shadow-sm rounded-xl px-5 py-3 text-center">
              <p className="text-xs text-[#8c7a68]">Available</p>
              <p className="font-bold text-lg">
                {products.filter((p) => p.availability === "Available").length}
              </p>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-coffee-100 backdrop-blur-sm rounded-2xl p-4 md:p-5 flex flex-wrap md:flex-nowrap items-center justify-between gap-4 mb-6 shadow-soft-lg">
          <div className="flex items-center gap-3 w-full flex-1">
            <div className="relative flex items-center w-full">
              <Search className="absolute left-3 text-[#c49a77] w-4 h-4" />
              <input
                type="text"
                placeholder="Search products, categories or descriptions..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/70 border border-[#f3e7dc] text-sm focus:outline-none placeholder:text-[#b9a999]"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <button className="p-2 rounded-xl bg-white/70 border border-[#f3e7dc] hover:bg-[#f8eee5] transition-colors">
              <Filter className="w-4 h-4 text-[#c49a77]" />
            </button>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-white/70 border border-[#f3e7dc] text-sm focus:outline-none text-[#7a6957]"
            >
              <option>All</option>
              <option>Beverage</option>
              <option>Dessert</option>
              <option>Meal</option>
            </select>

            <div className="flex items-center gap-2">
              <span className="text-sm text-[#7a6957]">Sort</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white/70 border border-[#f3e7dc] text-sm focus:outline-none text-[#7a6957]"
              >
                <option>Newest</option>
                <option>Oldest</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
              </select>
            </div>

            <button
              onClick={handleReset}
              className="px-4 py-2 text-sm rounded-xl bg-white/70 border border-[#f3e7dc] text-[#c49a77] hover:bg-[#f8eee5] transition-colors"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Items per page selector */}
        <div className="flex items-center gap-2 mb-4">
          <label className="text-xs text-[#8c7a68]">Show:</label>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-white border border-[#f3e7dc] text-[#7a6957] rounded-xl px-2 py-1 text-xs shadow-sm"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span className="text-xs text-[#8c7a68]">
            Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredProducts.length)} - {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length}
          </span>
        </div>

        {/* Table */}
        <div className="bg-white shadow-sm rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-coffee-100 text-[#8c7a68] text-left">
              <tr>
                <th className="p-4">ID</th>
                <th className="p-4">Product Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Availability</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map((p) => (
                <tr
                  key={p.id}
                  className="last:border-0 hover:bg-coffee-100 transition-all"
                >
                  <td className="p-4">{p.id}</td>
                  <td className="p-4 font-medium">
                    <div className="flex flex-col">
                      <span>{p.name}</span>
                    </div>
                  </td>
                  <td className="p-4">{p.category}</td>
                  <td className="p-4">₱{p.price}</td>
                  <td className="p-4">
                    <button
                      onClick={() => toggleAvailability(p.id, p.availability)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 
                        ${p.availability ? "bg-rgreened-100 text-green-700" : "bg-red-100 text-red-700"}
                      `}
                    >
                      {p.availability ? " Available" : " Not Available"}
                    </button>
                  </td>
                </tr>
              ))}

              {paginatedProducts.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center py-6 text-[#8c7a68] italic"
                  >
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 📄 Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 px-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm bg-white border border-[#f3e7dc] rounded-xl hover:bg-[#f8eee5] text-[#7a6957] font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                      className={`px-3 py-1.5 text-sm rounded-xl font-semibold transition-colors ${
                        currentPage === page
                          ? "bg-[#c49a77] text-white"
                          : "bg-white border border-[#f3e7dc] text-[#7a6957] hover:bg-[#f8eee5]"
                      }`}
                    >
                      {page}
                    </button>
                  );
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                  return (
                    <span key={page} className="text-[#8c7a68]">
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
              className="px-4 py-2 text-sm bg-white border border-[#f3e7dc] rounded-xl hover:bg-[#f8eee5] text-[#7a6957] font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
