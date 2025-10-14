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


const generateId = (() => {
  let id = 1000;
  return () => id++;
})();

function InventoryAnalytics() {

  const [inventoryData, setInventoryData] = useState([
    {
      id: 1,
      item: "Espresso Beans",
      stock: 120,
      category: "Coffee",
      unit: "kg",
      reorderLevel: 40,
    },
    { id: 2, item: "Milk", stock: 60, category: "Dairy", unit: "liters", reorderLevel: 20 },
    { id: 3, item: "Butter Croissant", stock: 45, category: "Pastry", unit: "pcs", reorderLevel: 20 },
    { id: 4, item: "Chocolate Muffin", stock: 30, category: "Pastry", unit: "pcs", reorderLevel: 15 },
    { id: 5, item: "Green Tea Leaves", stock: 25, category: "Tea", unit: "kg", reorderLevel: 10 },
    { id: 6, item: "Eggs", stock: 90, category: "Dairy", unit: "pcs", reorderLevel: 30 },
    { id: 7, item: "Strawberry Jam", stock: 15, category: "Condiments", unit: "jars", reorderLevel: 10 },
    { id: 8, item: "Bagels", stock: 35, category: "Bakery", unit: "pcs", reorderLevel: 15 },
    { id: 9, item: "Vanilla Syrup", stock: 10, category: "Condiments", unit: "bottles", reorderLevel: 5 },
  ]);
  const [suppliers, setSuppliers] = useState([
    { name: "Cafe Beans Co.", item: "Espresso Beans", lastDelivery: "Oct 3, 2025", nextDelivery: "Oct 10, 2025" },
    { name: "DairyFresh", item: "Milk", lastDelivery: "Oct 4, 2025", nextDelivery: "Oct 8, 2025" },
    { name: "Sweet Oven", item: "Butter Croissant", lastDelivery: "Oct 2, 2025", nextDelivery: "Oct 9, 2025" },
    { name: "TeaTime Ltd.", item: "Green Tea Leaves", lastDelivery: "Oct 1, 2025", nextDelivery: "Oct 12, 2025" },
    { name: "Bakery House", item: "Bagels", lastDelivery: "Oct 5, 2025", nextDelivery: "Oct 11, 2025" },
  ]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");


  const initialForm = { item: "", stock: "", category: "", unit: "", reorderLevel: "" };
  const [form, setForm] = useState(initialForm);


  const categories = [
    "All",
    ...Array.from(new Set(inventoryData.map(i => i.category)))
  ];

  const filteredInventory = inventoryData.filter(i =>
    (filterCategory === "All" || i.category === filterCategory) &&
    (i.item.toLowerCase().includes(search.toLowerCase()) || i.category.toLowerCase().includes(search.toLowerCase()))
  );


  const lowStock = inventoryData.filter((item) => item.stock < item.reorderLevel);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!form.item || !form.stock || !form.category || !form.unit || !form.reorderLevel) return;
    setInventoryData([
      ...inventoryData,
      {
        id: generateId(),
        item: form.item,
        stock: Number(form.stock),
        category: form.category,
        unit: form.unit,
        reorderLevel: Number(form.reorderLevel),
      },
    ]);
    setForm(initialForm);
    setShowAddModal(false);
  };

  const handleEditClick = (item) => {
    setEditItem(item);
    setForm({
      item: item.item,
      stock: item.stock,
      category: item.category,
      unit: item.unit,
      reorderLevel: item.reorderLevel,
    });
    setShowEditModal(true);
  };

  const handleEditSave = (e) => {
    e.preventDefault();
    setInventoryData(inventoryData.map(i =>
      i.id === editItem.id
        ? { ...i, ...form, stock: Number(form.stock), reorderLevel: Number(form.reorderLevel) }
        : i
    ));
    setShowEditModal(false);
    setEditItem(null);
    setForm(initialForm);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      setInventoryData(inventoryData.filter(i => i.id !== id));
    }
  };


  const handleAdjustStock = (id, delta) => {
    setInventoryData(inventoryData.map(i =>
      i.id === id ? { ...i, stock: Math.max(0, i.stock + delta) } : i
    ));
  };

  const Modal = ({ show, onClose, title, children }) =>
    show ? (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 relative">
          <button
            className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-2xl"
            onClick={onClose}
            aria-label="Close"
          >
            &times;
          </button>
          <h2 className="text-xl font-bold mb-4 text-black">{title}</h2>
          {children}
        </div>
      </div>
    ) : null;

  return (
    <div className="p-6 space-y-8 min-h-scree">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        📦 Inventory Analytics
        <button
          className="ml-auto bg-yellow-950 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          onClick={() => setShowAddModal(true)}
        >
          + Add Item
        </button>
      </h1>


      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-md border-l-4 border-yellow-400">
          <h2 className="text-gray-600 text-sm">Total Inventory Items</h2>
          <p className="text-2xl font-bold text-red-600">{inventoryData.length}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-md border-l-4 border-yellow-400">
          <h2 className="text-gray-600 text-sm">Low Stock Items</h2>
          <p className="text-2xl font-bold text-red-600">{lowStock.length}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-md border-l-4 border-yellow-400">
          <h2 className="text-gray-600 text-sm">Total Stock</h2>
          <p className="text-2xl font-bold text-red-600">
            {inventoryData.reduce((sum, i) => sum + i.stock, 0)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-md border-l-4 border-yellow-400">
          <h2 className="text-gray-600 text-sm">Next Scheduled Delivery</h2>
          <p className="text-2xl font-bold text-red-600">Oct 8, 2025</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <input
          type="text"
          placeholder="🔍 Search by item or category..."
          className="border-4 border-yellow-950 rounded text-black px-4 py-2 w-full md:w-1/3"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="border-4 border-yellow-950 text-black rounded px-4 py-2"
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
        >
          {categories.map(cat => (
            <option key={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Chart Section */}
      <div className="bg-white p-6 rounded-2xl shadow-md">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Current Stock Levels
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={filteredInventory}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="item" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="stock" fill="#DA291C" radius={[5, 5, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Inventory Table */}
      <div className="bg-white p-6 rounded-2xl shadow-md">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          🗃️ Inventory List
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-gray-700">
            <thead>
              <tr className="border-b border-gray-200 text-sm uppercase text-gray-500">
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
                  <td colSpan={7} className="text-center py-6 text-gray-400">
                    No items found.
                  </td>
                </tr>
              ) : (
                filteredInventory.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{item.item}</td>
                    <td className="px-4 py-3">{item.category}</td>
                    <td className="px-4 py-3 flex items-center gap-2">
                      <button
                        className="bg-gray-200 px-2 rounded hover:bg-gray-300"
                        onClick={() => handleAdjustStock(item.id, -1)}
                        disabled={item.stock <= 0}
                        title="Decrease"
                      >-</button>
                      <span>{item.stock}</span>
                      <button
                        className="bg-gray-200 px-2 rounded hover:bg-gray-300"
                        onClick={() => handleAdjustStock(item.id, 1)}
                        title="Increase"
                      >+</button>
                    </td>
                    <td className="px-4 py-3">{item.unit}</td>
                    <td className="px-4 py-3">{item.reorderLevel}</td>
                    <td className="px-4 py-3">
                      {item.stock < item.reorderLevel ? (
                        <span className="text-red-600 font-semibold">Low</span>
                      ) : (
                        <span className="text-green-600 font-semibold">OK</span>
                      )}
                    </td>
                    <td className="px-4 py-3 flex gap-2">
                      <button
                        className="bg-green-700 text-white px-3 py-1 rounded hover:bg-green-800"
                        onClick={() => handleEditClick(item)}
                      >
                        Edit
                      </button>
                      <button
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
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
      <div className="bg-white p-6 rounded-2xl shadow-md">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          ⚠️ Low Stock Alerts
        </h2>
        {lowStock.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-gray-700">
              <thead>
                <tr className="border-b border-gray-200 text-sm uppercase text-gray-500">
                  <th className="px-4 py-2">Item</th>
                  <th className="px-4 py-2">Stock</th>
                  <th className="px-4 py-2">Reorder Level</th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{item.item}</td>
                    <td className="px-4 py-3">{item.stock}</td>
                    <td className="px-4 py-3">{item.reorderLevel}</td>
                    <td className="px-4 py-3 text-red-600 font-semibold">
                      Restock Soon
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">All items are sufficiently stocked.</p>
        )}
      </div>

      {/* Supplier Info */}
      <div className="bg-white p-6 rounded-2xl shadow-md">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          🏭 Supplier Deliveries
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-gray-700">
            <thead>
              <tr className="border-b border-gray-200 text-sm uppercase text-gray-500">
                <th className="px-4 py-2">Supplier</th>
                <th className="px-4 py-2">Item</th>
                <th className="px-4 py-2">Last Delivery</th>
                <th className="px-4 py-2">Next Delivery</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{s.name}</td>
                  <td className="px-4 py-3">{s.item}</td>
                  <td className="px-4 py-3">{s.lastDelivery}</td>
                  <td className="px-4 py-3 text-yellow-600 font-semibold">{s.nextDelivery}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Item Modal */}
      <Modal show={showAddModal} onClose={() => setShowAddModal(false)} title="Add Inventory Item">
        
        <form className="space-y-4 text-black" onSubmit={handleAddItem}>
          <div>
            <label className="block text-gray-700 mb-1">Item Name</label>
            <input
              type="text"
              name="item"
              className="border rounded text-black px-3 py-2 w-full"
              value={form.item}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-gray-700 mb-1">Stock</label>
              <input
                type="number"
                name="stock"
                className="border rounded text-black px-3 py-2 w-full"
                value={form.stock}
                onChange={handleInputChange}
                required
                min="0"
              />
            </div>
            <div className="flex-1">
              <label className="block text-gray-700 mb-1">Unit</label>
              <input
                type="text"
                name="unit"
                className="border rounded text-black px-3 py-2 w-full"
                value={form.unit}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-gray-700 mb-1">Category</label>
              <input
                type="text"
                name="category"
                className="border rounded text-black px-3 py-2 w-full"
                value={form.category}
                onChange={handleInputChange}
                required
                placeholder="e.g. Meat, Dairy"
              />
            </div>
            <div className="flex-1">
              <label className="block text-gray-700 mb-1">Reorder Level</label>
              <input
                type="number"
                name="reorderLevel"
                className="border rounded text-black px-3 py-2 w-full"
                value={form.reorderLevel}
                onChange={handleInputChange}
                required
                min="1"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
              onClick={() => setShowAddModal(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
            >
              Add Item
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Item Modal */}
      <Modal show={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Inventory Item">
        <form className="space-y-4" onSubmit={handleEditSave}>
          <div>
            <label className="block text-gray-700 mb-1">Item Name</label>
            <input
              type="text"
              name="item"
              className="border rounded text-black px-3 py-2 w-full"
              value={form.item}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-gray-700 mb-1">Stock</label>
              <input
                type="number"
                name="stock"
                className="border rounded text-black px-3 py-2 w-full"
                value={form.stock}
                onChange={handleInputChange}
                required
                min="0"
              />
            </div>
            <div className="flex-1">
              <label className="block text-gray-700 mb-1">Unit</label>
              <input
                type="text"
                name="unit"
                className="border rounded text-black px-3 py-2 w-full"
                value={form.unit}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-gray-700 mb-1">Category</label>
              <input
                type="text"
                name="category"
                className="border rounded text-black px-3 py-2 w-full"
                value={form.category}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-gray-700 mb-1">Reorder Level</label>
              <input
                type="number"
                name="reorderLevel"
                className="border rounded text-black px-3 py-2 w-full"
                value={form.reorderLevel}
                onChange={handleInputChange}
                required
                min="1"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
              onClick={() => setShowEditModal(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-yellow-500 text-white hover:bg-yellow-600"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default InventoryAnalytics;
