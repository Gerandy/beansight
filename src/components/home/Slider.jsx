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
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch banners from Firestore
  useEffect(() => {
    const loadBanners = async () => {
      setLoading(true);
      try {
        const snapshot = await getDocs(collection(db, "banners"));
        const banners = snapshot.docs.map((doc) => ({
          id: doc.id,
          image: doc.data().img,
        }));
        setSlides(banners);
      } catch (err) {
        console.error("Failed to load banners:", err);
      } finally {
        setLoading(false);
      }
    };
    loadBanners();
  }, []);

  if (loading) {
    return (
      <div className="w-full flex justify-center mt-20 mb-8">
        <div className="relative w-full max-w-md lg:max-w-5xl mx-auto px-4">
          <div className="rounded-3xl overflow-hidden shadow-lg bg-gray-200 animate-pulse h-[160px] lg:h-[350px]">
            <div className="w-full h-full bg-gray-300"></div>
            {/* Pagination dots skeleton */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
              <div className="w-2 h-2 rounded-full bg-gray-400"></div>
              <div className="w-2 h-2 rounded-full bg-gray-400"></div>
              <div className="w-2 h-2 rounded-full bg-gray-400"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (slides.length === 0) {
    return (
      <div className="h-40 flex justify-center items-center text-gray-500">
        No banners available
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center mt-20 ">
      <div className="relative w-full max-w-md lg:max-w-5xl mx-auto px-4">
        <Swiper
          modules={[Navigation, Autoplay, Pagination]}
          pagination={{
            clickable: true,
            bulletClass: 'swiper-pagination-bullet',
            bulletActiveClass: 'swiper-pagination-bullet-active',
          }}
          loop
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          className="rounded-3xl overflow-hidden shadow-lg h-[160px] lg:h-[350px]"
        >
          {slides.map((slide) => (
            <SwiperSlide key={slide.id}>
              <div 
                className="cursor-pointer w-full h-full"
                onClick={() => navigate('/menu')}
              >
                <img
                  src={slide.image}
                  alt={`Banner ${slide.id}`}
                  className="w-full h-full object-cover"
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
