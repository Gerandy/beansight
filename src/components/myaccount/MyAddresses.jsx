import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, getDocs } from "firebase/firestore";

function MyAddresses() {
  const [addresses, setAddresses] = useState([]);

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

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl border-b border-coffee-200 pb-4 text-coffee-900 font-bold mb-6 lg:mb-10">
        My Addresses
      </h1>

      <div className="space-y-4">
        {addresses.map((address) => (
          <div
            key={address.id}
            className="flex flex-col sm:flex-row sm:items-start sm:justify-between border border-coffee-200 rounded-lg p-4 bg-coffee-50 gap-3"
          >
            <div className="flex items-start flex-1">
              <input
                type="radio"
                name="address"
                defaultChecked={address.isDefault}
                className="mt-1 mr-3 accent-coffee-700 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-coffee-900 text-sm sm:text-base mb-1">
                  {address.label}
                </h2>
                <p className="text-xs sm:text-sm text-coffee-700 break-words">{address.details}</p>
              </div>
            </div>

            <button className="px-4 py-2 bg-coffee-700 text-white rounded-lg font-medium hover:bg-coffee-800 transition-colors text-sm sm:text-base self-start sm:self-auto flex-shrink-0">
              Edit
            </button>
          </div>
        ))}
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
