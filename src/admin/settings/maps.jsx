import React, { useState, useCallback, useRef, useEffect } from "react";
import { GoogleMap, Marker, Circle, useJsApiLoader, Autocomplete } from "@react-google-maps/api";
import {getDoc, setDoc, doc} from "firebase/firestore"
import { db } from "../../firebase";
import { Check } from "lucide-react";

// Tooltip modal for help
function ModalTooltip({ open, text, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm bg-opacity-30">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full relative">
        <button
          className="absolute top-2 right-3 text-coffee-700 text-xl font-bold cursor-pointer"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <div className="text-coffee-900 text-base">{text}</div>
      </div>
    </div>
  );
}

// Success Modal
function SuccessModal({ open, onClose }) {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 relative animate-scaleIn">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
          onClick={onClose}
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="flex flex-col items-center text-center">
          {/* Success Icon */}
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Check className="w-10 h-10 text-green-600" strokeWidth={3} />
          </div>
          
          <h3 className="text-2xl font-bold text-coffee-900 mb-2">
            Settings Saved!
          </h3>
          
          <p className="text-gray-600 mb-6">
            Your map and delivery settings have been successfully updated.
          </p>
          
          <button
            onClick={onClose}
            className="bg-coffee-700 hover:bg-coffee-800 text-white px-8 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

const help = {
  address: "Enter your store's address. This helps customers find your location.",
  landmark: "Add a nearby landmark to help with delivery or pickup.",
  radius: "Set how far from your store you can deliver orders.",
  unit: "Choose kilometers (km) or miles (mi) for your delivery radius.",
  feeType: "Select how you want to charge for delivery: per kilometer/mile or a flat fee.",
  feePerKm: "Set the delivery fee charged for each kilometer or mile.",
  flatFee: "Set a single delivery fee for all orders, regardless of distance.",
  freeThreshold: "Orders above this amount will get free delivery. Leave blank if not applicable.",
  map: "Drag the pin to set your store's exact location on the map.",
  save: "Save your changes.",
  reset: "Reset all fields to their default values."
};

const containerStyle = {
  width: "100%",
  height: "min(320px,40vw)",
  borderRadius: "var(--radius-xl)",
};

export default function MapsSettings() {
  const [location, setLocation] = useState({ lat: 0, lng: 0 });
  const [address, setAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [radius, setRadius] = useState(null);
  const [feeType, setFeeType] = useState("per_km");
  const [feePerKm, setFeePerKm] = useState(10);
  const [flatFee, setFlatFee] = useState(0);
  const [freeThreshold, setFreeThreshold] = useState(0);
  const [unit, setUnit] = useState("km");
  const [errors, setErrors] = useState({});
  const [mapError, setMapError] = useState(false);
  const [message, setMessage] = useState("");
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [tooltipText, setTooltipText] = useState("");
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [longitude, setlongitude] = useState(null);
  const [latitude, setlatitude] = useState(null);
  const autocompleteRef = useRef(null);

  useEffect(() => {
    const loadSettings = async () => {
      const docSnap = await getDoc(doc(db, "settings", "mapRadius"));
      if (!docSnap.exists()) return;

      const data = docSnap.data();

      setFeeType(data.feeType);
      setFreeThreshold(data.freeDelivery);
      setFeePerKm(data.deliveryFeeKm);
      setlatitude(data.lat);
      setlongitude(data.long);
      setRadius(data.value);
      setLocation({ lat: data.lat, lng: data.long });
      setFlatFee(data.flatFee);
      
      console.log("Settings loaded:", data);
    };

    loadSettings();
  }, []);

  const { isLoaded, loadError } = useJsApiLoader({});

  const onMarkerDragEnd = useCallback((e) => {
    setLocation({
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    });
  }, []);

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

  const inputClass =
    "w-full p-3 rounded-xl border border-coffee-200 bg-coffee-50 shadow-soft-lg focus:outline-none focus:ring-2 focus:ring-coffee-400 transition placeholder:text-coffee-400 text-coffee-900 font-medium";

  const validate = () => {
    const newErrors = {};
    
    if (radius <= 0) newErrors.radius = "Radius must be greater than 0.";
    if (feeType === "per_km" && feePerKm < 0) newErrors.feePerKm = "Fee per km must be 0 or greater.";
    if (feeType === "flat" && flatFee < 0) newErrors.flatFee = "Flat fee must be 0 or greater.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSave = async () => {
    if (!validate()) {
      setMessage("");
      return;
    }
    const docRef = doc(db, "settings","mapRadius")
    await setDoc(docRef, {
      lat: location.lat,
      long: location.lng,
      deliveryFeeKm: feePerKm,
      flatDelivery: flatFee || 0,
      feeType: feeType,
      value: radius,
      freeDelivery: freeThreshold || 0
    });
    
    setSuccessModalOpen(true);
    setMessage("Settings saved!");
  };

  const handleReset = () => {
    setLocation({ lat: latitude, lng: longitude });
    setAddress("");
    setLandmark("");
    setRadius(radius);
    setFeeType("per_km");
    setFeePerKm(10);
    setFlatFee(0);
    setFreeThreshold(0);
    setUnit("km");
    setErrors({});
    setMessage("Fields reset to default.");
  };

  const showTooltip = text => {
    setTooltipText(text);
    setTooltipOpen(true);
  };

  return (
    <>
      <div className="w-full max-w-6xl mx-auto pt-8">
        <ModalTooltip open={tooltipOpen} text={tooltipText} onClose={() => setTooltipOpen(false)} />
        <SuccessModal open={successModalOpen} onClose={() => setSuccessModalOpen(false)} />
        
        <h2 className="text-3xl font-bold mb-4 flex items-center gap-3 text-coffee-900">
          <span role="img" aria-label="map">🗺️</span> Maps Settings
        </h2>
        <p className="mb-8 text-coffee-700 text-base">
          Set your store's location and delivery area. These settings help customers find you and know where you deliver. click Fields with <span className="text-coffee-700 font-bold">ⓘ</span> to have more info.
        </p>
        {message && (
          <div className="mb-4 text-coffee-700 font-medium" aria-live="polite">{message}</div>
        )}
        <div className="flex flex-col md:flex-row gap-8 md:gap-10">
          {/* Store Location & Map */}
          <div className="flex-1 flex">
            <div className="bg-coffee-50 rounded-2xl shadow-soft-xl p-8 border border-coffee-100 flex flex-col w-full h-full">
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-coffee-800">
                <span role="img" aria-label="pin">📍</span> Store Location
              </h3>
              <label className="block font-medium mb-2 text-coffee-700 flex items-center">
                Exact Pin Location (Drag on Map)
                <button
                  type="button"
                  className="ml-2 text-xs text-coffee-700 cursor-pointer"
                  onClick={() => showTooltip(help.map)}
                  aria-label="Help"
                >ⓘ</button>
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
                      radius={radius}
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
                <label className="block font-medium text-coffee-700 flex items-center">
                  Store Address
                  <button
                    type="button"
                    className="ml-2 text-xs text-coffee-700 cursor-pointer"
                    onClick={() => showTooltip(help.address)}
                    aria-label="Help"
                  >ⓘ</button>
                </label>
                <Autocomplete
                  onLoad={ref => (autocompleteRef.current = ref)}
                  onPlaceChanged={onPlaceChanged}
                >
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="e.g. 123 Main St, Manila"
                    value={address}
                    aria-label="Store Address"
                    onChange={e => setAddress(e.target.value)}
                  />
                </Autocomplete>
                {errors.address && (
                  <span className="text-red-600 text-sm">{errors.address}</span>
                )}
                <label className="block font-medium text-coffee-700 flex items-center">
                  Landmark
                  <button
                    type="button"
                    className="ml-2 text-xs text-coffee-700 cursor-pointer"
                    onClick={() => showTooltip(help.landmark)}
                    aria-label="Help"
                  >ⓘ</button>
                </label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="e.g. Near City Hall"
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
                  <label className="block font-medium text-coffee-700 flex items-center">
                    How far do you deliver?
                    <button
                      type="button"
                      className="ml-2 text-xs text-coffee-700 cursor-pointer"
                      onClick={() => showTooltip(help.radius)}
                      aria-label="Help"
                    >ⓘ</button>
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      className={inputClass + " w-24"}
                      value={radius || ""}
                      min={1}
                      aria-label="Delivery Radius"
                      onChange={e => setRadius(Number(e.target.value))}
                      placeholder="e.g. 5"
                    />
                    <label className="font-medium text-coffee-700 flex items-center">
                      <span>KM</span>
                      <button
                        type="button"
                        className="ml-2 text-xs text-coffee-700 cursor-pointer"
                        onClick={() => showTooltip(help.unit)}
                        aria-label="Help"
                      >ⓘ</button>
                    </label>
                  </div>
                </div>
                {errors.radius && (
                  <span className="text-red-600 text-sm">{errors.radius}</span>
                )}
                <div>
                  <label className="block font-medium mb-1 text-coffee-700 flex items-center">
                    Delivery Fee Type
                    <button
                      type="button"
                      className="ml-2 text-xs text-coffee-700 cursor-pointer"
                      onClick={() => showTooltip(help.feeType)}
                      aria-label="Help"
                    >ⓘ</button>
                  </label>
                  <select
                    className={inputClass}
                    value={feeType}
                    aria-label="Fee Type"
                    onChange={e => setFeeType(e.target.value)}
                  >
                    <option value="per_km">Per km</option>
                    <option value="flat">Flat Fee</option>
                  </select>
                </div>
                {feeType === "per_km" ? (
                  <div>
                    <label className="block font-medium mb-1 text-coffee-700 flex items-center">
                      Delivery Fee per {unit}
                      <button
                        type="button"
                        className="ml-2 text-xs text-coffee-700 cursor-pointer"
                        onClick={() => showTooltip(help.feePerKm)}
                        aria-label="Help"
                      >ⓘ</button>
                    </label>
                    <input
                      type="number"
                      className={inputClass}
                      value={feePerKm}
                      min={0}
                      aria-label="Fee Per Km"
                      onChange={e => setFeePerKm(Number(e.target.value))}
                      placeholder={`e.g. 10 per ${unit}`}
                    />
                    {errors.feePerKm && (
                      <span className="text-red-600 text-sm">{errors.feePerKm}</span>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="block font-medium mb-1 text-coffee-700 flex items-center">
                      Flat Delivery Fee
                      <button
                        type="button"
                        className="ml-2 text-xs text-coffee-700 cursor-pointer"
                        onClick={() => showTooltip(help.flatFee)}
                        aria-label="Help"
                      >ⓘ</button>
                    </label>
                    <input
                      type="number"
                      className={inputClass}
                      value={flatFee}
                      min={0}
                      aria-label="Flat Fee"
                      onChange={e => setFlatFee(Number(e.target.value))}
                      placeholder="e.g. 50"
                    />
                    {errors.flatFee && (
                      <span className="text-red-600 text-sm">{errors.flatFee}</span>
                    )}
                  </div>
                )}
                <div>
                  <label className="block font-medium mb-1 text-coffee-700 flex items-center">
                    Free Delivery Threshold (optional)
                    <button
                      type="button"
                      className="ml-2 text-xs text-coffee-700 cursor-pointer"
                      onClick={() => showTooltip(help.freeThreshold)}
                      aria-label="Help"
                    >ⓘ</button>
                  </label>
                  <input
                    type="number"
                    className={inputClass}
                    value={freeThreshold}
                    min={0}
                    aria-label="Free Delivery Threshold"
                    onChange={e => setFreeThreshold(Number(e.target.value))}
                    placeholder="e.g. 500"
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

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
}