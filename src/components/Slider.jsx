import React, { useState } from "react";

const slides = [
  { image: "src/assets/ahjinlogo.png" },
  { image: "src/assets/ahjinlogo2.png" }
];

function Slider() {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState("right");
  const [waveBtn, setWaveBtn] = useState(""); // "left" or "right"
  const [next, setNext] = useState(0);

  const startSwipe = (dir) => {
    if (animating) return;
    let nextIdx;
    if (dir === "right") {
      nextIdx = (current + 1) % slides.length;
    } else {
      nextIdx = (current - 1 + slides.length) % slides.length;
    }
    setDirection(dir);
    setNext(nextIdx);
    setAnimating(true);
    setTimeout(() => {
      setCurrent(nextIdx);
      setAnimating(false);
    }, 350);
  };

  const handleBtnClick = (side, fn) => {
    setWaveBtn(side);
    fn();
    setTimeout(() => setWaveBtn(""), 350);
  };

  // animation classes for image
  const getCurrentImgClass = () => {
    if (!animating) return "z-10";
    if (direction === "right") return "z-20 animate-slideOutLeft";
    return "z-20 animate-slideOutRight";
  };
  const getNextImgClass = () => {
    if (!animating) return "hidden";
    if (direction === "right") return "z-30 animate-slideInRight";
    return "z-30 animate-slideInLeft";
  };

  return (
    <div className="w-full flex justify-center items-center bg-transparent" style={{marginTop: '88px'}}>
      <div className="relative w-full max-w-2xl lg:max-w-5xl mx-auto px-4">
        <div className="relative w-full aspect-[2.8/1] bg-white rounded-2xl shadow-xl flex items-center justify-center overflow-hidden">
          {/* Previous button */}
          <button
            onClick={() => handleBtnClick("left", () => startSwipe("left"))}
            aria-label="Previous"
            disabled={animating}
            className={`
              absolute left-4 top-1/2 -translate-y-1/2 z-30
              bg-yellow-950 text-white rounded-full w-9 h-9 flex items-center justify-center
              text-3xl shadow-lg
              transition
              active:scale-90
              hover:cursor-pointer
            `}
          >
            <span
              className={`
                inline-block
                ${waveBtn === "left" ? "animate-waveicon" : ""}
              `}
            >
              &#8249;
            </span>
          </button>

          {/* Images */}
          <div className="w-full h-full flex items-center justify-center">
            <img
              src={slides[current].image}
              alt=""
              className={`absolute inset-0 w-full h-full object-cover transition-transform duration-300 rounded-2xl ${getCurrentImgClass()}`}
            />
            <img
              src={slides[next].image}
              alt=""
              className={`absolute inset-0 w-full h-full object-cover transition-transform duration-300 rounded-2xl ${getNextImgClass()}`}
            />
          </div>

          {/* Next button */}
          <button
            onClick={() => handleBtnClick("right", () => startSwipe("right"))}
            aria-label="Next"
            disabled={animating}
            className={`
              absolute right-4 top-1/2 -translate-y-1/2 z-20
              bg-yellow-950 text-white rounded-full w-9 h-9 flex items-center justify-center
              text-3xl shadow-lg
              transition
              active:scale-90
              hover:cursor-pointer
            `}
          >
            <span
              className={`
                inline-block
                ${waveBtn === "right" ? "animate-waveicon" : ""}
              `}
            >
              &#8250;
            </span>
          </button>
        </div>
        {/* keyframes for wave and swipe */}
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

export default Slider;