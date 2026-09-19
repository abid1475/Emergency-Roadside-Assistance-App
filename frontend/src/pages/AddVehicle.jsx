import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const AddVehicle = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    make: "",
    model: "",
    year: "",
    color: "",
    licensePlate: "",
    vehicleType: "Car",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.post(
        "https://emergency-roadside-assistance-app-backend.onrender.com/api/v1/vehicles",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log("Add Vehicle Response:", response.data);

      if (response.data.success) {
        navigate("/vehicles");
      }
    } catch (error) {
      console.error("Add Vehicle Error:", error);

      setError(error.response?.data?.message || "Unable to add vehicle");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/vehicles"
            className="text-sm text-slate-400 hover:text-teal-400"
          >
            ← Back to Vehicles
          </Link>

          <h1 className="mt-5 text-3xl font-bold text-white">Add Vehicle</h1>

          <p className="mt-2 text-slate-400">Add your vehicle information</p>
        </div>

        {/* Form */}
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
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
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
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
              />
            </div>

            {/* Year + Color */}
            <div className="grid gap-5 sm:grid-cols-2">
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
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-teal-500"
                />
              </div>

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
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-teal-500"
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
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 uppercase text-white outline-none placeholder:text-slate-500 focus:border-teal-500"
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
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-teal-500"
              >
                <option value="Car">Car</option>
                <option value="SUV">SUV</option>
                <option value="Truck">Truck</option>
                <option value="Van">Van</option>
                <option value="Motorcycle">Motorcycle</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-teal-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-teal-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Adding Vehicle..." : "Add Vehicle"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddVehicle;
