import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ShieldCheck, ScrollText, MapPin, Check, X } from "lucide-react";
import { createUserWithEmailAndPassword, sendEmailVerification  } from "firebase/auth";
import { doc, setDoc, collection, addDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";

export default function Signup() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [pwd, setPwd] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [error, setError] = useState("");
  const [radius, setRadius] = useState(null);
  const [longitude, setlongitude] = useState(null);
  const [latitude, setlatitude] = useState(null);
  const [showPwd, setShowPwd] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const [termsOpen, setTermsOpen] = useState(false);
  const [termsScrolledToEnd, setTermsScrolledToEnd] = useState(false);
  const [hasReadTerms, setHasReadTerms] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const [address, setAddress] = useState({
    label: "",
    details: "",
    long: "",
    lat: ""
  });

  // Password strength indicator
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: "", color: "" });

  // Google Maps refs
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerInstance = useRef(null);
  const autocompleteRef = useRef(null);
  const inputRef = useRef(null);
  const scrollRef = useRef(null);

  const navigate = useNavigate();

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

  useEffect(() => {
    if (localStorage.getItem("authToken")) navigate("/Myaccount", { replace: true });
  }, [navigate]);

  // Password strength checker
  useEffect(() => {
    if (!pwd) {
      setPasswordStrength({ score: 0, label: "", color: "" });
      return;
    }

    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) score++;

    const strength = [
      { score: 0, label: "", color: "" },
      { score: 1, label: "Very Weak", color: "bg-red-500" },
      { score: 2, label: "Weak", color: "bg-orange-500" },
      { score: 3, label: "Fair", color: "bg-yellow-500" },
      { score: 4, label: "Good", color: "bg-lime-500" },
      { score: 5, label: "Strong", color: "bg-green-500" },
    ];

    setPasswordStrength(strength[score]);
  }, [pwd]);

  // Google Maps setup
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    // Wait for all required data
    if (!radius || !longitude || !latitude) return;
    
    // Check if Google Maps is loaded
    const checkGoogleMapsLoaded = () => {
      if (window.google && window.google.maps && window.google.maps.Map) {
        setMapLoaded(true);
        return true;
      }
      return false;
    };

    // If already loaded, proceed
    if (checkGoogleMapsLoaded()) {
      initializeMap();
      return;
    }

    // Otherwise, wait for it to load
    const interval = setInterval(() => {
      if (checkGoogleMapsLoaded()) {
        clearInterval(interval);
        initializeMap();
      }
    }, 100);

    // Cleanup
    return () => clearInterval(interval);

  }, [radius, longitude, latitude, currentStep]);

  // Separate the map initialization logic
  const initializeMap = () => {
    if (!mapRef.current || !window.google || !inputRef.current) return;
    
    // Clear existing instances
    if (mapInstance.current) {
      mapInstance.current = null;
    }
    if (markerInstance.current) {
      markerInstance.current = null;
    }

    const storeCenter = { lat: latitude, lng: longitude };
    const deliveryRadius = radius;

    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      center: storeCenter,
      zoom: 14,
      disableDefaultUI: true,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
    });

    const zoneCircle = new window.google.maps.Circle({
      map: mapInstance.current,
      center: storeCenter,
      radius: deliveryRadius,
      fillColor: "#8B4513",
      strokeColor: "#5D2E0F",
      strokeWeight: 2,
      clickable: false,
      fillOpacity: 0.15,
    });

    markerInstance.current = new window.google.maps.Marker({
      map: mapInstance.current,
      draggable: true,
      position: storeCenter,
      animation: window.google.maps.Animation.DROP,
    });

    function isInsideZone(pos) {
      return window.google.maps.geometry.spherical.computeDistanceBetween(
        pos,
        zoneCircle.getCenter()
      ) <= zoneCircle.getRadius();
    }

    function snapToCircleEdge(pos) {
      const center = zoneCircle.getCenter();
      const distance = window.google.maps.geometry.spherical.computeDistanceBetween(pos, center);
      if (distance <= zoneCircle.getRadius()) return pos;

      const heading = window.google.maps.geometry.spherical.computeHeading(center, pos);
      return window.google.maps.geometry.spherical.computeOffset(center, zoneCircle.getRadius(), heading);
    }

    async function updateMarker(pos) {
      if (!markerInstance.current || !mapInstance.current) return;

      markerInstance.current.setPosition(pos);
      mapInstance.current.panTo(pos);

      const geocoder = new window.google.maps.Geocoder();
      try {
        const res = await geocoder.geocode({ location: pos });
        if (res.results[0]) fillAddressFromPlace(res.results[0]);
      } catch (error) {
        console.error("Geocoding error:", error);
      }
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          let userPos = new window.google.maps.LatLng(
            position.coords.latitude,
            position.coords.longitude
          );

          if (!isInsideZone(userPos)) {
            userPos = snapToCircleEdge(userPos);
          }

          updateMarker(userPos);
        },
        (err) => {
          console.warn("Geolocation failed, using store center:", err);
          updateMarker(storeCenter);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      updateMarker(storeCenter);
    }

    markerInstance.current.addListener("dragend", async () => {
      let pos = markerInstance.current.getPosition();
      if (!isInsideZone(pos)) {
        setError("⚠️ Location outside delivery zone. Snapping to nearest point.");
        setTimeout(() => setError(""), 3000);
        pos = snapToCircleEdge(pos);
      }
      updateMarker(pos);
    });

    mapInstance.current.addListener("click", async (e) => {
      let pos = e.latLng;
      if (!isInsideZone(pos)) {
        setError("⚠️ Location outside delivery zone. Snapping to nearest point.");
        setTimeout(() => setError(""), 3000);
        pos = snapToCircleEdge(pos);
      }
      updateMarker(pos);
    });

    // Initialize autocomplete only if input exists
    if (inputRef.current && window.google.maps.places) {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: "ph" },
        fields: ["address_components", "formatted_address", "geometry", "name", "place_id"],
        types: [], // Remove type restriction to allow all place types
      });

      // Bias results towards the delivery zone
      const circle = new window.google.maps.Circle({
        center: storeCenter,
        radius: deliveryRadius
      });
      autocompleteRef.current.setBounds(circle.getBounds());

      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current.getPlace();
        if (!place.geometry?.location) {
          setError("Please select a location from the dropdown suggestions.");
          setTimeout(() => setError(""), 3000);
          return;
        }

        let pos = place.geometry.location;
        if (!isInsideZone(pos)) {
          setError("⚠️ Address outside delivery zone. Snapping to nearest point.");
          setTimeout(() => setError(""), 3000);
          pos = snapToCircleEdge(pos);
        }

        updateMarker(pos);
        fillAddressFromPlace(place);
      });
    }
  };

  const fillAddressFromPlace = (place) => {
    let street = "";
    (place.address_components || []).forEach(comp => {
      const types = comp.types || [];
      if (types.includes("street_number")) street = comp.long_name + " " + street;
      if (types.includes("route")) street += comp.long_name;
    });

    // get formatted address
    const formatted = place.formatted_address || place.name || "";

    // obtain lat/lng (handles both PlaceResult and GeocoderResult LatLng)
    let lat = null;
    let lng = null;
    if (place.geometry && place.geometry.location) {
      // google.maps.LatLng has lat()/lng() methods
      try {
        lat = typeof place.geometry.location.lat === "function"
          ? place.geometry.location.lat()
          : place.geometry.location.lat;
        lng = typeof place.geometry.location.lng === "function"
          ? place.geometry.location.lng()
          : place.geometry.location.lng;
      } catch (e) {
        lat = null;
        lng = null;
      }
    }

    setAddress(prev => ({
      ...prev,
      details: street || formatted,
      // preserve label if user set it, but ensure coords are stored
      long: lng ?? prev.long ?? "",
      lat: lat ?? prev.lat ?? "",
    }));
  };

  const validateAddress = () => {
    return address.label && address.details;
  };

  useEffect(() => {
    if (pwd.length < 8) return setPwd2("");
    setError("");
  }, [pwd]);

  const onSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (!firstName || !lastName || !email || !contactNumber || !pwd) {
      return setError("All fields are required.");
    }
    if (pwd !== pwd2) return setError("Passwords do not match.");
    if (!hasReadTerms || !agreed) return setError("Please read and agree to the Terms of Service.");
    if (!validateAddress()) return setError("Please provide a complete address.");

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pwd);
      const user = userCredential.user;
      const userId = user.uid;

      await sendEmailVerification(user);

      await setDoc(doc(db, "users", userId), {
        firstName,
        lastName,
        email,
        contactNumber,
        role: "client",
        createdAt: new Date(),
        emailVerified: false,
      });

      await addDoc(collection(db, "users", userId, "addresses"), { ...address, isDefault: true });

      localStorage.setItem("authToken", userId);
      localStorage.setItem("role", "client");

      navigate("/verify-email", { replace: true });

    } catch (err) {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered. Please log in.");
      } else if (err.code === "auth/weak-password") {
        setError("Password should be at least 8 characters.");
      } else {
        setError(err.message);
      }
    }
  };

  const canSubmit =
    firstName &&
    lastName &&
    email &&
    contactNumber &&
    pwd &&
    pwd2 &&
    pwd === pwd2 &&
    hasReadTerms &&
    agreed &&
    validateAddress();

  const onScrollTerms = (e) => {
    const el = e.target;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 8) {
      setTermsScrolledToEnd(true);
    }
  };

  const confirmRead = () => {
    setHasReadTerms(true);
    setTermsOpen(false);
  };

  // Step validation
  const step1Valid = firstName && lastName && email && contactNumber;
  const step2Valid = pwd && pwd2 && pwd === pwd2 && passwordStrength.score >= 3;
  const step3Valid = validateAddress();

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br mt-20 py-8 sm:py-12 px-4">
        <div className="max-w-3xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-3">
              <ShieldCheck className="h-8 w-8 text-coffee-600" />
              <h1 className="text-3xl sm:text-4xl font-bold text-coffee-900">Create Account</h1>
            </div>
            <p className="text-gray-600">Join BeanSight and start your coffee journey</p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="max-w-3xl mx-auto px-4">
              <div className="relative">
                {/* SVG connector clipped between first and last circle centers */}
                <svg
                  className="absolute left-0 right-0 top-[20px] h-1 w-full"
                  viewBox="0 0 100 2"
                  preserveAspectRatio="none"
                >
                  {/* background line from 12.5% to 87.5% */}
                  <line x1="12.5" y1="1" x2="87.5" y2="1" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
                  {/* progress segment from 12.5% up to current step */}
                  <line
                    x1="12.5"
                    y1="1"
                    x2={12.5 + Math.min(((currentStep - 1) / 3) * 75, 75)}
                    y2="1"
                    stroke="#C69064" /* coffee-300 */
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>

                {/* circles + labels */}
                <div className="grid grid-cols-4 gap-4 items-start">
                  {[1, 2, 3, 4].map((step) => (
                    <div key={step} className="flex flex-col items-center">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(step)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all text-base z-10
                          ${currentStep === step ? "bg-coffee-600 text-white scale-110" : 
                            currentStep > step ? "bg-green-500 text-white hover:bg-green-600" : "bg-gray-300 text-gray-600 hover:bg-gray-400"}
                          cursor-pointer focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:ring-offset-2`}
                        aria-label={`Go to step ${step}`}
                      >
                        {currentStep > step ? <Check size={18} /> : step}
                      </button>

                      <button
                        type="button"
                        onClick={() => setCurrentStep(step)}
                        className={`mt-2 text-xs sm:text-sm hover:text-coffee-600 transition-colors truncate max-w-full
                          ${currentStep === step ? "font-semibold text-coffee-700" : "text-gray-600"}`}
                      >
                        {step === 1 ? "Personal" : step === 2 ? "Security" : step === 3 ? "Address" : "Terms"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
            <form onSubmit={onSignup} className="space-y-6">
              
              {/* Step 1: Personal Info */}
              {currentStep === 1 && (
                <div className="space-y-4 animate-fadeIn">
                  <h2 className="text-xl font-semibold text-coffee-900 mb-4">Personal Information</h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        className="w-full border border-gray-300 px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-transparent transition"
                        placeholder="John"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        className="w-full border border-gray-300 px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-transparent transition"
                        placeholder="Doe"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      className={`w-full border px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent transition
                        ${email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-coffee-500"}`}
                      placeholder="john.doe@example.com"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    {email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? (
                      <p className="text-xs text-red-600 mt-1.5 flex items-start gap-1">
                        <X className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                        <span>Please enter a valid email address (e.g., user@example.com)</span>
                      </p>
                    ) : email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? (
                      <p className="text-xs text-green-600 mt-1.5 flex items-start gap-1">
                        <Check className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                        <span>Valid email format</span>
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500 mt-1.5 flex items-start gap-1">
                        <svg className="h-3.5 w-3.5 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <span>We'll send a verification email to this address</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      className={`w-full border px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent transition
                        ${contactNumber && (!/^09\d{9}$/.test(contactNumber)) ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-coffee-500"}`}
                      placeholder="09123456789"
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={11}
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value.replace(/\D/g, ""))}
                    />
                    {contactNumber && contactNumber.length > 0 && contactNumber.length < 11 ? (
                      <p className="text-xs text-orange-600 mt-1.5 flex items-start gap-1">
                        <svg className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span>Phone number must be 11 digits ({contactNumber.length}/11)</span>
                      </p>
                    ) : contactNumber && !/^09\d{9}$/.test(contactNumber) ? (
                      <p className="text-xs text-red-600 mt-1.5 flex items-start gap-1">
                        <X className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                        <span>Must start with 09 and be exactly 11 digits</span>
                      </p>
                    ) : contactNumber && /^09\d{9}$/.test(contactNumber) ? (
                      <p className="text-xs text-green-600 mt-1.5 flex items-start gap-1">
                        <Check className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                        <span>Valid Philippine mobile number</span>
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500 mt-1.5 flex items-start gap-1">
                        <svg className="h-3.5 w-3.5 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <span>Rider will contact this number for delivery</span>
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={!step1Valid || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^09\d{9}$/.test(contactNumber)}
                    onClick={() => setCurrentStep(2)}
                    className={`w-full py-3 rounded-lg font-semibold transition-all
                      ${step1Valid && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && /^09\d{9}$/.test(contactNumber) ? "bg-coffee-600 hover:bg-coffee-700 text-white cursor-pointer" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
                  >
                    Continue to Security
                  </button>
                </div>
              )}

              {/* Step 2: Password */}
              {currentStep === 2 && (
                <div className="space-y-4 animate-fadeIn">
                  <h2 className="text-xl font-semibold text-coffee-900 mb-4">Create Password</h2>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        className="w-full border border-gray-300 px-4 py-3 pr-12 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-transparent transition"
                        placeholder="••••••••"
                        type={showPwd ? "text" : "password"}
                        value={pwd}
                        onChange={(e) => setPwd(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPwd((v) => !v)}
                        className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-coffee-700"
                      >
                        {showPwd ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    
                    {/* Password Strength Indicator */}
                    {pwd && (
                      <div className="mt-2">
                        <div className="flex gap-1 mb-1">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div
                              key={i}
                              className={`h-1 flex-1 rounded-full transition-all
                                ${i <= passwordStrength.score ? passwordStrength.color : "bg-gray-200"}`}
                            />
                          ))}
                        </div>
                        <p className={`text-xs ${passwordStrength.score >= 3 ? "text-green-600" : "text-orange-600"}`}>
                          {passwordStrength.label}
                        </p>
                        <div className="text-xs text-gray-600 mt-2 space-y-1">
                          <p className={pwd.length >= 8 ? "text-green-600" : ""}>
                            {pwd.length >= 8 ? "✓" : "○"} At least 8 characters
                          </p>
                          <p className={/[A-Z]/.test(pwd) && /[a-z]/.test(pwd) ? "text-green-600" : ""}>
                            {/[A-Z]/.test(pwd) && /[a-z]/.test(pwd) ? "✓" : "○"} Upper and lowercase letters
                          </p>
                          <p className={/\d/.test(pwd) ? "text-green-600" : ""}>
                            {/\d/.test(pwd) ? "✓" : "○"} At least one number
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        className={`w-full border px-4 py-3 pr-12 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent transition
                          ${pwd2 && pwd !== pwd2 ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-coffee-500"}`}
                        placeholder="••••••••"
                        type={showPwd2 ? "text" : "password"}
                        value={pwd2}
                        onChange={(e) => setPwd2(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPwd2((v) => !v)}
                        className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-coffee-700"
                      >
                        {showPwd2 ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {pwd2 && pwd !== pwd2 && (
                      <p className="text-xs text-red-600 mt-1">Passwords do not match</p>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="flex-1 py-3 rounded-lg border border-gray-300 font-semibold text-gray-700 hover:bg-gray-50 transition"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      disabled={!step2Valid}
                      onClick={() => setCurrentStep(3)}
                      className={`flex-1 py-3 rounded-lg font-semibold transition-all
                        ${step2Valid ? "bg-coffee-600 hover:bg-coffee-700 text-white cursor-pointer" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
                    >
                      Continue to Address
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Address */}
              {currentStep === 3 && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="h-6 w-6 text-coffee-600" />
                    <h2 className="text-xl font-semibold text-coffee-900">Delivery Address</h2>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address Label <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={address.label}
                      onChange={e => setAddress({ ...address, label: e.target.value })}
                      className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-transparent transition bg-white cursor-pointer"
                    >
                      <option value="" disabled>Select address type</option>
                      <option value="Residential">Residential</option>
                      <option value="Office">Office</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Search Address
                    </label>
                    <input
                      type="text"
                      ref={inputRef}
                      placeholder="Type to search your location"
                      className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-transparent transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address Details <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows="3"
                      placeholder="House number, street name, building"
                      value={address.details}
                      onChange={e => setAddress({ ...address, details: e.target.value })}
                      className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-transparent transition"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pin Your Location
                    </label>
                    <div className="relative">
                      <div ref={mapRef} className="w-full h-80 rounded-lg border-2 border-coffee-300 shadow-inner"></div>
                      {!mapLoaded && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-600 mx-auto mb-2"></div>
                            <p className="text-sm text-gray-600">Loading map...</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      📍 Drag the marker or click on the map to set your exact location
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="flex-1 py-3 rounded-lg border border-gray-300 font-semibold text-gray-700 hover:bg-gray-50 transition"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      disabled={!step3Valid}
                      onClick={() => setCurrentStep(4)}
                      className={`flex-1 py-3 rounded-lg font-semibold transition-all
                        ${step3Valid ? "bg-coffee-600 hover:bg-coffee-700 text-white cursor-pointer" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
                    >
                      Continue to Terms
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Terms & Submit */}
              {currentStep === 4 && (
                <div className="space-y-4 animate-fadeIn">
                  <h2 className="text-xl font-semibold text-coffee-900 mb-4">Terms & Conditions</h2>
                  
                  <div className="bg-coffee-50 border border-coffee-200 rounded-lg p-4">
                    <button
                      type="button"
                      onClick={() => {
                        setTermsOpen(true);
                        setTermsScrolledToEnd(false);
                      }}
                      className="flex items-center gap-2 text-coffee-700 hover:text-coffee-900 font-semibold transition"
                    >
                      <ScrollText className="h-5 w-5" />
                      <span>Read Terms of Service & Privacy Policy</span>
                    </button>
                    <p className="text-xs text-gray-600 mt-2">
                      {hasReadTerms ? "✓ You have read the terms" : "You must read the terms to continue"}
                    </p>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <input
                      id="agree"
                      type="checkbox"
                      className="mt-1 h-5 w-5 rounded border-gray-300 text-coffee-600 focus:ring-coffee-600 flex-shrink-0 cursor-pointer"
                      checked={agreed}
                      disabled={!hasReadTerms}
                      onChange={(e) => setAgreed(e.target.checked)}
                    />
                    <label htmlFor="agree" className="text-sm text-gray-700 select-none cursor-pointer">
                      I agree to the Terms of Service and Privacy Policy, and confirm that all information provided is accurate.
                    </label>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-start gap-2">
                      <X className="h-5 w-5 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{error}</span>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="flex-1 py-3 rounded-lg border border-gray-300 font-semibold text-gray-700 hover:bg-gray-50 transition"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={!canSubmit}
                      className={`flex-1 py-3 rounded-lg font-semibold transition-all shadow-lg
                        ${canSubmit ? "bg-gradient-to-r from-coffee-600 to-coffee-700 hover:from-coffee-700 hover:to-coffee-800 text-white cursor-pointer transform hover:scale-105" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
                    >
                      Create Account
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Login Link */}
          <p className="text-center text-sm mt-6 text-gray-600">
            Already have an account?{" "}
            <Link className="text-coffee-700 font-semibold hover:underline" to="/login">
              Log In
            </Link>
          </p>
        </div>
      </div>

      {/* Terms Modal */}
      {termsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl flex flex-col max-h-[90vh]">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-coffee-900">Terms of Service & Privacy Policy</h2>
              <button
                onClick={() => setTermsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition"
                aria-label="Close"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div
              ref={scrollRef}
              onScroll={onScrollTerms}
              className="px-6 py-4 overflow-y-auto flex-1"
            >
              <div className="prose prose-sm prose-gray max-w-none">
                <p className="text-gray-700">
                  Welcome to BeanSight. Please read these Terms carefully. By creating an account, you
                  agree to be bound by them.
                </p>

                <h3 className="text-coffee-900 font-bold mt-4">1. Accounts</h3>
                <p className="text-gray-700">You are responsible for maintaining the confidentiality of your account and password.</p>

                <h3 className="text-coffee-900 font-bold mt-4">2. Orders and Payments</h3>
                <p className="text-gray-700">All orders are subject to availability. Prices and fees may change without notice.</p>

                <h3 className="text-coffee-900 font-bold mt-4">3. Privacy</h3>
                <p className="text-gray-700">We collect and process your data according to our Privacy Policy.</p>

                <h3 className="text-coffee-900 font-bold mt-4">4. Security</h3>
                <p className="text-gray-700">Do not share your password. Enable additional security options when available.</p>

                <h3 className="text-coffee-900 font-bold mt-4">5. Termination</h3>
                <p className="text-gray-700">We may suspend or terminate accounts that violate these Terms or applicable laws.</p>

                <h3 className="text-coffee-900 font-bold mt-4">6. Delivery and Pickup</h3>
                <p className="text-gray-700">Estimated delivery/pickup times are provided for convenience only; actual times may vary.
                                      We are not responsible for delays caused by external factors, including traffic or courier issues.</p>

                <h3 className="text-coffee-900 font-bold mt-4">7. Intellectual Property</h3>
                <p className="text-gray-700">All content in the App, including text, images, logos, and designs, is owned by us or our licensors.
You may not copy, modify, distribute, or use the content for commercial purposes without our prior written consent.</p>


                <h3 className="text-coffee-900 font-bold mt-4">8. Privacy</h3>
                <p className="text-gray-700">Your use of the App is subject to our Privacy Policy, which explains how we collect, use, and protect your information.</p>

                <p className="text-gray-700 mt-4 font-medium">By proceeding, you acknowledge reading and understanding these Terms and our Privacy Policy.</p>
               
                <h3 className="text-coffee-900 font-bold mt-4">9. Termination</h3>
                <p className="text-gray-700">We may suspend or terminate your account or access to the App at our discretion, including for violations of these Terms.</p>

                <p className="text-gray-700 mt-4 font-medium">By proceeding, you acknowledge reading and understanding these Terms and our Privacy Policy.</p>
                
                {/* Repeat content for scroll */}
                {[...Array(10)].map((_, i) => (
                  <p key={i} className="text-gray-500 text-sm">
                    Additional terms and conditions content for scrolling...
                  </p>
                ))}

                <div className="h-16" />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <span className={`text-sm font-medium ${termsScrolledToEnd ? "text-green-600" : "text-gray-600"}`}>
                {termsScrolledToEnd ? "✓ Scrolled to end" : "↓ Scroll to end"}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setTermsOpen(false)}
                  className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRead}
                  disabled={!termsScrolledToEnd}
                  className={`px-5 py-2 rounded-lg font-semibold transition
                    ${termsScrolledToEnd ? "bg-coffee-600 hover:bg-coffee-700 text-white cursor-pointer" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
                >
                  I Agree
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
