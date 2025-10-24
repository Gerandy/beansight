import React, { useEffect } from "react";
import Slider from "../home/Slider";
import HomeGrid from "../home/HomeGrid";
import HomeCategories from "../home/HomeCategories";
import HomeFavorites from "../home/HomeFavorites";
import HomeFeatured from "../home/HomeFeatured";
import "../../index.css"; 

function Home() {
  useEffect(() => {
    const revealElements = document.querySelectorAll(".reveal");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          } else {
            entry.target.classList.remove("visible"); 
          }
        });
      },
      { threshold: 0.15 }
    );

    revealElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div>
      <div className="reveal">
        <Slider />
      </div>
      <div className="reveal">
        <HomeGrid />
      </div>
      <div className="reveal">
        <HomeCategories />
      </div>
      <div className="reveal">
        <HomeFavorites />
      </div>
      <div className="reveal">
        <HomeFeatured />
      </div>
    </div>
  );
}

export default Home;
