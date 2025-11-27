import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { useNavigate } from "react-router-dom";

// Swiper imports
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

function Slider() {
  const [slides, setSlides] = useState([]);
  const navigate = useNavigate();

  // Fetch banners from Firestore
  useEffect(() => {
    const loadBanners = async () => {
      try {
        const snapshot = await getDocs(collection(db, "banners"));
        const banners = snapshot.docs.map((doc) => ({
          id: doc.id,
          image: doc.data().img,
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
    <div className="w-full flex justify-center" style={{ marginTop: "88px" }}>
      <div className="relative w-full max-w-5xl mx-auto px-4 min-h-0 md:min-h-[400px]">
        <Swiper
          modules={[Navigation, Autoplay, Pagination]}
          pagination={{
            clickable: true,
            bulletClass: 'swiper-pagination-bullet',
            bulletActiveClass: 'swiper-pagination-bullet-active',
          }}
          loop
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          className="rounded-2xl overflow-hidden shadow-lg"
        >
          {slides.map((slide) => (
            <SwiperSlide key={slide.id}>
              <div 
                className="cursor-pointer"
                onClick={() => navigate('/menu')}
              >
                <img
                  src={slide.image}
                  alt={`Banner ${slide.id}`}
                  className="w-full h-auto object-cover"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}

export default Slider;
