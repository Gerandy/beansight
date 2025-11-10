import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase";

function MyAddresses() {
  const auth = getAuth();
  const user = auth.currentUser;

  const [addresses, setAddresses] = useState([]);

 
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!user) return;

      try {
        const addressesRef = collection(db, "users", user.uid, "addresses");
        const q = query(addressesRef);
        const querySnapshot = await getDocs(q);

        const fetchedAddresses = [];
        querySnapshot.forEach((doc) => {
          fetchedAddresses.push({ id: doc.id, ...doc.data() });
        });

        setAddresses(fetchedAddresses);
      } catch (err) {
        console.error("Error fetching addresses:", err);
      }
    };

    fetchAddresses();
  }, [user]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl border-b border-coffee-200 pb-4 text-coffee-900 font-bold mb-6 lg:mb-10">
        My Addresses
      </h1>

      <div className="space-y-4">
        {addresses.length > 0 ? (
          addresses.map((address) => (
            <div
              key={address.id}
              className="flex flex-col sm:flex-row sm:items-start sm:justify-between border border-coffee-200 rounded-lg p-4 bg-coffee-50 gap-3"
            >
              <div className="flex items-start flex-1">
                <input
                  type="radio"
                  name="address"
                  checked={address.isDefault}
                  className="mt-1 mr-3 accent-coffee-700 flex-shrink-0"
                  readOnly
                />
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-coffee-900 text-sm sm:text-base mb-1">
                    {address.label}
                  </h2>
                  <p className="text-xs sm:text-sm text-coffee-700 break-words">
                    {address.details}
                  </p>
                </div>
              </div>

              <button className="px-4 py-2 bg-coffee-700 text-white rounded-lg font-medium hover:bg-coffee-800 transition-colors text-sm sm:text-base self-start sm:self-auto flex-shrink-0">
                Edit
              </button>
            </div>
          ))
        ) : (
          <p className="text-coffee-700">No addresses found. Please add one.</p>
        )}
      </div>

      <div className="mt-6">
        <button className="w-full text-white bg-coffee-700 hover:bg-coffee-800 font-bold py-3 sm:py-3.5 rounded-lg transition-colors text-sm sm:text-base">
          Add New Address
        </button>
      </div>
    </div>
  );
}

export default MyAddresses;
