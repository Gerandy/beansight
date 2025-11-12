import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import ResetPassword from "./ResetPassword";
import logo from "../../assets/beansight.png";

export default function Login({ open, onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;

      // Get firstName from Firestore
      const docSnap = await getDoc(doc(db, "users", userId));
      const userData = docSnap.exists() ? docSnap.data() : {};

    // Store in localStorage
    localStorage.setItem("authToken", userId);
    localStorage.setItem("firstName", userData.firstName || "");

      onClose(); // close modal
      window.location.reload();
    } catch (err) {
      console.error(err);
      setError(err.message);
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
          <img src={logo} alt="Sol-Ace Cafe logo" className="w-50 h-50 object-contain" />
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-gray-900 text-center logo-font">Welcome back!</h2>
        <p className="text-gray-600 text-center mt-1 mb-6">Sign in to your account.</p>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email Input */}
          <div>
            <input
              type="email"
              placeholder="Email address"
              className="w-full bg-gray-50 border-0 px-4 py-4 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-coffee-500 focus:bg-white transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password Input */}
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
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Forgot Password */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => setShowResetPassword(true)}
              className="text-coffee-600 font-semibold text-sm hover:text-coffee-700"
            >
              Forgot your password?
            </button>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-coffee-500 to-coffee-600 text-white font-bold py-4 rounded-full hover:from-coffee-600 hover:to-coffee-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Log In
          </button>

          {/* Divider */}
          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4 text-sm text-gray-500">OR</span>
            </div>
          </div>

          {/* Guest Button */}
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-white border-2 border-gray-300 text-gray-900 font-bold py-4 rounded-full hover:bg-gray-50 transition-all"
          >
            Continue as guest
          </button>
        </form>
      </div>
    </div>
  );
}
