import React from "react";

function MyFavorites() {
  return (
    <div className="flex flex-col bg-white rounded-xl min-h-[500px] box-border">
      <div className="px-8 pt-8 pb-4 border-b border-gray-200">
        <h1 className="text-4xl border-b text-black font-bold mb-10">My Favorites</h1>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
        <svg
          width="150"
          height="120"
          viewBox="0 0 150 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="20"
            y="40"
            width="110"
            height="60"
            rx="10"
            stroke="#FFC107"
            strokeWidth="6"
            fill="none"
          />
          <path
            d="M75 80l-13-13a8 8 0 1113-10 8 8 0 1113 10L75 80z"
            fill="#FFC107"
          />
          <rect x="40" y="100" width="70" height="10" rx="5" fill="#fff" />
          <path d="M75 100l-10 10h20l-10-10z" fill="#FFC107" />
        </svg>
        <div className="mt-4 text-gray-900 text-base text-center">
          Add your favorites here so you can access
          <br />
          them quickly when craving strikes!
        </div>
      </div>
    </div>
  );
}

export default MyFavorites;