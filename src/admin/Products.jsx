import React, { useMemo, useState, useEffect } from "react";
import {
  Upload,
  Save,
  Edit,
  Trash2,
  Plus,
  X,
  Search,
  Filter,
  ChevronDown,
  ArrowUpDown,
  Eye,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";



export default function ProductManagement() {

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "Inventory"));
        const productList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProducts(productList);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);



  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Newest");
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12); 
  const [view, setView] = useState("cards"); 

  const [selectedIds, setSelectedIds] = useState(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    availability: true,
    image: null,
  });

  const filtered = useMemo(() => {
    const q = debouncedQuery || "";
    let arr = products.slice();

    if (categoryFilter !== "All") {
      arr = arr.filter((p) => p.category.toLowerCase() === categoryFilter.toLowerCase());
    }
    if (q) {
      arr = arr.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }
    if (sortBy === "Price: Low → High") {
      arr.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === "Price: High → Low") {
      arr.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sortBy === "Availability: Available first") {
      arr.sort((a, b) => {
        if (a.availability === b.availability) return 0;
        return a.availability ? -1 : 1;
      });
    } else {
      // Newest first by id timestamp-ish
      arr.sort((a, b) => b.id - a.id);
    }
    return arr;
  }, [products, /*query*/ debouncedQuery, categoryFilter, sortBy]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);
  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [totalPages, page]);

  // KPI values
  const totalProducts = products.length;
  const totalAvailable = products.reduce((sum, p) => sum + (p.availability ? 1 : 0), 0);

  // Open modal for add/edit
  const openModal = (product = null) => {
    if (product) {
      setEditing(product);
      setForm({ ...product });
    } else {
      setEditing(null);
      setForm({
        name: "",
        description: "",
        category: "",
        price: "",
        stock: "",
        img: "",
        isNew: true,
        availablity: true,
      });
    }
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const handleInput = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setForm((s) => ({ ...s, image: files?.[0] || null }));
    } else if (name === "availability") {
      // select returns string "true" / "false"
      setForm((s) => ({ ...s, availability: value === "true" }));
    } else {
      setForm((s) => ({ ...s, [name]: value }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        // Update existing document
        const productRef = doc(db, "Inventory", editing.id);
        await updateDoc(productRef, form);
      } else {
        // Add new document
        const docRef = await addDoc(collection(db, "Inventory"), form);
      }
      
      // Fetch updated products list
      const querySnapshot = await getDocs(collection(db, "Inventory"));
      const productList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productList);
      
      closeModal();
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Error saving product. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this product?")) {
      try {
        await deleteDoc(doc(db, "Inventory", id));
        setProducts(prev => prev.filter(p => p.id !== id));
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Error deleting product. Please try again.");
      }
    }
  };

  // ProductImage component with createObjectURL management (prevents leaks)
  const ProductImage = ({ product, className = "w-28 h-20" }) => {
    const [src, setSrc] = useState(null);
    useEffect(() => {
      let url = null;
      if (!product || !product.image) {
        setSrc(null);
        return;
      }
      if (product.image instanceof File) {
        url = URL.createObjectURL(product.image);
        setSrc(url);
      } else if (typeof product.image === "string") {
        setSrc(product.image);
      } else {
        setSrc(null);
      }
      return () => {
        if (url) URL.revokeObjectURL(url);
      };
    }, [product?.image]);

    if (src) {
      return <img src={src} alt={product?.name} className={`${className} object-cover rounded-lg`} />;
    }
    return (
      <div
        className={`${className} flex items-center justify-center rounded-lg border border-dashed border-coffee-300 bg-white/40`}
      >
        <Upload className="text-coffee-700" />
      </div>
    );
  };

  const [formImageUrl, setFormImageUrl] = useState(null);
  useEffect(() => {
    let url = null;
    if (!form.image) {
      setFormImageUrl(null);
      return;
    }
    if (form.image instanceof File) {
      url = URL.createObjectURL(form.image);
      setFormImageUrl(url);
    } else if (typeof form.image === "string") {
      setFormImageUrl(form.image);
    } else {
      setFormImageUrl(null);
    }
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [form.image]);

  // categories for filter dropdown based on data
  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category || "Uncategorized"));
    return ["All", ...Array.from(set)];
  }, [products]);

  // small debounce for search (optional)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim().toLowerCase()), 300);
    setPage(1); // reset to first page when query changes
    return () => clearTimeout(t);
  }, [query]);

  // table selection helpers
  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isAllPageSelected = paginated.length > 0 && paginated.every((p) => selectedIds.has(p.id));
  const toggleSelectAll = () => {
    if (isAllPageSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        paginated.forEach((p) => next.delete(p.id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        paginated.forEach((p) => next.add(p.id));
        return next;
      });
    }
  };

  const clearSelection = () => setSelectedIds(new Set());

  const bulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Delete ${selectedIds.size} selected item(s)?`)) return;
    
    try {
      const deletePromises = Array.from(selectedIds).map(id => 
        deleteDoc(doc(db, "Inventory", id))
      );
      await Promise.all(deletePromises);
      setProducts(prev => prev.filter(p => !selectedIds.has(p.id)));
      clearSelection();
    } catch (error) {
      console.error("Error bulk deleting products:", error);
      alert("Error deleting products. Please try again.");
    }
  };

  return (
    <div className="min-h-screen text-black bg-coffee-100 p-6 sm:p-8 lg:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header with title + KPIs */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-coffee-900 flex items-center gap-3">
              <span className="text-2xl">☕</span> Product Management
            </h1>
            <p className="mt-2 text-sm text-coffee-700 max-w-xl">
              Manage menu items, pricing, availability and images. Clean, responsive layout designed for quick scanning.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-3">
              <div className="px-4 py-2 bg-white rounded-xl shadow-soft-lg text-center">
                <div className="text-xs text-coffee-600">Total items</div>
                <div className="text-lg font-semibold text-coffee-800">{totalProducts}</div>
              </div>
              <div className="px-4 py-2 bg-white rounded-xl shadow-soft-lg text-center">
                <div className="text-xs text-coffee-600">Available</div>
                <div className="text-lg font-semibold text-coffee-800">{totalAvailable}</div>
              </div>
            </div>

            <button
              onClick={() => openModal()}
              className="flex items-center gap-2 bg-coffee-700 text-white px-4 py-2 rounded-2xl shadow hover:bg-coffee-600 transition"
            >
              <Plus size={16} /> Add Product
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 md:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 shadow-soft-lg">
          <div className="flex items-center gap-3 w-full md:w-1/2">
            <div className="relative flex items-center w-full">
              <Search className="absolute left-3 text-coffee-500" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products, categories or descriptions..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-coffee-200 focus:ring-2 focus:ring-coffee-200 outline-none bg-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="text-coffee-600" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded-xl border border-coffee-200 py-2 px-3 bg-white outline-none"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-end w-full md:w-auto">
            <div className="flex items-center gap-2">
              <span className="text-sm text-coffee-600 hidden md:block">Sort</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-xl border border-coffee-200 py-2 px-3 bg-white outline-none"
              >
                <option>Newest</option>
                <option>Price: Low → High</option>
                <option>Price: High → Low</option>
                <option>Availability: Available first</option>
              </select>
              <button
                onClick={() => {
                  setQuery("");
                  setCategoryFilter("All");
                  setSortBy("Newest");
                }}
                className="px-3 py-2 rounded-xl bg-coffee-50 border border-coffee-200 text-coffee-700"
                title="Reset filters"
              >
                Reset
              </button>
            </div>

            {/* View toggle */}
            <div className="ml-3 inline-flex items-center rounded-xl border border-coffee-200 bg-white">
              <button
                onClick={() => setView("cards")}
                className={`px-3 py-2 ${view === "cards" ? "bg-coffee-100" : ""}`}
                title="Card view"
              >
                Cards
              </button>
              <button
                onClick={() => setView("table")}
                className={`px-3 py-2 ${view === "table" ? "bg-coffee-100" : ""}`}
                title="Table view"
              >
                Table
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-2xl shadow-soft-lg">
            <p className="text-coffee-700 mb-3">No products found.</p>
            <button onClick={() => openModal()} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-coffee-700 text-white">
              <Plus size={16} /> Add your first product
            </button>
          </div>
        ) : view === "cards" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginated.map((p) => (
              <article
                key={p.id}
                className="bg-white rounded-2xl shadow-soft-lg p-4 flex flex-col"
                role="article"
              >
                <div className="flex items-start gap-4">
                  <ProductImage product={p} className="w-15 h-20 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-coffee-900">{p.name}</h3>
                        <div className="text-xs text-coffee-600 mt-1 line-clamp-2">{p.description}</div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-semibold text-coffee-800">₱{p.price}</div>
                        <div className="text-xs text-coffee-600 mt-1">
                          {p.availability ? "Available" : "Not available"}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <div className="inline-flex items-center gap-2">
                        <span className="px-2 py-1 rounded-full bg-coffee-50 text-coffee-700 text-xs">{p.category}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openModal(p)}
                          title="Edit"
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-coffee-200 hover:shadow transition"
                        >
                          <Edit size={16} />
                          <span className="hidden sm:inline text-sm">Edit</span>
                        </button>

                        <button
                          onClick={() => handleDelete(p.id)}
                          title="Delete"
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-red-100 text-red-600 hover:bg-red-50 transition"
                        >
                          <Trash2 size={16} />
                          <span className="hidden sm:inline text-sm">Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          // Enhanced Table view (theme-aware, selectable rows, bulk actions)
          <div className="bg-white rounded-2xl shadow-soft-lg overflow-hidden">
            {/* Bulk action bar */}
            {selectedIds.size > 0 && (
              <div className="flex items-center justify-between px-4 py-3 border-b bg-coffee-50">
                <div className="text-sm text-coffee-700">{selectedIds.size} selected</div>
                <div className="flex items-center gap-2">
                  <button onClick={bulkDelete} className="px-3 py-1 rounded-md bg-red-50 text-red-700 border border-red-100 hover:bg-red-100 transition">Delete selected</button>
                  <button onClick={clearSelection} className="px-3 py-1 rounded-md bg-white text-coffee-700 border border-coffee-100 hover:bg-coffee-50 transition">Clear</button>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-coffee-50 text-coffee-700">
                  <tr>
                    <th className="px-4 py-3 w-12">
                      <input type="checkbox" className="accent-coffee-700" checked={isAllPageSelected} onChange={toggleSelectAll} />
                    </th>
                    <th className="px-4 py-3 text-sm font-medium">ID</th>
                    <th className="px-4 py-3 text-sm font-medium">Item</th>
                    <th className="px-4 py-3 text-sm font-medium">Category</th>
                    <th className="px-4 py-3 text-sm font-medium">Price</th>
                    <th className="px-4 py-3 text-sm font-medium">Availability</th>
                    <th className="px-4 py-3 text-sm font-medium">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {paginated.map((p, idx) => {
                    const selected = selectedIds.has(p.id);
                    const rowBg = idx % 2 === 0 ? "bg-white" : "bg-coffee-50/30";
                    // availability badge colors
                    const availabilityClass = p.availability
                      ? "bg-green-50 text-green-800"
                      : "bg-red-50 text-red-700";

                    return (
                      <tr key={p.id} className={`${rowBg} hover:bg-coffee-50/60 transition`} >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleSelect(p.id)}
                            className="accent-coffee-700"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm text-coffee-700">{p.id}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-10 rounded-md overflow-hidden bg-white border border-coffee-100 flex-shrink-0">
                              <ProductImage product={p} className="w-12 h-10" />
                            </div>
                            <div>
                              <div className="font-medium text-coffee-900">{p.name}</div>
                              <div className="text-xs text-coffee-600 line-clamp-1">{p.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-coffee-700">{p.category}</td>
                        <td className="px-4 py-3 text-sm text-coffee-800">₱{p.price}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${availabilityClass}`}>
                            {p.availability ? "Available" : "Not available"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button onClick={() => openModal(p)} className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white border border-coffee-100 text-coffee-700 hover:shadow">
                              <Edit size={14} /> <span className="text-sm">Edit</span>
                            </button>
                            <button onClick={() => handleDelete(p.id)} className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-red-50 border border-red-100 text-red-700 hover:bg-red-100">
                              <Trash2 size={14} /> <span className="text-sm">Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
         {/* Pagination controls */}
         {filtered.length > pageSize && (
           <div className="mt-6 flex items-center justify-center gap-3">
             <button onClick={() => setPage((s) => Math.max(1, s - 1))} disabled={page === 1} className="px-3 py-1 rounded border">Prev</button>
             <div className="px-3 py-1">Page {page} / {totalPages}</div>
             <button onClick={() => setPage((s) => Math.min(totalPages, s + 1))} disabled={page === totalPages} className="px-3 py-1 rounded border">Next</button>
             <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} className="ml-3 rounded border px-2">
               <option value={6}>6</option>
               <option value={12}>12</option>
               <option value={24}>24</option>
             </select>
           </div>
         )}

         {/* footer spacing */}
         <div className="h-20"></div>
       </div>
        
       {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            key="product-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-md"
          >
            <motion.div
              key="product-modal"
              initial={{ y: 12, opacity: 0, scale: 0.995 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 12, opacity: 0, scale: 0.995 }}
              transition={{ duration: 0.18 }}
              className="bg-coffee-50/90 backdrop-blur-md border border-coffee-200/50 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-scroll scrollbar-hide p-8 relative"
            >
              {/* Close Button */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-coffee-700 hover:text-accent-500 transition"
                title="Close"
              >
                <X size={22} />
              </button>

              {/* Header */}
              <h2 className="text-2xl font-semibold text-coffee-800 mb-2 flex items-center gap-2">
                <Upload className="w-6 h-6 text-coffee-600" />
                {editing ? "Edit Product" : "Add New Product"}
              </h2>
              <p className="text-sm text-coffee-600 mb-6">
                Add product details and upload a photo. Preview updates instantly.
              </p>

              {/* Form */}
              <form onSubmit={handleSave} className="space-y-5">
                {/* Name & Category */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-coffee-700 mb-1">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleInput}
                      className="w-full border border-coffee-300 rounded-xl px-4 py-2.5 bg-white/70 focus:ring-2 focus:ring-coffee-400 focus:border-coffee-400 outline-none text-coffee-900"
                      placeholder="e.g. Caramel Latte"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-coffee-700 mb-1">Category</label>
                    <select
                      name="category"
                      value={form.category}
                      onChange={handleInput}
                      className="w-full border border-coffee-300 rounded-xl px-4 py-2.5 bg-white/70 focus:ring-2 focus:ring-coffee-400 focus:border-coffee-400 outline-none text-coffee-900"
                      required
                    >
                      <option value="">Select category</option>
                      <option value="Beverage">Beverage</option>
                      <option value="Dessert">Dessert</option>
                      <option value="Burger">Burger</option>
                      <option value="Chicken">Chicken</option>
                      <option value="Fries & Sides">Fries & Sides</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-coffee-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleInput}
                    rows="3"
                    className="w-full border border-coffee-300 rounded-xl px-4 py-2.5 bg-white/70 focus:ring-2 focus:ring-coffee-400 focus:border-coffee-400 outline-none text-coffee-900"
                    placeholder="e.g. A refreshing iced coffee with rich flavor..."
                    required
                  ></textarea>
                </div>

                {/* Price & Availability */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-coffee-700 mb-1">Price (₱)</label>
                    <input
                      type="number"
                      name="price"
                      value={form.price}
                      onChange={handleInput}
                      className="w-full border border-coffee-300 rounded-xl px-4 py-2.5 bg-white/70 focus:ring-2 focus:ring-coffee-400 focus:border-coffee-400 outline-none text-coffee-900"
                      placeholder="e.g. 120"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-coffee-700 mb-1">Availability</label>
                    <select
                      name="availability"
                      value={String(form.availability)}
                      onChange={handleInput}
                      className="w-full border border-coffee-300 rounded-xl px-4 py-2.5 bg-white/70 focus:ring-2 focus:ring-coffee-400 focus:border-coffee-400 outline-none text-coffee-900"
                      required
                    >
                      <option value="true">Available</option>
                      <option value="false">Not available</option>
                    </select>
                  </div>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-coffee-700 mb-1">Image</label>
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-coffee-300 rounded-xl py-8 cursor-pointer bg-white/60 hover:bg-coffee-50 transition text-coffee-700">
                    <Upload className="mb-2 text-coffee-500" />
                    <span>
                      {form.image ? form.image.name || "Image selected" : "Click to upload"}
                    </span>
                    <input
                      type="file"
                      name="image"
                      onChange={handleInput}
                      accept="image/*"
                      className="hidden"
                    />
                  </label>

                  {/* Preview */}
                  {form.image && (
                    <div className="mt-3 flex items-center gap-2">
                      <img
                        src={formImageUrl || ""}
                        alt="Preview"
                        className="w-16 h-16 object-cover rounded-xl border border-coffee-200 shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, image: null })}
                        className="text-red-500 hover:text-red-700 transition"
                        title="Remove image"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 pt-6 bg-coffee-50/90 backdrop-blur-sm pb-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-5 py-2.5 rounded-xl bg-coffee-200 hover:bg-coffee-300 text-coffee-800 font-medium flex items-center gap-2 transition"
                  >
                    <X className="w-4 h-4" /> Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl text-white font-medium flex items-center gap-2 transition bg-coffee-700 hover:bg-coffee-800"
                  >
                    <Save className="w-4 h-4" />
                    {editing ? "Update Product" : "Save Product"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}