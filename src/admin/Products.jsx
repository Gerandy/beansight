import React, { useState } from "react";
import { Upload, Save } from "lucide-react";

function AddItem() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    stock: "",
    image: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setFormData({ ...formData, image: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("New menu item added:", formData);
    alert("Menu item successfully added!");
    setFormData({
      name: "",
      description: "",
      category: "",
      price: "",
      stock: "",
      image: null,
    });
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-10xl mx-auto bg-white shadow-lg rounded-2xl p-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Add New Menu Item
        </h1>

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

          {/* Price & Stock side by side */}
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
            <label className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg py-10 cursor-pointer hover:bg-gray-100 transition">
              <div className="text-center">
                <Upload className="mx-auto mb-2 text-gray-500" />
                <span className="text-gray-600">
                  {formData.image ? formData.image.name : "Click to upload image"}
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
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="flex items-center justify-center gap-2 bg-yellow-950 hover:bg-yellow-500 text-white font-medium rounded-lg px-6 py-3 w-full transition"
          >
            <Save size={18} />
            Save Item
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddItem;
