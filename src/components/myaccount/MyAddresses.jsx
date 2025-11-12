import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";

function MyAddresses() {
  const [addresses, setAddresses] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: "",
    details: "",
    city: "",
    province: "",
    zipcode: "",
    isDefault: false,
  });

  // Fetch user addresses from Firestore
  useEffect(() => {
    const fetchAddresses = async () => {
      const userId = localStorage.getItem("authToken");
      if (!userId) return;

      try {
        const colRef = collection(db, "users", userId, "addresses");
        const snapshot = await getDocs(colRef);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAddresses(data);
      } catch (err) {
        console.error("Error fetching addresses:", err);
      }
    };

    fetchAddresses();
  }, []);

  // Add new address
  const handleAddAddress = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem("authToken");
    if (!userId) return;

    try {
      const colRef = collection(db, "users", userId, "addresses");
      const docRef = await addDoc(colRef, { ...newAddress });

      // Update local state immediately
      setAddresses(prev => [...prev, { id: docRef.id, ...newAddress }]);
      setNewAddress({ label: "", details: "", city: "", province: "", zipcode: "", isDefault: false });
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

      {/* Existing addresses */}
      <div className="space-y-4">
        {addresses.map((address) => (
          <div key={address.id} className="flex items-start gap-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <input
              type="radio"
              name="address"
              defaultChecked={address.isDefault}
              className="mt-1 accent-coffee-700 flex-shrink-0 w-5 h-5"
            />
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-base sm:text-lg text-coffee-900 mb-1">{address.label}</h2>
              <p className="text-sm text-coffee-700 leading-relaxed">
                {address.details}, {address.city}, {address.province} {address.zipcode}
              </p>
            </div>
            <button className="px-4 py-2 bg-coffee-400 text-white rounded-lg font-medium hover:bg-coffee-500 transition-colors text-sm flex-shrink-0">
              Edit
            </button>
          </div>
        ))}
      </div>

      {/* Add new address */}
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
                  rows="2"
                  placeholder="Enter street, barangay, etc."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-coffee-900 mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    className="w-full border border-coffee-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-coffee-700"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-coffee-900 mb-1">Province</label>
                  <input
                    type="text"
                    required
                    value={newAddress.province}
                    onChange={(e) => setNewAddress({ ...newAddress, province: e.target.value })}
                    className="w-full border border-coffee-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-coffee-700"
                    placeholder="Province"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-coffee-900 mb-1">Zipcode</label>
                  <input
                    type="text"
                    required
                    value={newAddress.zipcode}
                    onChange={(e) => setNewAddress({ ...newAddress, zipcode: e.target.value })}
                    className="w-full border border-coffee-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-coffee-700"
                    placeholder="Zipcode"
                  />
                </div>
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
