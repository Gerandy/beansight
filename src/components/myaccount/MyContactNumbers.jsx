import { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { Trash2 } from "lucide-react";

function MyContactNumbers() {
  const [contacts, setContacts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newNumber, setNewNumber] = useState("");

  const userId = localStorage.getItem("authToken");

  const fetchContacts = async () => {
    if (!userId) return;
    try {
      const querySnapshot = await getDocs(collection(db, "users", userId, "contactNumber"));
      setContacts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleAddContact = async () => {
    if (!newNumber) return;
    try {
      await addDoc(collection(db, "users", userId, "contactNumber"), { number: newNumber });
      setNewNumber("");
      setShowForm(false);
      fetchContacts(); // refresh list
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl border-b border-coffee-200 pb-4 text-coffee-900 font-bold mb-6 lg:mb-10">
        My Contact Numbers
      </h1>

      <div className="space-y-4">
        {contacts.length === 0 && !showForm && (
          <div className="border border-coffee-200 rounded-lg p-6 sm:p-8 shadow-sm bg-coffee-50 flex flex-col items-center text-center">
            <p className="text-coffee-800 mb-6 max-w-sm text-sm sm:text-base">
              Please add a contact number so we can reach you for deliveries.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-coffee-700 text-white font-semibold px-6 py-3 rounded-lg shadow-sm hover:bg-coffee-800 transition-colors text-sm sm:text-base"
            >
              Add New Contact Number
            </button>
          </div>
        )}

        {contacts.map(contact => (
          <div key={contact.id} className="flex items-center gap-3 border border-coffee-200 p-4 rounded-lg bg-coffee-50">
            <span className="flex-1 text-coffee-900">{contact.number}</span>
            <button className="text-coffee-600 hover:text-red-600 transition-colors">
              <Trash2 size={18} />
            </button>
          </div>
        ))}

        {showForm && (
          <div className="flex gap-2 items-center">
            <span className="px-3 py-2 bg-coffee-100 border border-coffee-200 rounded-l-lg text-coffee-800 font-medium">
              +63
            </span>
            <input
              type="text"
              placeholder="9XXXXXXXXX"
              maxLength="10"
              value={newNumber}
              onChange={(e) => setNewNumber(e.target.value)}
              className="flex-1 p-2 border border-coffee-200 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
            />
            <button
              onClick={handleAddContact}
              className="bg-coffee-700 text-white px-4 py-2 rounded-lg hover:bg-coffee-800 transition-colors"
            >
              Add
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyContactNumbers;
