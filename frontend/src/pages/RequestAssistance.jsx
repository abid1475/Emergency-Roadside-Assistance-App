import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";

const RequestAssistance = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();

  const [service, setService] = useState(null);
  const [vehicles, setVehicles] = useState([]);

  const [selectedVehicle, setSelectedVehicle] = useState("");

  const [location, setLocation] = useState({
    latitude: "",
    longitude: "",
    address: "",
  });

  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Get Service + Vehicles

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        // Get selected service
        const serviceResponse = await axios.get(
          `http://localhost:3000/api/v1/services/${serviceId}`,
        );

        // Get user's vehicles
        const vehicleResponse = await axios.get(
          "http://localhost:3000/api/v1/vehicles",
          config,
        );

        if (serviceResponse.data.success) {
          setService(serviceResponse.data.service);
        }

        if (vehicleResponse.data.success) {
          setVehicles(vehicleResponse.data.vehicles);
        }
      } catch (error) {
        console.error("Load Request Data Error:", error);

        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");

          navigate("/login");
          return;
        }

        setError(
          error.response?.data?.message || "Unable to load request information",
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [serviceId, navigate]);

  // Get Current Location

  const getCurrentLocation = () => {
    setError("");

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        setLocation({
          latitude,
          longitude,
          address: `Latitude: ${latitude.toFixed(
            6,
          )}, Longitude: ${longitude.toFixed(6)}`,
        });

        setLocationLoading(false);
      },

      (error) => {
        console.error("Location Error:", error);

        setLocationLoading(false);

        setError("Unable to get your location. Please allow location access.");
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  };

  // Submit Assistance Request

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // Check vehicle
    if (!selectedVehicle) {
      setError("Please select your vehicle.");
      return;
    }

    // Check location
    if (!location.latitude || !location.longitude) {
      setError("Please get your current location.");
      return;
    }

    try {
      setSubmitting(true);

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const requestData = {
        service: serviceId,

        vehicle: selectedVehicle,

        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          address: location.address,
        },

        description: description.trim(),
      };

      console.log("Assistance Request:", requestData);

      const response = await axios.post(
        "http://localhost:3000/api/v1/assistance-requests",
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log("Assistance Response:", response.data);

      if (response.data.success) {
        setSuccess("Your assistance request has been submitted successfully!");

        // Go to requests page after a short delay
        setTimeout(() => {
          navigate("/my-requests");
        }, 1000);
      }
    } catch (error) {
      console.error("Create Assistance Request Error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
        return;
      }

      setError(
        error.response?.data?.message || "Unable to submit assistance request.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Loading

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-teal-500"></div>

          <p className="text-slate-400">Loading request information...</p>
        </div>
      </div>
    );
  }

  // Service Not Found

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
          <div className="mb-4 text-5xl">⚠️</div>

          <h2 className="text-xl font-bold text-white">Service Not Found</h2>

          <p className="mt-2 text-slate-400">
            The selected roadside service could not be found.
          </p>

          <Link
            to="/services"
            className="mt-6 inline-block rounded-lg bg-teal-500 px-5 py-3 font-semibold text-slate-950 hover:bg-teal-400"
          >
            Back to Services
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10">
      <div className="mx-auto max-w-3xl">
        {/* Back */}
        <Link
          to="/services"
          className="text-sm text-slate-400 transition hover:text-teal-400"
        >
          ← Back to Services
        </Link>

        {/* Page Header */}
        <div className="mt-6">
          <p className="text-sm font-semibold uppercase tracking-wider text-teal-400">
            Emergency Roadside Assistance
          </p>

          <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
            Request Assistance
          </h1>

          <p className="mt-2 text-slate-400">
            Tell us what you need and we will help you as quickly as possible.
          </p>
        </div>

        {/* Selected Service */}
        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <p className="mb-4 text-sm font-medium text-slate-400">
            Selected Service
          </p>

          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 text-4xl">
              {service.icon}
            </div>

            <div>
              <h2 className="text-xl font-bold text-white">{service.name}</h2>

              <p className="mt-1 text-sm text-slate-400">
                {service.description}
              </p>

              <p className="mt-2 text-sm font-semibold text-teal-400">
                Starting from ${service.basePrice}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Error */}
          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4">
              <p className="text-sm text-green-400">{success}</p>
            </div>
          )}

          {/* Vehicle Selection */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-lg font-bold text-white">
              1. Select Your Vehicle
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Select the vehicle that needs assistance.
            </p>

            {vehicles.length === 0 ? (
              <div className="mt-5 rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-5">
                <p className="text-sm text-yellow-400">
                  You don't have any vehicles registered.
                </p>

                <Link
                  to="/vehicles/add"
                  className="mt-3 inline-block text-sm font-semibold text-teal-400 hover:text-teal-300"
                >
                  + Add a Vehicle
                </Link>
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {vehicles.map((vehicle) => (
                  <label
                    key={vehicle._id}
                    className={`block cursor-pointer rounded-xl border p-4 transition ${
                      selectedVehicle === vehicle._id
                        ? "border-teal-500 bg-teal-500/10"
                        : "border-slate-700 bg-slate-950 hover:border-slate-600"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <input
                        type="radio"
                        name="vehicle"
                        value={vehicle._id}
                        checked={selectedVehicle === vehicle._id}
                        onChange={(e) => setSelectedVehicle(e.target.value)}
                        className="h-4 w-4 accent-teal-500"
                      />

                      <div className="flex-1">
                        <h3 className="font-semibold text-white">
                          {vehicle.make} {vehicle.model}
                        </h3>

                        <p className="mt-1 text-sm text-slate-400">
                          {vehicle.year} • {vehicle.color}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          License Plate: {vehicle.licensePlate}
                        </p>
                      </div>

                      <div className="text-2xl">🚗</div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Location */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-lg font-bold text-white">2. Your Location</h2>

            <p className="mt-1 text-sm text-slate-400">
              We need your current location so the assistance team can find you.
            </p>

            <button
              type="button"
              onClick={getCurrentLocation}
              disabled={locationLoading}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-teal-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-teal-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {locationLoading ? (
                <>
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-950 border-t-transparent"></span>
                  Getting Location...
                </>
              ) : (
                <>📍 Get Current Location</>
              )}
            </button>

            {/* Location Result */}
            {location.latitude && location.longitude && (
              <div className="mt-4 rounded-xl border border-green-500/20 bg-green-500/10 p-4">
                <div className="flex gap-3">
                  <span className="text-xl">✅</span>

                  <div>
                    <p className="font-semibold text-green-400">
                      Location detected
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Latitude: {location.latitude}
                    </p>

                    <p className="text-xs text-slate-400">
                      Longitude: {location.longitude}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Problem Description */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-lg font-bold text-white">
              3. Describe Your Problem
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Tell us what happened so the assistance team can prepare.
            </p>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="5"
              placeholder="Example: My car stopped suddenly on the road and won't start..."
              className="mt-5 w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
            />

            <p className="mt-2 text-right text-xs text-slate-500">
              {description.length}/500
            </p>
          </div>

          {/* Submit */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-5">
              <h2 className="text-lg font-bold text-white">
                Ready to Request Help?
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Your request will be sent to our assistance team.
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting || vehicles.length === 0}
              className="w-full rounded-xl bg-teal-500 px-6 py-4 font-bold text-slate-950 transition hover:bg-teal-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting
                ? "Sending Request..."
                : "🚨 Request Emergency Assistance"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestAssistance;
