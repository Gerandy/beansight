import React, { useEffect, useState } from "react";
import Slider from "../home/Slider";
import HomeGrid from "../home/HomeGrid";
import HomeCategories from "../home/HomeCategories";
import HomeFavorites from "../home/HomeFavorites";
import HomeFeatured from "../home/HomeFeatured";
import "../../index.css"; 

function Home() {
  // auth state
  const [isAuthed, setIsAuthed] = useState(!!localStorage.getItem("authToken"));

  // keep reveal effects
  useEffect(() => {
    const revealElements = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible");
          else entry.target.classList.remove("visible");
        });
      },
      { threshold: 0.15 }
    );
    revealElements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // react to auth changes from other tabs
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "authToken") setIsAuthed(!!e.newValue);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
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

      {/* only show when logged in */}
      {isAuthed && (
        <div className="reveal">
          <HomeFavorites />
        </div>
      )}

      <div className="reveal">
        <HomeFeatured />
      </div>
    </div>
  );
}

export default Home;
