import React from "react";

function MenuCard({ name, price, img }) {
  return (
    <div className="group bg-[#fffaf5] rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 ease-out p-5 flex flex-col items-center text-center cursor-pointer border border-[#f2e9e1] h-[220px]">
      <div className="w-28 h-28 mb-4 rounded-xl overflow-hidden bg-[#f8f4f1] flex items-center justify-center">
        <img
          src={img}
          alt={name}
          className="w-24 h-24 object-contain transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <div className="flex flex-col flex-1 justify-between w-full">
        <h2 className="text-[#4b3f34] text-sm font-normal mb-1 tracking-wide line-clamp-2 min-h-[40px]">
          {name}
        </h2>

        <p className="text-[#4b3f34] font-bold text-xl">
          ₱{price}
        </p>
      </div>
    </div>
  );
}

export default MenuCard;



