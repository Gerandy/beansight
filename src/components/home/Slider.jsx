import React, { useState, useEffect, useRef } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { useNavigate } from "react-router-dom";

export default function Slider() {
  const [slides, setSlides] = useState([]);
  const [current, setCurrent] = useState(0);
  const [next, setNext] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState("right");
  const [waveBtn, setWaveBtn] = useState("");
  const timerRef = useRef(null);
  const navigate = useNavigate();

  const AUTO_INTERVAL = 7000;

  // ⬇️ Fetch banners from Firestore
  useEffect(() => {
    const loadBanners = async () => {
      try {
        const snap = await getDocs(collection(db, "banners"));
        const banners = snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setSlides(banners);
      } catch (err) {
        console.error("Failed to load banners:", err);
      }
    };

    loadBanners();
  }, []);

  // ⬇️ Start swipe + animation
  const startSwipe = (dir) => {
    if (animating || slides.length === 0) return;

    setCurrent((prevCurrent) => {
      const nextIdx =
        dir === "right"
          ? (prevCurrent + 1) % slides.length
          : (prevCurrent - 1 + slides.length) % slides.length;

      setDirection(dir);
      setNext(nextIdx);
      setAnimating(true);

      setTimeout(() => {
        setCurrent(nextIdx);
        setAnimating(false);
      }, 350);

      return prevCurrent; // Return current state unchanged for now
    });
  };

  // ⬇️ Autoplay
  useEffect(() => {
    if (slides.length === 0) return;

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      startSwipe("right");
    }, AUTO_INTERVAL);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [slides.length, animating]); // Add animating to dependencies

  const handleBtnClick = (side, fn) => {
    setWaveBtn(side);
    fn();
    setTimeout(() => setWaveBtn(""), 350);
  };

  // Toggle animation classes
  const currentClass = !animating
    ? "z-10"
    : direction === "right"
    ? "z-20 animate-slideOutLeft"
    : "z-20 animate-slideOutRight";

  const nextClass = !animating
    ? "hidden"
    : direction === "right"
    ? "z-30 animate-slideInRight"
    : "z-30 animate-slideInLeft";

  if (slides.length === 0) {
    return (
      <div className="w-full flex justify-center mt-10 text-gray-500">
        Loading banners…
      </div>
    );
  }

  return (
    <div
      className="w-full flex justify-center items-center bg-transparent"
      style={{ marginTop: "88px" }}
    >
      <div className="relative w-full max-w-2xl lg:max-w-5xl mx-auto px-4">
        <div
          className="group relative w-full aspect-[2.8/1] bg-white rounded-2xl shadow-xl flex items-center justify-center overflow-hidden"
          onMouseEnter={() => {
            if (timerRef.current) clearInterval(timerRef.current);
            timerRef.current = null;
          }}
          onMouseLeave={() => {
            if (!animating) {
              timerRef.current = setInterval(() => startSwipe("right"), AUTO_INTERVAL);
            }
          }}
        >
          {/* Left Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleBtnClick("left", () => startSwipe("left"));
            }}
            className={`
              absolute left-4 top-1/2 -translate-y-1/2 z-30
              bg-yellow-950 text-white rounded-full w-9 h-9 flex items-center justify-center
              text-3xl shadow-lg transition-opacity duration-200
              active:scale-90 opacity-0 pointer-events-none
              group-hover:opacity-100 group-hover:pointer-events-auto
            `}
          >
            <span className={`${waveBtn === "left" ? "animate-waveicon" : ""}`}>
              &#8249;
            </span>
          </button>

          {/* Images */}
          <div 
            className="w-full h-full flex items-center justify-center cursor-pointer"
            onClick={() => navigate('/menu')}
          >
            <img
              src={slides[current].img}
              alt=""
              className={`absolute inset-0 w-full h-full object-cover rounded-2xl ${currentClass}`}
            />
            <img
              src={slides[next].img}
              alt=""
              className={`absolute inset-0 w-full h-full object-cover rounded-2xl ${nextClass}`}
            />
          </div>

          {/* Right Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleBtnClick("right", () => startSwipe("right"));
            }}
            className={`
              absolute right-4 top-1/2 -translate-y-1/2 z-30
              bg-yellow-950 text-white rounded-full w-9 h-9 flex items-center justify-center
              text-3xl shadow-lg transition-opacity duration-200
              active:scale-90 opacity-0 pointer-events-none
              group-hover:opacity-100 group-hover:pointer-events-auto
            `}
          >
            <span className={`${waveBtn === "right" ? "animate-waveicon" : ""}`}>
              &#8250;
            </span>
          </button>

          {/* Indicator Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  if (index !== current && !animating) {
                    setDirection(index > current ? "right" : "left");
                    setNext(index);
                    setAnimating(true);
                    setTimeout(() => {
                      setCurrent(index);
                      setAnimating(false);
                    }, 350);
                  }
                }}
                className={`
                  w-2 h-2 rounded-full transition-all duration-300
                  ${index === current 
                    ? "bg-yellow-950 w-6" 
                    : "bg-white/60 hover:bg-white/80"
                  }
                `}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Animations */}
        <style>
          {`
          @keyframes waveicon {
            0% { transform: scale(1);}
            50% { transform: scale(1.25);}
            100% { transform: scale(1);}
          }
          .animate-waveicon {
            animation: waveicon 0.35s;
          }

          @keyframes slideInRight {
            from { transform: translateX(100%);}
            to { transform: translateX(0);}
          }
          .animate-slideInRight {
            animation: slideInRight 0.35s cubic-bezier(.77,0,.18,1);
          }

          @keyframes slideOutLeft {
            from { transform: translateX(0);}
            to { transform: translateX(-100%);}
          }
          .animate-slideOutLeft {
            animation: slideOutLeft 0.35s cubic-bezier(.77,0,.18,1);
          }

          @keyframes slideInLeft {
            from { transform: translateX(-100%);}
            to { transform: translateX(0);}
          }
          .animate-slideInLeft {
            animation: slideInLeft 0.35s cubic-bezier(.77,0,.18,1);
          }

          @keyframes slideOutRight {
            from { transform: translateX(0);}
            to { transform: translateX(100%);}
          }
          .animate-slideOutRight {
            animation: slideOutRight 0.35s cubic-bezier(.77,0,.18,1);
          }
        `}
        </style>
      </div>
    </div>
  );
}
