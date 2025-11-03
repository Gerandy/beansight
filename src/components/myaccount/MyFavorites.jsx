import React from "react";
import { Heart } from "lucide-react";

function MyFavorites() {
  return (
    <div className="flex flex-col bg-coffee-50 rounded-xl min-h-[500px] border border-coffee-200">
      <div className="px-4 sm:px-6 lg:px-8 pt-6 lg:pt-8 pb-4 border-b border-coffee-200">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl text-coffee-900 font-bold">
          My Favorites
        </h1>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] p-4">
        <div className="w-32 h-32 sm:w-40 sm:h-40 bg-coffee-100 rounded-full flex items-center justify-center mb-6">
          <Heart size={64} className="text-coffee-400" />
        </div>
        <div className="text-coffee-800 text-sm sm:text-base text-center max-w-md">
          Add your favorites here so you can access them quickly when craving strikes!
        </div>
        <button className="mt-6 px-6 py-3 bg-coffee-700 text-white rounded-lg font-semibold hover:bg-coffee-800 transition-colors text-sm sm:text-base">
          Browse Menu
        </button>
      </div>
    </div>
  );
}

export default MyFavorites;