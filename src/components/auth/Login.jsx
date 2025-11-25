import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword, signInWithPhoneNumber, RecaptchaVerifier } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import ResetPassword from "./ResetPassword";
import logo from "../../assets/beansight.png";

export default function Login({ open, onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);

  const navigate = useNavigate();

 const auth = getAuth();
  

  // Initialize invisible reCAPTCHA
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
    // It's good practice to ensure the settings object exists, though it should by default.
    if (auth && !auth.settings) {
      auth.settings = {}; // Initialize if somehow undefined (rare)
    }
    auth.settings.appVerificationDisabledForTesting = true;
  }
  if (!window.recaptchaVerifier) {
    // The element must exist in DOM
    const container = document.getElementById("recaptcha-container");
    if (!container) return; // prevent undefined

    window.recaptchaVerifier = new RecaptchaVerifier(auth, container, {
      size: "invisible", // or "normal"
      callback: (response) => {
        console.log("reCAPTCHA solved", response);
      },
    });

    window.recaptchaVerifier.render().catch(err => console.error(err));
  }
}, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Sign in with email/password first
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;

      // Fetch user data
      const docSnap = await getDoc(doc(db, "users", userId));
      const userData = docSnap.exists() ? docSnap.data() : {};

      if (userData.role === "client") {
        // Client: login directly
        localStorage.setItem("authToken", userId);
        localStorage.setItem("firstName", userData?.firstName || "");
        localStorage.setItem("favorites", JSON.stringify(userData?.favorites || []));
        onClose();
        window.location.reload();
      } else if (userData.role === "staff" || userData.role === "admin") {
        // Staff/Admin: OTP verification
        if (!userData.contactNumber) throw new Error("No phone number found for OTP.");
        const phoneNumber = "+63" + userData.contactNumber.slice(1); // Convert to +63 format
        const appVerifier = window.recaptchaVerifier;
        console.log(phoneNumber)

        const result = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
        setConfirmationResult(result);
        setOtpSent(true);
      } else {
        throw new Error("User role not recognized.");
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");

    if (!confirmationResult) return setError("No OTP request found.");

    try {
      const result = await confirmationResult.confirm(otpCode);
      const userId = result.user.uid;

      const docSnap = await getDoc(doc(db, "users", userId));
      const userData = docSnap.exists() ? docSnap.data() : {};

      localStorage.setItem("authToken", userId);
      localStorage.setItem("firstName", userData?.firstName || "");
      localStorage.setItem("favorites", JSON.stringify(userData?.favorites || []));
      onClose();
      window.location.reload();
    } catch (err) {
      console.error(err);
      setError("Invalid OTP code.");
    }
  };

  if (!open) return null;

  if (showResetPassword) {
    return (
      <ResetPassword
        open={true}
        onClose={() => setShowResetPassword(false)}
        onBack={() => setShowResetPassword(false)}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fadeIn">
      <div
        className="bg-white rounded-3xl p-8 w-full max-w-md shadow-soft-xl relative animate-slideUp"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full border-2 border-gray-800 flex items-center justify-center hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Logo */}
        <div className="flex justify-center mb-0">
          <img src={logo} alt="Beansight Logo" className="w-50 h-50 object-contain" />
        </div>

        <h2 className="text-3xl font-bold text-gray-900 text-center logo-font">Welcome back!</h2>
        <p className="text-gray-600 text-center mt-1 mb-6">Sign in to your account.</p>

        {!otpSent ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="Email address"
              className="w-full bg-gray-50 border-0 px-4 py-4 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-coffee-500 focus:bg-white transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full bg-gray-50 border-0 px-4 py-4 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-coffee-500 focus:bg-white transition-all pr-12"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">{error}</div>}

            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowResetPassword(true)}
                className="text-coffee-600 font-semibold text-sm hover:text-coffee-700"
              >
                Forgot your password?
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-coffee-500 to-coffee-600 text-white font-bold py-4 rounded-full hover:from-coffee-600 hover:to-coffee-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Log In
            </button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-sm text-gray-500">OR</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => { localStorage.setItem("authToken", "guest"); onClose(); window.location.reload(); }}
              className="w-full bg-white border-2 border-gray-300 text-gray-900 font-bold py-4 rounded-full hover:bg-gray-50 transition-all"
            >
              Continue as guest
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <input
              type="text"
              placeholder="Enter OTP code"
              className="w-full bg-gray-50 border-0 px-4 py-4 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-coffee-500 focus:bg-white transition-all"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              required
            />
            {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">{error}</div>}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-coffee-500 to-coffee-600 text-white font-bold py-4 rounded-full hover:from-coffee-600 hover:to-coffee-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Verify OTP
            </button>
          </form>
        )}
      </div>
      <div id="recaptcha-container"></div>
    </div>
  );
}
