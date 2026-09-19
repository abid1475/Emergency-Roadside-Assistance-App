import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";

const EditVehicle = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    make: "",
    model: "",
    year: "",
    color: "",
    licensePlate: "",
    vehicleType: "Car",
  });

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  // Get selected vehicle
  useEffect(() => {
    const getVehicle = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        // Get all user's vehicles
        const response = await axios.get(
          "https://emergency-roadside-assistance-app-backend.onrender.com/api/v1/vehicles",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const vehicles = response.data.vehicles;

        // Find vehicle using URL ID
        const vehicle = vehicles.find((item) => item._id === id);

        if (!vehicle) {
          setError("Vehicle not found");
          return;
        }

        // Fill form with existing vehicle data
        setFormData({
          make: vehicle.make || "",
          model: vehicle.model || "",
          year: vehicle.year || "",
          color: vehicle.color || "",
          licensePlate: vehicle.licensePlate || "",
          vehicleType: vehicle.vehicleType || "Car",
        });
      } catch (error) {
        console.error("Get Vehicle Error:", error);

        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");

          navigate("/login");
          return;
        }

        setError(error.response?.data?.message || "Unable to load vehicle");
      } finally {
        setLoading(false);
      }
    };

    getVehicle();
  }, [id, navigate]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  // Update vehicle
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    try {
      setUpdating(true);

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.put(
        `https://emergency-roadside-assistance-app-backend.onrender.com/api/v1/vehicles/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log("Update Vehicle Response:", response.data);

      if (response.data.success) {
        navigate("/vehicles");
      }
    } catch (error) {
      console.error("Update Vehicle Error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
        return;
      }

      setError(error.response?.data?.message || "Unable to update vehicle");
    } finally {
      setUpdating(false);
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-teal-500"></div>

          <p className="text-slate-400">Loading vehicle...</p>
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
          <h2 className="mb-3 text-xl font-bold text-red-400">{error}</h2>

          <Link
            to="/vehicles"
            className="mt-4 inline-block rounded-lg bg-teal-500 px-5 py-3 font-semibold text-slate-950 hover:bg-teal-400"
          >
            Back to Vehicles
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/vehicles"
            className="text-sm text-slate-400 transition hover:text-teal-400"
          >
            ← Back to Vehicles
          </Link>

          <h1 className="mt-5 text-3xl font-bold text-white">Edit Vehicle</h1>

          <p className="mt-2 text-slate-400">Update your vehicle information</p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl sm:p-8">
          {error && (
            <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Make */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Vehicle Make
              </label>

              <input
                type="text"
                name="make"
                value={formData.make}
                onChange={handleChange}
                placeholder="e.g. Toyota"
                required
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
              />
            </div>

            {/* Model */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Model
              </label>

              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                placeholder="e.g. Corolla"
                required
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
              />
            </div>

            {/* Year + Color */}
            <div className="grid gap-5 sm:grid-cols-2">
              {/* Year */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">
                  Year
                </label>

                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  placeholder="2020"
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              {/* Color */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">
                  Color
                </label>

                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  placeholder="White"
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                />
              </div>
            </div>

            {/* License Plate */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                License Plate
              </label>

              <input
                type="text"
                name="licensePlate"
                value={formData.licensePlate}
                onChange={handleChange}
                placeholder="ABC-123"
                required
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 uppercase text-white outline-none placeholder:text-slate-500 transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
              />
            </div>

            {/* Vehicle Type */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Vehicle Type
              </label>

              <select
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
              >
                <option value="Car">Car</option>
                <option value="SUV">SUV</option>
                <option value="Truck">Truck</option>
                <option value="Van">Van</option>
                <option value="Motorcycle">Motorcycle</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-3 pt-3 sm:flex-row">
              <Link
                to="/vehicles"
                className="flex-1 rounded-lg border border-slate-700 px-4 py-3 text-center font-semibold text-slate-300 transition hover:border-slate-500"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={updating}
                className="flex-1 rounded-lg bg-teal-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-teal-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {updating ? "Updating..." : "Update Vehicle"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditVehicle;
