import React, { useState, useEffect } from "react";
import { db, storage } from "../../firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Upload, Trash2, Edit2, Image as ImageIcon, Settings, Save, AlertCircle, CheckCircle } from "lucide-react";

export default function AdvertisementSettings() {
  const [banners, setBanners] = useState([]);
  const [maxBanners, setMaxBanners] = useState(5);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState(null);

  // Load existing banners and maxBanners on mount
  useEffect(() => {
    const loadData = async () => {
      setInitialLoading(true);
      try {
        const snapshot = await getDocs(collection(db, "banners"));
        const bannerList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setBanners(bannerList);

        const savedMax = localStorage.getItem("maxBanners");
        if (savedMax) setMaxBanners(parseInt(savedMax));
      } catch (err) {
        console.error("Failed to load data:", err);
        showMessage("Failed to load banners. Please refresh the page.", "error");
      } finally {
        setInitialLoading(false);
      }
    };
    loadData();
  }, []);

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 4000);
  };

  const handleAddBanner = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showMessage("Image size must be less than 5MB", "error");
      return;
    }

    setLoading(true);
    try {
      const storageRef = ref(storage, `banners/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      const docRef = await addDoc(collection(db, "banners"), { img: downloadURL, createdAt: new Date() });
      setBanners(prev => [...prev, { id: docRef.id, img: downloadURL }]);
      showMessage("Banner added successfully! 🎉", "success");
      e.target.value = ""; // Reset file input
    } catch (err) {
      console.error("Failed to add banner:", err);
      showMessage("Failed to add banner. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBanner = async (id, file) => {
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      showMessage("Image size must be less than 5MB", "error");
      return;
    }

    setUploadingId(id);
    try {
      const storageRef = ref(storage, `banners/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      await updateDoc(doc(db, "banners", id), { img: downloadURL, updatedAt: new Date() });
      setBanners(prev => prev.map(b => b.id === id ? { ...b, img: downloadURL } : b));
      showMessage("Banner updated successfully! ✨", "success");
    } catch (err) {
      console.error("Failed to update banner:", err);
      showMessage("Failed to update banner. Please try again.", "error");
    } finally {
      setUploadingId(null);
    }
  };

  const handleDeleteBanner = async (id) => {
    if (!window.confirm("Are you sure you want to delete this banner?")) return;
    
    setUploadingId(id);
    try {
      await deleteDoc(doc(db, "banners", id));
      setBanners(prev => prev.filter(b => b.id !== id));
      showMessage("Banner deleted successfully", "success");
    } catch (err) {
      console.error("Failed to delete banner:", err);
      showMessage("Failed to delete banner. Please try again.", "error");
    } finally {
      setUploadingId(null);
    }
  };

  const handleSaveMax = () => {
    localStorage.setItem("maxBanners", maxBanners);
    showMessage("Settings saved successfully! 💾", "success");
  };

  if (initialLoading) {
    return (
      <div className="w-full max-w-5xl mx-auto pt-8 px-4">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-gray-200 rounded-lg w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="bg-white rounded-2xl p-6 space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded w-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-xl p-4 space-y-3">
                <div className="h-32 bg-gray-200 rounded-lg"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto pt-8 px-4 pb-12">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-3 flex items-center gap-3 text-coffee-900">
          <ImageIcon className="w-8 h-8 text-coffee-700" />
          Advertisement Settings
        </h2>
        <p className="text-coffee-600 text-base leading-relaxed">
          Manage banner images for the home page slider. Upload high-quality images to showcase your brand.
        </p>
      </div>

      {/* Message Toast */}
      {message.text && (
        <div 
          className={`mb-6 flex items-center gap-3 p-4 rounded-xl shadow-md ${
            message.type === "error" 
              ? "bg-red-50 text-red-800 border border-red-200" 
              : "bg-green-50 text-green-800 border border-green-200"
          }`}
          role="alert"
        >
          {message.type === "error" ? (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      {/* Max Banners Setting */}
      <div className="bg-white rounded-2xl shadow-lg border border-coffee-100 p-6 md:p-8 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <Settings className="w-6 h-6 text-coffee-700" />
          <h3 className="text-xl font-bold text-coffee-800">Slider Settings</h3>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
          <div className="flex-1 w-full">
            <label className="block font-medium mb-2 text-coffee-700 text-sm" htmlFor="max-banners">
              Maximum Banners to Display
            </label>
            <input
              type="number"
              id="max-banners"
              min="1"
              max="10"
              value={maxBanners}
              onChange={(e) => setMaxBanners(parseInt(e.target.value) || 1)}
              className="border-2 border-coffee-300 rounded-xl px-4 py-3 bg-white text-coffee-800 w-full focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 transition"
              disabled={loading}
            />
            <p className="text-xs text-coffee-500 mt-2">Choose how many banners to show in the slider (1-10)</p>
          </div>
          <button
            className="bg-coffee-700 text-white px-6 py-3 rounded-xl hover:bg-coffee-800 transition flex items-center gap-2 font-medium shadow-md hover:shadow-lg disabled:opacity-50 whitespace-nowrap"
            onClick={handleSaveMax}
            disabled={loading}
          >
            <Save className="w-4 h-4" />
            Save Settings
          </button>
        </div>
      </div>

      {/* Add New Banner */}
      <div className="bg-gradient-to-br from-coffee-50 to-coffee-100 rounded-2xl shadow-lg border-2 border-dashed border-coffee-300 p-6 md:p-8 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <Upload className="w-6 h-6 text-coffee-700" />
          <h3 className="text-xl font-bold text-coffee-800">Add New Banner</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-8">
          <label 
            htmlFor="add-banner" 
            className="cursor-pointer bg-white hover:bg-coffee-50 border-2 border-coffee-300 rounded-xl px-8 py-6 flex flex-col items-center gap-3 transition hover:shadow-lg group"
          >
            <Upload className="w-12 h-12 text-coffee-600 group-hover:text-coffee-800 transition" />
            <span className="font-medium text-coffee-700 group-hover:text-coffee-900">
              {loading ? "Uploading..." : "Click to upload banner image"}
            </span>
            <span className="text-xs text-coffee-500">Max size: 5MB | Recommended: 1920x600px</span>
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleAddBanner}
            className="hidden"
            id="add-banner"
            disabled={loading}
          />
        </div>
      </div>

      {/* Manage Existing Banners */}
      <div className="bg-white rounded-2xl shadow-lg border border-coffee-100 p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <ImageIcon className="w-6 h-6 text-coffee-700" />
            <h3 className="text-xl font-bold text-coffee-800">Your Banners</h3>
            <span className="bg-coffee-200 text-coffee-800 px-3 py-1 rounded-full text-sm font-semibold">
              {banners.length}
            </span>
          </div>
        </div>
        
        {banners.length === 0 ? (
          <div className="text-center py-16">
            <ImageIcon className="w-16 h-16 text-coffee-300 mx-auto mb-4" />
            <p className="text-coffee-400 text-lg font-medium">No banners uploaded yet</p>
            <p className="text-coffee-500 text-sm mt-2">Upload your first banner to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {banners.map((banner) => (
              <div 
                key={banner.id} 
                className="group relative bg-coffee-50 border-2 border-coffee-200 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
              >
                {/* Image */}
                <div className="relative aspect-video bg-gray-200 overflow-hidden">
                  <img
                    src={banner.img}
                    alt="Banner preview"
                    className="w-full h-full object-cover"
                  />
                  {uploadingId === banner.id && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="p-4 flex gap-2">
                  <label 
                    htmlFor={`update-${banner.id}`}
                    className="flex-1 bg-coffee-700 text-white px-4 py-2.5 rounded-lg hover:bg-coffee-800 transition flex items-center justify-center gap-2 text-sm font-medium cursor-pointer disabled:opacity-50"
                  >
                    <Edit2 className="w-4 h-4" />
                    Replace
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleUpdateBanner(banner.id, e.target.files[0])}
                    className="hidden"
                    id={`update-${banner.id}`}
                    disabled={uploadingId === banner.id}
                  />
                  <button
                    className="bg-red-500 text-white px-4 py-2.5 rounded-lg hover:bg-red-600 transition flex items-center gap-2 text-sm font-medium disabled:opacity-50"
                    onClick={() => handleDeleteBanner(banner.id)}
                    disabled={uploadingId === banner.id}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}