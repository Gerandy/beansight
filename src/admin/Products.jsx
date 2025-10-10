import React, { useState } from "react";
import { Upload, Save, Edit, Trash2, Plus, X } from "lucide-react";

const initialProducts = [
  {
    id: 1,
    name: "Big Mac",
    description: "Two all-beef patties, special sauce, lettuce, cheese, pickles, onions on a sesame seed bun.",
    category: "burger",
    price: 120,
    stock: 50,
    image: null,
  },
  {
    id: 2,
    name: "Crispy Chicken",
    description: "Juicy fried chicken with crispy coating.",
    category: "chicken",
    price: 150,
    stock: 30,
    image: null,
  },
];

function ProductManagement() {
  const [products, setProducts] = useState(initialProducts);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    stock: "",
    image: null,
  });

  // Open modal for add or edit
  const openModal = (product = null) => {
    setEditing(product);
    setFormData(
      product
        ? { ...product }
        : { name: "", description: "", category: "", price: "", stock: "", image: null }
    );
    setModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setFormData({ name: "", description: "", category: "", price: "", stock: "", image: null });
  };

  // Handle form input
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setFormData({ ...formData, image: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Add or update product
  const handleSubmit = (e) => {
    e.preventDefault();
    if (editing) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editing.id
            ? { ...formData, id: editing.id }
            : p
        )
      );
    } else {
      setProducts((prev) => [
        ...prev,
        {
          ...formData,
          id: Date.now(),
        },
      ]);
    }
    closeModal();
  };

  // Delete product
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  // Render image preview
  const renderImage = (product) => {
    if (product.image instanceof File) {
      return (
        <img
          src={URL.createObjectURL(product.image)}
          alt={product.name}
          className="w-14 h-14 object-cover rounded"
        />
      );
    }
    return (
      <div className="w-14 h-14 bg-gray-200 flex items-center justify-center rounded text-gray-400">
        <Upload />
      </div>
    );
  };

  return (
    <div className="min-h-screen  p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Product Management</h1>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-yellow-950 hover:bg-yellow-600 text-white font-semibold px-5 py-2 rounded-lg shadow transition"
          >
            <Plus size={18} />
            Add Product
          </button>
        </div>

        {/* Product Table */}
        <div className="bg-white shadow-lg rounded-2xl overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-yellow-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Image</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Price (₱)</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Stock</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-400">
                    No products found.
                  </td>
                </tr>
              )}
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-yellow-50 text-black transition">
                  <td className="px-4 py-3">{renderImage(product)}</td>
                  <td className="px-4 py-3 font-medium">{product.name}</td>
                  <td className="px-4 py-3 capitalize">{product.category}</td>
                  <td className="px-4 py-3">₱{product.price}</td>
                  <td className="px-4 py-3">{product.stock}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => openModal(product)}
                      className="inline-flex items-center p-2 text-yellow-700 hover:text-yellow-900"
                      title="Edit"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="inline-flex items-center p-2 text-red-600 hover:text-red-800"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 relative animate-fadeIn">
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
                title="Close"
              >
                <X size={22} />
              </button>
              <h2 className="text-xl font-bold mb-6 text-gray-800">
                {editing ? "Edit Product" : "Add New Product"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none"
                    placeholder="e.g. Big Mac"
                    required
                  />
                </div>
                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none"
                    placeholder="e.g. Two all-beef patties, special sauce..."
                    required
                  ></textarea>
                </div>
                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full border text-black border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none"
                    required
                  >
                    <option value="">Select category</option>
                    <option value="burger">Burger</option>
                    <option value="chicken">Chicken</option>
                    <option value="beverage">Beverage</option>
                    <option value="dessert">Dessert</option>
                    <option value="fries">Fries & Sides</option>
                  </select>
                </div>
                {/* Price & Stock */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price (₱)
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      className="w-full border text-black border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none"
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
                      value={formData.stock}
                      onChange={handleChange}
                      className="w-full border text-black border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none"
                      placeholder="e.g. 50"
                      required
                    />
                  </div>
                </div>
                {/* Image upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload Image
                  </label>
                  <label className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg py-8 cursor-pointer hover:bg-gray-100 transition">
                    <div className="text-center">
                      <Upload className="mx-auto mb-2 text-gray-500" />
                      <span className="text-gray-600">
                        {formData.image
                          ? formData.image.name || "Image selected"
                          : "Click to upload image"}
                      </span>
                    </div>
                    <input
                      type="file"
                      name="image"
                      onChange={handleChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </label>
                  {formData.image && (
                    <div className="mt-2 flex items-center gap-2">
                      <img
                        src={
                          formData.image instanceof File
                            ? URL.createObjectURL(formData.image)
                            : formData.image
                        }
                        alt="Preview"
                        className="w-14 h-14 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image: null })}
                        className="text-red-500 hover:text-red-700"
                        title="Remove image"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  )}
                </div>
             
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 bg-yellow-950 hover:bg-yellow-500 text-white font-medium rounded-lg px-6 py-3 w-full transition"
                >
                  <Save size={18} />
                  {editing ? "Update Product" : "Save Product"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductManagement;
