import React, { useState, useEffect } from "react";
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

  // ✅ Realtime listener to Firestore “products” collection
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
      const newStatus =
        currentAvailability === "Available" ? "Not Available" : "Available";
      const docRef = doc(db, "Inventory", id);
      await updateDoc(docRef, { availability: newStatus });
      console.log(`✅ Updated ${id} → ${newStatus}`);
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
  const filteredProducts = products
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
              {filteredProducts.map((p) => (
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
                      onClick={() =>
                        toggleAvailability(p.id, p.availability)
                      }
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${
                        p.availability === "Available"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {p.availability}
                    </button>
                  </td>
                </tr>
              ))}

              {filteredProducts.length === 0 && (
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
      </div>
    </div>
  );
}
