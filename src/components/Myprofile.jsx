import React, { useState } from "react";

function MyProfile() {
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div>

      <h1 className="text-4xl border-b text-black font-bold mb-10">
        {showChangePassword ? "Change Password" : "My Profile"}
      </h1>

      <div className="flex justify-center">
        <form className="space-y-4 max-w-lg w-full">

          {!showChangePassword && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  type="text"
                  defaultValue="Ferd"
                  className="w-full p-4 rounded-md bg-gray-200 text-black pr-10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  type="text"
                  defaultValue="Olaira"
                  className="w-full p-4 rounded-md bg-gray-200 text-black pr-10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  defaultValue="sinbaggy12@gmail.com"
                  className="w-full p-4 rounded-md bg-gray-200 text-black pr-10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Date of birth
                </label>
                <input
                  type="date"
                  className="w-full p-4 rounded-md bg-gray-200 text-black pr-10"
                />
              </div>

              <button
                type="submit"
                disabled
                className="w-full py-3 rounded-full bg-gray-200 text-gray-400 font-bold text-lg cursor-not-allowed mb-2"
              >
                Save
              </button>
            </>
          )}

         
          {!showChangePassword ? (
            <div className="text-center mt-4">
              <button
                type="button"
                className="text-gray-500 font-bold underline text-base"
                onClick={() => setShowChangePassword(true)}
              >
                Change password
              </button>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-6 mt-8 shadow">
     
              <div className="mb-4">
                <div className="relative">
                  <input
                    type={showCurrent ? "text" : "password"}
                    className="w-full p-4 rounded-md bg-gray-200 text-black pr-10"
                    placeholder="Current Password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    tabIndex={-1}
                    onClick={() => setShowCurrent((v) => !v)}
                  >
                    <span role="img" aria-label="toggle visibility">
                      {showCurrent ? (
      
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      ) : (
           
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.293-3.95m3.249-2.383A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.965 9.965 0 01-4.293 5.032M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" /></svg>
                      )}
                    </span>
                  </button>
                </div>
              </div>
              <p className="mb-4 text-gray-700">Please enter your new password below.</p>
              <div className="mb-4">
                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    className="w-full p-4 rounded-md bg-gray-200 text-black pr-10"
                    placeholder="New Password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    tabIndex={-1}
                    onClick={() => setShowNew((v) => !v)}
                  >
                    <span role="img" aria-label="toggle visibility">
                      {showNew ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.293-3.95m3.249-2.383A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.965 9.965 0 01-4.293 5.032M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" /></svg>
                      )}
                    </span>
                  </button>
                </div>
              </div>
              <div className="mb-6">
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    className="w-full p-4 rounded-md bg-gray-200 text-black pr-10"
                    placeholder="Confirm Password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    tabIndex={-1}
                    onClick={() => setShowConfirm((v) => !v)}
                  >
                    <span role="img" aria-label="toggle visibility">
                      {showConfirm ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.293-3.95m3.249-2.383A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.965 9.965 0 01-4.293 5.032M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" /></svg>
                      )}
                    </span>
                  </button>
                </div>
              </div>
              <button
                type="button"
                disabled
                className="w-full py-3 rounded-full bg-gray-200 text-gray-400 font-bold text-lg cursor-not-allowed mb-2"
              >
                Change Password
              </button>
              <div className="text-center">
                <button
                  type="button"
                  className="text-gray-500 font-bold underline text-base"
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
