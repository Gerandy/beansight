import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

// Swiper imports
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

function Slider() {
  const [slides, setSlides] = useState([]);

  // Fetch banners from Firestore
  useEffect(() => {
    const loadBanners = async () => {
      try {
        const snapshot = await getDocs(collection(db, "banners"));
        const banners = snapshot.docs.map((doc) => ({
          id: doc.id,
          image: doc.data().img, // Ensure your field in Firestore is "img"
        }));
        setSlides(banners);
      } catch (err) {
        console.error("Failed to load banners:", err);
      }
    };
    loadBanners();
  }, []);

  if (slides.length === 0) {
    return (
      <div className="h-40 flex justify-center items-center text-gray-500">
        Loading banners...
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center mt-20">
      <div className="relative w-full max-w-6xl mx-auto px-4">
        <Swiper
          modules={[Navigation, Autoplay]}
          navigation={{
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
          }}
          loop
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          className="rounded-2xl overflow-hidden"
        >
          {slides.map((slide) => (
            <SwiperSlide key={slide.id}>
              <img
                src={slide.image}
                alt={`Banner ${slide.id}`}
                className="w-full h-[320px] md:h-[420px] object-cover rounded-2xl"
              />
            </SwiperSlide>
          ))}

          {/* Custom Navigation Buttons */}
          <div className="swiper-button-prev text-green  "></div>
          <div className="swiper-button-next text-green  "></div>
        </Swiper>
      </div>
    </div>
  );
}

export default Slider;
