import React, { useState, useCallback, useRef } from "react";
import { GoogleMap, Marker, Circle, useJsApiLoader, Autocomplete } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "min(320px,40vw)",
  borderRadius: "var(--radius-xl)",
};

export default function MapsSettings() {
  const [location, setLocation] = useState({ lat: 14.5995, lng: 120.9842 }); // Default to Manila
  const [address, setAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [radius, setRadius] = useState(5);
  const [feeType, setFeeType] = useState("per_km");
  const [feePerKm, setFeePerKm] = useState(10);
  const [flatFee, setFlatFee] = useState(0);
  const [freeThreshold, setFreeThreshold] = useState("");
  const [unit, setUnit] = useState("km");
  const [errors, setErrors] = useState({});
  const [mapError, setMapError] = useState(false);

  const autocompleteRef = useRef(null);

  // Load Google Maps JS API
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY", 
    libraries: ["places", "maps"], 
  });

  // Handle marker drag
  const onMarkerDragEnd = useCallback((e) => {
    setLocation({
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    });
  }, []);

  // Handle address autocomplete
  const onPlaceChanged = () => {
    const place = autocompleteRef.current.getPlace();
    if (place && place.geometry) {
      setLocation({
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      });
      setAddress(place.formatted_address || "");
    }
  };

  // Input style using theme
  const inputClass =
    "w-full p-3 rounded-xl border border-coffee-200 bg-coffee-50 shadow-soft-lg focus:outline-none focus:ring-2 focus:ring-coffee-400 transition placeholder:text-coffee-400 text-coffee-900 font-medium";

  // Validation
  const validate = () => {
    const newErrors = {};
    if (!address) newErrors.address = "Address is required.";
    if (radius <= 0) newErrors.radius = "Radius must be greater than 0.";
    if (feeType === "per_km" && feePerKm < 0) newErrors.feePerKm = "Fee per km must be 0 or greater.";
    if (feeType === "flat" && flatFee < 0) newErrors.flatFee = "Flat fee must be 0 or greater.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save handler
  const handleSave = () => {
    if (!validate()) return;
    // Save logic here (API call, etc.)
    alert("Settings saved!");
  };

  // Reset handler
  const handleReset = () => {
    setLocation({ lat: 14.5995, lng: 120.9842 });
    setAddress("");
    setLandmark("");
    setRadius(5);
    setFeeType("per_km");
    setFeePerKm(10);
    setFlatFee(0);
    setFreeThreshold("");
    setUnit("km");
    setErrors({});
  };

  // Convert radius to meters for Circle overlay
  const getRadiusMeters = () => unit === "km" ? radius * 1000 : radius * 1609.34;

  return (
    <div className="w-full max-w-6xl mx-auto pt-8">
      <h2 className="text-3xl font-bold mb-8 flex items-center gap-3 text-coffee-900">
        <span role="img" aria-label="map">🗺️</span> Maps Settings
      </h2>
      <div className="flex flex-col md:flex-row gap-8 md:gap-10">
        {/* Store Location & Map */}
        <div className="flex-1 flex">
          <div className="bg-coffee-50 rounded-2xl shadow-soft-xl p-8 border border-coffee-100 flex flex-col w-full h-full">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-coffee-800">
              <span role="img" aria-label="pin">📍</span> Store Location
            </h3>
            <label className="block font-medium mb-2 text-coffee-700">
              Exact Pin Location (Drag on Map)
            </label>
            <div className="border-2 border-coffee-200 rounded-xl p-2 bg-coffee-100 mb-5">
              {loadError || mapError ? (
                <div className="h-56 flex items-center justify-center bg-gradient-to-br from-coffee-100 to-coffee-200 rounded-xl shadow-inner">
                  <span className="text-lg font-semibold text-coffee-700">
                    Failed to load map. Please check your API key or connection.
                  </span>
                </div>
              ) : isLoaded ? (
                <GoogleMap
                  mapContainerStyle={containerStyle}
                  center={location}
                  zoom={16}
                  options={{
                    disableDefaultUI: true,
                  }}
                  onError={() => setMapError(true)}
                >
                  <Marker
                    position={location}
                    draggable={true}
                    onDragEnd={onMarkerDragEnd}
                  />
                  <Circle
                    center={location}
                    radius={getRadiusMeters()}
                    options={{
                      fillColor: "#ffe4c4",
                      fillOpacity: 0.2,
                      strokeColor: "#d2a679",
                      strokeOpacity: 0.7,
                      strokeWeight: 2,
                    }}
                  />
                </GoogleMap>
              ) : (
                <div className="h-56 flex items-center justify-center bg-gradient-to-br from-coffee-100 to-coffee-200 rounded-xl shadow-inner">
                  <span className="text-lg font-semibold text-coffee-700">
                    Loading Map...
                  </span>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-4 mt-2">
              <Autocomplete
                onLoad={ref => (autocompleteRef.current = ref)}
                onPlaceChanged={onPlaceChanged}
              >
                <input
                  type="text"
                  className={inputClass}
                  placeholder="Address"
                  value={address}
                  aria-label="Store Address"
                  onChange={e => setAddress(e.target.value)}
                />
              </Autocomplete>
              {errors.address && (
                <span className="text-red-600 text-sm">{errors.address}</span>
              )}
              <input
                type="text"
                className={inputClass}
                placeholder="Landmark"
                value={landmark}
                aria-label="Landmark"
                onChange={e => setLandmark(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Delivery & Radius */}
        <div className="flex-1 flex">
          <div className="bg-coffee-50 rounded-2xl shadow-soft-xl p-8 border border-coffee-100 flex flex-col w-full h-full">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-coffee-800">
              <span role="img" aria-label="truck">🚚</span> Delivery and Radius
            </h3>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="block font-medium text-coffee-700">
                  Set Delivery Radius
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    className={inputClass + " w-24"}
                    value={radius}
                    min={1}
                    aria-label="Delivery Radius"
                    onChange={e => setRadius(Number(e.target.value))}
                  />
                  <select
                    className="p-2 rounded-xl border border-coffee-200 bg-coffee-50 text-coffee-900 font-medium"
                    value={unit}
                    aria-label="Unit"
                    onChange={e => setUnit(e.target.value)}
                  >
                    <option value="km">km</option>
                    <option value="mi">mi</option>
                  </select>
                </div>
              </div>
              {errors.radius && (
                <span className="text-red-600 text-sm">{errors.radius}</span>
              )}
              <div>
                <label className="block font-medium mb-1 text-coffee-700">
                  Delivery Fee Type
                </label>
                <select
                  className={inputClass}
                  value={feeType}
                  aria-label="Fee Type"
                  onChange={e => setFeeType(e.target.value)}
                >
                  <option value="per_km">Per km/mi</option>
                  <option value="flat">Flat Fee</option>
                </select>
              </div>
              {feeType === "per_km" ? (
                <div>
                  <label className="block font-medium mb-1 text-coffee-700">
                    Delivery Fee per {unit}
                  </label>
                  <input
                    type="number"
                    className={inputClass}
                    value={feePerKm}
                    min={0}
                    aria-label="Fee Per Km"
                    onChange={e => setFeePerKm(Number(e.target.value))}
                  />
                  {errors.feePerKm && (
                    <span className="text-red-600 text-sm">{errors.feePerKm}</span>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block font-medium mb-1 text-coffee-700">
                    Flat Delivery Fee
                  </label>
                  <input
                    type="number"
                    className={inputClass}
                    value={flatFee}
                    min={0}
                    aria-label="Flat Fee"
                    onChange={e => setFlatFee(Number(e.target.value))}
                  />
                  {errors.flatFee && (
                    <span className="text-red-600 text-sm">{errors.flatFee}</span>
                  )}
                </div>
              )}
              <div>
                <label className="block font-medium mb-1 text-coffee-700">
                  Free Delivery Threshold (optional)
                </label>
                <input
                  type="number"
                  className={inputClass}
                  value={freeThreshold}
                  min={0}
                  aria-label="Free Delivery Threshold"
                  onChange={e => setFreeThreshold(e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-row gap-4 mt-6">
              <button
                className="bg-coffee-700 text-white px-6 py-2 rounded-xl font-semibold shadow hover:bg-coffee-800 transition"
                onClick={handleSave}
                aria-label="Save Settings"
              >
                Save
              </button>
              <button
                className="bg-coffee-200 text-coffee-900 px-6 py-2 rounded-xl font-semibold shadow hover:bg-coffee-300 transition"
                onClick={handleReset}
                aria-label="Reset Settings"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}