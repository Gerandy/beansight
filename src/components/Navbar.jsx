import { Link } from "react-router-dom";
import { useEffect } from "react"
import logo from "../assets/ahjinlogo.png"
import {Handbag} from "lucide-react";
import CartSidebar from "./CartSidebar";

function Navbar({menuOpen, setMenuOpen, cartOpen, setCartOpen}) {

    useEffect(() => {
      document.body.style.overflow = menuOpen ? "hidden" : "";
    }, [menuOpen]);

    return(
        <>
        <nav className="fixed top-0 w-full z-40 bg-gradient-to-r from-coffee-700 to-coffee-600 border-b border-white/10 shadow-lg navbar-animate">
          <div className="max-w-5xl mx-auto px-4">
            <div className="flex justify-between items-center h-16">

                {/*Logo*/}
                <a href="#home" className="font-mono text-xl font-bold text-white">
                    {" "}
                    <div className="flex justify-between items-center">
                        <div className="flex items-center group cursor-pointer">
                          <img className="h-12 w-12 mr-2 group-hover:scale-105" src={logo} alt="logo" />
                          <span className="logo-font text-white group-hover:text-orange-200 transition-colors duration-400 group-hover:scale-100 mr-1">BEAN</span>
                          <span className="logo-font text-orange-200  group-hover:text-white transition-colors duration-400 group-hover:scale-100">SIGHT</span>
                        </div>
                    </div>                
                </a>
                <div className="w-7 h5 relative cursor-pointer z-40 md:hidden hover:scale-110" onClick={() => setMenuOpen((prev) => !prev)}>
                  &#9776;
                </div>

                <div className="hidden md:flex items-center space-x-8">
                  <Link to="/" className="font-sans font-bold text-xl relative text-orange-100 hover:text-white transition-colors hover:scale-100 after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-white after:transition-all after:duration-100 hover:after:w-full">
                    Home
                  </Link>
                  <Link to="/menu" className="font-sans font-bold text-xl relative text-orange-100 hover:text-white transition-colors hover:scale-100 after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-white after:transition-all after:duration-100 hover:after:w-full">
                    Menu
                  </Link>
                  <Link to="/orders" className="font-sans font-bold text-xl relative text-orange-100 hover:text-white transition-colors hover:scale-100 after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-white after:transition-all after:duration-100 hover:after:w-full">
                    Orders
                  </Link>

                  {/*MyAccount*/}
                  <div className="relative group inline-block">
                      <Link to="/Myaccount" className="font-sans font-bold text-xl relative text-orange-100 hover:text-white transition-colors hover:scale-100 after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-white after:transition-all after:duration-100 hover:after:w-full">
                        MyAccount
                      </Link>
                      <div className="absolute hidden group-hover:block bg-white shadow-lg rounded-md top-full w-52 right-0">
                        <ul className="flex flex-col text-gray-700">
                          <li>
                            <Link to="/Myaccount/profile" className="px-4 py-2 hover:bg-gray-100 block">
                              My Profile
                            </Link>
                          </li>
                          <li>
                            <Link to="/Myaccount/addresses" className="px-4 py-2 hover:bg-gray-100 block">
                              My Addresses
                            </Link>
                          </li>
                          <li>
                            <Link to="/Myaccount/contacts" className="px-4 py-2 hover:bg-gray-100 block">
                              My Contact Numbers
                            </Link>
                          </li>
                          <li>
                            <Link to="/Myaccount/coupons" className="px-4 py-2 hover:bg-gray-100 block">
                              Coupons
                            </Link>
                          </li>
                          <li>
                            <Link to="/logout" className="px-4 py-2 hover:bg-gray-100 block">
                              Logout
                            </Link>
                          </li>
                        </ul>
                      </div>
                  </div>
                  <button
                    onClick={() => setCartOpen((prev) => !prev)}
                    className="relative"
                    aria-label="Open cart"
                  >
                    <Handbag className="text-orange-100 h-8 w-8 hover:text-white hover:scale-105 transition-transform hover:cursor-pointer" />
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full px-2">
                      0
                    </span>
                  </button>
                </div>
            </div>
          </div>
        </nav>
        <CartSidebar cartOpen={cartOpen} />
      </>      
    ) 
}
export default Navbar