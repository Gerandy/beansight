import { useState } from "react";
import { Trash2 } from "lucide-react";

function MyContactNumbers() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl border-b border-coffee-200 pb-4 text-coffee-900 font-bold mb-6 lg:mb-10">
        My Contact Numbers
      </h1>

      <div className="border border-coffee-200 rounded-lg p-6 sm:p-8 shadow-sm bg-coffee-50 flex flex-col items-center text-center">
        {!showForm ? (
          <>
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-coffee-200 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-coffee-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <p className="text-coffee-800 mb-6 max-w-sm text-sm sm:text-base">
              Please enter a valid mobile number to make sure deliveries reach you and
              services run smoothly.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-coffee-700 text-white font-semibold px-6 py-3 rounded-lg shadow-sm hover:bg-coffee-800 transition-colors text-sm sm:text-base"
            >
              Add New Contact Number
            </button>
          </>
        ) : (
          <div className="w-full max-w-md">
            <div className="flex items-center mb-4 gap-2">
              <span className="px-3 py-2 sm:py-3 bg-coffee-100 border border-coffee-200 rounded-l-lg text-coffee-800 font-medium text-sm sm:text-base">
                +63
              </span>
              <input
                type="text"
                placeholder="9XXXXXXXXX"
                maxLength="10"
                className="flex-1 text-coffee-900 p-2 sm:p-3 border border-coffee-200 bg-coffee-100 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 text-sm sm:text-base"
              />
              <button className="ml-2 text-coffee-600 hover:text-red-600 transition-colors p-2">
                <Trash2 size={18} />
              </button>
            </div>

            <button
              disabled
              className="w-full bg-coffee-200 text-coffee-500 py-2.5 sm:py-3 rounded-lg mb-3 cursor-not-allowed font-semibold text-sm sm:text-base"
            >
              Update
            </button>

            <button
              onClick={() => setShowForm(true)}
              className="w-full border border-coffee-200 bg-coffee-700 text-white py-2.5 sm:py-3 rounded-lg hover:bg-coffee-800 transition-colors font-semibold text-sm sm:text-base"
            >
              Add New Contact Number
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyContactNumbers;
