import React, { useState, useEffect, useRef } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { collection, query, where, onSnapshot, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { getAuth, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from "firebase/auth";

export default function StaffLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [newOrderCount, setNewOrderCount] = useState(0);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const location = useLocation();
  const prevCountRef = useRef(newOrderCount);
  const audioRef = useRef(null);
  const navigate = useNavigate();
   const [currentPassword, setCurrentPassword] = useState("");
   const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirm password do not match.");
      return;
    }

    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      setPasswordError("No user logged in.");
      return;
    }

    try {
      // Re-authenticate
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);

      setPasswordSuccess("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordModal(false);
    } catch (err) {
      console.error(err);
      setPasswordError(err.message || "Failed to change password.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("firstName");
    navigate("/");
  };

  useEffect(() => {
    const q = query(
      collection(db, "orders"),
      where("status", "==", "Pending")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNewOrderCount(snapshot.size);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (newOrderCount > prevCountRef.current) {
      audioRef.current?.play();
    }
    prevCountRef.current = newOrderCount;
  }, [newOrderCount]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  return (
    <div className="min-h-screen bg-coffee-50 text-coffee-900 font-inter">
      <audio ref={audioRef} src="/sounds/new-order.mp3" preload="auto" />

      {/* Header */}
      <header className="bg-gradient-to-r from-coffee-700 to-coffee-600 text-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo + Hamburger */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden cursor-pointer p-2 rounded-md hover:bg-white/10 transition"
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>

              {/* Logo */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-md bg-white/10 flex items-center justify-center text-lg sm:text-xl">
                  ☕
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-base sm:text-lg font-semibold leading-none">Staff POS</h1>
                  <p className="text-xs text-white/80">Sol-Ace</p>
                </div>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-3 lg:gap-4">
                {["POS", "Online Orders", "Products",  "History"].map((label, idx) => (
                  <NavLink
                    key={label}
                    to={`/staff/${label.toLowerCase().replace(" ", "-")}`}
                    className={({ isActive }) =>
                      `relative flex items-center gap-2 px-2 lg:px-3 py-2 rounded-md transition-colors text-xs lg:text-sm font-medium ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "text-white/80 hover:text-white hover:bg-white/10"
                      }`
                    }
                  >
                    <span className="opacity-90">
                      {idx === 0 && (
                        <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h18v6H3zM3 9v11a2 2 0 002 2h14a2 2 0 002-2V9" />
                        </svg>
                      )}
                      {idx === 1 && (
                        <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7h18M5 7v10a2 2 0 002 2h10a2 2 0 002-2V7M8 3h8l1 4H7l1-4z" />
                        </svg>
                      )}
                      {idx === 2 && (
                        <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7l9-4 9 4v10l-9 4-9-4V7z" />
                        </svg>
                      )}
                      {idx === 3 && (
                        <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      )}
                      {idx === 4 && (
                        <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      )}
                    </span>
                    <span className="relative flex items-center gap-1">
                      {label}
                      {label === "Online Orders" && newOrderCount > 0 && (
                        <span className="absolute -top-2 -right-3 flex items-center justify-center text-[10px] font-bold text-white bg-red-500 rounded-full w-4 h-4 animate-pulse">
                          {newOrderCount}
                        </span>
                      )}
                    </span>
                  </NavLink>
                ))}
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden sm:flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs sm:text-sm font-medium">{localStorage.getItem("firstName")}</p>
                  <p className="text-[10px] sm:text-xs text-white/80">Staff/Barista</p>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setMobileOpen((v) => !v)}
                    className="cursor-pointer w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/10 flex items-center justify-center text-xs sm:text-sm font-semibold hover:bg-white/20 transition"
                  >
                    {localStorage.getItem("firstName").slice(0,1)}
                  </button>
                  <div
                    className={`origin-top-right absolute right-0 mt-2 w-40 rounded-md bg-white text-coffee-900 shadow-lg ring-1 ring-black ring-opacity-5 transform transition-all ${
                      mobileOpen ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"
                    }`}
                    style={{ zIndex: 50 }}
                  >
                    <div className="py-1">
                      <button
                        className="cursor-pointer w-full text-left px-4 py-2 text-sm text-coffee-700 hover:bg-coffee-50"
                        onClick={() => setShowPasswordModal(true)}
                      >
                        Change Password
                      </button>
                      <button className="cursor-pointer w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-coffee-50"
                      onClick={() => handleLogout()}>
                        
                        Logout
                      </button>
                    </div> 
                  </div>
                </div>
              </div>

              {/* Mobile User Icon */}
              <button
                onClick={() => setMobileOpen((v) => !v)}
                className="sm:hidden cursor-pointer w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-semibold hover:bg-white/20 transition"
              >
                JD
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      <div
        className={`md:hidden fixed inset-0 bg-black/50 z-30 transition-opacity ${
          mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileMenuOpen(false)}
      >
        <div
          className={`bg-white w-64 h-full shadow-xl transform transition-transform ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold text-coffee-800">Menu</h2>
          </div>
          <div className="p-3 space-y-1">
            {["POS", "Online Orders", "Products",  "History"].map((label) => (
              <NavLink
                key={label}
                to={`/staff/${label.toLowerCase().replace(" ", "-")}`}
                className={({ isActive }) =>
                  `relative flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-coffee-100 text-coffee-800"
                      : "text-coffee-700 hover:bg-coffee-50"
                  }`
                }
              >
                {label}
                {label === "Online Orders" && newOrderCount > 0 && (
                  <span className="ml-auto flex items-center justify-center text-xs font-bold text-white bg-red-500 rounded-full w-5 h-5">
                    {newOrderCount}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      </div>

      {/* Page Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-6">
        <div className="rounded-lg">
          <Outlet />
        </div>
      </main>

      {/* Change Password Modal */}
       {/* Change Password Modal */}
      {showPasswordModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-sm">
      <h2 className="text-base sm:text-lg font-semibold mb-4">Change Password</h2>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setPasswordError("");
          setPasswordSuccess("");

          if (newPassword !== confirmPassword) {
            setPasswordError("New password and confirm password do not match.");
            return;
          }

          try {
            // Example: find staff document by email
            const staffQuery = query(
              collection(db, "staff"),
              where("email", "==", email)
            );
            const snapshot = await getDocs(staffQuery);

            if (snapshot.empty) {
              setPasswordError("Email not found.");
              return;
            }

            const staffDoc = snapshot.docs[0];
            const staffData = staffDoc.data();

            if (staffData.password !== currentPassword) {
              setPasswordError("Current password is incorrect.");
              return;
            }

            // Update password in Firestore
            await updateDoc(staffDoc.ref, { password: newPassword });

            setPasswordSuccess("Password updated successfully!");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setEmail("");
            setShowPasswordModal(false);
          } catch (err) {
            console.error(err);
            setPasswordError(err.message || "Failed to change password.");
          }
        }}
      >
        <div className="mb-3">
          <label className="block text-xs sm:text-sm mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
            required
          />
        </div>

        <div className="mb-3">
          <label className="block text-xs sm:text-sm mb-1">Current Password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
            required
          />
        </div>

        <div className="mb-3">
          <label className="block text-xs sm:text-sm mb-1">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-xs sm:text-sm mb-1">Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
            required
          />
        </div>

        {passwordError && <p className="text-red-500 text-sm mb-2">{passwordError}</p>}
        {passwordSuccess && <p className="text-green-500 text-sm mb-2">{passwordSuccess}</p>}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="cursor-pointer px-3 sm:px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-sm"
            onClick={() => setShowPasswordModal(false)}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="cursor-pointer px-3 sm:px-4 py-2 rounded bg-coffee-700 text-white hover:bg-coffee-800 text-sm"
          >
            Change
          </button>
        </div>
      </form>
    </div>
  </div>
      )}
  
    </div>
  );
}