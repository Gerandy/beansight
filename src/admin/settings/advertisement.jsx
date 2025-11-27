import React, { useState } from "react";

export default function AdvertisementSettings() {
  const [banner, setBanner] = useState(null);
  const [preview, setPreview] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [message, setMessage] = useState("");

  const inputClass =
    "w-full p-3 rounded-xl border border-coffee-200 bg-coffee-50 shadow-soft-lg focus:outline-none focus:ring-2 focus:ring-coffee-400 transition text-coffee-900 font-medium";

  const sectionClass =
    "bg-white rounded-2xl shadow-soft-xl p-8 border border-coffee-100 flex flex-col mb-8";

  const labelClass = "block font-medium mb-2 text-coffee-700";

  const handleBannerChange = e => {
    const file = e.target.files[0];
    setBanner(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
    setMessage("");
  };

  const handleSave = () => {
    if (!banner) {
      setMessage("Please upload a banner image.");
      return;
    }
    if (startDate && endDate && endDate < startDate) {
      setMessage("End date cannot be before start date.");
      return;
    }
    setMessage("Advertisement settings saved!");
  };

  const handleReset = () => {
    setBanner(null);
    setPreview(null);
    setStartDate("");
    setEndDate("");
    setMessage("Form reset.");
  };

  return (
    <div className="w-full max-w-3xl mx-auto pt-8">
      <h2 className="text-3xl font-bold mb-4 flex items-center gap-3 text-coffee-900">
        <span role="img" aria-label="ads">🖼️</span> Advertisement Settings
      </h2>
      <p className="mb-8 text-coffee-700 text-base">
        Upload a banner image to be displayed on your home page. You can also schedule when the promo banner will be shown.
      </p>
      {message && (
        <div className="mb-4 text-coffee-700 font-medium" aria-live="polite">{message}</div>
      )}
      <div className={sectionClass}>
        <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-coffee-800">
          <span role="img" aria-label="banner">🏷️</span> Banner Image
        </h3>
        <div className="flex flex-col gap-4">
          <div>
            <label className={labelClass} htmlFor="banner-upload">
              Upload banner image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleBannerChange}
              className="block"
              id="banner-upload"
              aria-label="Upload banner image"
            />
            {preview ? (
              <div className="mt-4">
                <img
                  src={preview}
                  alt="Banner Preview"
                  className="rounded-xl shadow-soft-lg max-h-40 object-contain border border-coffee-200"
                />
              </div>
            ) : (
              <div className="mt-4 text-coffee-400 text-sm">
                No image selected. Banner preview will appear here.
              </div>
            )}
          </div>
          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <div className="flex-1">
              <label className={labelClass} htmlFor="promo-start">
                Promo start date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className={inputClass}
                id="promo-start"
                aria-label="Promo start date"
              />
            </div>
            <div className="flex-1">
              <label className={labelClass} htmlFor="promo-end">
                Promo end date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className={inputClass}
                id="promo-end"
                aria-label="Promo end date"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-4 mt-8 justify-end">
        <button
          className="bg-coffee-700 text-white px-6 py-2 rounded-xl font-semibold shadow hover:bg-coffee-800 transition"
          onClick={handleSave}
          disabled={!banner}
          aria-label="Save advertisement settings"
        >
          Save
        </button>
        <button
          className="bg-coffee-200 text-coffee-900 px-6 py-2 rounded-xl font-semibold shadow hover:bg-coffee-300 transition"
          onClick={handleReset}
          aria-label="Reset advertisement form"
        >
          Reset
        </button>
      </div>
    </div>
  );
}