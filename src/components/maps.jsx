import React, { useState, useCallback, useEffect } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";

const [shopLocation, setLocation] = useState({ lat: 14.5995, lng: 120.9842 });



useEffect(()=> {
  
  const loadLocation = async () =>{
    const docSnap = await getDoc(doc(db, "settings", "mapRadius" ));
    if (docSnap.exists()){
      const data = docSnap.data();
      setLocation({ lat: data.lat || 14.5995, lng: data.long || 120.9842 });
      
    }
  }

loadLocation();
},[])





const containerStyle = {
  width: "100%",
  height: "300px",
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
