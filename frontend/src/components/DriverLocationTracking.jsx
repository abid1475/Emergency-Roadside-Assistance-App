import React, { useEffect, useState } from "react";

const DriverLocationTracking = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    // Check browser support
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    // Start watching driver's location
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        const currentLocation = {
          latitude,
          longitude,
        };

        setLocation(currentLocation);
        setError("");

        console.log("Driver Location:", currentLocation);
      },

      (error) => {
        console.error("Location Error:", error);

        switch (error.code) {
          case 1:
            setError("Location permission was denied.");
            break;

          case 2:
            setError("Unable to get your location.");
            break;

          case 3:
            setError("Location request timed out.");
            break;

          default:
            setError("Unable to track your location.");
        }
      },

      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      },
    );

    // Stop watching location when component is removed
    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  return (
    <div>
      <h3>Driver Location</h3>

      {error && <p>{error}</p>}

      {location ? (
        <div>
          <p>
            <strong>Latitude:</strong> {location.latitude}
          </p>

          <p>
            <strong>Longitude:</strong> {location.longitude}
          </p>
        </div>
      ) : (
        <p>Getting your location...</p>
      )}
    </div>
  );
};

export default DriverLocationTracking;
