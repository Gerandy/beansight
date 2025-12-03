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
  const [showScrollTop, setShowScrollTop] = useState(false);

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

 
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "authToken") setIsAuthed(!!e.newValue);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Show/hide scroll to top button based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
      
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '40px',
            height: '40px',
            backgroundColor: 'var(--color-coffee-600)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '20px',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'opacity 0.3s ease',
          }}
        >
          ↑
        </button>
      )}
    </div>
  );
}

export default Home;
