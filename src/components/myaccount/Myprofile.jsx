import React, { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { getAuth, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";

function MyProfile() {
  const auth = getAuth();
  const user = auth.currentUser;

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    dob: ""
  });

  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const canChangePassword = currentPwd && newPwd && confirmPwd && newPwd === confirmPwd;

  // Fetch user profile from Firestore
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfile({
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            email: data.email || user.email || "",
            dob: data.dob || ""
          });
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };
    fetchProfile();
  }, [user]);

  const handleChangePassword = async () => {
    setError("");
    setSuccess("");
    if (!canChangePassword) return;

    try {
      // Re-authenticate the user
      const credential = EmailAuthProvider.credential(user.email, currentPwd);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPwd);
      setSuccess("Password updated successfully!");
      setCurrentPwd("");
      setNewPwd("");
      setConfirmPwd("");
      setShowChangePassword(false);
    } catch (err) {
      setError(err.message);
    }
  };

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
                <label className="block text-sm font-medium text-coffee-800 mb-2">First Name</label>
                <input
                  type="text"
                  value={profile.firstName}
                  className="w-full p-3 sm:p-4 rounded-lg bg-coffee-100 text-coffee-900 border border-coffee-200 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-coffee-800 mb-2">Last Name</label>
                <input
                  type="text"
                  value={profile.lastName}
                  className="w-full p-3 sm:p-4 rounded-lg bg-coffee-100 text-coffee-900 border border-coffee-200 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-coffee-800 mb-2">Email</label>
                <input
                  type="email"
                  value={profile.email}
                  className="w-full p-3 sm:p-4 rounded-lg bg-coffee-100 text-coffee-900 border border-coffee-200 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-coffee-800 mb-2">Date of Birth</label>
                <input
                  type="date"
                  value={profile.dob}
                  className="w-full p-3 sm:p-4 rounded-lg bg-coffee-100 text-coffee-900 border border-coffee-200 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                  readOnly
                />
              </div>
            </>
          )}

          {/* Password change section */}
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
              {error && <p className="text-red-600 mb-2">{error}</p>}
              {success && <p className="text-green-600 mb-2">{success}</p>}

              <div className="mb-4">
                <label className="block text-sm font-medium text-coffee-800 mb-2">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrent ? "text" : "password"}
                    className="w-full p-3 sm:p-4 rounded-lg bg-coffee-100 text-coffee-900 border border-coffee-200 pr-10 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                    placeholder="Enter current password"
                    value={currentPwd}
                    onChange={(e) => setCurrentPwd(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-coffee-600 hover:text-coffee-800"
                    onClick={() => setShowCurrent((v) => !v)}
                  >
                    {showCurrent ? <Eye size={20} /> : <EyeOff size={20} />}
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-coffee-800 mb-2">New Password</label>
                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    className="w-full p-3 sm:p-4 rounded-lg bg-coffee-100 text-coffee-900 border border-coffee-200 pr-10 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                    placeholder="Enter new password"
                    value={newPwd}
                    onChange={(e) => setNewPwd(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-coffee-600 hover:text-coffee-800"
                    onClick={() => setShowNew((v) => !v)}
                  >
                    {showNew ? <Eye size={20} /> : <EyeOff size={20} />}
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-coffee-800 mb-2">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    className="w-full p-3 sm:p-4 rounded-lg bg-coffee-100 text-coffee-900 border border-coffee-200 pr-10 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                    placeholder="Confirm new password"
                    value={confirmPwd}
                    onChange={(e) => setConfirmPwd(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-coffee-600 hover:text-coffee-800"
                    onClick={() => setShowConfirm((v) => !v)}
                  >
                    {showConfirm ? <Eye size={20} /> : <EyeOff size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="button"
                disabled={!canChangePassword}
                onClick={handleChangePassword}
                className={`w-full py-3 sm:py-3.5 rounded-lg font-bold text-base sm:text-lg mb-3 text-white transition ${
                  canChangePassword ? "bg-coffee-600 hover:bg-coffee-700" : "bg-coffee-200 cursor-not-allowed"
                }`}
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
