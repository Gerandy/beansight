import React, { useState, useEffect } from "react";
import { db, storage } from "../../firebase"; // Adjust path if needed
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function AdvertisementSettings() {
  const [banners, setBanners] = useState([]);
  const [maxBanners, setMaxBanners] = useState(5);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const sectionClass =
    "bg-white rounded-2xl shadow-soft-xl p-8 border border-coffee-100 flex flex-col mb-8";

  const labelClass = "block font-medium mb-2 text-coffee-700";

  // Load existing banners and maxBanners on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const snapshot = await getDocs(collection(db, "banners"));
        const bannerList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setBanners(bannerList);

        const savedMax = localStorage.getItem("maxBanners");
        if (savedMax) setMaxBanners(parseInt(savedMax));
      } catch (err) {
        console.error("Failed to load data:", err);
      }
    };
    loadData();
  }, []);

  const handleAddBanner = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    try {
      const storageRef = ref(storage, `banners/${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      await addDoc(collection(db, "banners"), { img: downloadURL });
      setBanners(prev => [...prev, { img: downloadURL }]);
      setMessage("Banner added successfully.");
    } catch (err) {
      console.error("Failed to add banner:", err);
      setMessage("Failed to add banner.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBanner = async (id, file) => {
    if (!file) return;
    setLoading(true);
    try {
      const storageRef = ref(storage, `banners/${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      await updateDoc(doc(db, "banners", id), { img: downloadURL });
      setBanners(prev => prev.map(b => b.id === id ? { ...b, img: downloadURL } : b));
      setMessage("Banner updated successfully.");
    } catch (err) {
      console.error("Failed to update banner:", err);
      setMessage("Failed to update banner.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBanner = async (id) => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, "banners", id));
      setBanners(prev => prev.filter(b => b.id !== id));
      setMessage("Banner deleted successfully.");
    } catch (err) {
      console.error("Failed to delete banner:", err);
      setMessage("Failed to delete banner.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMax = () => {
    localStorage.setItem("maxBanners", maxBanners);
    setMessage("Max banners setting saved!");
  };

  return (
    <div className="w-full max-w-4xl mx-auto pt-8">
      <h2 className="text-3xl font-bold mb-4 flex items-center gap-3 text-coffee-900">
        <span role="img" aria-label="ads">🖼️</span> Advertisement Settings
      </h2>
      <p className="mb-8 text-coffee-700 text-base">
        Manage banner images for the home page slider. Set the max number to display, and add, update, or delete banners.
      </p>
      {message && (
        <div className="mb-4 text-coffee-700 font-medium" aria-live="polite">{message}</div>
      )}

      {/* Max Banners Setting */}
      <div className={sectionClass}>
        <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-coffee-800">
          <span role="img" aria-label="settings">⚙️</span> Slider Settings
        </h3>
        <div>
          <label className={labelClass} htmlFor="max-banners">
            Max Banners to Show on Slider
          </label>
          <input
            type="number"
            id="max-banners"
            min="1"
            max="10"
            value={maxBanners}
            onChange={(e) => setMaxBanners(parseInt(e.target.value) || 1)}
            className="border border-coffee-300 rounded-lg px-3 py-2 bg-white text-coffee-800"
            disabled={loading}
          />
        </div>
      </div>

      {/* Add New Banner */}
      <div className={sectionClass}>
        <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-coffee-800">
          <span role="img" aria-label="add">➕</span> Add New Banner
        </h3>
        <div>
          <label className={labelClass} htmlFor="add-banner">
            Upload new banner image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleAddBanner}
            className="block"
            id="add-banner"
            disabled={loading}
          />
        </div>
      </div>

      {/* Manage Existing Banners */}
      <div className={sectionClass}>
        <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-coffee-800">
          <span role="img" aria-label="manage">📋</span> Manage Banners ({banners.length})
        </h3>
        {banners.length === 0 ? (
          <p className="text-coffee-400">No banners uploaded yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {banners.map((banner) => (
              <div key={banner.id} className="border border-coffee-200 rounded-lg p-4 bg-coffee-50">
                <img
                  src={banner.img}
                  alt="Banner"
                  className="w-full h-24 object-cover rounded-lg mb-2"
                />
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleUpdateBanner(banner.id, e.target.files[0])}
                    className="text-xs"
                    disabled={loading}
                  />
                  <button
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                    onClick={() => handleDeleteBanner(banner.id)}
                    disabled={loading}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save Button at Bottom Right */}
      <div className="flex justify-end mt-8">
        <button
          className="bg-coffee-700 text-white px-6 py-3 rounded-lg hover:bg-coffee-800 transition"
          onClick={handleSaveMax}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}