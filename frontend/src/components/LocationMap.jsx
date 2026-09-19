import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",

  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",

  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const LocationMap = ({
  latitude,
  longitude,
  height = "400px",
  zoom = 15,
  popupText = "Your Location",
}) => {
  // Check location
  if (!latitude || !longitude) {
    return (
      <div
        className="flex items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400"
        style={{ height }}
      >
        <div className="text-center">
          <div className="mb-2 text-4xl">📍</div>

          <p className="text-sm">Location not available</p>
        </div>
      </div>
    );
  }

  const position = [Number(latitude), Number(longitude)];

  return (
    <div
      className="overflow-hidden rounded-xl border border-slate-800"
      style={{ height }}
    >
      <MapContainer
        center={position}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{
          height: "100%",
          width: "100%",
        }}
      >
        {/* OpenStreetMap */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User Location */}
        <Marker position={position}>
          <Popup>
            <strong>{popupText}</strong>
            <br />
            Latitude: {latitude}
            <br />
            Longitude: {longitude}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default LocationMap;
