import MenuCategories from "../MenuCategories";
import Navbar from "../Navbar";
import Footer from "./Footer";
import MenuGrid from "../MenuGrid";

function Menu() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <MenuCategories />
      <MenuGrid />
      <Footer />
    </div>
  );
}

export default Menu;