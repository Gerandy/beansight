import React, { useState, useCallback } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "300px",
};

// STATIC SHOP LOCATION
const shopLocation = {
  lat: 14.442745288868798, 
  lng: 120.91028756755293,
};

export default function Map({ onSelect }) {
  const [customerPos, setCustomerPos] = useState(null);

  const handleMapClick = useCallback(
    (e) => {
      const newPos = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      };
      setCustomerPos(newPos);
      if (onSelect) onSelect(newPos);
    },
    [onSelect]
  );

  return (
    <LoadScript googleMapsApiKey="AIzaSyBGvh2aLua0lajoAnSJjRm0S-XUVSof6RY">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={shopLocation} // map starts focused on your shop
        zoom={20}
        onClick={handleMapClick}
      >
        {/* 🏪 SHOP MARKER */}
        <Marker
          position={shopLocation}
          label={{
            text: "Sol-ace Cafe",
            color: "black",
            fontSize: "12px",
            border: "3px"
          }}
          icon={{
            url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
          }}
        />

        {/* 📍 CUSTOMER SELECTED LOCATION */}
        {customerPos && (
          <Marker
            position={customerPos}
            icon={{
              url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
            }}
          />
        )}
      </GoogleMap>
    </LoadScript>
  );
}
