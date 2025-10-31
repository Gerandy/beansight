import { Link } from "react-router-dom";
import { useEffect } from "react";
import logo from "../assets/ahjinlogo.png";
import { Handbag } from "lucide-react";
import CartSidebar from "./CartSidebar";

function Navbar({ menuOpen, setMenuOpen, cartOpen, setCartOpen }) {
  useEffect(() => {
    // Only lock scroll when menu is open, not cart
    document.body.style.overflow = menuOpen ? "hidden" : "";
  }, [menuOpen]);

  return (
    <>
      <nav className="fixed top-0 w-full z-40 bg-gradient-to-r from-coffee-700 to-coffee-600 border-b border-white/10 shadow-lg navbar-animate">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">

            <Link to="/home" className="font-mono text-xl font-bold text-white">
              <div className="flex items-center group cursor-pointer">
                <img
                  className="h-12 w-12 mr-2 group-hover:scale-105"
                  src={logo}
                  alt="logo"
                />
                <span className="logo-font text-white group-hover:text-orange-200 transition-colors duration-400 mr-1">
                  BEAN
                </span>
                <span className="logo-font text-orange-200 group-hover:text-white transition-colors duration-400">
                  SIGHT
                </span>
              </div>
            </Link>

            {/* RIGHT SIDE: Links + Cart */}
            <div className="flex items-center space-x-4">

              {/* DESKTOP NAV */}
              <div className="hidden md:flex items-center space-x-8">
                <Link
                  to="/"
                  className="font-sans font-bold text-xl relative text-orange-100 hover:text-white transition-colors after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-white after:transition-all after:duration-100 hover:after:w-full"
                >
                  Home
                </Link>
                <Link
                  to="/menu"
                  className="font-sans font-bold text-xl relative text-orange-100 hover:text-white transition-colors after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-white after:transition-all after:duration-100 hover:after:w-full"
                >
                  Menu
                </Link>
                <Link
                  to="/orders"
                  className="font-sans font-bold text-xl relative text-orange-100 hover:text-white transition-colors after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-white after:transition-all after:duration-100 hover:after:w-full"
                >
                  Orders
                </Link>
                <Link
                  to="/Myaccount"
                  className="font-sans font-bold text-xl relative text-orange-100 hover:text-white transition-colors after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-white after:transition-all after:duration-100 hover:after:w-full"
                >
                  MyAccount
                </Link>
              </div>

              {/* 🛒 CART ICON — stays right on all screens */}
              <button
                onClick={() => setCartOpen((prev) => !prev)}
                className="relative z-40 hover:scale-110 transition-transform"
                aria-label="Open cart"
              >
                <Handbag className="text-orange-100 h-6 w-6 md:h-8 md:w-8 hover:text-white transition-colors" />
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full px-2">
                  0
                </span>
              </button>

              <div
                className="w-7 h-5 relative cursor-pointer z-40 md:hidden hover:scale-110"
                onClick={() => setMenuOpen((prev) => !prev)}
              >
                &#9776;
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* 🛒 Cart Sidebar */}
      <CartSidebar cartOpen={cartOpen} setCartOpen={setCartOpen} />
    </>
  );
}

export default Navbar;