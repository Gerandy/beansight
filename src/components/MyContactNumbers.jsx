import { useState } from "react";
import { Trash2 } from "lucide-react"; // for the delete icon

function MyContactNumbers() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div>
      <h1 className="text-4xl border-b text-black font-bold mb-10">My Contact Numbers</h1>

      <div className="border rounded-lg p-8 shadow-sm flex flex-col items-center text-center">
        {!showForm ? (
          <>
            <p className="text-gray-700 mb-6 max-w-sm">
              Please enter a valid mobile number to make sure deliveries reach you and
              services run smoothly.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-yellow-400 text-black font-semibold px-6 py-3 rounded-full shadow hover:bg-yellow-500 transition"
            >
              Add New Contact Number
            </button>
          </>
        ) : (
          <div className="w-full max-w-md">
            {/* Number input */}
            <div className="flex items-center mb-4">
              <span className="px-3 py-2 bg-gray-100 border border-r-0 rounded-l-md text-gray-700">
                +63
              </span>
              <input
                type="text"
                placeholder="9XXXXXXXXX"
                className="flex-1 text-black p-2 border border-l-0 rounded-r-md bg-gray-100"
              />
              <button className="ml-2 text-gray-500 hover:text-red-500">
                <Trash2 size={18} />
              </button>
            </div>

            {/* Buttons */}
            <button
              disabled
              className="w-full bg-gray-200 text-gray-500 py-2 rounded mb-3 cursor-not-allowed"
            >
              Update
            </button>

            <button
              onClick={() => setShowForm(true)}
              className="w-full border bg-yellow-950 py-2 rounded hover:bg-dark"    
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
