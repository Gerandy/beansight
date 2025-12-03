import { getDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { loadGoogleMaps } from "./loadGoogleMaps";

// Make baseRate optional; if not provided, fetch from Firestore
export const calculateDeliveryFeeUtil = async (origin, destination, baseRate = null) => {
  // If baseRate not provided, fetch from settings
  if (baseRate === null) {
    try {
      const docRef = await getDoc(doc(db, "settings", "mapRadius"));
      if (docRef.exists()) {
        const data = docRef.data();
        baseRate = data.deliveryFeeKm || 10; // fallback to 10
      } else {
        baseRate = 10; // fallback if settings not found
      }
    } catch (err) {
      console.error("Error loading settings:", err);
      baseRate = 10;
    }
  }

  const maps = await loadGoogleMaps();

  return new Promise((resolve, reject) => {
    const service = new maps.DistanceMatrixService();

    service.getDistanceMatrix(
      {
        origins: [origin],
        destinations: [destination],
        travelMode: maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status !== "OK") return reject("Distance Matrix failed");

        const meters = result.rows[0].elements[0].distance.value;
        const km = meters / 1000;

        resolve({
          km,
          fee: Math.round(km * baseRate),
        });
      }
    );
  });
};
