import { createContext, useContext, useState, useEffect } from "react";
import { collection, onSnapshot, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "./firebase";

const DataContext = createContext();

export function DataProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [userData, setUserData] = useState({}); // dynamic user data

  // 🔹 Fetch Inventory in real-time
  useEffect(() => {
    const unsubProducts = onSnapshot(collection(db, "Inventory"), snapshot => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(data);
    });
    return () => unsubProducts();
  }, []);

  // 🔹 Fetch user info + all subcollections dynamically
  useEffect(() => {
    const fetchUser = async () => {
      const uid = localStorage.getItem("authToken");
      if (!uid) return;

      const userDoc = await getDoc(doc(db, "users", uid));
      const userInfo = userDoc.exists() ? userDoc.data() : {};

      // Example: define which subcollections you want to fetch
      const subcollections = ["addresses", "contactNumber", ]; 

      const userSubData = {};
      for (const sub of subcollections) {
        const subSnapshot = await getDocs(collection(db, "users", uid, sub));
        userSubData[sub] = subSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }

      setUserData({ ...userInfo, ...userSubData });
    };

    fetchUser();
  }, []);

  return (
    <DataContext.Provider value={{ products, userData }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
