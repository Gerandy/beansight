import { loadGoogleMaps } from "./loadGoogleMaps";

export const calculateDeliveryFeeUtil = async (origin, destination, baseRate = 10) => {
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
