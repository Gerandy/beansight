import Slider from "../Slider";
import HomeGrid from "../HomeGrid";
import HomeCategories from "../HomeCategories";
import Favorites from "../Favorites";
import HomeFeatured from "../HomeFeatured";


function Home(){ 
  return (
    <div>
      <Slider />
      <HomeGrid />
      <HomeCategories />
      <Favorites />
      <HomeFeatured />
    </div>
    
  );
};
export default Home