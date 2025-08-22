import Navbar from "../Navbar";
import MobileMenu from "../MobileMenu";
import Slider from "../Slider";
import HomeGrid from "../HomeGrid";
import HomeCategories from "../HomeCategories";
import Favorites from "../Favorites";
import HomeFeatured from "../HomeFeatured";
import Footer from "./Footer";


function Home(){ 
  return (
    <div>
      <Navbar />
      <MobileMenu />
      <Slider />
      <HomeGrid />
      <HomeCategories />
      <Favorites />
      <HomeFeatured />
      <Footer />
    </div>
    
  );
};
export default Home