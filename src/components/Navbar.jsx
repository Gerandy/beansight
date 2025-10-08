import { Link } from "react-router-dom";
import { useEffect } from "react"
import logo from "../assets/ahjinlogo.png"
import cartLogo from "../assets/ahjinlogo.png"
import CartSidebar from "./CartSidebar";

function Navbar({menuOpen, setMenuOpen, cartOpen, setCartOpen}) {

    useEffect(() => {
      document.body.style.overflow = menuOpen ? "hidden" : "";
    }, [menuOpen]);

    return(
        <>
        <nav className="fixed top-0 w-full z-40 bg-yellow-950 border-b border-white/10 shadow-lg" >
          <div className="max-w-5xl mx-auto px-4">
            <div className="flex justify-between items-center h-16">

                {/*Logo*/}
                <a href="#home" className="font-mono text-xl font-bold text-white">
                    {" "}
                    <div className="flex justify-between items-center">
                        <div className="flex items-center group cursor-pointer">
                          <img className="h-12 w-12 mr-2 group-hover:scale-105" src={logo} alt="logo" />
                          <span className="text-zinc-900 group-hover:text-orange-200 transition-colors duration-400 group-hover:scale-105 mr-1">Solace</span>
                          <span className="text-orange-200  group-hover:text-zinc-900 transition-colors duration-400 group-hover:scale-105">.Cafe</span>
                        </div>
                    </div>                
                </a>
                <div className="w-7 h5 relative cursor-pointer z-40 md:hidden hover:scale-110" onClick={() => setMenuOpen((prev) => !prev)}>
                  &#9776;
                </div>

                <div className="hidden md:flex items-center space-x-8">
                  <Link to="/" className="font-sans font-bold text-xl relative text-orange-100 hover:text-zinc-500 transition-colors hover:scale-110 after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-zinc-500 after:transition-all after:duration-100 hover:after:w-full">
                    Home
                  </Link>
                  <Link to="/menu" className="font-sans font-bold text-xl relative text-orange-100 hover:text-zinc-500 transition-colors hover:scale-110 after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-zinc-500 after:transition-all after:duration-100 hover:after:w-full">
                    Menu
                  </Link>
                  <Link to="/orders" className="font-sans font-bold text-xl relative text-orange-100 hover:text-zinc-500 transition-colors hover:scale-110 after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-zinc-500 after:transition-all after:duration-100 hover:after:w-full">
                    Orders
                  </Link>

                  {/*MyAccount*/}
                  <div className="relative group inline-block">
                      <Link to="/Myaccount" className="font-sans font-bold text-xl relative text-orange-100 hover:text-zinc-500 transition-colors hover:scale-110 after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-zinc-500 after:transition-all after:duration-100 hover:after:w-full">
                        MyAccount
                      </Link>
                      <div className="absolute hidden group-hover:block bg-white shadow-lg rounded-md top-full w-52 right-0">
                        <ul className="flex flex-col text-gray-700">
                          <li>
                            <Link to="/profile" className="px-4 py-2 hover:bg-gray-100 block">
                              My Profile
                            </Link>
                          </li>
                          <li>
                            <Link to="/addresses" className="px-4 py-2 hover:bg-gray-100 block">
                              My Addresses
                            </Link>
                          </li>
                          <li>
                            <Link to="/contact" className="px-4 py-2 hover:bg-gray-100 block">
                              My Contact Numbers
                            </Link>
                          </li>
                          <li>
                            <Link to="/coupons" className="px-4 py-2 hover:bg-gray-100 block">
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
                  >
                    <img src={cartLogo} alt="Cart" className="h-8 w-8 hover:scale-110 transition-transform" />
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