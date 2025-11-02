import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import logo from "../assets/ahjinlogo.png";
import { Handbag } from "lucide-react";
import CartSidebar from "./CartSidebar";
import Login from "./auth/Login";

function Navbar({ menuOpen, setMenuOpen, cartOpen, setCartOpen }) {
  const [isAuthed, setIsAuthed] = useState(!!localStorage.getItem("authToken"));
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
  }, [menuOpen]);

  const location = useLocation();
  // Re-check auth on route changes
  useEffect(() => {
    setIsAuthed(!!localStorage.getItem("authToken"));
  }, [location.pathname]);

  // Also react to auth changes from other tabs
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "authToken") setIsAuthed(!!e.newValue);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Close login modal once authenticated
  useEffect(() => {
    if (isAuthed) setLoginOpen(false);
  }, [isAuthed]);

  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setIsAuthed(false);
    navigate("/");
  };

  const handleOrdersClick = (e) => {
    if (!isAuthed) {
      e.preventDefault();
      setLoginOpen(true);
    }
  };

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
                  onClick={handleOrdersClick}
                  className="font-sans font-bold text-xl relative text-orange-100 hover:text-white transition-colors after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-white after:transition-all after:duration-100 hover:after:w-full"
                >
                  Orders
                </Link>

                {/* Auth-aware area */}
                {isAuthed ? (
                  // MyAccount dropdown (only when logged in)
                  <div className="relative group">
                    <Link
                      to="/Myaccount"
                      className="font-sans font-bold text-xl relative text-orange-100 hover:text-white transition-colors after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-white after:transition-all after:duration-100 group-hover:after:w-full"
                    >
                      MyAccount
                    </Link>

                    <div className="invisible opacity-0 translate-y-1 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 transition ease-out duration-150 absolute right-0 mt-2 w-52 rounded-md bg-white text-gray-800 shadow-lg ring-1 ring-black/10 py-2 z-50">
                      <Link
                        to="/Myaccount/profile"
                        className="block px-4 py-2 text-sm hover:bg-gray-100"
                      >
                        Profile
                      </Link>
                      <Link
                        to="/Myaccount/addresses"
                        className="block px-4 py-2 text-sm hover:bg-gray-100"
                      >
                        Addresses
                      </Link>
                      <Link
                        to="/Myaccount/contacts"
                        className="block px-4 py-2 text-sm hover:bg-gray-100"
                      >
                        Contacts
                      </Link>
                      <Link
                        to="/Myaccount/favorites"
                        className="block px-4 py-2 text-sm hover:bg-gray-100"
                      >
                        Favorites
                      </Link>
                      <div className="my-2 h-px bg-gray-200" />
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Log out
                      </button>
                    </div>
                  </div>
                ) : (
                  // Sign Up | Log In (modal)
                  <div className="flex items-center space-x-4">
                    <Link
                      to="/signup"
                      className="font-sans font-bold text-xl relative text-orange-100 hover:text-white transition-colors after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-white after:transition-all after:duration-100 hover:after:w-full"
                    >
                      Sign Up
                    </Link>
                    <span className="text-orange-200/60 select-none">|</span>
                    <button
                      type="button"
                      onClick={() => setLoginOpen(true)}
                      className="font-sans font-bold text-xl relative text-orange-100 hover:text-white transition-colors after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-white after:transition-all after:duration-100 hover:after:w-full"
                    >
                      Log In
                    </button>
                  </div>
                )}
              </div>

              {/* 🛒 CART ICON */}
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

      {/* 🔐 Login Modal */}
      <Login open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}

export default Navbar;