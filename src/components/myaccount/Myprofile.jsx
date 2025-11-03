import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

function MyProfile() {
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl border-b border-coffee-200 pb-4 text-coffee-900 font-bold mb-6 lg:mb-10">
        {showChangePassword ? "Change Password" : "My Profile"}
      </h1>

      <div className="flex justify-center">
        <form className="space-y-4 max-w-lg w-full">
          {!showChangePassword && (
            <>
              <div>
                <label className="block text-sm font-medium text-coffee-800 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  defaultValue="Ferd"
                  className="w-full p-3 sm:p-4 rounded-lg bg-coffee-100 text-coffee-900 border border-coffee-200 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-coffee-800 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  defaultValue="Olaira"
                  className="w-full p-3 sm:p-4 rounded-lg bg-coffee-100 text-coffee-900 border border-coffee-200 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-coffee-800 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  defaultValue="sinbaggy12@gmail.com"
                  className="w-full p-3 sm:p-4 rounded-lg bg-coffee-100 text-coffee-900 border border-coffee-200 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-coffee-800 mb-2">
                  Date of birth
                </label>
                <input
                  type="date"
                  className="w-full p-3 sm:p-4 rounded-lg bg-coffee-100 text-coffee-900 border border-coffee-200 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                />
              </div>

              <button
                type="submit"
                disabled
                className="w-full py-3 sm:py-3.5 rounded-lg bg-coffee-200 text-coffee-500 font-bold text-base sm:text-lg cursor-not-allowed mb-2"
              >
                Save
              </button>
            </>
          )}

          {!showChangePassword ? (
            <div className="text-center mt-4">
              <button
                type="button"
                className="text-coffee-700 font-semibold underline text-sm sm:text-base hover:text-coffee-900 transition-colors"
                onClick={() => setShowChangePassword(true)}
              >
                Change password
              </button>
            </div>
          ) : (
            <div className="bg-coffee-50 rounded-lg p-4 sm:p-6 mt-8 shadow-sm border border-coffee-200">
              <div className="mb-4">
                <label className="block text-sm font-medium text-coffee-800 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrent ? "text" : "password"}
                    className="w-full p-3 sm:p-4 rounded-lg bg-coffee-100 text-coffee-900 border border-coffee-200 pr-10 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-coffee-600 hover:text-coffee-800"
                    tabIndex={-1}
                    onClick={() => setShowCurrent((v) => !v)}
                  >
                    {showCurrent ? <Eye size={20} /> : <EyeOff size={20} />}
                  </button>
                </div>
              </div>

              <p className="mb-4 text-sm text-coffee-700">
                Please enter your new password below.
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-coffee-800 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    className="w-full p-3 sm:p-4 rounded-lg bg-coffee-100 text-coffee-900 border border-coffee-200 pr-10 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-coffee-600 hover:text-coffee-800"
                    tabIndex={-1}
                    onClick={() => setShowNew((v) => !v)}
                  >
                    {showNew ? <Eye size={20} /> : <EyeOff size={20} />}
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-coffee-800 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    className="w-full p-3 sm:p-4 rounded-lg bg-coffee-100 text-coffee-900 border border-coffee-200 pr-10 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-coffee-600 hover:text-coffee-800"
                    tabIndex={-1}
                    onClick={() => setShowConfirm((v) => !v)}
                  >
                    {showConfirm ? <Eye size={20} /> : <EyeOff size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="button"
                disabled
                className="w-full py-3 sm:py-3.5 rounded-lg bg-coffee-200 text-coffee-500 font-bold text-base sm:text-lg cursor-not-allowed mb-3"
              >
                Change Password
              </button>

              <div className="text-center">
                <button
                  type="button"
                  className="text-coffee-700 font-semibold underline text-sm sm:text-base hover:text-coffee-900 transition-colors"
                  onClick={() => setShowChangePassword(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default MyProfile;
