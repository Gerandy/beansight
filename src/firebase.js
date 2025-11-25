// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCeLdyGF7Ja7k4BSL53zrg8hcg_Xm68vf4",
  authDomain: "beansight-cc92a.firebaseapp.com",
  projectId: "beansight-cc92a",
  storageBucket: "beansight-cc92a.appspot.com",
  messagingSenderId: "187187391881",
  appId: "1:187187391881:web:b65418455da6121740c558",
};

const app = initializeApp(firebaseConfig);
export {app};

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);


export default app;
