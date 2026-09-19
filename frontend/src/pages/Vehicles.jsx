import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const Vehicles = () => {
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Get vehicles
  const getVehicles = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get(
        "http://localhost:3000/api/v1/vehicles",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log("Vehicles:", response.data);

      setVehicles(response.data.vehicles);
    } catch (error) {
      console.error("Get Vehicles Error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
        return;
      }

      setError(error.response?.data?.message || "Unable to load vehicles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getVehicles();
  }, []);

  // Delete vehicle
  const handleDelete = async (vehicleId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this vehicle?",
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await axios.delete(`http://localhost:3000/api/v1/vehicles/${vehicleId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Remove vehicle from UI
      setVehicles((previousVehicles) =>
        previousVehicles.filter((vehicle) => vehicle._id !== vehicleId),
      );
    } catch (error) {
      console.error("Delete Vehicle Error:", error);

      alert(error.response?.data?.message || "Unable to delete vehicle");
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-teal-500"></div>

          <p className="text-slate-400">Loading vehicles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">My Vehicles</h1>

            <p className="mt-2 text-slate-400">
              Manage your vehicles for roadside assistance
            </p>
          </div>

          <Link
            to="/vehicles/add"
            className="rounded-lg bg-teal-500 px-5 py-3 text-center font-semibold text-slate-950 transition hover:bg-teal-400"
          >
            + Add Vehicle
          </Link>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400">
            {error}
          </div>
        )}

        {/* No Vehicles */}
        {vehicles.length === 0 && !error && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
            <div className="mb-4 text-5xl">🚗</div>

            <h2 className="text-xl font-bold text-white">No Vehicles Added</h2>

            <p className="mt-2 text-slate-400">
              Add your vehicle so you can quickly request roadside assistance.
            </p>

            <Link
              to="/vehicles/add"
              className="mt-6 inline-block rounded-lg bg-teal-500 px-5 py-3 font-semibold text-slate-950 hover:bg-teal-400"
            >
              Add Your First Vehicle
            </Link>
          </div>
        )}

        {/* Vehicle Grid */}
        {vehicles.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2">
            {vehicles.map((vehicle) => (
              <div
                key={vehicle._id}
                className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl"
              >
                {/* Vehicle Header */}
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-teal-500/10 text-3xl">
                      🚗
                    </div>

                    <div>
                      <h2 className="text-xl font-bold text-white">
                        {vehicle.make} {vehicle.model}
                      </h2>

                      <p className="text-sm text-slate-400">
                        {vehicle.vehicleType}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Vehicle Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-slate-950 p-3">
                    <p className="text-xs text-slate-500">Year</p>

                    <p className="mt-1 font-medium text-slate-200">
                      {vehicle.year}
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-950 p-3">
                    <p className="text-xs text-slate-500">Color</p>

                    <p className="mt-1 font-medium text-slate-200">
                      {vehicle.color}
                    </p>
                  </div>

                  <div className="col-span-2 rounded-lg bg-slate-950 p-3">
                    <p className="text-xs text-slate-500">License Plate</p>

                    <p className="mt-1 font-medium uppercase text-slate-200">
                      {vehicle.licensePlate}
                    </p>
                  </div>
                </div>

                {/* Buttons */}
                <div className="mt-6 flex gap-3">
                  <Link
                    to={`/vehicles/edit/${vehicle._id}`}
                    className="flex-1 rounded-lg border border-slate-700 px-4 py-2.5 text-center font-medium text-slate-300 transition hover:border-teal-500 hover:text-teal-400"
                  >
                    Edit
                  </Link>

                  <button
                    onClick={() => handleDelete(vehicle._id)}
                    className="flex-1 rounded-lg bg-red-500/10 px-4 py-2.5 font-medium text-red-400 transition hover:bg-red-500/20"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Back */}
        <div className="mt-8">
          <Link
            to="/profile"
            className="text-sm text-slate-400 hover:text-teal-400"
          >
            ← Back to Profile
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Vehicles;
