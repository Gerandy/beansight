import { useEffect, useState, useRef } from "react";
import { db } from "../../firebase";
import { collection, getDocs, addDoc, doc, updateDoc } from "firebase/firestore";

// Ensure Google Maps JS API is loaded in index.html
// <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places"></script>

function MyAddresses() {
  const [addresses, setAddresses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [formData, setFormData] = useState({
    label: "",
    details: "",
    province: "",
    city: "",
    zipcode: "",
    isDefault: false,
  });
  const [errors, setErrors] = useState({});

  const addressLabel = ["Residential","Office"];
  

  // Google Maps refs
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerInstance = useRef(null);
  const autocompleteRef = useRef(null);
  const inputRef = useRef(null);

  // Fetch addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      const userId = localStorage.getItem("authToken");
      if (!userId) return;
      try {
        const colRef = collection(db, "users", userId, "addresses");
        const snapshot = await getDocs(colRef);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAddresses(data);
      } catch (err) {
        console.error("Error fetching addresses:", err);
      }
    };
    fetchAddresses();
  }, []);

  // Initialize Google Maps
  useEffect(() => {
    if (!mapRef.current || !window.google) return;

    const defaultLocation = { lat: 14.4453, lng: 120.9187 }; // Kawit, Cavite
    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      center: defaultLocation,
      zoom: 14,
    });

    markerInstance.current = new window.google.maps.Marker({
      map: mapInstance.current,
      draggable: true,
      position: defaultLocation,
    });

    // Drag marker to update address
    markerInstance.current.addListener("dragend", async () => {
      const pos = markerInstance.current.getPosition();
      const geocoder = new window.google.maps.Geocoder();
      const res = await geocoder.geocode({ location: pos });
      if (res.results[0]) fillAddressFromPlace(res.results[0]);
    });

    // Click map to move marker
    mapInstance.current.addListener("click", (e) => {
      const pos = e.latLng;
      markerInstance.current.setPosition(pos);
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: pos }, (results, status) => {
        if (status === "OK" && results[0]) fillAddressFromPlace(results[0]);
      });
    });
  }, [showForm]);

  // Autocomplete
  useEffect(() => {
    if (!inputRef.current || !window.google) return;

    autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: "ph" },
      fields: ["address_components", "formatted_address", "geometry"],
      types: ["address"],
    });

    autocompleteRef.current.addListener("place_changed", () => {
      const place = autocompleteRef.current.getPlace();
      if (!place.address_components) return;
      fillAddressFromPlace(place);

      if (place.geometry && mapInstance.current && markerInstance.current) {
        const pos = place.geometry.location;
        mapInstance.current.setCenter(pos);
        markerInstance.current.setPosition(pos);
      }
    });
  }, [showForm]);

  const fillAddressFromPlace = (place) => {
    let street = "", city = "", province = "", zipcode = "";

    place.address_components.forEach(comp => {
      const types = comp.types;
      if (types.includes("street_number")) street = comp.long_name + " " + street;
      if (types.includes("route")) street += comp.long_name;
      if (types.includes("locality")) city = comp.long_name;
      if (types.includes("administrative_area_level_1")) province = comp.long_name;
      if (types.includes("postal_code")) zipcode = comp.long_name;
    });

    setFormData(prev => ({
      ...prev,
      details: street || place.formatted_address,
      city,
      province,
      zipcode
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.label) newErrors.label = "Label is required";
    if (!formData.details) newErrors.details = "Address details are required";
    if (!formData.province) newErrors.province = "Province is required";
    if (!formData.city) newErrors.city = "City is required";
    if (!formData.zipcode) newErrors.zipcode = "Zipcode is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const userId = localStorage.getItem("authToken");
    if (!userId) return;

    try {
      if (editingAddress) {
        const docRef = doc(db, "users", userId, "addresses", editingAddress.id);
        await updateDoc(docRef, formData);
        setAddresses(prev => prev.map(addr => addr.id === editingAddress.id ? { ...addr, ...formData } : addr));
      } else {
        const colRef = collection(db, "users", userId, "addresses");
        const docRef = await addDoc(colRef, formData);
        setAddresses(prev => [...prev, { id: docRef.id, ...formData }]);
      }
      setFormData({ label: "", details: "", province: "", isDefault: true });
      setEditingAddress(null);
      setShowForm(false);
      setErrors({});
    } catch (err) {
      console.error("Error saving address:", err);
    }
  };

  const handleEdit = (address) => {
    setEditingAddress(address);
    setFormData(address);
    setShowForm(true);
    setErrors({});
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl border-b border-coffee-200 pb-4 text-coffee-900 font-bold mb-6 lg:mb-10">
        My Addresses
      </h1>

      <div className="space-y-4">
        {addresses.map(addr => (
          <div key={addr.id} className="flex items-start gap-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <input type="radio" name="address" defaultChecked={addr.isDefault} className="mt-1 accent-coffee-700 w-5 h-5" />
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-base sm:text-lg text-coffee-900 mb-1">{addr.label}</h2>
              <p className="text-sm text-coffee-700 leading-relaxed">{addr.details}, {addr.city}, {addr.province} {addr.zipcode}</p>
            </div>
            <button onClick={() => handleEdit(addr)} className="px-4 py-2 bg-coffee-400 text-white rounded-lg font-medium hover:bg-coffee-500 transition-colors text-sm flex-shrink-0">Edit</button>
          </div>
        ))}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-6 border border-coffee-200 rounded-lg p-4 bg-coffee-50 space-y-4">
          <h3 className="text-lg font-semibold text-coffee-900 mb-4">{editingAddress ? "Edit Address" : "Add New Address"}</h3>

          <select
            value={formData.label}
            onChange={(e) =>
              setFormData({
                ...formData,
                label: e.target.value
              })
            }
            className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 border-coffee-300 ring-coffee-700"
          >
            <option value="">Select Address Label</option>

            {addressLabel.map((label) => (
              <option key={label} value={label}>
                {label}
              </option>
            ))}
          </select>

          {errors.label && (
            <p className="text-red-600 text-sm mt-1">{errors.label}</p>
          )}

          <input
            type="text"
            ref={inputRef}
            placeholder="Search address on map"
            className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 border-coffee-300 ring-coffee-700"
          />

          <textarea
            rows="2"
            placeholder="Full Address"
            value={formData.details}
            onChange={e => setFormData({ ...formData, details: e.target.value })}
            className={`w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 ${errors.details ? "border-red-600 ring-red-500" : "border-coffee-300 ring-coffee-700"}`}
          />
          {errors.details && <p className="text-red-600 text-sm mt-1">{errors.details}</p>}

          {/* Google Maps */}
          <div ref={mapRef} className="w-full h-64 rounded-lg border border-coffee-300"></div>

          

          

          <div className="flex items-center mb-3">
            <input type="checkbox" defaultValuechecked={formData.isDefault} onChange={e => setFormData({ ...formData, isDefault: e.target.checked })} className="mr-2 accent-coffee-700" />
            <label className="text-sm text-coffee-900">Set as default address</label>
          </div>

          <div className="flex gap-3">
            <button type="submit" className="flex-1 bg-coffee-700 text-white py-2 rounded-lg hover:bg-coffee-800 transition-colors">{editingAddress ? "Save Changes" : "Add Address"}</button>
            <button type="button" onClick={() => { setShowForm(false); setEditingAddress(null); setErrors({}); window.location.reload();}} className="flex-1 bg-coffee-200 text-coffee-900 py-2 rounded-lg hover:bg-coffee-300 transition-colors">Cancel</button>
          </div>
        </form>
      )}

      {!showForm && !editingAddress && (
        <button onClick={() => setShowForm(true)} className="w-full text-white bg-coffee-700 hover:bg-coffee-800 font-bold py-3 sm:py-3.5 rounded-lg transition-colors text-sm sm:text-base mt-4">
          Add New Address
        </button>
      )}
    </div>
  );
}

export default MyAddresses;
