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

  const firstName = localStorage.getItem("firstName") || "User";

  useEffect(() => {
    setIsAuthed(!!localStorage.getItem("authToken"));
  }, [location.pathname]);

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
              <img className="h-65 w-65 mr-1" src={logo} alt="logo" />
            </Link>

            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-8">
                <Link to="/" className="text-orange-100 hover:text-white">Home</Link>
                <Link to="/menu" className="text-orange-100 hover:text-white">Menu</Link>
                <Link to="/orders" onClick={handleOrdersClick} className="text-orange-100 hover:text-white">Orders</Link>

                {isAuthed ? (
                  <div className="relative group">
                    <span className="text-orange-100 font-bold">Hello, {firstName}!</span>

                    <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition absolute right-0 mt-2 w-52 bg-white text-gray-800 shadow-lg py-2 rounded-md z-50">
                      <Link to="/Myaccount/profile" className="block px-4 py-2 hover:bg-gray-100">Profile</Link>
                      <Link to="/Myaccount/addresses" className="block px-4 py-2 hover:bg-gray-100">Addresses</Link>
                      <Link to="/Myaccount/favorites" className="block px-4 py-2 hover:bg-gray-100">Favorites</Link>
                      <div className="my-2 h-px bg-gray-200" />
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50">Log out</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-4">
                    <Link to="/signup" className="text-orange-100 hover:text-white">Sign Up</Link>
                    <button onClick={() => setLoginOpen(true)} className="text-orange-100 hover:text-white">Log In</button>
                  </div>
                )}
              </div>

              <button onClick={() => setCartOpen((prev) => !prev)} className="relative z-40">
                <Handbag className="text-orange-100 h-6 w-6 hover:text-white" />
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full px-2">{cartCount}</span>
              </button>

              <div className="md:hidden cursor-pointer" onClick={() => setMenuOpen((prev) => !prev)}>&#9776;</div>
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
