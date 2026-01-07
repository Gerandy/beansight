import { useEffect, useState, useRef } from "react";
import { db } from "../../firebase";
import { collection, getDocs, addDoc, doc, updateDoc, getDoc } from "firebase/firestore";

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
    lat: null,
    long: null,
  });
  const [errors, setErrors] = useState({});
  const [hasOutOfZoneAddresses, setHasOutOfZoneAddresses] = useState(false);

  const [longitude, setlongitude] = useState(null);
  const [latitude, setlatitude] = useState(null);
    const [radius, setRadius] = useState(null);

  const addressLabel = ["Residential","Office"];
  const storeCenter = { lat: latitude, lng: longitude };

  // compute distance (meters) between two lat/lng pairs (Haversine)
  const computeDistanceMeters = (lat1, lon1, lat2, lon2) => {
    if ([lat1, lon1, lat2, lon2].some(v => v === null || v === undefined)) return Infinity;
    const toRad = (v) => (v * Math.PI) / 180;
    const R = 6371000; // meters
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Google Maps refs
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerInstance = useRef(null);
  const autocompleteRef = useRef(null);
  const inputRef = useRef(null);
  const deliveryRadius = radius;


  useEffect(() =>{
      const load = async () => {
        const docSnap = await getDoc(doc(db, "settings", "mapRadius"));  
        if (docSnap.exists()){
          const radiusValue = docSnap.data().value
          const long = docSnap.data().long
          const lat = docSnap.data().lat
          setRadius(radiusValue)
          setlongitude(long)
          setlatitude(lat)
          console.log(radius)
        }
      }
      load();
    },[])



  // Fetch addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      const userId = localStorage.getItem("authToken");
      if (!userId) return;
      try {
        const colRef = collection(db, "users", userId, "addresses");
        const snapshot = await getDocs(colRef);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // mark out-of-zone addresses based on current store center/radius
        const marked = data.map(a => {
          const dist = computeDistanceMeters(latitude, longitude, a.lat, a.long);
          return { ...a, outOfZone: radius ? dist > radius : false, distanceMeters: isFinite(dist) ? Math.round(dist) : null };
        });
        setAddresses(marked);
        setHasOutOfZoneAddresses(marked.some(m => m.outOfZone));
      } catch (err) {
        console.error("Error fetching addresses:", err);
      }
    };
    fetchAddresses();
  }, [latitude, longitude, radius]);

  // re-evaluate addresses when store center/radius change
  useEffect(() => {
    if (!addresses || addresses.length === 0) return;
    const marked = addresses.map(a => {
      const dist = computeDistanceMeters(latitude, longitude, a.lat, a.long);
      return { ...a, outOfZone: radius ? dist > radius : false, distanceMeters: isFinite(dist) ? Math.round(dist) : null };
    });
    setAddresses(marked);
    setHasOutOfZoneAddresses(marked.some(m => m.outOfZone));
  }, [latitude, longitude, radius]);
  
  // Initialize Google Maps
  useEffect(() => {
    if (!mapRef.current || !window.google) return;

    const defaultLocation = (formData.lat && formData.long)
      ? { lat: formData.lat, lng: formData.long }
      : (latitude && longitude)
        ? { lat: latitude, lng: longitude }
        : { lat: 14.3966, lng: 120.956 }; // fallback

    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      center: defaultLocation,
      zoom: 14,
    });

    markerInstance.current = new window.google.maps.Marker({
      map: mapInstance.current,
      draggable: true,
      position: defaultLocation,
    });

    // create delivery zone only if center & radius available
    const zoneCircle = (latitude && longitude && radius)
      ? new window.google.maps.Circle({
          map: mapInstance.current,
          center: storeCenter,
          radius: radius,
          fillColor: "#8B4513",
          strokeColor: "#5D2E0F",
          strokeWeight: 2,
          clickable: false,
          fillOpacity: 0.15,
        })
      : null;

    const isInsideZone = (pos) => {
      if (!zoneCircle || !window.google.maps.geometry) return true;
      return window.google.maps.geometry.spherical.computeDistanceBetween(
        pos,
        zoneCircle.getCenter()
      ) <= zoneCircle.getRadius();
    };

    const snapToCircleEdge = (pos) => {
      if (!zoneCircle || !window.google.maps.geometry) return pos;
      const center = zoneCircle.getCenter();
      const distance = window.google.maps.geometry.spherical.computeDistanceBetween(pos, center);
      if (distance <= zoneCircle.getRadius()) return pos;
      const heading = window.google.maps.geometry.spherical.computeHeading(center, pos);
      return window.google.maps.geometry.spherical.computeOffset(center, zoneCircle.getRadius(), heading);
    };

    // Drag marker to update address (snap to zone if outside)
    markerInstance.current.addListener("dragend", async () => {
      let pos = markerInstance.current.getPosition();
      if (!isInsideZone(pos)) {
        pos = snapToCircleEdge(pos);
        markerInstance.current.setPosition(pos);
      }
      const geocoder = new window.google.maps.Geocoder();
      const res = await geocoder.geocode({ location: pos });
      if (res?.results?.[0]) fillAddressFromPlace(res.results[0]);
    });

    // Click map to move marker (snap to zone if outside)
    mapInstance.current.addListener("click", (e) => {
      let pos = e.latLng;
      if (!isInsideZone(pos)) {
        pos = snapToCircleEdge(pos);
        markerInstance.current.setPosition(pos);
      } else {
        markerInstance.current.setPosition(pos);
      }
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: pos }, (results, status) => {
        if (status === "OK" && results[0]) fillAddressFromPlace(results[0]);
      });
    });
  }, [showForm, latitude, longitude, radius]);

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
      if (!place) return;

      // prefer geometry location and snap to zone if needed
      let pos = place.geometry && place.geometry.location ? place.geometry.location : null;

      if (pos && window.google && radius && latitude && longitude && window.google.maps.geometry) {
        const center = new window.google.maps.LatLng(latitude, longitude);
        const dist = window.google.maps.geometry.spherical.computeDistanceBetween(pos, center);
        if (dist > radius) {
          const heading = window.google.maps.geometry.spherical.computeHeading(center, pos);
          pos = window.google.maps.geometry.spherical.computeOffset(center, radius, heading);
        }
      }

      if (mapInstance.current && markerInstance.current && pos) {
        mapInstance.current.setCenter(pos);
        markerInstance.current.setPosition(pos);
      }

      // ensure form gets filled from a GeocoderResult (snapped or original)
      if (pos) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: pos }, (results, status) => {
          if (status === "OK" && results[0]) fillAddressFromPlace(results[0]);
          else if (place) fillAddressFromPlace(place);
        });
      } else {
        fillAddressFromPlace(place);
      }
    });
  }, [showForm]);

  const fillAddressFromPlace = (place) => {
    // support both PlaceResult and GeocoderResult shapes
    const components = place.address_components || [];
    let street = "", city = "", province = "", zipcode = "";

    components.forEach(comp => {
      const types = comp.types || [];
      if (types.includes("street_number")) street = comp.long_name + " " + street;
      if (types.includes("route")) street += comp.long_name;
      if (types.includes("locality")) city = comp.long_name;
      if (types.includes("administrative_area_level_1")) province = comp.long_name;
      if (types.includes("postal_code")) zipcode = comp.long_name;
    });

    const formatted = place.formatted_address || place.formattedAddress || "";

    // get lat/lng safely (may be google.maps.LatLng with lat()/lng())
    let lat = null;
    let lng = null;
    try {
      if (place.geometry && place.geometry.location) {
        const loc = place.geometry.location;
        lat = typeof loc.lat === "function" ? loc.lat() : loc.lat;
        lng = typeof loc.lng === "function" ? loc.lng() : loc.lng;
      }
    } catch (e) {
      // ignore
    }

    setFormData(prev => ({
      ...prev,
      details: street || formatted || prev.details,
      city: city || prev.city,
      province: province || prev.province,
      zipcode: zipcode || prev.zipcode,
      lat: lat ?? prev.lat,
      long: lng ?? prev.long,
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
      // prepare payload, ensure numeric lat/long or null
      const payload = {
        label: formData.label,
        details: formData.details,
        province: formData.province,
        city: formData.city,
        zipcode: formData.zipcode,
        isDefault: !!formData.isDefault,
        lat: formData.lat ?? null,
        long: formData.long ?? null,
      };

      if (editingAddress) {
        const docRef = doc(db, "users", userId, "addresses", editingAddress.id);
        await updateDoc(docRef, payload);
        setAddresses(prev => prev.map(addr => addr.id === editingAddress.id ? { ...addr, ...payload } : addr));
      } else {
        const colRef = collection(db, "users", userId, "addresses");
        const docRef = await addDoc(colRef, payload);
        setAddresses(prev => [...prev, { id: docRef.id, ...payload }]);
      }
      setFormData({
        label: "",
        details: "",
        province: "",
        city: "",
        zipcode: "",
        isDefault: true,
        lat: null,
        long: null,
      });
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
      <h1 className="text-2xl sm:text-3xl lg:text-4xl pb-4 text-coffee-900 font-bold mb-6 lg:mb-10">
        My Addresses
      </h1>

      {hasOutOfZoneAddresses && (
        <div className="mb-4 p-3 rounded-md bg-yellow-100 border border-yellow-300 text-yellow-900">
          The store's delivery location or radius has changed — some saved addresses are now outside the delivery zone. Please review and update your addresses.
        </div>
      )}

      <div className="space-y-4">
        {addresses.map(addr => (
          <div key={addr.id} className="flex items-start gap-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <input type="radio" name="address" defaultChecked={addr.isDefault} className="cursor-pointer mt-1 accent-coffee-700 w-5 h-5" />
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-base sm:text-lg text-coffee-900 mb-1">{addr.label}</h2>
              <p className="text-sm text-coffee-700 leading-relaxed">{addr.details}, {addr.city}, {addr.province} {addr.zipcode}</p>
              {addr.outOfZone && (
                <p className="text-sm text-red-600 mt-2">This address is outside the store's delivery zone. The store location changed — please update this address.</p>
              )}
            </div>
            <button onClick={() => handleEdit(addr)} className="cursor-pointer px-4 py-2 bg-coffee-400 text-white rounded-lg font-medium hover:bg-coffee-500 transition-colors text-sm flex-shrink-0">Edit</button>
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
            className="cursor-pointer w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 border-coffee-300 ring-coffee-700"
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
            <input
              type="checkbox"
              checked={!!formData.isDefault}
              onChange={e => setFormData({ ...formData, isDefault: e.target.checked })}
              className="cursor-pointer mr-2 accent-coffee-700"
            />
            <label className="text-sm text-coffee-900">Set as default address</label>
          </div>

          <div className="flex gap-3">
            <button type="submit" className="cursor-pointer flex-1 bg-coffee-700 text-white py-2 rounded-lg hover:bg-coffee-800 transition-colors">{editingAddress ? "Save Changes" : "Add Address"}</button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingAddress(null);
                setErrors({});
                // reset form but do not reload whole page
                setFormData({
                  label: "",
                  details: "",
                  province: "",
                  city: "",
                  zipcode: "",
                  isDefault: false,
                  lat: null,
                  long: null,
                });
              }}
              className="cursor-pointer flex-1 bg-coffee-200 text-coffee-900 py-2 rounded-lg hover:bg-coffee-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {!showForm && !editingAddress && (
        <button onClick={() => setShowForm(true)} className="cursor-pointer w-full text-white bg-coffee-700 hover:bg-coffee-800 font-bold py-3 sm:py-3.5 rounded-lg transition-colors text-sm sm:text-base mt-4">
          Add New Address
        </button>
      )}
    </div>
  );
}

export default MyAddresses;
