import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyCeLdyGF7Ja7k4BSL53zrg8hcg_Xm68vf4",
  authDomain: "beansight-cc92a.firebaseapp.com",
  projectId: "beansight-cc92a",
  storageBucket: "beansight-cc92a.firebasestorage.app",
  messagingSenderId: "187187391881",
  appId: "1:187187391881:web:b65418455da6121740c558",
  measurementId: "G-2LZ1VD25TH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firestore instance
export const db = getFirestore(app);

