import React, { useState } from "react";
import MenuCard from "./MenuCard";

function MenuGrid() {
  const foodMenu = [
    {
      name: "Sige Sige",
      price: "₱175.00",
      img: "src/assets/ahjinlogo.png"
    },
    {
      name: "Puto Tumbong",
      price: "₱145.00",
      img: "src/assets/ahjinlogo.png"
    },
    {
      name: "Dinakdakan",
      price: "₱174.00",
      img: "src/assets/ahjinlogo.png"
    },
    {
      name: "Longganigg*",
      price: "₱138.00",
      img: "src/assets/ahjinlogo.png"
    },
  ];

    return (
        <div className="max-w-[950px] mx-auto p-6 relative">
            <h1 className="text-gray-950 text-4xl font-bold">Hello, User!</h1>
            <p className="text-gray-950 mb-6">Food Options for you!</p>

            <div className="text-gray-950 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {foodMenu.map((item, index) => (
                    <MenuCard
                        key={index}
                        name={item.name}
                        price={item.price}
                        img={item.img}
                    />
                ))}
            </div>
        </div>
        
    );
}
export default MenuGrid;