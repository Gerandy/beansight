import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Login from "./auth/Login";

function MobileMenu({ menuOpen, setMenuOpen }) {
  const [isAuthed, setIsAuthed] = useState(!!localStorage.getItem("authToken"));
  const [loginOpen, setLoginOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Update auth state when route changes
  useEffect(() => {
    setIsAuthed(!!localStorage.getItem("authToken"));
  }, [location.pathname]);

  // Listen for storage events (cross-tab login/logout)
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "authToken") setIsAuthed(!!e.newValue);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setIsAuthed(false);
    setMenuOpen(false);
    navigate("/");
  };

  const handleLoginClick = (e) => {
    e.preventDefault();
    setLoginOpen(true);
  };

  const handleOrdersClick = (e) => {
    e.preventDefault();
    if (!isAuthed) {
      setLoginOpen(true);
    } else {
      setMenuOpen(false);
      navigate("/orders");
    }
  };

  return (
    <>
      <div
        className={`fixed top-0 left-0 w-full bg-coffee-700 z-40 flex flex-col items-center justify-center
          transition-all duration-300 ease-in-out
          ${
            menuOpen
              ? "h-screen opacity-100 pointer-events-auto"
              : "h-0 opacity-0 pointer-events-none"
          }`}
      >

        <button
          onClick={() => setMenuOpen(false)}
          className="absolute top-6 right-6 text-white text-3xl focus:outline-none cursor-pointer hover:scale-110"
          aria-label="Close menu"
        >
          &times;
        </button>

        {/* Navigation Links */}
        <Link
          to="/"
          onClick={() => setMenuOpen(false)}
          className={`text-2xl font-semibold text-white my-4 transform transition-transform duration-300
            hover:-translate-y-1.5 hover:shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:text-coffee-100
            ${menuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}
          `}
        >
          Home
        </Link>

        <Link
          to="/menu"
          onClick={() => setMenuOpen(false)}
          className={`text-2xl font-semibold text-white my-4 transform transition-transform duration-300
            hover:-translate-y-1.5 hover:shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:text-coffee-100
            ${menuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}
          `}
        >
          Menu
        </Link>

        <button
          onClick={handleOrdersClick}
          className={`text-2xl font-semibold text-white my-4 transform transition-transform duration-300
            hover:-translate-y-1.5 hover:shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:text-coffee-100
            ${menuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}
          `}
        >
          Orders
        </button>

        {isAuthed ? (
          <>
            <Link
              to="/Myaccount"
              onClick={() => setMenuOpen(false)}
              className={`text-2xl font-semibold text-white my-4 transform transition-transform duration-300
                hover:-translate-y-1.5 hover:shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:text-coffee-100
                ${menuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}
              `}
            >
              My Account
            </Link>

            <button
              onClick={handleLogout}
              className={`text-2xl font-semibold text-white my-4 transform transition-transform duration-300
                hover:-translate-y-1.5 hover:shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:text-coffee-100
                ${menuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}
              `}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/signup"
              onClick={() => setMenuOpen(false)}
              className={`text-2xl font-semibold text-white my-4 transform transition-transform duration-300
                hover:-translate-y-1.5 hover:shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:text-coffee-100
                ${menuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}
              `}
            >
              Sign Up
            </Link>

            <button
              onClick={handleLoginClick}
              className={`text-2xl font-semibold text-white my-4 transform transition-transform duration-300
                hover:-translate-y-1.5 hover:shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:text-coffee-100
                ${menuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}
              `}
            >
              Log In
            </button>
          </>
        )}
      </div>

      <Login open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}

export default MobileMenu;
