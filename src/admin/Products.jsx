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
  Package,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc, setDoc, arrayUnion  } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase";
import {
  SkeletonCard,
  SkeletonTable,
} from "../components/SkeletonLoader";



// Add this component before ProductManagement
const ProductImage = ({ product, className = "w-28 h-20" }) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  if (!product?.img || imageError) {
    return (
      <div
        className={`${className} flex items-center justify-center rounded-lg border border-dashed border-coffee-300 bg-white/40`}
      >
        <Upload className="text-coffee-700" />
      </div>
    );
  }

  return (
    <div className={`${className} relative rounded-lg overflow-hidden`}>
      {imageLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <img
        src={product.img}
        alt={product?.name}
        className={`${className} object-cover rounded-lg transition-opacity duration-300 ${
          imageLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onLoad={() => setImageLoading(false)}
        onError={() => {
          setImageLoading(false);
          setImageError(true);
        }}
      />
    </div>
  );
};



export default function ProductManagement() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "Inventory"));
        const productList = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            // Ensure availability is a boolean from Firestore
            availability: data.availability === true
          };
        });
        setProducts(productList);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
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
    availability: true, // Set default to true
    image: null,
  });

  // Add-ons state
  const [addOns, setAddOns] = useState([]);
  const [addOnModalOpen, setAddOnModalOpen] = useState(false);
  const [editingAddOn, setEditingAddOn] = useState(null);
  const [addOnForm, setAddOnForm] = useState({
    name: "",
    price: "",
    category: "Beverage", // Beverage or Food
    allowMultiple: false,
  });
  const [showAddOnsTab, setShowAddOnsTab] = useState(false);
  
  // Add-ons search and filter state
  const [addOnQuery, setAddOnQuery] = useState("");
  const [addOnCategoryFilter, setAddOnCategoryFilter] = useState("All");
  const [debouncedAddOnQuery, setDebouncedAddOnQuery] = useState("");

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
      setForm({ 
        name: product.name ?? "",
        description: product.description ?? "",
        category: product.category ?? "",
        price: product.price ?? "",
        availability: product.availability === true,
        image: null, // Don't set the image File object
        img: product.img ?? "", // Store the existing URL
        isNew: product.isNew ?? false,
        id: product.id
      });
    } else {
      setEditing(null);
      setForm({
        name: "",
        description: "",
        category: "",
        price: "",
        availability: true,
        image: null,
        img: "",
        isNew: true,
      });
    }
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  // handle inputs (convert availability string -> boolean, handle file)
  const handleInput = (e) => {
    const { name, value, files, type } = e.target;
    if (name === "image") {
      setForm((s) => ({ ...s, image: files?.[0] || null }));
    } else if (name === "availability") {
      // select returns "true" or "false" strings — convert to boolean
      setForm((s) => ({ ...s, availability: value === "true" }));
    } else if (type === "number") {
      setForm((s) => ({ ...s, [name]: value }));
    } else {
      setForm((s) => ({ ...s, [name]: value }));
    }
  };

  // Save (upload image to Firebase Storage first, then save URL to Firestore)
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      let imageUrl = form.img || "";

      // If a new image file was selected, upload it to Firebase Storage
      if (form.image instanceof File) {
        const imageRef = ref(storage, `products/${Date.now()}_${form.image.name}`);
        const snapshot = await uploadBytes(imageRef, form.image);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      const productData = {
        name: form.name,
        description: form.description,
        category: form.category,
        price: form.price === "" ? 0 : Number(form.price),
        availability: !!form.availability,
        img: imageUrl, // Store the download URL
        isNew: form.isNew || false,
      };

      if (editing) {
        const productRef = doc(db, "Inventory", editing.id);
        await updateDoc(productRef, productData);
      } else {
        await addDoc(collection(db, "Inventory"), productData);
      }

      // Refresh list after save
      const querySnapshot = await getDocs(collection(db, "Inventory"));
      const productList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        availability: doc.data().availability === true
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

  // Update formImageUrl to show preview or existing image
  const [formImageUrl, setFormImageUrl] = useState(null);
  useEffect(() => {
    let url = null;
    
    // If there's a new file selected, create object URL for preview
    if (form.image instanceof File) {
      url = URL.createObjectURL(form.image);
      setFormImageUrl(url);
    } 
    // If there's an existing image URL from Firestore, use it
    else if (form.img) {
      setFormImageUrl(form.img);
    } 
    // Otherwise, no image
    else {
      setFormImageUrl(null);
    }
    
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [form.image, form.img]);

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

  // Add a function to toggle availability directly from the UI
  const toggleAvailability = async (productId, currentAvailability) => {
    try {
      const productRef = doc(db, "Inventory", productId);
      
      // First, get the latest data from Firestore
      const docSnap = await getDoc(productRef);
      if (docSnap.exists()) {
        const firestoreAvailability = docSnap.data().availability === true;
        
        // Update only if the Firestore state matches our local state
        if (firestoreAvailability === currentAvailability) {
          await updateDoc(productRef, {
            availability: !currentAvailability
          });

          // Update local state
          setProducts(prev => prev.map(p => {
            if (p.id === productId) {
              return { ...p, availability: !currentAvailability };
            }
            return p;
          }));
        } else {
          // If states don't match, refresh the product list
          const querySnapshot = await getDocs(collection(db, "Inventory"));
          const productList = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            availability: doc.data().availability === true
          }));
          setProducts(productList);
        }
      }
    } catch (error) {
      console.error("Error updating availability:", error);
      alert("Error updating availability. Please try again.");
    }
  };

  // Add this function to check availability from Firestore
  const checkAvailability = async (productId) => {
    try {
      const productRef = doc(db, "Inventory", productId);
      const docSnap = await getDoc(productRef);
      
      if (docSnap.exists()) {
        // Update local state to match Firestore
        setProducts(prev => prev.map(p => {
          if (p.id === productId) {
            return { ...p, availability: docSnap.data().availability === true };
          }
          return p;
        }));
      }
    } catch (error) {
      console.error("Error checking availability:", error);
    }
  };

  // Fetch add-ons from Firestore
  useEffect(() => {
    const fetchAddOns = async () => {
      try {
        const docRef = await getDoc(doc(db, "extra", "addOns"));
        const data = docRef.data();
        setAddOns(data.beverageAddOns);
      } catch (error) {
        console.error("Error fetching add-ons:", error);
      }
    };
    fetchAddOns();
  }, [addOns]);

  // Add-on management functions
  const openAddOnModal = (addOn = null) => {
    if (addOn) {
      setEditingAddOn(addOn);
      setAddOnForm({
        name: addOn.name || "",
        price: addOn.price || "",
        category: addOn.category || "Beverage",
        allowMultiple: addOn.allowMultiple || false,
      });
    } else {
      setEditingAddOn(null);
      setAddOnForm({
        name: "",
        price: "",
        category: "Beverage",
        allowMultiple: false,
      });
    }
    setAddOnModalOpen(true);
  };

  const closeAddOnModal = () => {
    setAddOnModalOpen(false);
    setEditingAddOn(null);
  };

  const handleAddOnInput = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setAddOnForm((s) => ({ ...s, [name]: checked }));
    } else if (type === "number") {
      setAddOnForm((s) => ({ ...s, [name]: value }));
    } else {
      setAddOnForm((s) => ({ ...s, [name]: value }));
    }
  };
  const generateCustomId = () => {
  const timestamp = Date.now().toString(36); // Convert timestamp to base36
  const randomStr = Math.random().toString(36).substring(2, 8); // 6 random chars
  return `${timestamp}-${randomStr}`; // Example: "klt9x2-4f1a9b"
};


  const handleSaveAddOn = async (e) => {
  e.preventDefault();
  try {
    const docRef = doc(db, "extra", "addOns"); // your single document
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      console.error("Document does not exist!");
      return;
    }

    const addOnsArray = docSnap.data().beverageAddOns || [];

    const newAddOn = {
      id: generateCustomId(),
      name: addOnForm.name,
      price: addOnForm.price === "" ? 0 : Number(addOnForm.price),
      category: addOnForm.category,
      allowMultiple: !!addOnForm.allowMultiple,
    };

    // Check if an add-on with the same name exists
    const existingIndex = addOnsArray.findIndex(a => a.name === newAddOn.name);

    let updatedArray;
    if (existingIndex >= 0) {
      // Replace the existing add-on
      updatedArray = [...addOnsArray];
      updatedArray[existingIndex] = newAddOn;
    } else {
      // Add new add-on
      updatedArray = [...addOnsArray, newAddOn];
    }

    // Update the Firestore document
    await updateDoc(docRef, { beverageAddOns: updatedArray });

    console.log("Add-on saved successfully!");
    closeAddOnModal();

  } catch (error) {
    console.error("Error saving add-on:", error);
    alert("Error saving add-on. Please try again.");
  }
};


  const handleDeleteAddOn = async (id) => {
  if (!window.confirm("Delete this add-on?")) return;

  try {
    const docRef = doc(db, "extra", "addOns"); // Your document containing beverageAddOns
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      console.error("Document not found");
      return;
    }

    const addOnsArray = docSnap.data().beverageAddOns || [];

    // Remove the add-on with the matching id
    const updatedArray = addOnsArray.filter(a => a.id !== id);

    // Update the document
    await updateDoc(docRef, { beverageAddOns: updatedArray });

    // Update local state
    setAddOns(prev => prev.filter(a => a.id !== id));

  } catch (error) {
    console.error("Error deleting add-on:", error);
    alert("Error deleting add-on. Please try again.");
  }
};

  // Debounce add-on search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedAddOnQuery(addOnQuery.trim().toLowerCase()), 300);
    return () => clearTimeout(t);
  }, [addOnQuery]);

  // Filter add-ons
  const filteredAddOns = useMemo(() => {
    const q = debouncedAddOnQuery || "";
    let arr = addOns.slice();

    if (addOnCategoryFilter !== "All") {
      arr = arr.filter((a) => a.category === addOnCategoryFilter);
    }
    if (q) {
      arr = arr.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q)
      );
    }
    return arr;
  }, [addOns, debouncedAddOnQuery, addOnCategoryFilter]);

  if (loading) {
    return (
      <div className="min-h-screen text-black p-2 sm:p-4 md:p-6 lg:p-10">
        <div className="mx-auto max-w-screen-2xl w-full">
          {/* Header - Keep visible during loading */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6 mb-6 md:mb-8">
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-coffee-900 flex items-center gap-3">
                <span className="text-xl sm:text-2xl">☕</span> Product Management
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-coffee-700 max-w-xl">
                Manage menu items, pricing, availability, images, and add-ons. Clean, responsive layout designed for quick scanning.
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <div className="hidden md:flex items-center gap-3 shrink-0">
                <div className="px-4 py-2 bg-white rounded-xl shadow-soft-lg text-center">
                  <div className="text-xs text-coffee-600">Total items</div>
                  <div className="h-6 w-12 bg-gray-200 rounded animate-pulse mx-auto mt-1"></div>
                </div>
                <div className="px-4 py-2 bg-white rounded-xl shadow-soft-lg text-center">
                  <div className="text-xs text-coffee-600">Available</div>
                  <div className="h-6 w-12 bg-gray-200 rounded animate-pulse mx-auto mt-1"></div>
                </div>
              </div>
              <button
                disabled
                className="flex items-center gap-2 bg-coffee-700 text-white px-4 py-2 rounded-2xl shadow opacity-50 cursor-not-allowed w-full sm:w-auto"
              >
                <Plus size={16} /> Add Product
              </button>
            </div>
          </div>

          {/* Controls Skeleton */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-3 sm:p-4 md:p-5 mb-4 md:mb-6 shadow-soft-lg animate-pulse">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 md:gap-4">
              <div className="h-10 bg-gray-200 rounded-xl w-full lg:w-1/2"></div>
              <div className="h-10 bg-gray-200 rounded-xl w-full lg:w-1/4"></div>
            </div>
          </div>

          {/* Cards Skeleton */}
          <div className="grid gap-4 sm:gap-6 
                  grid-cols-[repeat(auto-fit,minmax(330px,1fr))] 
                  md:grid-cols-[repeat(auto-fit,minmax(360px,1fr))] 
                  xl:grid-cols-[repeat(auto-fit,minmax(420px,1fr))]">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-black p-2 sm:p-4 md:p-6 lg:p-10">
      <div className="mx-auto max-w-screen-2xl w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-coffee-900 flex items-center gap-3">
              <span className="text-xl sm:text-2xl">☕</span> Product Management
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-coffee-700 max-w-xl">
              Manage menu items, pricing, availability, images, and add-ons. Clean, responsive layout designed for quick scanning.
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className="hidden md:flex items-center gap-3 shrink-0">
              <div className="px-4 py-2 bg-white rounded-xl shadow-soft-lg text-center">
                <div className="text-xs text-coffee-600">Total items</div>
                <div className="text-lg font-semibold text-coffee-800">{totalProducts}</div>
              </div>
              <div className="px-4 py-2 bg-white rounded-xl shadow-soft-lg text-center">
                <div className="text-xs text-coffee-600">Available</div>
                <div className="text-lg font-semibold text-coffee-800">{totalAvailable}</div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => openModal()}
                  className="flex items-center gap-2 bg-coffee-700 text-white px-4 py-2 rounded-2xl shadow hover:bg-coffee-600 transition cursor-pointer"
                >
                  <Plus size={16} /> Add Product
                </button>
                <button
                  onClick={() => setShowAddOnsTab(!showAddOnsTab)}
                  className="flex items-center gap-2 bg-white text-coffee-700 px-4 py-2 rounded-2xl shadow border border-coffee-200 hover:bg-coffee-50 transition cursor-pointer"
                >
                  <Package size={16} /> Manage Add-ons
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Toggle between Products and Add-ons */}
        {!showAddOnsTab ? (
          <>
            {/* Controls */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-3 sm:p-4 md:p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 md:gap-4 mb-4 md:mb-6 shadow-soft-lg w-full">
              <div className="flex flex-col sm:flex-row items-stretch gap-2 sm:gap-3 w-full lg:w-1/2 min-w-0">
                <div className="relative flex items-center w-full">
                  <Search className="absolute left-3 text-coffee-500" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search products, categories or descriptions..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-coffee-200 focus:ring-2 focus:ring-coffee-200 outline-none bg-white"
                  />
                </div>
                <div className="flex items-center gap-2 sm:self-stretch">
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

              <div className="flex flex-col sm:flex-row items-stretch gap-2 sm:gap-3 justify-end w-full lg:w-auto flex-wrap min-w-0">
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
                <div className="inline-flex items-center rounded-xl border border-coffee-200 bg-white shrink-0">
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
              <div className="grid gap-4 sm:gap-6 
                  grid-cols-[repeat(auto-fit,minmax(330px,1fr))] 
                  md:grid-cols-[repeat(auto-fit,minmax(360px,1fr))] 
                  xl:grid-cols-[repeat(auto-fit,minmax(420px,1fr))]">
                {paginated.map((p) => (
                  <article
                    key={p.id}
                    className="bg-white rounded-2xl shadow-soft-lg p-4 flex flex-col h-full min-w-0"
                    role="article"
                  >
                    <div className="flex items-start gap-3 sm:gap-4 flex-wrap sm:flex-nowrap">
                      <ProductImage product={p} className="w-24 h-20 sm:w-28 sm:h-20 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        {/* Stack header until lg so text never gets crushed */}
                        <div className="flex flex-col lg:flex-row items-start lg:items-start justify-between gap-2 lg:gap-3 w-full">
                          <div className="min-w-0 flex-1">
                            <h3 className="text-base sm:text-lg font-semibold text-coffee-900 line-clamp-2 break-normal">{p.name}</h3>
                            {/* show a bit more text on small screens */}
                            <div className="text-xs text-coffee-600 mt-1 line-clamp-3 md:line-clamp-2 break-normal">{p.description}</div>
                          </div>
                          <div className="text-right flex-shrink-0 pl-1 sm:pl-2 min-w-[120px] xl:min-w-[132px] self-end lg:self-auto w-full lg:w-auto mt-1 lg:mt-0">
                            <div className="text-sm font-semibold text-coffee-800">₱{p.price}</div>
                            <button
                              onClick={async () => {
                                await checkAvailability(p.id);
                                
                              }}
                              className={`text-xs mt-1 px-2 py-1 rounded-full whitespace-nowrap ${
                                p.availability 
                                  ? "bg-green-50 text-green-700" 
                                  : "bg-red-50 text-red-600"
                              }`}
                            >
                              {p.availability ? "Available" : "Not available"}
                            </button>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-3 flex-wrap w-full min-w-0">
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
                              <span className="hidden lg:inline text-sm">Edit</span>
                            </button>

                            <button
                              onClick={() => handleDelete(p.id)}
                              title="Delete"
                              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-red-100 text-red-600 hover:bg-red-50 transition"
                            >
                              <Trash2 size={16} />
                              <span className="hidden lg:inline text-sm">Delete</span>
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
               <div className="mt-6 flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
                 <button onClick={() => setPage((s) => Math.max(1, s - 1))} disabled={page === 1} className="px-3 py-1 rounded border">Prev</button>
                 <div className="px-3 py-1">Page {page} / {totalPages}</div>
                 <button onClick={() => setPage((s) => Math.min(totalPages, s + 1))} disabled={page === totalPages} className="px-3 py-1 rounded border">Next</button>
                 <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} className="sm:ml-3 rounded border px-2">
                   <option value={6}>6</option>
                   <option value={12}>12</option>
                   <option value={24}>24</option>
                 </select>
               </div>
             )}

             {/* footer spacing */}
             <div className="h-20"></div>
          </>
        ) : (
          // Add-ons Management Section - TABLE LAYOUT
          <div className="space-y-6">
            {/* Search and Filter Controls */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-3 sm:p-4 md:p-5 shadow-soft-lg">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 md:gap-4">
                {/* Search */}
                <div className="relative flex items-center w-full lg:w-1/2">
                  <Search className="absolute left-3 text-coffee-500" />
                  <input
                    value={addOnQuery}
                    onChange={(e) => setAddOnQuery(e.target.value)}
                    placeholder="Search add-ons by name or category..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-coffee-200 focus:ring-2 focus:ring-coffee-200 outline-none bg-white"
                  />
                </div>

                {/* Filter and Actions */}
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Filter className="text-coffee-600" />
                    <select
                      value={addOnCategoryFilter}
                      onChange={(e) => setAddOnCategoryFilter(e.target.value)}
                      className="rounded-xl border border-coffee-200 py-2 px-3 bg-white outline-none"
                    >
                      <option value="All">All Categories</option>
                      <option value="Beverage">Beverage</option>
                      <option value="Meal">Meal</option>
                    </select>
                  </div>

                  <button
                    onClick={() => openAddOnModal()}
                    className="flex items-center gap-2 bg-coffee-700 text-white px-4 py-2 rounded-xl shadow hover:bg-coffee-600 transition cursor-pointer"
                  >
                    <Plus size={16} /> Add New
                  </button>
                </div>
              </div>
            </div>

            {/* Add-ons Table */}
            {filteredAddOns.length > 0 ? (
              <div className="bg-white rounded-2xl shadow-soft-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-coffee-50 text-coffee-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Category</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Price</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Multiple Qty</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredAddOns.map((addOn, idx) => {
                        const rowBg = idx % 2 === 0 ? "bg-white" : "bg-coffee-50/30";
                        const categoryClass = addOn.category === "Beverage"
                          ? "bg-blue-50 text-blue-800"
                          : "bg-orange-50 text-orange-700";

                        return (
                          <tr key={addOn.id} className={`${rowBg} hover:bg-coffee-50/60 transition`}>
                            <td className="px-4 py-3">
                              <div className="font-medium text-coffee-900">{addOn.name}</div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${categoryClass}`}>
                                {addOn.category}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-coffee-800">₱{addOn.price}</td>
                            <td className="px-4 py-3">
                              {addOn.allowMultiple ? (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700">
                                  Yes
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-50 text-gray-700">
                                  No
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => openAddOnModal(addOn)}
                                  className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white border border-coffee-100 text-coffee-700 hover:shadow transition"
                                >
                                  <Edit size={14} /> <span className="text-sm">Edit</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteAddOn(addOn.id)}
                                  className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-red-50 border border-red-100 text-red-700 hover:bg-red-100 transition"
                                >
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

                {/* Results counter */}
                <div className="px-4 py-3 bg-coffee-50/50 border-t border-coffee-100 text-sm text-coffee-600">
                  Showing {filteredAddOns.length} of {addOns.length} add-ons
                </div>
              </div>
            ) : (
              // Empty State
              <div className="text-center py-16 bg-white rounded-2xl shadow-soft-lg">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-coffee-50 mb-4">
                  <Package className="w-8 h-8 text-coffee-600" />
                </div>
                {addOns.length === 0 ? (
                  <>
                    <h3 className="text-lg font-bold text-coffee-900 mb-2">No add-ons yet</h3>
                    <p className="text-coffee-600 mb-6 max-w-md mx-auto text-sm">
                      Start building your menu by adding extra items and customization options.
                    </p>
                    <button
                      onClick={() => openAddOnModal()}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-coffee-700 text-white hover:bg-coffee-600 shadow-lg transition-all font-semibold"
                    >
                      <Plus size={18} /> Add Your First Add-on
                    </button>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-bold text-coffee-900 mb-2">No add-ons found</h3>
                    <p className="text-coffee-600 mb-6 max-w-md mx-auto text-sm">
                      Try adjusting your search or filter to find what you're looking for.
                    </p>
                    <button
                      onClick={() => {
                        setAddOnQuery("");
                        setAddOnCategoryFilter("All");
                      }}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-coffee-700 text-white hover:bg-coffee-600 shadow-lg transition-all font-semibold"
                    >
                      <X size={18} /> Clear Filters
                    </button>
                  </>
                )}
              </div>
            )}

            {/* footer spacing */}
            <div className="h-20"></div>
          </div>
        )}

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
                className="bg-coffee-50/90 backdrop-blur-md border border-coffee-200/50 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto scrollbar-hide p-4 sm:p-6 md:p-8 relative"
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
                        <option value="false">Not Available</option>
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
                    {formImageUrl && (
                      <div className="mt-3 flex items-center gap-2">
                        <img
                          src={formImageUrl}
                          alt="Preview"
                          className="w-16 h-16 object-cover rounded-xl border border-coffee-200 shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setForm({ ...form, image: null, img: "" });
                            setFormImageUrl(null);
                          }}
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

        {/* Add-on Modal */}
        <AnimatePresence>
          {addOnModalOpen && (
            <motion.div
              key="addon-modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-md"
            >
              <motion.div
                key="addon-modal"
                initial={{ y: 12, opacity: 0, scale: 0.995 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 12, opacity: 0, scale: 0.995 }}
                transition={{ duration: 0.18 }}
                className="bg-coffee-50/90 backdrop-blur-md border border-coffee-200/50 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto scrollbar-hide p-6 relative"
              >
                <button
                  onClick={closeAddOnModal}
                  className="absolute top-4 right-4 text-coffee-700 hover:text-accent-500 transition"
                  title="Close"
                >
                  <X size={22} />
                </button>

                <h2 className="text-2xl font-semibold text-coffee-800 mb-2 flex items-center gap-2">
                  <Package className="w-6 h-6 text-coffee-600" />
                  {editingAddOn ? "Edit Add-on" : "Add New Add-on"}
                </h2>
                <p className="text-sm text-coffee-600 mb-6">
                  Configure add-on details for your menu items.
                </p>

                <form onSubmit={handleSaveAddOn} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-coffee-700 mb-1">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={addOnForm.name}
                      onChange={handleAddOnInput}
                      className="w-full border border-coffee-300 rounded-xl px-4 py-2.5 bg-white/70 focus:ring-2 focus:ring-coffee-400 focus:border-coffee-400 outline-none text-coffee-900"
                      placeholder="e.g. Pearls"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-coffee-700 mb-1">Price (₱)</label>
                    <input
                      type="number"
                      name="price"
                      value={addOnForm.price}
                      onChange={handleAddOnInput}
                      className="w-full border border-coffee-300 rounded-xl px-4 py-2.5 bg-white/70 focus:ring-2 focus:ring-coffee-400 focus:border-coffee-400 outline-none text-coffee-900"
                      placeholder="e.g. 15"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-coffee-700 mb-1">Category</label>
                    <select
                      name="category"
                      value={addOnForm.category}
                      onChange={handleAddOnInput}
                      className="w-full border border-coffee-300 rounded-xl px-4 py-2.5 bg-white/70 focus:ring-2 focus:ring-coffee-400 focus:border-coffee-400 outline-none text-coffee-900"
                      required
                    >
                      <option value="Beverage">Beverage</option>
                      <option value="Meal">Meal</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="allowMultiple"
                      checked={addOnForm.allowMultiple}
                      onChange={handleAddOnInput}
                      className="w-5 h-5 accent-coffee-700"
                      id="allowMultiple"
                    />
                    <label htmlFor="allowMultiple" className="text-sm text-coffee-700">
                      Allow multiple quantities
                    </label>
                  </div>

                  <div className="flex justify-end gap-3 pt-6">
                    <button
                      type="button"
                      onClick={closeAddOnModal}
                      className="px-5 py-2.5 rounded-xl bg-coffee-200 hover:bg-coffee-300 text-coffee-800 font-medium flex items-center gap-2 transition"
                    >
                      <X className="w-4 h-4" /> Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-coffee-700 hover:bg-coffee-800 text-white font-medium flex items-center gap-2 transition"
                    >
                      <Save className="w-4 h-4" />
                      {editingAddOn ? "Update" : "Save"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}