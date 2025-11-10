import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";

function MyAddresses() {
  const [addresses, setAddresses] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: "", details: "", isDefault: false });

  useEffect(() => {
    const fetchAddresses = async () => {
      const userId = localStorage.getItem("authToken");
      if (!userId) return;

      try {
        const querySnapshot = await getDocs(collection(db, "users", userId, "addresses"));
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAddresses(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchAddresses();
  }, []);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem("authToken");
    if (!userId) return;

    try {
      const docRef = await addDoc(collection(db, "users", userId, "addresses"), {
        label: newAddress.label,
        details: newAddress.details,
        isDefault: newAddress.isDefault
      });
      
      setAddresses([...addresses, { id: docRef.id, ...newAddress }]);
      setNewAddress({ label: "", details: "", isDefault: false });
      setShowAddForm(false);
    } catch (err) {
      console.error("Error adding address:", err);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl border-b border-coffee-200 pb-4 text-coffee-900 font-bold mb-6 lg:mb-10">
        My Addresses
      </h1>

      <div className="space-y-4">
        {addresses.map((address) => (
          <div
            key={address.id}
            className="flex items-start gap-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <input
              type="radio"
              name="address"
              defaultChecked={address.isDefault}
              className="mt-1 accent-coffee-700 flex-shrink-0 w-5 h-5"
            />
            
            <div className="flex-shrink-0 w-12 h-12 bg-coffee-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-coffee-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-base sm:text-lg text-coffee-900 mb-1">
                {address.label}
              </h2>
              <p className="text-sm text-coffee-700 leading-relaxed">{address.details}</p>
            </div>

            <button className="px-4 py-2 bg-coffee-400 text-white rounded-lg font-medium hover:bg-coffee-500 transition-colors text-sm flex-shrink-0">
              Edit
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6">
        {!showAddForm ? (
          <button 
            onClick={() => setShowAddForm(true)}
            className="w-full text-white bg-coffee-700 hover:bg-coffee-800 font-bold py-3 sm:py-3.5 rounded-lg transition-colors text-sm sm:text-base"
          >
            Add New Address
          </button>
        ) : (
          <form onSubmit={handleAddAddress} className="border border-coffee-200 rounded-lg p-4 bg-coffee-50">
            <h3 className="text-lg font-semibold text-coffee-900 mb-4">Add New Address</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-coffee-900 mb-1">Label</label>
                <input
                  type="text"
                  required
                  value={newAddress.label}
                  onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                  className="w-full border border-coffee-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-coffee-700"
                  placeholder="e.g., Home, Office"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-coffee-900 mb-1">Address Details</label>
                <textarea
                  required
                  value={newAddress.details}
                  onChange={(e) => setNewAddress({ ...newAddress, details: e.target.value })}
                  className="w-full border border-coffee-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-coffee-700"
                  rows="3"
                  placeholder="Enter full address"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={newAddress.isDefault}
                  onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                  className="mr-2 accent-coffee-700"
                />
                <label className="text-sm text-coffee-900">Set as default address</label>
              </div>
            </div>
            
            <div className="flex gap-3 mt-4">
              <button
                type="submit"
                className="flex-1 bg-coffee-700 text-white py-2 rounded-lg font-medium hover:bg-coffee-800 transition-colors"
              >
                Save Address
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="flex-1 bg-coffee-200 text-coffee-900 py-2 rounded-lg font-medium hover:bg-coffee-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default MyAddresses;
