import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import { useState } from "react";
import MobileMenu from "./components/MobileMenu";
import Navbar from "./components/Navbar"; 
import Home from "./components/sections/Home";
import Menu from "./components/sections/Menu";
import Myaccount from "./components/sections/Myaccount";
import Myprofile from "./components/Myprofile";
import "./index.css";

function App() {
  const [menuOpen, setMenuOpen] = useState(false); 
  const [cartOpen, setCartOpen] = useState(false);  

  return (
    <Router>
      <Navbar 
        menuOpen={menuOpen} 
        setMenuOpen={setMenuOpen} 
        cartOpen={cartOpen} 
        setCartOpen={setCartOpen} 
      />

      <MobileMenu menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      {/* Page content */}
      <Routes>
        {/* Public pages */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/menu" element={<Menu cartOpen={cartOpen} />} />

        {/* MyAccount parent route */}
        <Route path="/Myaccount" element={<Myaccount />}>
          <Route index element={<Myprofile />} />
          <Route path="profile" element={<Myprofile />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;