import { useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";

export default function Login({ open, onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

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

    // Refresh page so Navbar and Home screen update
    window.location.reload();
  } catch (err) {
    console.error(err);
    setError(err.message);
  }
};

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-coffee-800 mb-4">Log In</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-coffee-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-coffee-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-coffee-600 text-white hover:bg-coffee-700"
              
            >
              Log In
              
            </button>
            
          </div>
        </form>
      </div>
    </div>
  );
}
