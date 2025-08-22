import { Link } from "react-router-dom";
import { useEffect } from "react"
import logo from "../assets/ahjinlogo.png"


function Navbar({menuOpen, setMenuOpen}){

  useEffect(() => {
     document.body.style.overflow = menuOpen ? "hidden" : ""
  }, [menuOpen])

    return(
      
        <nav className="fixed top-0 w-full z-40 bg-yellow-950 border-b border-white/10 shadow-lg" >
          <div className="max-w-5xl mx-auto px-4">
            <div className="flex justify-between items-center h-16">
                <a href="#home" className="font-mono text-xl font-bold text-white">
                    {" "}
                    <div className="flex justify-between items-center">
                        <div className="flex items-center group cursor-pointer">
                          <img className="h-12 w-12 mr-2 group-hover:scale-105" src={logo} alt="logo" />
                          <span className="text-zinc-900 group-hover:text-purple-500 transition-colors duration-400 group-hover:scale-105 mr-1">Ahjin</span>
                          <span className="text-purple-500 group-hover:text-zinc-900 transition-colors duration-400 group-hover:scale-105">.guild</span>
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
                  <Link to="/account" className="font-sans font-bold text-xl relative text-orange-100 hover:text-zinc-500 transition-colors hover:scale-110 after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-zinc-500 after:transition-all after:duration-100 hover:after:w-full">
                    MyAccount
                  </Link>
                </div>
            </div>
          </div>
        </nav>
        
    ) 
}
export default Navbar