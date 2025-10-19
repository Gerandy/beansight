import Slider from "../home/Slider";
import HomeGrid from "../home/HomeGrid";
import HomeCategories from "../home/HomeCategories";
import HomeFavorites from "../home/HomeFavorites";
import HomeFeatured from "../home/HomeFeatured";


function Home(){ 
  return (
    <div>
      <Slider />
      <HomeGrid />
      <HomeCategories />
      <HomeFavorites />
      <HomeFeatured />
    </div>
    
  );
};
export default Home