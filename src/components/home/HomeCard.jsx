import React from "react";

function MenuCard({ name, price, img, isNew }) {
  return (
    <div className="group bg-gradient-to-br from-[#FAE5D3] to-[#F8D2B5] rounded-2xl shadow-md hover:shadow-lg hover:-translate-y-2 transition-all duration-300 ease-out p-5 flex flex-col items-center text-center cursor-pointer border border-[#E8C1A1] h-[220px] relative overflow-hidden">
      <div className="absolute inset-0 opacity-5 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iNCIgZmlsbD0iIzJFMUMxNCIvPgo8L3N2Zz4=')] bg-repeat"></div>

      {isNew && (
        <span className="absolute top-2 right-2 bg-coffee-600 text-white px-2 py-1 text-xs rounded-full z-20">
          New
        </span>
      )}

      <div className="w-28 h-28 mb-4 rounded-xl overflow-hidden bg-gradient-to-br from-[#FBE4CB] to-[#F3CDA7] flex items-center justify-center relative z-10">
        <img src={img} alt={name} className="w-24 h-24 object-contain transition-transform duration-300 group-hover:scale-110" />
      </div>

      <div className="flex flex-col flex-1 justify-between w-full relative z-10">
        <h2 className="text-[#4E342E] text-sm font-semibold mb-1 tracking-wide line-clamp-2 min-h-[40px]">
          {name}
        </h2>
        <p className="text-[#6B3E2E] font-bold text-xl">₱{price}</p>
      </div>
    </div>
  );
}

export default MenuCard;



