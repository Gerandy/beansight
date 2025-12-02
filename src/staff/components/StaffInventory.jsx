import React, { useState, useEffect } from "react";
import { X, Check, Coffee, Package, Layers, Tag, Ruler, AlertTriangle, Pencil, Plus } from "lucide-react";
import { db } from "../../firebase";
import { collection, addDoc, doc, updateDoc, deleteDoc, onSnapshot } from "firebase/firestore";

function StaffInventory() {
  const [inventoryData, setInventoryData] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const initialForm = { item: "", stock: "", category: "", unit: "", reorderLevel: "", cost: "" };
  const [form, setForm] = useState(initialForm);

  // Fetch inventory from Firestore
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "inventory"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setInventoryData(data);
    });
    return () => unsub();
  }, []);

  const categories = ["All", ...Array.from(new Set(inventoryData.map((i) => i.category)))];

  const filteredInventory = inventoryData.filter((i) => {
    const matchesCategory = filterCategory === "All" || i.category === filterCategory;
    const matchesSearch = i.item.toLowerCase().includes(search.toLowerCase()) ||
      i.category.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);
  const paginatedInventory = filteredInventory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterCategory]);

  const handleInputChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!form.item || !form.stock || !form.category || !form.unit || !form.reorderLevel) return;

    await addDoc(collection(db, "inventory"), {
      ...form,
      stock: Number(form.stock),
      reorderLevel: Number(form.reorderLevel),
      cost: Number(form.cost || 0),
    });

    setForm(initialForm);
    setShowAddModal(false);
  };

  const handleEditClick = (item) => {
    setEditItem(item);
    setForm(item);
    setShowEditModal(true);
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    const docRef = doc(db, "inventory", editItem.id);
    await updateDoc(docRef, { 
      ...form, 
      stock: Number(form.stock), 
      reorderLevel: Number(form.reorderLevel),
      cost: Number(form.cost || 0),
    });
    setShowEditModal(false);
    setEditItem(null);
    setForm(initialForm);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      await deleteDoc(doc(db, "inventory", id));
    }
  };

  const handleAdjustStock = async (id, delta) => {
    const item = inventoryData.find((i) => i.id === id);
    if (!item) return;
    const docRef = doc(db, "inventory", id);
    await updateDoc(docRef, { stock: Math.max(0, item.stock + delta) });
  };

  const Modal = ({ show, onClose, title, children }) =>
    show ? (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6 lg:p-8 relative">
          <button 
            className="absolute top-3 right-3 sm:top-4 sm:right-4 text-[var(--color-coffee-700)] hover:text-[var(--color-coffee-900)] transition-colors" 
            onClick={onClose}
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-[var(--color-coffee-800)] mb-4 sm:mb-6 flex items-center gap-2 pr-8">
            <Coffee className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--color-coffee-600)]" /> {title}
          </h2>
          {children}
        </div>
      </div>
    ) : null;

  function renderForm(type) {
    const handleSubmit = type === "Add" ? handleAddItem : handleEditSave;
    const categoryOptions = ["Coffee", "Dairy", "Pastry", "Tea", "Condiments", "Bakery"];
    const unitOptions = ["kg", "pcs", "liters", "bottles", "jars"];

    return (
      <form className="space-y-4 sm:space-y-5 text-[var(--color-coffee-900)]" onSubmit={handleSubmit}>
        <div>
          <label className="block mb-1 sm:mb-2 text-[var(--color-coffee-700)] font-medium text-xs sm:text-sm">Item Name</label>
          <div className="flex items-center border border-[var(--color-coffee-200)] rounded-lg sm:rounded-xl bg-[var(--color-coffee-50)] px-3">
            <Package className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--color-coffee-500)] mr-2 flex-shrink-0" />
            <input
              type="text"
              name="item"
              placeholder="e.g., Espresso Beans"
              className="bg-transparent py-2 sm:py-2.5 w-full outline-none text-sm"
              value={form.item}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 sm:mb-2 text-[var(--color-coffee-700)] font-medium text-xs sm:text-sm">Stock</label>
            <div className="flex items-center border border-[var(--color-coffee-200)] rounded-lg sm:rounded-xl bg-[var(--color-coffee-50)] px-3">
              <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--color-coffee-500)] mr-2 flex-shrink-0" />
              <input
                type="number"
                name="stock"
                placeholder="e.g., 120"
                className="bg-transparent py-2 sm:py-2.5 w-full outline-none text-sm"
                value={form.stock}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 sm:mb-2 text-[var(--color-coffee-700)] font-medium text-xs sm:text-sm">Unit</label>
            <div className="flex items-center border border-[var(--color-coffee-200)] rounded-lg sm:rounded-xl bg-[var(--color-coffee-50)] px-3">
              <Ruler className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--color-coffee-500)] mr-2 flex-shrink-0" />
              <select
                name="unit"
                className="bg-transparent py-2 sm:py-2.5 w-full outline-none text-sm"
                value={form.unit}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Unit</option>
                {unitOptions.map((unit) => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div>
          <label className="block mb-1 sm:mb-2 text-[var(--color-coffee-700)] font-medium text-xs sm:text-sm">Category</label>
          <div className="flex items-center border border-[var(--color-coffee-200)] rounded-lg sm:rounded-xl bg-[var(--color-coffee-50)] px-3">
            <Tag className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--color-coffee-500)] mr-2 flex-shrink-0" />
            <select
              name="category"
              className="bg-transparent py-2 sm:py-2.5 w-full outline-none text-sm"
              value={form.category}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Category</option>
              {categoryOptions.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 sm:mb-2 text-[var(--color-coffee-700)] font-medium text-xs sm:text-sm">Reorder Level</label>
            <div className="flex items-center border border-[var(--color-coffee-200)] rounded-lg sm:rounded-xl bg-[var(--color-coffee-50)] px-3">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--color-coffee-500)] mr-2 flex-shrink-0" />
              <input
                type="number"
                name="reorderLevel"
                placeholder="e.g., 30"
                className="bg-transparent py-2 sm:py-2.5 w-full outline-none text-sm"
                value={form.reorderLevel}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 sm:mb-2 text-[var(--color-coffee-700)] font-medium text-xs sm:text-sm">Unit Cost (₱)</label>
            <div className="flex items-center border border-[var(--color-coffee-200)] rounded-lg sm:rounded-xl bg-[var(--color-coffee-50)] px-3">
              <Tag className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--color-coffee-500)] mr-2 flex-shrink-0" />
              <input
                type="number"
                step="0.01"
                min="0"
                name="cost"
                placeholder="e.g., 5.00"
                className="bg-transparent py-2 sm:py-2.5 w-full outline-none text-sm"
                value={form.cost}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-3">
          <button
            type="button"
            className="cursor-pointer px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-[var(--color-coffee-200)] hover:bg-[var(--color-coffee-300)] text-[var(--color-coffee-800)] font-medium flex items-center justify-center gap-2 text-sm transition-colors"
            onClick={() => (type === "Add" ? setShowAddModal(false) : setShowEditModal(false))}
          >
            <X className="w-4 h-4" /> Cancel
          </button>
          <button
            type="submit"
            className="cursor-pointer px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-[var(--color-coffee-700)] hover:bg-[var(--color-coffee-800)] text-white font-medium flex items-center justify-center gap-2 text-sm transition-colors"
          >
            <Check className="w-4 h-4" />
            {type === "Add" ? "Add Item" : "Save Changes"}
          </button>
        </div>
      </form>
    );
  }

  const lowStockItems = inventoryData.filter(item => item.stock <= item.reorderLevel).length;

  return (
    <div className="p-3 sm:p-4 lg:p-6 min-h-screen text-[var(--color-coffee-800)]">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--color-coffee-800)] flex items-center gap-2">
              <Coffee className="w-6 h-6 sm:w-7 sm:h-7" /> Inventory Management
            </h1>
            <p className="text-xs sm:text-sm text-[var(--color-coffee-700)] mt-1">
              Track and manage your inventory items
            </p>
          </div>

          <button
            className="cursor-pointer w-full sm:w-auto bg-[var(--color-coffee-700)] text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl shadow hover:bg-[var(--color-coffee-800)] transition-colors flex items-center justify-center gap-2 text-sm sm:text-base font-medium"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" /> Add Item
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-[var(--color-coffee-100)] p-3 sm:p-4">
            <p className="text-[10px] sm:text-xs text-[var(--color-coffee-600)] mb-1">Total Items</p>
            <p className="font-bold text-lg sm:text-xl lg:text-2xl text-[var(--color-coffee-800)]">{inventoryData.length}</p>
          </div>
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-[var(--color-coffee-100)] p-3 sm:p-4">
            <p className="text-[10px] sm:text-xs text-[var(--color-coffee-600)] mb-1">Categories</p>
            <p className="font-bold text-lg sm:text-xl lg:text-2xl text-[var(--color-coffee-800)]">{categories.length - 1}</p>
          </div>
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-[var(--color-coffee-100)] p-3 sm:p-4">
            <p className="text-[10px] sm:text-xs text-[var(--color-coffee-600)] mb-1">Low Stock</p>
            <p className="font-bold text-lg sm:text-xl lg:text-2xl text-red-600">{lowStockItems}</p>
          </div>
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-[var(--color-coffee-100)] p-3 sm:p-4">
            <p className="text-[10px] sm:text-xs text-[var(--color-coffee-600)] mb-1">Total Value</p>
            <p className="font-bold text-lg sm:text-xl lg:text-2xl text-[var(--color-coffee-800)]">
              ₱{inventoryData.reduce((sum, item) => sum + (item.stock * item.cost), 0).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-[var(--color-coffee-50)] rounded-xl border border-[var(--color-coffee-100)] p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <input
                type="text"
                placeholder="🔍 Search by item or category..."
                className="w-full border border-[var(--color-coffee-200)] rounded-lg sm:rounded-xl bg-white text-[var(--color-coffee-800)] px-3 sm:px-4 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-[var(--color-coffee-700)] outline-none shadow-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="cursor-pointer border border-[var(--color-coffee-200)] bg-white text-[var(--color-coffee-800)] rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-[var(--color-coffee-700)] shadow-sm"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Items per page */}
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
            Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredInventory.length)} - {Math.min(currentPage * itemsPerPage, filteredInventory.length)} of {filteredInventory.length}
          </span>
        </div>

        {/* Table - Desktop */}
        <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-[var(--color-coffee-100)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-[var(--color-coffee-100)] text-[var(--color-coffee-800)]">
                <tr>
                  <th className="px-4 py-3 text-left">Item</th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-center">Stock</th>
                  <th className="px-4 py-3 text-left">Unit</th>
                  <th className="px-4 py-3 text-center">Reorder Level</th>
                  <th className="px-4 py-3 text-right">Total Value</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedInventory.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-[var(--color-coffee-400)]">
                      No items found.
                    </td>
                  </tr>
                ) : (
                  paginatedInventory.map((item, idx) => {
                    const totalVal = Number(item.stock || 0) * Number(item.cost || 0);
                    const isLowStock = item.stock <= item.reorderLevel;
                    return (
                      <tr key={item.id} className={`border-t border-[var(--color-coffee-100)] hover:bg-[var(--color-coffee-50)] transition ${idx % 2 === 0 ? 'bg-white' : 'bg-[var(--color-coffee-50)]'}`}>
                        <td className="px-4 py-3 font-medium">
                          <div className="flex items-center gap-2">
                            {item.item}
                            {isLowStock && <AlertTriangle className="w-4 h-4 text-red-500" />}
                          </div>
                        </td>
                        <td className="px-4 py-3">{item.category}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              className="cursor-pointer bg-[var(--color-coffee-200)] text-[var(--color-coffee-800)] px-2 py-1 rounded hover:bg-[var(--color-coffee-300)] transition text-xs"
                              onClick={() => handleAdjustStock(item.id, -1)}
                              disabled={item.stock <= 0}
                            >
                              -
                            </button>
                            <span className={`font-medium ${isLowStock ? 'text-red-600' : ''}`}>{item.stock}</span>
                            <button
                              className="cursor-pointer bg-[var(--color-coffee-200)] text-[var(--color-coffee-800)] px-2 py-1 rounded hover:bg-[var(--color-coffee-300)] transition text-xs"
                              onClick={() => handleAdjustStock(item.id, 1)}
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3">{item.unit}</td>
                        <td className="px-4 py-3 text-center">{item.reorderLevel}</td>
                        <td className="px-4 py-3 text-right font-medium">₱{totalVal.toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <button
                              className="cursor-pointer bg-[var(--color-coffee-600)] hover:bg-[var(--color-coffee-700)] text-white px-3 py-1 rounded text-xs font-semibold flex items-center gap-1 transition"
                              onClick={() => handleEditClick(item)}
                            >
                              <Pencil size={12} /> Edit
                            </button>
                            <button
                              className="cursor-pointer bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-semibold transition"
                              onClick={() => handleDelete(item.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cards - Mobile/Tablet */}
        <div className="lg:hidden space-y-3">
          {paginatedInventory.length === 0 ? (
            <div className="text-center py-8 text-[var(--color-coffee-400)]">No items found.</div>
          ) : (
            paginatedInventory.map((item) => {
              const totalVal = Number(item.stock || 0) * Number(item.cost || 0);
              const isLowStock = item.stock <= item.reorderLevel;
              return (
                <div key={item.id} className="bg-white rounded-lg shadow-sm border border-[var(--color-coffee-100)] p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm text-[var(--color-coffee-800)]">{item.item}</h3>
                        {isLowStock && <AlertTriangle className="w-4 h-4 text-red-500" />}
                      </div>
                      <p className="text-xs text-[var(--color-coffee-600)] mt-1">{item.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-[var(--color-coffee-800)]">₱{totalVal.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                    <div>
                      <p className="text-[var(--color-coffee-600)]">Stock</p>
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          className="cursor-pointer bg-[var(--color-coffee-200)] text-[var(--color-coffee-800)] px-2 py-1 rounded hover:bg-[var(--color-coffee-300)] transition"
                          onClick={() => handleAdjustStock(item.id, -1)}
                          disabled={item.stock <= 0}
                        >
                          -
                        </button>
                        <span className={`font-medium ${isLowStock ? 'text-red-600' : ''}`}>{item.stock}</span>
                        <button
                          className="cursor-pointer bg-[var(--color-coffee-200)] text-[var(--color-coffee-800)] px-2 py-1 rounded hover:bg-[var(--color-coffee-300)] transition"
                          onClick={() => handleAdjustStock(item.id, 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div>
                      <p className="text-[var(--color-coffee-600)]">Unit</p>
                      <p className="font-medium mt-1">{item.unit}</p>
                    </div>
                    <div>
                      <p className="text-[var(--color-coffee-600)]">Reorder Level</p>
                      <p className="font-medium mt-1">{item.reorderLevel}</p>
                    </div>
                    <div>
                      <p className="text-[var(--color-coffee-600)]">Unit Cost</p>
                      <p className="font-medium mt-1">₱{Number(item.cost || 0).toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      className="cursor-pointer flex-1 bg-[var(--color-coffee-600)] hover:bg-[var(--color-coffee-700)] text-white px-3 py-2 rounded text-xs font-semibold flex items-center justify-center gap-1 transition"
                      onClick={() => handleEditClick(item)}
                    >
                      <Pencil size={12} /> Edit
                    </button>
                    <button
                      className="cursor-pointer flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-xs font-semibold transition"
                      onClick={() => handleDelete(item.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
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

      {/* Modals */}
      <Modal show={showAddModal} onClose={() => setShowAddModal(false)} title="Add Inventory Item">
        {renderForm("Add")}
      </Modal>
      <Modal show={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Inventory Item">
        {renderForm("Edit")}
      </Modal>
    </div>
  );
}

export default StaffInventory;