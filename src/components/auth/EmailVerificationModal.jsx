import React, { useState } from "react";
import { auth } from "../../firebase";

export default function EmailVerificationModal({ email, onClose }) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResend = async () => {
    setLoading(true);
    setMessage("");
    try {
      const user = auth.currentUser;
      if (user) {
        await user.sendEmailVerification();
        setMessage("Verification email resent! Please check your inbox.");
      } else {
        setMessage("User not found. Please try logging in again.");
      }
    } catch (err) {
      console.error(err);
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
        <h2 className="text-xl font-bold text-coffee-800">Email Not Verified</h2>
        <p className="text-gray-700 text-sm">
          Your account with <span className="font-semibold">{email}</span> is not yet verified.
          Please check your inbox for the verification email.
        </p>
        {message && <p className="text-green-600 text-sm">{message}</p>}

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
          <button
            onClick={handleResend}
            disabled={loading}
            className={`px-4 py-2 rounded-lg text-white font-semibold transition ${
              loading ? "bg-coffee-300 cursor-not-allowed" : "bg-coffee-600 hover:bg-coffee-700"
            }`}
          >
            {loading ? "Sending..." : "Resend Verification"}
          </button>
        </div>
      </div>
    </div>
  );
}
