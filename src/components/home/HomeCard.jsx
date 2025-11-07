import React from "react";

function MenuCard({ name, price, img, isNew }) {
  return (
    <div className="group bg-white rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300 ease-out p-6 flex flex-col items-center text-center cursor-pointer border-2 border-[#D4A574] h-[280px] relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iNCIgZmlsbD0iIzJFMUMxNCIvPgo8L3N2Zz4=')] bg-repeat"></div>

      {isNew && (
        <span className="absolute top-3 right-3 bg-coffee-600 text-white px-3 py-1.5 text-xs font-semibold rounded-full z-20 shadow-md">
          New
        </span>
      )}

      <div className="w-36 h-36 mb-5 rounded-xl overflow-hidden bg-gradient-to-br from-[#FFF5EB] to-[#FFE8D6] flex items-center justify-center relative z-10 shadow-sm">
        <img src={img} alt={name} className="w-32 h-32 object-contain transition-transform duration-300 group-hover:scale-110" />
      </div>

      <div className="flex flex-col flex-1 justify-between w-full relative z-10">
        <h2 className="text-[#4E342E] text-base font-semibold mb-2 tracking-wide line-clamp-2 min-h-[44px]">
          {name}
        </h2>
        <p className="text-[#6B3E2E] font-bold text-2xl">₱{price}</p>
      </div>
    </div>
  );
}

export default MenuCard;



