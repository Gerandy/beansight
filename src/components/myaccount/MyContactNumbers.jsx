import { useState, useEffect } from "react";
import { db } from "../../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Edit2, Check, X } from "lucide-react";

function MyContactNumbers() {
  const [contact, setContact] = useState("");
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const userId = localStorage.getItem("authToken");

  // Fetch contact number from user document
  const fetchContact = async () => {
    if (!userId) return;
    try {
      const docRef = doc(db, "users", userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setContact(docSnap.data().contactNumber || "");
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchContact();
  }, []);

  // Save edited contact number
  const handleSave = async () => {
    if (!inputValue) return;
    try {
      const docRef = doc(db, "users", userId);
      await updateDoc(docRef, { contactNumber: inputValue });
      setContact(inputValue);
      setEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setInputValue(contact);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl border-b border-coffee-200 pb-4 text-coffee-900 font-bold mb-6 lg:mb-10">
        My Contact Number
      </h1>

      <div className="space-y-4">
        {editing ? (
          <div className="flex items-center gap-2">
            <span className="px-3 py-2 bg-coffee-100 border border-coffee-200 rounded-l-lg text-coffee-800 font-medium">
              +63
            </span>
            <input
              type="text"
              maxLength="10"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 p-2 border border-coffee-200 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
            />
            <button onClick={handleSave} className="text-green-600 hover:text-green-800"><Check size={18} /></button>
            <button onClick={handleCancel} className="text-red-600 hover:text-red-800"><X size={18} /></button>
          </div>
        ) : (
          <div className="flex items-center gap-3 border border-coffee-200 p-4 rounded-lg bg-coffee-50">
            <span className="flex-1 text-coffee-900">{contact || "No contact number added"}</span>
            <button onClick={() => { setEditing(true); setInputValue(contact); }} className="text-coffee-600 hover:text-blue-600 transition-colors">
              <Edit2 size={18} />
            </button>
          </div>
        )}

        {!contact && !editing && (
          <button
            onClick={() => setEditing(true)}
            className="w-full bg-coffee-700 text-white font-semibold px-6 py-3 rounded-lg shadow-sm hover:bg-coffee-800 transition-colors text-sm sm:text-base mt-2"
          >
            Add Contact Number
          </button>
        )}
      </div>
    </div>
  );
}

export default MyContactNumbers;
