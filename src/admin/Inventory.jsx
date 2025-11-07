import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import {
  X,
  Check,
  Coffee,
  Package,
  Layers,
  Tag,
  Ruler,
  AlertTriangle,
  Pencil,
} from "lucide-react";

const generateId = (() => {
  let id = 1000;
  return () => id++;
})();

function InventoryAnalytics() {
  const [inventoryData, setInventoryData] = useState([
    { id: 1, item: "Espresso Beans", stock: 120, category: "Coffee", unit: "kg", reorderLevel: 40 },
    { id: 2, item: "Milk", stock: 60, category: "Dairy", unit: "liters", reorderLevel: 20 },
    { id: 3, item: "Butter Croissant", stock: 45, category: "Pastry", unit: "pcs", reorderLevel: 20 },
    { id: 4, item: "Chocolate Muffin", stock: 30, category: "Pastry", unit: "pcs", reorderLevel: 15 },
    { id: 5, item: "Green Tea Leaves", stock: 25, category: "Tea", unit: "kg", reorderLevel: 10 },
    { id: 6, item: "Eggs", stock: 90, category: "Dairy", unit: "pcs", reorderLevel: 30 },
    { id: 7, item: "Strawberry Jam", stock: 15, category: "Condiments", unit: "jars", reorderLevel: 10 },
    { id: 8, item: "Bagels", stock: 35, category: "Bakery", unit: "pcs", reorderLevel: 15 },
    { id: 9, item: "Vanilla Syrup", stock: 10, category: "Condiments", unit: "bottles", reorderLevel: 5 },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [unitFilter, setUnitFilter] = useState("");


  const initialForm = { item: "", stock: "", category: "", unit: "", reorderLevel: "" };
  const [form, setForm] = useState(initialForm);

  const categories = ["All", ...Array.from(new Set(inventoryData.map((i) => i.category)))];

  const filteredInventory = inventoryData.filter((i) => {
    const matchesCategory =
      (filterCategory === "All" || i.category === filterCategory) &&
      (categoryFilter === "" || i.category === categoryFilter);

    const status =
      i.stock < i.reorderLevel
        ? "Low"
        : "OK"; 

    const matchesStatus =
      statusFilter === "" || status === statusFilter;

    const matchesUnit =
      unitFilter === "" || i.unit === unitFilter;

    const matchesSearch =
      i.item.toLowerCase().includes(search.toLowerCase()) ||
      i.category.toLowerCase().includes(search.toLowerCase());

    return matchesCategory && matchesStatus && matchesUnit && matchesSearch;
  });

  const lowStock = inventoryData.filter((item) => item.stock < item.reorderLevel);

  const handleInputChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleAddItem = (e) => {
    e.preventDefault();
    if (!form.item || !form.stock || !form.category || !form.unit || !form.reorderLevel) return;
    setInventoryData([
      ...inventoryData,
      { id: generateId(), ...form, stock: Number(form.stock), reorderLevel: Number(form.reorderLevel) },
    ]);
    setForm(initialForm);
    setShowAddModal(false);
  };

  const handleEditClick = (item) => {
    setEditItem(item);
    setForm(item);
    setShowEditModal(true);
  };

  const handleEditSave = (e) => {
    e.preventDefault();
    setInventoryData(
      inventoryData.map((i) =>
        i.id === editItem.id ? { ...i, ...form, stock: Number(form.stock), reorderLevel: Number(form.reorderLevel) } : i
      )
    );
    setShowEditModal(false);
    setEditItem(null);
    setForm(initialForm);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      setInventoryData(inventoryData.filter((i) => i.id !== id));
    }
  };

  const handleAdjustStock = (id, delta) => {
    setInventoryData(
      inventoryData.map((i) => (i.id === id ? { ...i, stock: Math.max(0, i.stock + delta) } : i))
    );
  };

  const Modal = ({ show, onClose, title, children }) =>
    show ? (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-md">
        <div className="bg-coffee-50/90 backdrop-blur-md border border-coffee-200/50 rounded-2xl shadow-2xl w-full max-w-lg p-8 relative animate-fadeIn">
          <button className="absolute top-3 right-3 text-coffee-700 hover:text-accent-500" onClick={onClose}>
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-2xl font-semibold text-coffee-800 mb-6 flex items-center gap-2">
            <Coffee className="w-6 h-6 text-coffee-600" /> {title}
          </h2>
          {children}
        </div>
      </div>
    ) : null;


  return (
    <div className="p-8 space-y-8 min-h-screen text-coffee-800 font-sans">
      <header className="flex items-center mb-6">
        <h1 className="text-3xl font-bold text-coffee-800">☕ Inventory Analytics</h1>
        <button
          className="ml-auto text-2xl font-bold bg-coffee-700 text-coffee-50 px-5 py-2.5 rounded-xl shadow hover:bg-coffee-800 transition"
          onClick={() => setShowAddModal(true)}
        >
          + Add Item
        </button>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: "Total Items", value: inventoryData.length },
          { title: "Low Stock Items", value: lowStock.length },
          { title: "Total Stock", value: inventoryData.reduce((sum, i) => sum + i.stock, 0) },
          { title: "Next Delivery", value: "Oct 8, 2025" },
        ].map((card, i) => (
          <div
            key={i}
            className="bg-coffee-50 p-6 rounded-2xl shadow-soft-lg border border-coffee-200 hover:shadow-soft-xl transition"
          >
            <h2 className="text-sm text-coffee-600">{card.title}</h2>
            <p className="text-2xl font-bold text-coffee-800 mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <input
          type="text"
          placeholder="🔍 Search by item or category..."
          className="border border-coffee-300 rounded-xl bg-coffee-50 text-coffee-800 px-4 py-2 w-full md:w-1/3 focus:ring-2 focus:ring-coffee-700 outline-none shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="border border-coffee-300 bg-coffee-50 text-coffee-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-coffee-700 shadow-sm"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          {categories.map((cat) => (
            <option key={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Chart */}
      <div className="bg-coffee-50 p-6 rounded-2xl shadow-soft-lg">
        <h2 className="text-lg font-semibold mb-4 text-coffee-800">Current Stock Levels</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={filteredInventory}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F6E3CC" />
            <XAxis dataKey="item" stroke="#8E5A3A" />
            <YAxis stroke="#8E5A3A" />
            <Tooltip />
            <Bar dataKey="stock" fill="var(--color-coffee-500)" radius={[5, 5, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Inventory Table */}
      <div className="bg-coffee-50 p-6 rounded-2xl shadow-soft-lg">
        <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2 text-[var(--color-coffee-800)]">
          🗃️ Inventory List
        </h2>

        {/* Filter Section */}
        <div className="flex flex-wrap gap-2 mt-3 sm:mt-0">
          <select
            className="px-3 py-2 rounded-lg bg-[var(--color-coffee-100)] border border-[var(--color-coffee-200)] text-[var(--color-coffee-800)] focus:outline-none focus:ring-2 focus:ring-[var(--color-coffee-400)]"
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="Coffee">Coffee</option>
            <option value="Dairy">Dairy</option>
            <option value="Pastry">Pastry</option>
            <option value="Tea">Tea</option>
            <option value="Condiments">Condiments</option>
            <option value="Bakery">Bakery</option>
          </select>

          <select
            className="px-3 py-2 rounded-lg bg-[var(--color-coffee-100)] border border-[var(--color-coffee-200)] text-[var(--color-coffee-800)] focus:outline-none focus:ring-2 focus:ring-[var(--color-coffee-400)]"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="OK">OK</option>
            <option value="Low">Low</option>
            <option value="Critical">Critical</option>
          </select>

          <select
            className="px-3 py-2 rounded-lg bg-[var(--color-coffee-100)] border border-[var(--color-coffee-200)] text-[var(--color-coffee-800)] focus:outline-none focus:ring-2 focus:ring-[var(--color-coffee-400)]"
            onChange={(e) => setUnitFilter(e.target.value)}
          >
            <option value="">All Units</option>
            <option value="kg">kg</option>
            <option value="pcs">pcs</option>
            <option value="liters">liters</option>
            <option value="bottles">bottles</option>
            <option value="jars">jars</option>
          </select>
        </div>
      </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-coffee-900">
            <thead>
              <tr className="border-b border-coffee-200 text-sm uppercase text-coffee-600">
                <th className="px-4 py-2">Item</th>
                <th className="px-4 py-2">Category</th>
                <th className="px-4 py-2">Stock</th>
                <th className="px-4 py-2">Unit</th>
                <th className="px-4 py-2">Reorder Level</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-coffee-400">
                    No items found.
                  </td>
                </tr>
              ) : (
                filteredInventory.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-coffee-200 hover:bg-coffee-100/70 transition"
                  >
                    <td className="px-4 py-3 font-medium">{item.item}</td>
                    <td className="px-4 py-3">{item.category}</td>
                    <td className="px-4 py-3 flex items-center gap-2">
                      <button
                        className="bg-coffee-200 text-coffee-800 px-2 rounded hover:bg-coffee-300"
                        onClick={() => handleAdjustStock(item.id, -1)}
                        disabled={item.stock <= 0}
                      >
                        -
                      </button>
                      <span>{item.stock}</span>
                      <button
                        className="bg-coffee-200 text-coffee-800 px-2 rounded hover:bg-coffee-300"
                        onClick={() => handleAdjustStock(item.id, 1)}
                      >
                        +
                      </button>
                    </td>
                    <td className="px-4 py-3">{item.unit}</td>
                    <td className="px-4 py-3">{item.reorderLevel}</td>
                    <td className="px-4 py-3">
                      {item.stock < item.reorderLevel ? (
                        <span className="text-accent-500 font-semibold">Low</span>
                      ) : (
                        <span className="text-coffee-700 font-semibold">OK</span>
                      )}
                    </td>
                    <td className="px-4 py-3 flex gap-2">
                      <button
                        className="bg-coffee-500 hover:bg-coffee-600 text-white px-3 py-1 rounded text-xs font-semibold transition flex items-center gap-1"
                        onClick={() => handleEditClick(item)}
                      >
                        <Pencil size={12} /> Edit
                      </button>
                      <button
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-semibold transition"
                        onClick={() => handleDelete(item.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Low Stock Table */}
      <div className="bg-coffee-50 p-6 rounded-2xl shadow-soft-lg">
        <h2 className="text-lg font-semibold text-coffee-800 mb-4">⚠️ Low Stock Alerts</h2>
        {lowStock.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-coffee-900">
              <thead>
                <tr className="border-b border-coffee-200 text-sm uppercase text-coffee-600">
                  <th className="px-4 py-2">Item</th>
                  <th className="px-4 py-2">Stock</th>
                  <th className="px-4 py-2">Reorder Level</th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-coffee-200 hover:bg-coffee-100/70"
                  >
                    <td className="px-4 py-3 font-medium">{item.item}</td>
                    <td className="px-4 py-3">{item.stock}</td>
                    <td className="px-4 py-3">{item.reorderLevel}</td>
                    <td className="px-4 py-3 text-accent-500 font-semibold">
                      Restock Soon
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-coffee-700">All items are sufficiently stocked.</p>
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

    function renderForm(type) {
      const handleSubmit = type === "Add" ? handleAddItem : handleEditSave;

      const categoryOptions = ["Coffee", "Dairy", "Pastry", "Tea", "Condiments", "Bakery"];
      const unitOptions = ["kg", "pcs", "liters", "bottles", "jars"];

      return (
        <form className="space-y-5 text-coffee-900" onSubmit={handleSubmit}>
          {/* Item Name */}
          <div>
            <label className="block mb-1 text-coffee-700 font-medium">Item Name</label>
            <div className="flex items-center border border-coffee-300 rounded-xl bg-coffee-50 px-3">
              <Package className="w-5 h-5 text-coffee-500 mr-2" />
              <input
                type="text"
                name="item"
                placeholder="e.g., Espresso Beans"
                className="bg-transparent py-2.5 w-full outline-none"
                value={form.item}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          {/* Stock */}
          <div>
            <label className="block mb-1 text-coffee-700 font-medium">Stock</label>
            <div className="flex items-center border border-coffee-300 rounded-xl bg-coffee-50 px-3">
              <Layers className="w-5 h-5 text-coffee-500 mr-2" />
              <input
                type="number"
                name="stock"
                placeholder="e.g., 120"
                className="bg-transparent py-2.5 w-full outline-none"
                value={form.stock}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block mb-1 text-coffee-700 font-medium">Category</label>
            <div className="flex items-center border border-coffee-300 rounded-xl bg-coffee-50 px-3">
              <Tag className="w-5 h-5 text-coffee-500 mr-2" />
              <select
                name="category"
                className="bg-transparent py-2.5 w-full outline-none"
                value={form.category}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Category</option>
                {categoryOptions.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Unit */}
          <div>
            <label className="block mb-1 text-coffee-700 font-medium">Unit</label>
            <div className="flex items-center border border-coffee-300 rounded-xl bg-coffee-50 px-3">
              <Ruler className="w-5 h-5 text-coffee-500 mr-2" />
              <select
                name="unit"
                className="bg-transparent py-2.5 w-full outline-none"
                value={form.unit}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Unit</option>
                {unitOptions.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Reorder Level */}
          <div>
            <label className="block mb-1 text-coffee-700 font-medium">Reorder Level</label>
            <div className="flex items-center border border-coffee-300 rounded-xl bg-coffee-50 px-3">
              <AlertTriangle className="w-5 h-5 text-coffee-500 mr-2" />
              <input
                type="number"
                name="reorderLevel"
                placeholder="e.g., 30"
                className="bg-transparent py-2.5 w-full outline-none"
                value={form.reorderLevel}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              className="px-5 py-2.5 rounded-xl bg-coffee-200 hover:bg-coffee-300 text-coffee-800 font-medium flex items-center gap-2"
              onClick={() => (type === "Add" ? setShowAddModal(false) : setShowEditModal(false))}
            >
              <X className="w-4 h-4" /> Cancel
            </button>
            <button
              type="submit"
              className={`px-5 py-2.5 rounded-xl bg-coffee-700 hover:bg-coffee-800 text-white font-medium flex items-center gap-2 ${
                type === "Add" ? "bg-coffee-700 hover:bg-coffee-800" : "bg-accent-500 hover:brightness-90"
              }`}
            >
              <Check className="w-4 h-4" />
              {type === "Add" ? "Add Item" : "Save Changes"}
            </button>
          </div>
        </form>
      );
    }

}

export default InventoryAnalytics;