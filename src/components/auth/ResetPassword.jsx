import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebase";

export default function ResetPassword({ open, onClose, onBack }) {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError("Failed to send reset email. Please check your email address.");
    }
  };

  if (!open) return null;

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
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-coffee-500 to-coffee-700 flex items-center justify-center shadow-soft-lg">
            <span className="text-white text-3xl font-bold logo-font">B</span>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-4 logo-font">Reset Password</h2>
        <p className="text-gray-600 text-center mb-2 text-sm leading-relaxed px-4">
          Please enter the email address you used to register your Beansight account.
        </p>
        <p className="text-coffee-600 text-center mb-8 text-xs font-medium">
          We'll send you an email with a link to reset your password.
        </p>

        <form onSubmit={handleResetPassword} className="space-y-6">
          {/* Email Input */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2 ml-1">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full bg-gray-50 border-0 px-4 py-4 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-coffee-500 focus:bg-white transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
              Password reset email sent! Check your inbox.
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Reset Password Button */}
          <button
            type="submit"
            disabled={!email}
            className="w-full bg-gray-300 text-gray-500 font-bold py-4 rounded-full transition-all disabled:cursor-not-allowed enabled:bg-gradient-to-r enabled:from-coffee-500 enabled:to-coffee-600 enabled:text-white enabled:hover:from-coffee-600 enabled:hover:to-coffee-700 enabled:shadow-lg enabled:hover:shadow-xl enabled:transform enabled:hover:scale-[1.02] enabled:active:scale-[0.98]"
          >
            Reset Password
          </button>

          {/* Back to Login */}
          <button
            type="button"
            onClick={onBack}
            className="w-full text-gray-900 font-bold py-2 hover:text-coffee-600 transition-colors"
          >
            Back to login
          </button>
        </form>
      </div>
    </div>
  );
}