import React, { useEffect, useState } from "react";
import axios from "axios";

const Admin = () => {
  // ==========================================
  // STATE
  // ==========================================

  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [updatingDriverId, setUpdatingDriverId] = useState(null);

  // ==========================================
  // GET TOKEN
  // ==========================================

  const token = localStorage.getItem("token");

  // ==========================================
  // GET ALL DRIVERS
  // ==========================================

  const getAllDrivers = async () => {
    try {
      setLoading(true);
      setError("");

      if (!token) {
        setError("You are not logged in. Please login as an admin.");
        setLoading(false);
        return;
      }

      const response = await axios.get("https://emergency-roadside-assistance-app-backend.onrender.com/api/v1/drivers", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Drivers Response:", response.data);

      setDrivers(response.data.drivers || []);
    } catch (error) {
      console.error("Get Drivers Error:", error);

      if (error.response?.status === 401) {
        setError("Your session has expired. Please login again.");
      } else if (error.response?.status === 403) {
        setError("Access denied. Admin access is required.");
      } else {
        setError(
          error.response?.data?.message || "Failed to load driver requests.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // UPDATE DRIVER STATUS
  // ==========================================

  const updateDriverStatus = async (driverId, status) => {
    try {
      setError("");
      setSuccess("");
      setUpdatingDriverId(driverId);

      if (!token) {
        setError("You are not logged in. Please login again.");
        return;
      }

      console.log("Updating Driver:", driverId);
      console.log("New Status:", status);

      const response = await axios.put(
        `http://localhost:3000/api/v1/drivers/${driverId}/status`,
        {
          status: status,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      console.log("Update Driver Response:", response.data);

      // Success message
      if (status === "approved") {
        setSuccess("Driver approved successfully.");
      } else if (status === "rejected") {
        setSuccess("Driver rejected successfully.");
      } else if (status === "suspended") {
        setSuccess("Driver suspended successfully.");
      } else {
        setSuccess("Driver status updated successfully.");
      }

      // Refresh driver list
      await getAllDrivers();
    } catch (error) {
      console.error("Update Driver Status Error:", error);

      if (error.response?.status === 401) {
        setError("Your session has expired. Please login again.");
      } else if (error.response?.status === 403) {
        setError("Access denied. Only an admin can update driver status.");
      } else {
        setError(
          error.response?.data?.message || "Failed to update driver status.",
        );
      }
    } finally {
      setUpdatingDriverId(null);
    }
  };

  // ==========================================
  // APPROVE DRIVER
  // ==========================================

  const handleApprove = (driverId) => {
    const confirmed = window.confirm(
      "Are you sure you want to approve this driver?",
    );

    if (!confirmed) {
      return;
    }

    updateDriverStatus(driverId, "approved");
  };

  // ==========================================
  // REJECT DRIVER
  // ==========================================

  const handleReject = (driverId) => {
    const confirmed = window.confirm(
      "Are you sure you want to reject this driver?",
    );

    if (!confirmed) {
      return;
    }

    updateDriverStatus(driverId, "rejected");
  };

  // ==========================================
  // LOAD DRIVERS WHEN PAGE OPENS
  // ==========================================

  useEffect(() => {
    getAllDrivers();
  }, []);

  // ==========================================
  // COUNTS
  // ==========================================

  const pendingDrivers = drivers.filter(
    (driver) => driver.status === "pending",
  );

  const approvedDrivers = drivers.filter(
    (driver) => driver.status === "approved",
  );

  const rejectedDrivers = drivers.filter(
    (driver) => driver.status === "rejected",
  );

  // ==========================================
  // STATUS BADGE
  // ==========================================

  const getStatusClass = (status) => {
    if (status === "approved") {
      return "bg-green-500/10 text-green-400 ring-1 ring-green-500/20";
    }

    if (status === "rejected") {
      return "bg-red-500/10 text-red-400 ring-1 ring-red-500/20";
    }

    if (status === "suspended") {
      return "bg-orange-500/10 text-orange-400 ring-1 ring-orange-500/20";
    }

    return "bg-yellow-500/10 text-yellow-400 ring-1 ring-yellow-500/20";
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6 lg:px-8">
      {/* ==========================================
          MAIN CONTAINER
      ========================================== */}

      <div className="mx-auto max-w-7xl">
        {/* ==========================================
            HEADER
        ========================================== */}

        <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-2xl shadow-lg shadow-blue-600/20">
                🛠️
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Admin Dashboard
                </h1>

                <p className="mt-1 text-sm text-slate-400">
                  Emergency Roadside Assistance
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm text-slate-400">
              Manage and review all driver registration requests.
            </p>
          </div>

          {/* Refresh Button */}

          <button
            onClick={getAllDrivers}
            disabled={loading || updatingDriverId !== null}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition duration-200 hover:bg-blue-700 hover:shadow-blue-600/30 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className={loading ? "animate-spin" : ""}>↻</span>

            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* ==========================================
            SUCCESS MESSAGE
        ========================================== */}

        {success && (
          <div className="mb-8 flex items-center gap-3 rounded-xl border border-green-800/50 bg-green-950/40 px-5 py-4 text-green-400">
            <span className="text-xl">✅</span>

            <p className="text-sm font-medium">{success}</p>

            <button
              onClick={() => setSuccess("")}
              className="ml-auto text-green-500 hover:text-green-300"
            >
              ✕
            </button>
          </div>
        )}

        {/* ==========================================
            ERROR MESSAGE
        ========================================== */}

        {error && (
          <div className="mb-8 flex items-center gap-3 rounded-xl border border-red-800/50 bg-red-950/40 px-5 py-4 text-red-400">
            <span className="text-xl">⚠️</span>

            <p className="text-sm font-medium">{error}</p>

            <button
              onClick={() => setError("")}
              className="ml-auto text-red-500 hover:text-red-300"
            >
              ✕
            </button>
          </div>
        )}

        {/* ==========================================
            STATISTICS
        ========================================== */}

        <div className="mb-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Drivers */}

          <div className="group rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg transition duration-300 hover:-translate-y-1 hover:border-blue-600/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">
                  Total Drivers
                </p>

                <h2 className="mt-3 text-4xl font-bold text-white">
                  {drivers.length}
                </h2>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600/10 text-2xl">
                👨‍🔧
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-500">
              All registered drivers
            </p>
          </div>

          {/* Pending Drivers */}

          <div className="group rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg transition duration-300 hover:-translate-y-1 hover:border-yellow-600/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-400">
                  Pending Requests
                </p>

                <h2 className="mt-3 text-4xl font-bold text-white">
                  {pendingDrivers.length}
                </h2>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-500/10 text-2xl">
                ⏳
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-500">Waiting for approval</p>
          </div>

          {/* Approved Drivers */}

          <div className="group rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg transition duration-300 hover:-translate-y-1 hover:border-green-600/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-400">
                  Approved Drivers
                </p>

                <h2 className="mt-3 text-4xl font-bold text-white">
                  {approvedDrivers.length}
                </h2>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10 text-2xl">
                ✅
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-500">Approved drivers</p>
          </div>

          {/* Rejected Drivers */}

          <div className="group rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg transition duration-300 hover:-translate-y-1 hover:border-red-600/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-400">
                  Rejected Drivers
                </p>

                <h2 className="mt-3 text-4xl font-bold text-white">
                  {rejectedDrivers.length}
                </h2>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-2xl">
                ❌
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-500">Rejected requests</p>
          </div>
        </div>

        {/* ==========================================
            DRIVER REQUESTS SECTION
        ========================================== */}

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl sm:p-6">
          {/* Section Header */}

          <div className="mb-6 flex flex-col gap-3 border-b border-slate-800 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold sm:text-2xl">
                All Driver Requests
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Review registered driver profiles
              </p>
            </div>

            <span className="w-fit rounded-full bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-400">
              {drivers.length} Drivers
            </span>
          </div>

          {/* ==========================================
              LOADING
          ========================================== */}

          {loading ? (
            <div className="flex min-h-[250px] flex-col items-center justify-center">
              <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500"></div>

              <p className="text-sm text-slate-400">
                Loading driver requests...
              </p>
            </div>
          ) : drivers.length === 0 ? (
            /* ==========================================
               NO DATA
            ========================================== */

            <div className="flex min-h-[250px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-700">
              <div className="mb-4 text-5xl">🚗</div>

              <h3 className="text-lg font-semibold">No Driver Requests</h3>

              <p className="mt-2 text-sm text-slate-500">
                No driver registration requests found.
              </p>
            </div>
          ) : (
            /* ==========================================
               DRIVER GRID
            ========================================== */

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {drivers.map((driver) => (
                <div
                  className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 transition duration-300 hover:border-slate-700 hover:shadow-xl"
                  key={driver._id}
                >
                  {/* ==========================================
                      DRIVER HEADER
                  ========================================== */}

                  <div className="flex flex-col gap-4 border-b border-slate-800 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      {/* Avatar */}

                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-xl font-bold shadow-lg shadow-blue-500/20">
                        {driver.name
                          ? driver.name.charAt(0).toUpperCase()
                          : "D"}
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-white">
                          {driver.name || "Unknown Driver"}
                        </h3>

                        <p className="mt-1 text-sm text-slate-400">
                          📞 {driver.phone || "No phone number"}
                        </p>
                      </div>
                    </div>

                    {/* Status */}

                    <span
                      className={`w-fit rounded-full px-3 py-1.5 text-xs font-bold capitalize ${getStatusClass(
                        driver.status,
                      )}`}
                    >
                      {driver.status || "pending"}
                    </span>
                  </div>

                  {/* ==========================================
                      DRIVER INFORMATION
                  ========================================== */}

                  <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
                    {/* License */}

                    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        License Number
                      </p>

                      <p className="mt-2 text-sm font-semibold text-white">
                        {driver.licenseNumber || "N/A"}
                      </p>
                    </div>

                    {/* Vehicle Type */}

                    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Vehicle Type
                      </p>

                      <p className="mt-2 text-sm font-semibold capitalize text-white">
                        {driver.vehicleType || "N/A"}
                      </p>
                    </div>

                    {/* Availability */}

                    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Availability
                      </p>

                      <p
                        className={`mt-2 text-sm font-semibold capitalize ${
                          driver.availability === "available"
                            ? "text-green-400"
                            : driver.availability === "busy"
                              ? "text-yellow-400"
                              : "text-slate-400"
                        }`}
                      >
                        ● {driver.availability || "offline"}
                      </p>
                    </div>

                    {/* Vehicle */}

                    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Vehicle
                      </p>

                      <p className="mt-2 text-sm font-semibold text-white">
                        {driver.vehicle?.make || "N/A"}{" "}
                        {driver.vehicle?.model || ""}
                      </p>
                    </div>

                    {/* Vehicle Year */}

                    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Vehicle Year
                      </p>

                      <p className="mt-2 text-sm font-semibold text-white">
                        {driver.vehicle?.year || "N/A"}
                      </p>
                    </div>

                    {/* Vehicle Color */}

                    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Vehicle Color
                      </p>

                      <p className="mt-2 text-sm font-semibold text-white">
                        {driver.vehicle?.color || "N/A"}
                      </p>
                    </div>

                    {/* License Plate */}

                    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 sm:col-span-2">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        License Plate
                      </p>

                      <p className="mt-2 text-sm font-bold uppercase tracking-wider text-blue-400">
                        {driver.vehicle?.licensePlate || "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* ==========================================
                      REQUEST DATE
                  ========================================== */}

                  <div className="border-t border-slate-800 px-5 py-4">
                    <p className="text-xs text-slate-500">Request Date</p>

                    <p className="mt-1 text-sm font-medium text-slate-300">
                      {driver.createdAt
                        ? new Date(driver.createdAt).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>

                  {/* ==========================================
                      ACTION AREA
                  ========================================== */}

                  <div className="border-t border-slate-800 bg-slate-900/50 p-5">
                    {driver.status === "pending" ? (
                      <div className="flex flex-col gap-3 sm:flex-row">
                        {/* APPROVE BUTTON */}

                        <button
                          onClick={() => handleApprove(driver._id)}
                          disabled={updatingDriverId === driver._id}
                          className="flex-1 rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-green-600/10 transition duration-200 hover:bg-green-700 hover:shadow-green-600/20 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {updatingDriverId === driver._id ? (
                            <span className="flex items-center justify-center gap-2">
                              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                              Updating...
                            </span>
                          ) : (
                            "✓ Approve Driver"
                          )}
                        </button>

                        {/* REJECT BUTTON */}

                        <button
                          onClick={() => handleReject(driver._id)}
                          disabled={updatingDriverId === driver._id}
                          className="flex-1 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-red-600/10 transition duration-200 hover:bg-red-700 hover:shadow-red-600/20 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {updatingDriverId === driver._id ? (
                            <span className="flex items-center justify-center gap-2">
                              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                              Updating...
                            </span>
                          ) : (
                            "✕ Reject Driver"
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center rounded-xl border border-slate-800 bg-slate-950 px-4 py-3">
                        <p className="text-sm text-slate-400">
                          Driver request is{" "}
                          <strong
                            className={`capitalize ${
                              driver.status === "approved"
                                ? "text-green-400"
                                : driver.status === "rejected"
                                  ? "text-red-400"
                                  : "text-yellow-400"
                            }`}
                          >
                            {driver.status}
                          </strong>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
