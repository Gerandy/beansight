import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import logo from "../assets/solacew.png";
import { Handbag } from "lucide-react";
import CartSidebar from "./CartSidebar";
import Login from "./auth/Login";
import { useCart } from "./CartContext";

function Navbar({ menuOpen, setMenuOpen, cartOpen, setCartOpen }) {
  const [isAuthed, setIsAuthed] = useState(!!localStorage.getItem("authToken"));
  const [loginOpen, setLoginOpen] = useState(false);
  const { cart } = useCart();

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

  useEffect(() => {
    if (isAuthed) setLoginOpen(false);
  }, [isAuthed]);

  const firstName = localStorage.getItem("firstName") || "User";

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("firstName");
    setIsAuthed(false);
    window.location.href = "/";
  };

  const handleOrdersClick = (e) => {
    if (!isAuthed) {
      e.preventDefault();
      setLoginOpen(true);
    }
  };

  const cartCount = cart?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;

  return (
    <>
      <nav
        className="fixed top-0 w-full z-40 bg-gradient-to-r from-coffee-700 to-coffee-600 border-b border-white/10 shadow-lg navbar-animate"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link to="/home" className="logo-font text-xl font-bold text-white flex items-center">
              <div className="flex items-center group cursor-pointer">
                <span className="logo-font text-white text-2xl tracking-wide">SOL</span>
                <span className="logo-font text-orange-200 text-2xl mx-1">-</span>
                <span className="logo-font text-orange-200 text-2xl tracking-wide">ACE</span>
              </div>
            </Link>

            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-8">
                <Link
                  to="/"
                  className="font-sans font-bold text-lg text-orange-100 hover:text-white transition-colors relative after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-white after:transition-all after:duration-150 hover:after:w-full"
                >
                  Home
                </Link>

                <Link
                  to="/menu"
                  className="font-sans font-bold text-lg text-orange-100 hover:text-white transition-colors relative after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-white after:transition-all after:duration-150 hover:after:w-full"
                >
                  Menu
                </Link>

                <Link
                  to="/orders"
                  onClick={handleOrdersClick}
                  className="font-sans font-bold text-lg text-orange-100 hover:text-white transition-colors relative after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-white after:transition-all after:duration-150 hover:after:w-full"
                >
                  Orders
                </Link>

                {isAuthed ? (
                  <div className="relative group">
                    <button className="font-sans font-bold text-lg text-orange-100 hover:text-white">
                      Hello, {firstName}!
                    </button>

                    <div className="invisible opacity-0 translate-y-1 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 transition ease-out duration-150 absolute right-0 mt-2 w-52 rounded-md bg-white text-gray-800 shadow-lg ring-1 ring-black/10 py-2 z-50">
                      <Link to="/Myaccount/profile" className="block px-4 py-2 text-sm hover:bg-gray-100">Profile</Link>
                      <Link to="/Myaccount/addresses" className="block px-4 py-2 text-sm hover:bg-gray-100">Addresses</Link>
                      <Link to="/Myaccount/favorites" className="block px-4 py-2 text-sm hover:bg-gray-100">Favorites</Link>
                      <div className="my-2 h-px bg-gray-200" />
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Log out</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-4">
                    <Link
                      to="/signup"
                      className="font-sans font-bold text-lg text-orange-100 hover:text-white transition-colors"
                    >
                      Sign Up
                    </Link>
                    <button
                      type="button"
                      onClick={() => setLoginOpen(true)}
                      className="font-sans font-bold text-lg text-orange-100 hover:text-white transition-colors"
                    >
                      Log In
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => setCartOpen((prev) => !prev)}
                className="relative z-40 hover:scale-110 transition-transform"
                aria-label="Open cart"
              >
                <Handbag className="text-orange-100 h-6 w-6 md:h-8 md:w-8 hover:text-white transition-colors" />
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full px-2">
                  {cartCount}
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

      <CartSidebar cartOpen={cartOpen} setCartOpen={setCartOpen} />
      <Login open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}

export default Navbar;
