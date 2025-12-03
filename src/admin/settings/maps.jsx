import React, { useState, useCallback, useRef, useEffect } from "react";
import { GoogleMap, Marker, Circle, useJsApiLoader, Autocomplete } from "@react-google-maps/api";
import { getDoc, setDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";
import { 
  Check, 
  MapPin, 
  Truck, 
  DollarSign, 
  Info, 
  Save, 
  RotateCcw, 
  X,
  AlertCircle,
  Loader,
  Calendar
} from "lucide-react";

// Tooltip modal for help
function ModalTooltip({ open, text, onClose }) {
  if (!open) return null;
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm cursor-pointer animate-fadeIn" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 relative transform transition-all" 
        onClick={e => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 text-coffee-400 hover:text-coffee-700 transition"
          onClick={onClose}
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-coffee-600 flex-shrink-0 mt-0.5" />
          <div className="text-coffee-800 text-sm leading-relaxed">{text}</div>
        </div>
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
          <X className="w-6 h-6" />
        </button>
        
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Check className="w-12 h-12 text-green-600" strokeWidth={3} />
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
  radius: "Set how far from your store you can deliver orders. This creates a delivery zone shown on the map.",
  feeType: "Select how you want to charge for delivery: per kilometer or a flat fee.",
  feePerKm: "Set the delivery fee charged for each kilometer from your store.",
  flatFee: "Set a single delivery fee for all orders, regardless of distance.",
  freeThreshold: "Orders below this amount will get free delivery. Leave at 0 to disable free delivery.",
  map: "Drag the pin to set your store's exact location on the map. The circle shows your delivery area."
};

const containerStyle = {
  width: "100%",
  height: "400px",
  borderRadius: "16px",
};

export default function MapsSettings() {
  const [location, setLocation] = useState({ lat: 14.5995, lng: 120.9842 });
  const [address, setAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [radius, setRadius] = useState(5000);
  const [feeType, setFeeType] = useState("per_km");
  const [feePerKm, setFeePerKm] = useState(10);
  const [flatFee, setFlatFee] = useState(""); // default empty, not 0
  const [freeThreshold, setFreeThreshold] = useState(""); // default empty, not 0
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ text: "", type: "" });
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [tooltipText, setTooltipText] = useState("");
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const autocompleteRef = useRef(null);

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      try {
        const docSnap = await getDoc(doc(db, "settings", "mapRadius"));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFeeType(data.feeType || "per_km");
          setFreeThreshold(
            typeof data.freeDelivery === "number" ? String(data.freeDelivery) : ""
          );
          setFeePerKm(data.deliveryFeeKm ?? 10);
          setLocation({ lat: data.lat || 14.5995, lng: data.long || 120.9842 });
          setRadius(data.value || 5000);
          setFlatFee(
            typeof data.flatFee === "number" ? String(data.flatFee) : ""
          );
        }
      } catch (err) {
        console.error("Error loading settings:", err);
        showMessage("Failed to load settings", "error");
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
    libraries: ["places"],
  });

  const onMarkerDragEnd = useCallback((e) => {
    setLocation({
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    });
  }, []);

  const onPlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace();
    if (place && place.geometry) {
      setLocation({
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      });
      setAddress(place.formatted_address || "");
    }
  };

  const inputClass =
    "w-full p-3 rounded-xl border-2 border-coffee-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 transition placeholder:text-coffee-400 text-coffee-900 font-medium hover:border-coffee-300";

  const labelClass = "block font-semibold mb-2 text-coffee-800 flex items-center gap-2";

  const feeTypes = [
    { value: "per_km", label: "Per Kilometer", icon: Calendar },
    { value: "flat", label: "Flat Fee", icon: DollarSign }
  ];

  const validate = () => {
    const newErrors = {};
    
    if (!radius || radius <= 0) newErrors.radius = "Radius must be greater than 0.";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 4000);
  };
  
  const handleSave = async () => {
    if (!validate()) {
      showMessage("Please fix the errors before saving", "error");
      return;
    }
    
    setSaving(true);
    try {
      const docRef = doc(db, "settings", "mapRadius");
      await setDoc(docRef, {
        lat: location.lat,
        long: location.lng,
        deliveryFeeKm: Number(feePerKm),
        flatFee: flatFee === "" ? null : Number(flatFee),
        feeType: feeType,
        value: Number(radius),
        freeDelivery: freeThreshold === "" ? null : Number(freeThreshold)
      });
      
      setSuccessModalOpen(true);
    } catch (err) {
      console.error("Error saving settings:", err);
      showMessage("Failed to save settings. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm("Are you sure you want to reset all settings?")) return;
    
    try {
      const docSnap = await getDoc(doc(db, "settings", "mapRadius"));
      if (docSnap.exists()) {
        const data = docSnap.data();
        setLocation({ lat: data.lat || 14.5995, lng: data.long || 120.9842 });
        setRadius(data.value || 5000);
        setFeeType(data.feeType || "per_km");
        setFeePerKm(data.deliveryFeeKm || 10);
        setFlatFee(data.flatFee || 0);
        setFreeThreshold(data.freeDelivery || 0);
      }
      setAddress("");
      setLandmark("");
      setErrors({});
      showMessage("Settings reset successfully", "success");
    } catch (err) {
      showMessage("Failed to reset settings", "error");
    }
  };

  const showTooltip = text => {
    setTooltipText(text);
    setTooltipOpen(true);
  };

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto pt-8 px-4 pb-12">
        <div className="animate-pulse space-y-6">
          <div className="h-12 bg-gray-200 rounded-lg w-1/3"></div>
          <div className="h-6 bg-gray-200 rounded w-2/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2].map(i => (
              <div key={i} className="bg-white rounded-2xl p-8 space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                <div className="h-64 bg-gray-200 rounded-xl"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full max-w-7xl mx-auto pt-8 px-4 pb-12">
        <ModalTooltip open={tooltipOpen} text={tooltipText} onClose={() => setTooltipOpen(false)} />
        <SuccessModal open={successModalOpen} onClose={() => setSuccessModalOpen(false)} />
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-coffee-600 p-3 rounded-xl">
              <MapPin className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-4xl font-extrabold text-coffee-900">Maps & Delivery Settings</h2>
          </div>
          <p className="text-coffee-600 text-lg leading-relaxed max-w-3xl">
            Configure your store location and delivery zones. Set delivery fees and radius to manage your service area effectively. 
            Click <Info className="w-4 h-4 inline text-coffee-600" /> icons for detailed explanations.
          </p>
        </div>

        {/* Message Toast */}
        {message.text && (
          <div 
            className={`mb-6 flex items-center gap-3 p-4 rounded-xl shadow-lg border-l-4 ${
              message.type === "error" 
                ? "bg-red-50 text-red-800 border-red-500" 
                : "bg-green-50 text-green-800 border-green-500"
            } animate-fadeIn`}
            role="alert"
          >
            {message.type === "error" ? (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <Check className="w-5 h-5 flex-shrink-0" />
            )}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Store Location & Map */}
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-coffee-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-coffee-100 p-2 rounded-lg">
                <MapPin className="w-6 h-6 text-coffee-700" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-coffee-900">Store Location</h3>
                <p className="text-coffee-600 text-sm">Pin your exact location</p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Map */}
              <div>
                <label className={labelClass}>
                  <MapPin className="w-5 h-5 text-coffee-600" />
                  Interactive Map
                  <button
                    type="button"
                    className="text-coffee-600 hover:text-coffee-800 transition"
                    onClick={() => showTooltip(help.map)}
                    aria-label="Help"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                </label>
                <p className="text-sm text-coffee-600 mb-3">Drag the red marker to set your store location. The circle shows your delivery area.</p>
                <div className="border-2 border-coffee-200 rounded-xl overflow-hidden shadow-md">
                  {loadError ? (
                    <div className="h-96 flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-red-100 p-8">
                      <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
                      <span className="text-lg font-semibold text-red-700 text-center">
                        Failed to load map
                      </span>
                      <span className="text-sm text-red-600 mt-2">
                        Please check your API key or connection
                      </span>
                    </div>
                  ) : !isLoaded ? (
                    <div className="h-96 flex flex-col items-center justify-center bg-gradient-to-br from-coffee-100 to-coffee-200">
                      <Loader className="w-12 h-12 text-coffee-600 animate-spin mb-4" />
                      <span className="text-lg font-semibold text-coffee-700">
                        Loading Map...
                      </span>
                    </div>
                  ) : (
                    <GoogleMap
                      mapContainerStyle={containerStyle}
                      center={location}
                      zoom={14}
                      options={{
                        disableDefaultUI: false,
                        zoomControl: true,
                        streetViewControl: false,
                        mapTypeControl: false,
                        fullscreenControl: true,
                      }}
                    >
                      <Marker
                        position={location}
                        draggable={true}
                        onDragEnd={onMarkerDragEnd}
                        animation={window.google?.maps?.Animation?.DROP}
                      />
                      <Circle
                        center={location}
                        radius={radius}
                        options={{
                          fillColor: "#8B4513",
                          fillOpacity: 0.15,
                          strokeColor: "#8B4513",
                          strokeOpacity: 0.6,
                          strokeWeight: 2,
                        }}
                      />
                    </GoogleMap>
                  )}
                </div>
              </div>

              {/* Address Search */}
              <div>
                <label className={labelClass} htmlFor="address">
                  Store Address
                  <button
                    type="button"
                    className="text-coffee-600 hover:text-coffee-800 transition"
                    onClick={() => showTooltip(help.address)}
                    aria-label="Help"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                </label>
                {isLoaded && (
                  <Autocomplete
                    onLoad={ref => (autocompleteRef.current = ref)}
                    onPlaceChanged={onPlaceChanged}
                  >
                    <input
                      type="text"
                      className={inputClass}
                      placeholder="Search for your store address..."
                      value={address}
                      id="address"
                      onChange={e => setAddress(e.target.value)}
                    />
                  </Autocomplete>
                )}
                {errors.address && (
                  <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.address}
                  </p>
                )}
              </div>

              {/* Landmark */}
              <div>
                <label className={labelClass} htmlFor="landmark">
                  Landmark (Optional)
                  <button
                    type="button"
                    className="text-coffee-600 hover:text-coffee-800 transition"
                    onClick={() => showTooltip(help.landmark)}
                    aria-label="Help"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                </label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="e.g., Near City Hall, Beside McDonald's"
                  value={landmark}
                  id="landmark"
                  onChange={e => setLandmark(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Delivery & Radius */}
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-coffee-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-coffee-100 p-2 rounded-lg">
                <Truck className="w-6 h-6 text-coffee-700" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-coffee-900">Delivery Settings</h3>
                <p className="text-coffee-600 text-sm">Configure delivery zones & fees</p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Delivery Radius */}
              <div>
                <label className={labelClass}>
                  <MapPin className="w-5 h-5 text-coffee-600" />
                  Delivery Radius
                  <button
                    type="button"
                    className="text-coffee-600 hover:text-coffee-800 transition"
                    onClick={() => showTooltip(help.radius)}
                    aria-label="Help"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                </label>
                <p className="text-sm text-coffee-600 mb-3">How far from your store will you deliver?</p>
                <div className="flex gap-3 items-center">
                  <input
                    type="number"
                    className={inputClass}
                    value={radius}
                    min={0.1}
                    step={0.5}
                    onChange={e => {
                      const value = e.target.value;
                      setRadius(value === "" ? "" : Number(value));
                    }}
                    onBlur={e => {
                      // Set to minimum value if empty on blur
                      if (e.target.value === "" || Number(e.target.value) <= 0) {
                        setRadius(0.5);
                      }
                    }}
                    placeholder="5"
                  />
                  <span className="text-coffee-800 font-bold whitespace-nowrap">kilometers</span>
                </div>
                {errors.radius && (
                  <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.radius}
                  </p>
                )}
              </div>

              {/* Fee Type */}
              <div>
                <label className={labelClass}>
                  <DollarSign className="w-5 h-5 text-coffee-600" />
                  Delivery Fee Type
                  <button
                    type="button"
                    className="text-coffee-600 hover:text-coffee-800 transition"
                    onClick={() => showTooltip(help.feeType)}
                    aria-label="Help"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                </label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {feeTypes.map(type => {
                    const IconComponent = type.icon;
                    return (
                      <label key={type.value} className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${
                        feeType === type.value
                          ? 'border-coffee-500 bg-coffee-50' 
                          : 'border-gray-200 bg-gray-50'
                      }`}>
                        <input
                          type="radio"
                          name="feeType"
                          value={type.value}
                          checked={feeType === type.value}
                          onChange={e => setFeeType(e.target.value)}
                          className="accent-coffee-700 w-5 h-5 cursor-pointer"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <IconComponent className="w-5 h-5 text-coffee-600" />
                            <span className="font-semibold text-coffee-900 text-sm">{type.label}</span>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Fee Amount */}
              {feeType === "per_km" ? (
                <div>
                  <label className={labelClass}>
                    <DollarSign className="w-5 h-5 text-coffee-600" />
                    Fee Per Kilometer
                    <button
                      type="button"
                      className="text-coffee-600 hover:text-coffee-800 transition"
                      onClick={() => showTooltip(help.feePerKm)}
                      aria-label="Help"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-coffee-700 font-bold">₱</span>
                    <input
                      type="number"
                      className={inputClass + " pl-10"}
                      value={feePerKm}
                      /* removed min constraint to allow any number */
                      onChange={e => setFeePerKm(e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder="10"
                    />
                  </div>
                  {errors.feePerKm && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.feePerKm}
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <label className={labelClass}>
                    <DollarSign className="w-5 h-5 text-coffee-600" />
                    Flat Delivery Fee
                    <button
                      type="button"
                      className="text-coffee-600 hover:text-coffee-800 transition"
                      onClick={() => showTooltip(help.flatFee)}
                      aria-label="Help"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-coffee-700 font-bold">₱</span>
                    <input
                      type="number"
                      className={inputClass + " pl-10"}
                      value={flatFee}
                      onChange={e => setFlatFee(e.target.value)}
                      placeholder="50"
                    />
                  </div>
                  {errors.flatFee && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.flatFee}
                    </p>
                  )}
                </div>
              )}

              {/* Free Delivery Threshold */}
              <div>
                <label className={labelClass}>
                  <DollarSign className="w-5 h-5 text-coffee-600" />
                  Free Delivery Threshold
                  <button
                    type="button"
                    className="text-coffee-600 hover:text-coffee-800 transition"
                    onClick={() => showTooltip(help.freeThreshold)}
                    aria-label="Help"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                </label>
                <p className="text-sm text-coffee-600 mb-3">
                  Orders below this amount get free delivery (set to 0 to disable)
                </p>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-coffee-700 font-bold">₱</span>
                  <input
                    type="number"
                    className={inputClass + " pl-10"}
                    value={freeThreshold}
                    /* removed min constraint to allow any number */
                    onChange={e => setFreeThreshold(e.target.value)}
                    placeholder="500"
                  />
                </div>
                {freeThreshold > 0 && (
                  <div className="bg-green-50 border-2 border-green-300 rounded-lg p-3 mt-3">
                    <p className="text-sm text-green-800">
                      <Check className="w-4 h-4 inline mr-1" />
                      Orders ₱{freeThreshold} and below will have free delivery
                    </p>
                  </div>
                )}
              </div>

              {/* Preview */}
              <div className="bg-gradient-to-br from-coffee-50 to-coffee-100 rounded-xl p-5 border-2 border-coffee-300">
                <h4 className="font-bold text-coffee-900 mb-3 flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Fee Calculation Preview
                </h4>
                <div className="space-y-2 text-sm text-coffee-800">
                  <p><strong>Type:</strong> {feeType === "per_km" ? "Per Kilometer" : "Flat Rate"}</p>
                  <p><strong>Rate:</strong> ₱{feeType === "per_km" ? `${feePerKm} per km` : flatFee}</p>
                  <p><strong>Free Delivery:</strong> {freeThreshold > 0 ? `≤ ₱${freeThreshold}` : "Disabled"}</p>
                  {feeType === "per_km" && (
                    <div className="mt-3 pt-3 border-t border-coffee-300">
                      <p className="font-semibold mb-1">Example:</p>
                      <p>• 2km away = ₱{feePerKm * 2}</p>
                      <p>• 5km away = ₱{feePerKm * 5}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-end">
          <button
            className="cursor-pointer bg-gray-200 text-gray-700 px-8 py-3 rounded-xl font-bold shadow-md hover:bg-gray-300 transition flex items-center justify-center gap-2 disabled:opacity-50"
            onClick={handleReset}
            disabled={saving}
          >
            <RotateCcw className="w-5 h-5" />
            Reset to Saved
          </button>
          <button
            className="cursor-pointer bg-coffee-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-coffee-800 hover:shadow-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`
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