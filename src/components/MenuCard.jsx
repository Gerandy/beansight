import React from "react";

function MenuCard({ name, price, img}) {
    return (
        <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center hover:shadow-lg transition">
            <img
                src={img}
                alt={name}
                className="w-30 h-30 object-cover mb-3"
            />
            <h2 className="text-gray-950 text-center text-lg font-medium mb-2">{name}</h2>
            <p className="text-lg text-gray-600">{price}</p>
        </div>
    );
}

export default MenuCard;