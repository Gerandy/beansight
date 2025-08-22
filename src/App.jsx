import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import { useState } from "react";
import  MobileMenu  from "./components/MobileMenu";
import Home from "./components/sections/Home";
import Menu from "./components/sections/Menu";
import "./index.css";


function App() {
  
  const [menuOpen, setMenuOpen] = useState(false);
  const images = ["https://d3bjzufjcawald.cloudfront.net/public/web/2022-08-04/62eb51d93d530/Mcdo_E-Gifts_CAROUSEL-MOBILE-Banner-Refresh_767x455-banner-mobile.jpg"]

  return (
    <Router>
      <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/menu" element={<Menu />} />
      </Routes>
    </Router>
  );
}

export default App;