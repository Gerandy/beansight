import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Home, Menu as MenuIcon, ShoppingBag, User, LogOut, UserPlus, LogIn, X } from "lucide-react";
import Login from "./auth/Login";

function MobileMenu({ menuOpen, setMenuOpen }) {
  const [isAuthed, setIsAuthed] = useState(!!localStorage.getItem("authToken"));
  const [loginOpen, setLoginOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsAuthed(!!localStorage.getItem("authToken"));
  }, [location.pathname]);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "authToken") setIsAuthed(!!e.newValue);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [menuOpen]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("firstName");
    setIsAuthed(false);
    setMenuOpen(false);
    navigate("/");
  };

  const handleLoginClick = (e) => {
    e.preventDefault();
    setLoginOpen(true);
    setMenuOpen(false);
  };

  const handleOrdersClick = (e) => {
    e.preventDefault();
    if (!isAuthed) {
      setLoginOpen(true);
      setMenuOpen(false);
    } else {
      setMenuOpen(false);
      navigate("/orders");
    }
  };

  const isActive = (path) => {
    return location.pathname === path || 
           (path === "/Myaccount" && location.pathname.startsWith("/Myaccount"));
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 lg:hidden
          ${menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setMenuOpen(false)}
      />

      {/* Slide-in Menu Panel */}
      <div
        className={`fixed top-0 right-0 h-screen w-[75%] sm:w-[320px] bg-gradient-to-br from-coffee-800 to-coffee-900 z-50 
          shadow-2xl transform transition-transform duration-300 ease-out lg:hidden
          ${menuOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-coffee-700/50">
          <h2 className="text-xl sm:text-2xl font-bold text-white">Menu</h2>
          <button
            onClick={() => setMenuOpen(false)}
            className="text-white hover:bg-coffee-700 rounded-full p-2 transition-colors active:scale-95"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        {/* User Info Section */}
        {isAuthed && (
          <div className="px-4 sm:px-6 py-3 sm:py-4 bg-coffee-700/30 border-b border-coffee-700/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-coffee-600 flex items-center justify-center flex-shrink-0">
                <User size={20} className="text-white sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-white font-semibold text-sm sm:text-base truncate">
                  Hello, {localStorage.getItem("firstName") || "User"}!
                </p>
                <p className="text-coffee-300 text-xs sm:text-sm">Welcome back</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex flex-col p-3 sm:p-4 space-y-1 overflow-y-auto" 
             style={{ maxHeight: isAuthed ? 'calc(100vh - 220px)' : 'calc(100vh - 140px)' }}>
          
          <Link
            to="/"
            onClick={() => setMenuOpen(false)}
            className={`flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg
              transition-all duration-200 group active:scale-95
              ${isActive("/") 
                ? "bg-coffee-600 text-white" 
                : "text-white hover:bg-coffee-700/50"}`}
          >
            <Home size={20} className="group-hover:scale-110 transition-transform flex-shrink-0" />
            <span className="text-base sm:text-lg font-medium">Home</span>
          </Link>

          <Link
            to="/menu"
            onClick={() => setMenuOpen(false)}
            className={`flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg
              transition-all duration-200 group active:scale-95
              ${isActive("/menu") 
                ? "bg-coffee-600 text-white" 
                : "text-white hover:bg-coffee-700/50"}`}
          >
            <MenuIcon size={20} className="group-hover:scale-110 transition-transform flex-shrink-0" />
            <span className="text-base sm:text-lg font-medium">Menu</span>
          </Link>

          <button
            onClick={handleOrdersClick}
            className={`flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg
              transition-all duration-200 group text-left w-full active:scale-95
              ${isActive("/orders") 
                ? "bg-coffee-600 text-white" 
                : "text-white hover:bg-coffee-700/50"}`}
          >
            <ShoppingBag size={20} className="group-hover:scale-110 transition-transform flex-shrink-0" />
            <span className="text-base sm:text-lg font-medium">Orders</span>
          </button>

          {isAuthed && (
            <Link
              to="/Myaccount"
              onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg
                transition-all duration-200 group active:scale-95
                ${isActive("/Myaccount") 
                  ? "bg-coffee-600 text-white" 
                  : "text-white hover:bg-coffee-700/50"}`}
            >
              <User size={20} className="group-hover:scale-110 transition-transform flex-shrink-0" />
              <span className="text-base sm:text-lg font-medium">My Account</span>
            </Link>
          )}

          <div className="border-t border-coffee-700/50 my-2"></div>

          {isAuthed ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg 
                text-red-300 hover:bg-red-500/20 transition-all duration-200 group text-left w-full active:scale-95"
            >
              <LogOut size={20} className="group-hover:scale-110 transition-transform flex-shrink-0" />
              <span className="text-base sm:text-lg font-medium">Logout</span>
            </button>
          ) : (
            <>
              <Link
                to="/signup"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg 
                  text-white hover:bg-coffee-700/50 transition-all duration-200 group active:scale-95"
              >
                <UserPlus size={20} className="group-hover:scale-110 transition-transform flex-shrink-0" />
                <span className="text-base sm:text-lg font-medium">Sign Up</span>
              </Link>

              <button
                onClick={handleLoginClick}
                className="flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg 
                  bg-coffee-600 text-white hover:bg-coffee-500 transition-all duration-200 group text-left w-full active:scale-95"
              >
                <LogIn size={20} className="group-hover:scale-110 transition-transform flex-shrink-0" />
                <span className="text-base sm:text-lg font-medium">Log In</span>
              </button>
            </>
          )}
        </nav>
      </div>

      <Login open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}

export default MobileMenu;
