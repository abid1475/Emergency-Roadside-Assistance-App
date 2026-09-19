import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const DriverProfile = () => {
  const navigate = useNavigate();

  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    licenseNumber: "",
    vehicle: {
      make: "",
      model: "",
      year: "",
      color: "",
      licensePlate: "",
    },
    vehicleType: "tow-truck",
  });

  // ==========================================
  // GET DRIVER PROFILE
  // ==========================================
  const getDriverProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get(
        "https://emergency-roadside-assistance-app-backend.onrender.com/api/v1/drivers/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log("Driver Profile:", response.data);

      if (response.data.success) {
        const driverData = response.data.driver;

        setDriver(driverData);

        setFormData({
          name: driverData.name || "",
          phone: driverData.phone || "",
          licenseNumber: driverData.licenseNumber || "",

          vehicle: {
            make: driverData.vehicle?.make || "",
            model: driverData.vehicle?.model || "",
            year: driverData.vehicle?.year || "",
            color: driverData.vehicle?.color || "",
            licensePlate: driverData.vehicle?.licensePlate || "",
          },

          vehicleType: driverData.vehicleType || "tow-truck",
        });
      }
    } catch (error) {
      console.error("Get Driver Profile Error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      /*
        404 normally means the logged-in user
        does not have a driver profile yet.
      */
      if (error.response?.status === 404) {
        setDriver(null);
      } else {
        setError(
          error.response?.data?.message || "Unable to load driver profile",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOAD DRIVER PROFILE
  // ==========================================
  useEffect(() => {
    getDriverProfile();
  }, []);

  // ==========================================
  // HANDLE INPUT CHANGE
  // ==========================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================
  // HANDLE VEHICLE INPUT CHANGE
  // ==========================================
  const handleVehicleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      vehicle: {
        ...previous.vehicle,
        [name]: value,
      },
    }));
  };

  // ==========================================
  // CREATE DRIVER PROFILE
  // ==========================================
  const createDriverProfile = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.post(
        "http://localhost:3000/api/v1/drivers",
        {
          name: formData.name,
          phone: formData.phone,
          licenseNumber: formData.licenseNumber,

          vehicle: {
            make: formData.vehicle.make,
            model: formData.vehicle.model,
            year: Number(formData.vehicle.year),
            color: formData.vehicle.color,
            licensePlate: formData.vehicle.licensePlate,
          },

          vehicleType: formData.vehicleType,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      console.log("Create Driver Response:", response.data);

      if (response.data.success) {
        setDriver(response.data.driver);

        setMessage("Driver profile created successfully.");

        /*
          Refresh profile so all information
          comes directly from backend.
        */
        await getDriverProfile();
      }
    } catch (error) {
      console.error("Create Driver Error:", error);

      setError(
        error.response?.data?.message || "Unable to create driver profile",
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // UPDATE DRIVER PROFILE
  // ==========================================
  const updateDriverProfile = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.put(
        "https://emergency-roadside-assistance-app-backend.onrender.com/api/v1/drivers/profile",
        {
          name: formData.name,
          phone: formData.phone,
          licenseNumber: formData.licenseNumber,

          vehicle: {
            make: formData.vehicle.make,
            model: formData.vehicle.model,
            year: Number(formData.vehicle.year),
            color: formData.vehicle.color,
            licensePlate: formData.vehicle.licensePlate,
          },

          vehicleType: formData.vehicleType,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      console.log("Update Driver Response:", response.data);

      if (response.data.success) {
        setDriver(response.data.driver);

        setMessage("Driver profile updated successfully.");

        await getDriverProfile();
      }
    } catch (error) {
      console.error("Update Driver Error:", error);

      setError(
        error.response?.data?.message || "Unable to update driver profile",
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-teal-500"></div>

          <p className="text-slate-400">Loading driver profile...</p>
        </div>
      </div>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10">
      {/* ==========================================
          HEADER
      ========================================== */}
      <div className="mx-auto mb-8 max-w-4xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Driver Profile</h1>

            <p className="mt-2 text-sm text-slate-400">
              {driver
                ? "Manage your driver information and towing vehicle."
                : "Create your driver profile to provide roadside assistance."}
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              to="/profile"
              className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-teal-500 hover:text-teal-400"
            >
              ← Profile
            </Link>

            {driver && (
              <Link
                to="/driver/dashboard"
                className="rounded-lg bg-teal-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-teal-400"
              >
                Dashboard
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl">
        {/* ==========================================
            SUCCESS MESSAGE
        ========================================== */}
        {message && (
          <div className="mb-6 rounded-xl border border-green-500/30 bg-green-500/10 p-4">
            <p className="text-sm font-medium text-green-400">✅ {message}</p>
          </div>
        )}

        {/* ==========================================
            ERROR MESSAGE
        ========================================== */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
            <p className="text-sm font-medium text-red-400">⚠️ {error}</p>
          </div>
        )}

        {/* ==========================================
            DRIVER STATUS
        ========================================== */}
        {driver && (
          <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-teal-500/10 text-3xl">
                  🚚
                </div>

                <div>
                  <h2 className="font-bold text-white">Driver Account</h2>

                  <p className="mt-1 text-sm text-slate-400">{driver.name}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {/* Account Status */}
                <span
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${
                    driver.status === "approved"
                      ? "bg-green-500/10 text-green-400"
                      : driver.status === "pending"
                        ? "bg-yellow-500/10 text-yellow-400"
                        : driver.status === "suspended"
                          ? "bg-red-500/10 text-red-400"
                          : "bg-slate-500/10 text-slate-400"
                  }`}
                >
                  {driver.status || "pending"}
                </span>

                {/* Availability */}
                <span className="rounded-full bg-slate-800 px-3 py-1.5 text-xs font-semibold capitalize text-slate-300">
                  {driver.availability || "offline"}
                </span>
              </div>
            </div>

            {/* Pending Notice */}
            {driver.status === "pending" && (
              <div className="mt-5 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">
                <p className="text-sm font-medium text-yellow-400">
                  ⏳ Your driver profile is waiting for admin approval.
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  You will be able to receive roadside assistance requests after
                  approval.
                </p>
              </div>
            )}

            {/* Approved Notice */}
            {driver.status === "approved" && (
              <div className="mt-5 rounded-xl border border-green-500/20 bg-green-500/5 p-4">
                <p className="text-sm font-medium text-green-400">
                  ✅ Your driver account is approved.
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  You can use the Driver Dashboard to manage your requests.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ==========================================
            DRIVER FORM
        ========================================== */}
        <form
          onSubmit={driver ? updateDriverProfile : createDriverProfile}
          className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl"
        >
          {/* ==========================================
              PERSONAL INFORMATION
          ========================================== */}
          <div className="border-b border-slate-800 p-6">
            <h2 className="text-xl font-bold text-white">Driver Information</h2>

            <p className="mt-1 text-sm text-slate-500">
              Enter your personal and license information.
            </p>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {/* Name */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Full Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter driver name"
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-teal-500"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Phone Number
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="03001234567"
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-teal-500"
                />
              </div>

              {/* License */}
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Driving License Number
                </label>

                <input
                  type="text"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  placeholder="DL-123456"
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-teal-500"
                />
              </div>
            </div>
          </div>

          {/* ==========================================
              VEHICLE INFORMATION
          ========================================== */}
          <div className="border-b border-slate-800 p-6">
            <h2 className="text-xl font-bold text-white">Towing Vehicle</h2>

            <p className="mt-1 text-sm text-slate-500">
              Enter the vehicle information you use for roadside assistance.
            </p>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {/* Make */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Vehicle Make
                </label>

                <input
                  type="text"
                  name="make"
                  value={formData.vehicle.make}
                  onChange={handleVehicleChange}
                  placeholder="Isuzu"
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-teal-500"
                />
              </div>

              {/* Model */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Vehicle Model
                </label>

                <input
                  type="text"
                  name="model"
                  value={formData.vehicle.model}
                  onChange={handleVehicleChange}
                  placeholder="NPR"
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-teal-500"
                />
              </div>

              {/* Year */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Vehicle Year
                </label>

                <input
                  type="number"
                  name="year"
                  value={formData.vehicle.year}
                  onChange={handleVehicleChange}
                  placeholder="2024"
                  min="1900"
                  max="2100"
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-teal-500"
                />
              </div>

              {/* Color */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Vehicle Color
                </label>

                <input
                  type="text"
                  name="color"
                  value={formData.vehicle.color}
                  onChange={handleVehicleChange}
                  placeholder="White"
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-teal-500"
                />
              </div>

              {/* License Plate */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  License Plate
                </label>

                <input
                  type="text"
                  name="licensePlate"
                  value={formData.vehicle.licensePlate}
                  onChange={handleVehicleChange}
                  placeholder="ABC-123"
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-teal-500"
                />
              </div>

              {/* Vehicle Type */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Vehicle Type
                </label>

                <select
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-teal-500"
                >
                  <option value="tow-truck">Tow Truck</option>

                  <option value="flatbed">Flatbed</option>

                  <option value="recovery-truck">Recovery Truck</option>

                  <option value="roadside-vehicle">Roadside Vehicle</option>

                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* ==========================================
              LOCATION INFORMATION
          ========================================== */}
          {driver && (
            <div className="border-b border-slate-800 p-6">
              <h2 className="text-xl font-bold text-white">Current Location</h2>

              <p className="mt-1 text-sm text-slate-500">
                Your current driver location will be managed from the dashboard.
              </p>

              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Latitude
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-300">
                    {driver.location?.latitude ?? "Not available"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Longitude
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-300">
                    {driver.location?.longitude ?? "Not available"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Address
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-300">
                    {driver.location?.address || "Not available"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              BUTTONS
          ========================================== */}
          <div className="flex flex-col gap-3 bg-slate-800/30 p-6 sm:flex-row sm:justify-end">
            <Link
              to="/profile"
              className="rounded-lg border border-slate-700 px-6 py-3 text-center text-sm font-semibold text-slate-300 transition hover:border-slate-500"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-teal-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-teal-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : driver
                  ? "Update Driver Profile"
                  : "Create Driver Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DriverProfile;
