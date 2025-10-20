// ProductManagement.jsx
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
} from "lucide-react";

/* sample initial data */
const initialProducts = [
  {
    id: 1,
    name: "Hot Coffee",
    description: "Freshly brewed premium Arabica — smooth, nutty, warming.",
    category: "Beverage",
    price: 120,
    stock: 50,
    image: null,
  },
  {
    id: 2,
    name: "Iced Coffee",
    description: "Cold brew with a touch of milk — bright and refreshing.",
    category: "Beverage",
    price: 150,
    stock: 30,
    image: null,
  },
  // add more demo items if you like
];

export default function ProductManagement() {
  const [products, setProducts] = useState(initialProducts);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Newest");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    stock: "",
    image: null,
  });

  // Responsive grid columns are handled by tailwind classes in JSX

  // Derived lists (search + filter + sort)
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
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
    } else if (sortBy === "Stock: Low → High") {
      arr.sort((a, b) => Number(a.stock) - Number(b.stock));
    } else {
      // Newest first by id timestamp-ish
      arr.sort((a, b) => b.id - a.id);
    }
    return arr;
  }, [products, query, categoryFilter, sortBy]);

  // KPI values
  const totalProducts = products.length;
  const totalStock = products.reduce((sum, p) => sum + Number(p.stock || 0), 0);

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
        image: null,
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
    } else {
      setForm((s) => ({ ...s, [name]: value }));
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editing) {
      setProducts((prev) => prev.map((p) => (p.id === editing.id ? { ...form, id: editing.id } : p)));
    } else {
      const newItem = { ...form, id: Date.now() };
      setProducts((prev) => [newItem, ...prev]);
    }
    closeModal();
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this product?")) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  // small helper to render image preview or placeholder
  const ProductImage = ({ product, className = "w-28 h-20" }) => {
    if (product.image instanceof File) {
      return (
        <img
          src={URL.createObjectURL(product.image)}
          alt={product.name}
          className={`${className} object-cover rounded-lg`}
        />
      );
    }
    if (product.image && typeof product.image === "string") {
      return <img src={product.image} alt={product.name} className={`${className} object-cover rounded-lg`} />;
    }
    return (
      <div
        className={`${className} flex items-center justify-center rounded-lg border border-dashed border-coffee-300 bg-white/40`}
      >
        <Upload className="text-coffee-700" />
      </div>
    );
  };

  // categories for filter dropdown based on data
  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category || "Uncategorized"));
    return ["All", ...Array.from(set)];
  }, [products]);

  // small debounce for search (optional)
  useEffect(() => {
    // placeholder for future debouncing if needed
  }, [query]);

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
              Manage menu items, pricing, stock and images. Clean, responsive layout designed for quick scanning.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-3">
              <div className="px-4 py-2 bg-white rounded-xl shadow-soft-lg text-center">
                <div className="text-xs text-coffee-600">Total items</div>
                <div className="text-lg font-semibold text-coffee-800">{totalProducts}</div>
              </div>
              <div className="px-4 py-2 bg-white rounded-xl shadow-soft-lg text-center">
                <div className="text-xs text-coffee-600">Total stock</div>
                <div className="text-lg font-semibold text-coffee-800">{totalStock}</div>
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
                <option>Stock: Low → High</option>
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
          </div>
        </div>

        {/* Grid of product cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white rounded-2xl shadow-soft-lg">
              <p className="text-coffee-700 mb-3">No products found.</p>
              <button onClick={() => openModal()} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-coffee-700 text-white">
                <Plus size={16} /> Add your first product
              </button>
            </div>
          ) : (
            filtered.map((p) => (
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
                        <div className="text-xs text-coffee-600 mt-1">Stock: {p.stock}</div>
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
            ))
          )}
        </div>

        {/* footer spacing */}
        <div className="h-20"></div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-coffee-900/30 bg-gradient-to-br from-coffee-900/20 to-coffee-700/10 px-4 transition-all">

          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 relative animate-fadeIn">
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
              title="Close"
            >
              <X size={22} />
            </button>

            {/* Modal Header */}
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              {editing ? "Edit Product" : "Add New Product"}
            </h2>
            <p className="text-gray-500 mb-6 text-sm">
              Add product details and upload a photo. Images are previewed locally.
            </p>

            {/* Form */}
            <form onSubmit={handleSave} className="space-y-5">
              {/* Name & Category */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleInput}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-black focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none"
                    placeholder="e.g. Caramel Latte"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleInput}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-black focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleInput}
                  rows="3"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-black focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none"
                  placeholder="e.g. A refreshing iced coffee with rich flavor..."
                  required
                ></textarea>
              </div>

              {/* Price & Stock */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (₱)
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleInput}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-black focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none"
                    placeholder="e.g. 120"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={form.stock}
                    onChange={handleInput}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-black focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none"
                    placeholder="e.g. 50"
                    required
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image
                </label>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg py-8 cursor-pointer hover:bg-gray-100 transition text-gray-600">
                  <Upload className="mb-2 text-gray-500" />
                  <span>
                    {form.image
                      ? form.image.name || "Image selected"
                      : "Click to upload"}
                  </span>
                  <input
                    type="file"
                    name="image"
                    onChange={handleInput}
                    accept="image/*"
                    className="hidden"
                  />
                </label>

                {/* Image Preview */}
                {form.image && (
                  <div className="mt-3 flex items-center gap-2">
                    <img
                      src={
                        form.image instanceof File
                          ? URL.createObjectURL(form.image)
                          : form.image
                      }
                      alt="Preview"
                      className="w-16 h-16 object-cover rounded-lg shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, image: null })}
                      className="text-red-500 hover:text-red-700"
                      title="Remove image"
                    >
                      <X size={18} />
                    </button>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-yellow-950 hover:bg-yellow-700 text-white font-medium rounded-lg px-6 py-2 transition"
                >
                  <Save size={18} />
                  {editing ? "Update Product" : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


    </div>
  );
}