import { useState } from "react";
import "./App.css";

import Navbar from "./components/Navbar";
import  MobileMenu  from "./components/MobileMenu";
import Home from "./components/sections/Home";
import About from "./components/sections/About";
import Projects from "./components/sections/Projects";
import "./index.css";
import Contact from "./components/sections/Contact";
import  Footer  from "./components/sections/Footer";
import Slider from "./components/Slider";

function App() {
  
  const [menuOpen, setMenuOpen] = useState(false);
  const images = ["https://d3bjzufjcawald.cloudfront.net/public/web/2022-08-04/62eb51d93d530/Mcdo_E-Gifts_CAROUSEL-MOBILE-Banner-Refresh_767x455-banner-mobile.jpg"]

  return (
    <>
    
      

        <div>
          
        <Navbar />
        <MobileMenu  />
        <div className="App">
      <Home 
        images={images}
        title="Our Nature Trips"
      />
    </div>
        
        <Projects />
        <About />
        
        
        <Contact />
        <Footer />
        
        
        
        
      </div>
      
    </>
  );
}

export default App;