import React from "react";
import { Link } from "react-router-dom";

function MobileMenu({ menuOpen, setMenuOpen }) {
  return (
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

      <Link
        to="/orders"
        onClick={() => setMenuOpen(false)}
        className={`text-2xl font-semibold text-white my-4 transform transition-transform duration-300
          hover:-translate-y-1.5 hover:shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:text-coffee-100
          ${menuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}
        `}
      >
        Orders
      </Link>

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
    </div>
  );
}

export default MobileMenu;
