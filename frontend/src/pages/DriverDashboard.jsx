import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import DriverLocationTracking from "../components/DriverLocationTracking";

const DRIVER_API = "https://emergency-roadside-assistance-app-backend.onrender.com/api/v1/drivers";
const DRIVER_REQUEST_API = "https://emergency-roadside-assistance-app-backend.onrender.com/api/v1/driver-requests";

const DriverDashboard = () => {
  const navigate = useNavigate();

  // ======================================================
  // STATE
  // ======================================================

  const [driver, setDriver] = useState(null);
  const [requests, setRequests] = useState([]);

  const [loading, setLoading] = useState(true);
  const [requestsLoading, setRequestsLoading] = useState(false);

  const [error, setError] = useState("");
  const [requestError, setRequestError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [updatingAvailability, setUpdatingAvailability] = useState(false);

  const [acceptingRequest, setAcceptingRequest] = useState(null);
  const [rejectingRequest, setRejectingRequest] = useState(null);
  const [updatingRequest, setUpdatingRequest] = useState(null);

  const [stats, setStats] = useState({
    totalRequests: 0,
    completedRequests: 0,
    pendingRequests: 0,
    earnings: 0,
  });

  const token = localStorage.getItem("token");

  // ======================================================
  // AXIOS HEADERS
  // ======================================================

  const getHeaders = useCallback(
    () => ({
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }),
    [token],
  );

  // ======================================================
  // HANDLE AUTH ERROR
  // ======================================================

  const handleAuthError = useCallback(
    (error) => {
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");

        return true;
      }

      return false;
    },
    [navigate],
  );

  // ======================================================
  // SUCCESS MESSAGE
  // ======================================================

  const showSuccess = (message) => {
    setSuccessMessage(message);

    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  };

  // ======================================================
  // CALCULATE STATS
  // ======================================================

  const calculateStats = useCallback((requestList) => {
    const totalRequests = requestList.length;

    const completedRequests = requestList.filter(
      (request) => request.status === "completed",
    ).length;

    const pendingRequests = requestList.filter(
      (request) =>
        request.status === "pending" ||
        request.status === "driver_assigned" ||
        request.status === "accepted" ||
        request.status === "on_the_way" ||
        request.status === "arrived",
    ).length;

    setStats({
      totalRequests,
      completedRequests,
      pendingRequests,
      earnings: 0,
    });
  }, []);

  // ======================================================
  // GET DRIVER PROFILE
  // ======================================================

  const getDriverProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get(`${DRIVER_API}/profile`, getHeaders());

      console.log("Driver Profile:", response.data);

      if (response.data.success) {
        setDriver(response.data.driver);
      } else {
        setError(response.data.message || "Unable to load driver profile");
      }
    } catch (error) {
      console.error("Get Driver Profile Error:", error);

      if (handleAuthError(error)) {
        return;
      }

      setError(
        error.response?.data?.message || "Unable to load driver profile",
      );
    } finally {
      setLoading(false);
    }
  }, [token, navigate, getHeaders, handleAuthError]);

  // ======================================================
  // GET AVAILABLE CUSTOMER REQUESTS
  // ======================================================

  const getAvailableRequests = useCallback(async () => {
    try {
      if (
        !driver ||
        driver.status !== "approved" ||
        driver.availability !== "available"
      ) {
        return [];
      }

      const response = await axios.get(
        `${DRIVER_REQUEST_API}/available`,
        getHeaders(),
      );

      console.log("Available Customer Requests:", response.data);

      if (response.data.success) {
        return response.data.requests || [];
      }

      return [];
    } catch (error) {
      console.error("Get Available Requests Error:", error);

      if (handleAuthError(error)) {
        return [];
      }

      return [];
    }
  }, [driver, getHeaders, handleAuthError]);

  // ======================================================
  // GET DRIVER ASSIGNED REQUESTS
  // ======================================================

  const getMyRequests = useCallback(async () => {
    try {
      if (!driver || driver.status !== "approved") {
        return [];
      }

      const response = await axios.get(
        `${DRIVER_REQUEST_API}/my-requests`,
        getHeaders(),
      );

      console.log("My Driver Requests:", response.data);

      if (response.data.success) {
        return response.data.requests || [];
      }

      return [];
    } catch (error) {
      console.error("Get My Requests Error:", error);

      if (handleAuthError(error)) {
        return [];
      }

      return [];
    }
  }, [driver, getHeaders, handleAuthError]);

  // ======================================================
  // LOAD ALL REQUESTS
  // ======================================================

  const getDriverRequests = useCallback(async () => {
    try {
      if (!driver || driver.status !== "approved") {
        setRequests([]);
        calculateStats([]);
        return;
      }

      setRequestsLoading(true);
      setRequestError("");

      // Get requests that are waiting for a driver
      const availableRequests = await getAvailableRequests();

      // Get requests already assigned to this driver
      const myRequests = await getMyRequests();

      // Combine both lists
      const combinedRequests = [...availableRequests, ...myRequests];

      // Remove duplicate requests
      const uniqueRequests = Array.from(
        new Map(
          combinedRequests.map((request) => [request._id, request]),
        ).values(),
      );

      // Sort newest first
      uniqueRequests.sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
      );

      console.log("All Driver Requests:", uniqueRequests);

      setRequests(uniqueRequests);

      calculateStats(uniqueRequests);
    } catch (error) {
      console.error("Get Driver Requests Error:", error);

      if (handleAuthError(error)) {
        return;
      }

      setRequestError(
        error.response?.data?.message || "Unable to load customer requests",
      );
    } finally {
      setRequestsLoading(false);
    }
  }, [
    driver,
    getAvailableRequests,
    getMyRequests,
    calculateStats,
    handleAuthError,
  ]);

  // ======================================================
  // UPDATE DRIVER AVAILABILITY
  // ======================================================

  const updateAvailability = async (availability) => {
    try {
      if (!driver) {
        return;
      }

      if (driver.status !== "approved") {
        alert(
          "Your driver account must be approved before changing availability.",
        );
        return;
      }

      setUpdatingAvailability(true);
      setError("");

      const response = await axios.put(
        `${DRIVER_API}/availability`,
        {
          availability,
        },
        getHeaders(),
      );

      console.log("Availability Response:", response.data);

      if (response.data.success) {
        setDriver(response.data.driver);

        showSuccess(`You are now ${availability}.`);

        await getDriverRequests();
      } else {
        alert(response.data.message || "Unable to update availability");
      }
    } catch (error) {
      console.error("Update Availability Error:", error);

      if (handleAuthError(error)) {
        return;
      }

      alert(error.response?.data?.message || "Unable to update availability");
    } finally {
      setUpdatingAvailability(false);
    }
  };

  // ======================================================
  // ACCEPT CUSTOMER REQUEST
  // ======================================================

  const acceptRequest = async (requestId) => {
    try {
      if (!driver) {
        return;
      }

      if (driver.status !== "approved") {
        alert("Your driver account has not been approved yet.");
        return;
      }

      if (driver.availability !== "available") {
        alert("You must be available to accept a request.");
        return;
      }

      setAcceptingRequest(requestId);
      setRequestError("");

      const response = await axios.put(
        `${DRIVER_REQUEST_API}/${requestId}/accept`,
        {},
        getHeaders(),
      );

      console.log("Accept Request Response:", response.data);

      if (response.data.success) {
        showSuccess("Customer request accepted successfully!");

        // Driver becomes busy
        setDriver((prev) => {
          if (!prev) return prev;

          return {
            ...prev,
            availability: "busy",
          };
        });

        await getDriverProfile();
        await getDriverRequests();
      } else {
        alert(response.data.message || "Unable to accept request");
      }
    } catch (error) {
      console.error("Accept Request Error:", error);

      if (handleAuthError(error)) {
        return;
      }

      alert(error.response?.data?.message || "Unable to accept request");
    } finally {
      setAcceptingRequest(null);
    }
  };

  // ======================================================
  // REJECT CUSTOMER REQUEST
  // ======================================================

  const rejectRequest = async (requestId) => {
    try {
      if (!driver || driver.status !== "approved") {
        alert("Only approved drivers can reject requests.");
        return;
      }

      const confirmed = window.confirm(
        "Are you sure you want to reject this customer request?",
      );

      if (!confirmed) {
        return;
      }

      setRejectingRequest(requestId);
      setRequestError("");

      const response = await axios.put(
        `${DRIVER_REQUEST_API}/${requestId}/reject`,
        {},
        getHeaders(),
      );

      console.log("Reject Request Response:", response.data);

      if (response.data.success) {
        showSuccess("Customer request rejected successfully.");

        await getDriverRequests();
      } else {
        alert(response.data.message || "Unable to reject request");
      }
    } catch (error) {
      console.error("Reject Request Error:", error);

      if (handleAuthError(error)) {
        return;
      }

      alert(error.response?.data?.message || "Unable to reject request");
    } finally {
      setRejectingRequest(null);
    }
  };

  // ======================================================
  // UPDATE REQUEST STATUS
  // ======================================================

  const updateRequestStatus = async (requestId, status) => {
    try {
      setUpdatingRequest(requestId);
      setRequestError("");

      const response = await axios.put(
        `${DRIVER_REQUEST_API}/${requestId}/status`,
        {
          status,
        },
        getHeaders(),
      );

      console.log("Update Request Status:", response.data);

      if (response.data.success) {
        showSuccess(`Request status updated to ${status.replace(/_/g, " ")}.`);

        await getDriverProfile();
        await getDriverRequests();
      } else {
        alert(response.data.message || "Unable to update request status");
      }
    } catch (error) {
      console.error("Update Request Status Error:", error);

      if (handleAuthError(error)) {
        return;
      }

      alert(error.response?.data?.message || "Unable to update request status");
    } finally {
      setUpdatingRequest(null);
    }
  };

  // ======================================================
  // LOGOUT
  // ======================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  // ======================================================
  // LOAD DRIVER PROFILE
  // ======================================================

  useEffect(() => {
    getDriverProfile();
  }, [getDriverProfile]);

  // ======================================================
  // LOAD REQUESTS WHEN DRIVER IS APPROVED
  // ======================================================

  useEffect(() => {
    if (!driver) {
      return;
    }

    if (driver.status === "approved") {
      getDriverRequests();
    } else {
      setRequests([]);
      calculateStats([]);
    }
  }, [driver?.status, driver?.availability, getDriverRequests, calculateStats]);

  // ======================================================
  // AUTO REFRESH CUSTOMER REQUESTS
  // ======================================================

  useEffect(() => {
    if (!driver || driver.status !== "approved") {
      return;
    }

    const interval = setInterval(() => {
      getDriverRequests();
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, [driver?.status, getDriverRequests]);

  // ======================================================
  // LOADING SCREEN
  // ======================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-teal-500"></div>

          <p className="text-slate-400">Loading driver dashboard...</p>
        </div>
      </div>
    );
  }

  // ======================================================
  // ERROR SCREEN
  // ======================================================

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
        <div className="w-full max-w-md rounded-2xl border border-red-500/30 bg-slate-900 p-8 text-center">
          <div className="mb-4 text-5xl">⚠️</div>

          <h2 className="text-xl font-bold text-white">
            Unable to Load Dashboard
          </h2>

          <p className="mt-3 text-sm text-red-400">{error}</p>

          <button
            onClick={getDriverProfile}
            className="mt-6 rounded-lg bg-teal-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-teal-400"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ======================================================
  // NO DRIVER PROFILE
  // ======================================================

  if (!driver) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
          <div className="mb-4 text-5xl">🚚</div>

          <h2 className="text-xl font-bold text-white">
            Driver Profile Not Found
          </h2>

          <p className="mt-3 text-slate-400">
            You don't have a driver profile yet.
          </p>

          <Link
            to="/driver/profile"
            className="mt-6 inline-block rounded-lg bg-teal-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-teal-400"
          >
            Create Driver Profile
          </Link>
        </div>
      </div>
    );
  }

  // ======================================================
  // REQUEST FILTERS
  // ======================================================

  const activeRequests = requests.filter(
    (request) =>
      request.status !== "completed" &&
      request.status !== "cancelled" &&
      request.status !== "rejected",
  );

  const completedRequests = requests.filter(
    (request) => request.status === "completed",
  );

  // ======================================================
  // DRIVER LOCATION
  // ======================================================

  const driverLocation = driver.location || driver.currentLocation;

  // ======================================================
  // STATUS CLASS
  // ======================================================

  const getStatusClass = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-500/10 text-green-400";

      case "pending":
        return "bg-yellow-500/10 text-yellow-400";

      case "rejected":
        return "bg-red-500/10 text-red-400";

      case "suspended":
        return "bg-red-500/10 text-red-400";

      default:
        return "bg-slate-500/10 text-slate-400";
    }
  };

  // ======================================================
  // REQUEST STATUS CLASS
  // ======================================================

  const getRequestStatusClass = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-400";

      case "driver_assigned":
        return "bg-purple-500/10 text-purple-400";

      case "accepted":
        return "bg-blue-500/10 text-blue-400";

      case "on_the_way":
        return "bg-orange-500/10 text-orange-400";

      case "arrived":
        return "bg-green-500/10 text-green-400";

      case "completed":
        return "bg-green-500/10 text-green-400";

      case "cancelled":
        return "bg-red-500/10 text-red-400";

      case "rejected":
        return "bg-red-500/10 text-red-400";

      default:
        return "bg-slate-500/10 text-slate-400";
    }
  };

  // ======================================================
  // OPEN CUSTOMER LOCATION
  // ======================================================

  const openCustomerLocation = (request) => {
    const latitude = request.location?.latitude;
    const longitude = request.location?.longitude;

    if (latitude == null || longitude == null) {
      alert("Customer location coordinates are not available.");
      return;
    }

    const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

    window.open(googleMapsUrl, "_blank", "noopener,noreferrer");
  };

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* ==================================================
          NAVBAR
      ================================================== */}

      <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link to="/driver/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500 text-xl">
              🚚
            </div>

            <div>
              <h1 className="font-bold text-white">RoadAssist</h1>

              <p className="text-xs text-slate-500">Driver Portal</p>
            </div>
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            <Link
              to="/driver/dashboard"
              className="text-sm font-semibold text-teal-400"
            >
              Dashboard
            </Link>

            <Link
              to="/driver/requests"
              className="text-sm text-slate-400 transition hover:text-teal-400"
            >
              Requests
            </Link>

            <Link
              to="/driver/profile"
              className="text-sm text-slate-400 transition hover:text-teal-400"
            >
              Profile
            </Link>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-red-500 hover:text-red-400"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* ==================================================
          MAIN
      ================================================== */}

      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* ==================================================
            WELCOME
        ================================================== */}

        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-teal-400">
              Driver Dashboard
            </p>

            <h1 className="mt-1 text-3xl font-bold text-white">
              Welcome, {driver.name || "Driver"} 👋
            </h1>

            <p className="mt-2 text-slate-400">
              Manage customer requests, locations and your availability.
            </p>
          </div>

          {/* AVAILABILITY */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Your Availability
            </p>

            <div className="flex items-center gap-3">
              <div
                className={`h-3 w-3 rounded-full ${
                  driver.status !== "approved"
                    ? "bg-slate-500"
                    : driver.availability === "available"
                      ? "bg-green-500"
                      : driver.availability === "busy"
                        ? "bg-yellow-500"
                        : "bg-slate-500"
                }`}
              />

              <span className="font-semibold capitalize">
                {driver.status !== "approved"
                  ? "Unavailable"
                  : driver.availability || "offline"}
              </span>

              <select
                value={
                  driver.status === "approved"
                    ? driver.availability || "offline"
                    : "offline"
                }
                onChange={(e) => updateAvailability(e.target.value)}
                disabled={updatingAvailability || driver.status !== "approved"}
                className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-teal-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="available">Available</option>

                <option value="busy">Busy</option>

                <option value="offline">Offline</option>
              </select>
            </div>
          </div>
        </div>

        {/* ==================================================
            SUCCESS MESSAGE
        ================================================== */}

        {successMessage && (
          <div className="mb-6 rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-sm font-medium text-green-400">
            ✅ {successMessage}
          </div>
        )}

        {/* ==================================================
            PENDING
        ================================================== */}

        {driver.status === "pending" && (
          <div className="mb-8 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-5">
            <div className="flex items-start gap-4">
              <div className="text-2xl">⏳</div>

              <div>
                <h3 className="font-semibold text-yellow-400">
                  Driver Approval Pending
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  Your driver profile is waiting for admin approval. You cannot
                  receive customer requests until your account is approved.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================
            APPROVED
        ================================================== */}

        {driver.status === "approved" && (
          <div className="mb-8 rounded-2xl border border-green-500/30 bg-green-500/10 p-5">
            <div className="flex items-start gap-4">
              <div className="text-2xl">✅</div>

              <div>
                <h3 className="font-semibold text-green-400">
                  Driver Account Approved
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  Your account is approved. Set yourself to Available to receive
                  new customer requests.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================
            REJECTED
        ================================================== */}

        {driver.status === "rejected" && (
          <div className="mb-8 rounded-2xl border border-red-500/30 bg-red-500/10 p-5">
            <div className="flex items-start gap-4">
              <div className="text-2xl">❌</div>

              <div>
                <h3 className="font-semibold text-red-400">
                  Driver Application Rejected
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  Your driver application was rejected by the administrator.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================
            SUSPENDED
        ================================================== */}

        {driver.status === "suspended" && (
          <div className="mb-8 rounded-2xl border border-red-500/30 bg-red-500/10 p-5">
            <div className="flex items-start gap-4">
              <div className="text-2xl">🚫</div>

              <div>
                <h3 className="font-semibold text-red-400">
                  Driver Account Suspended
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  Your driver account is currently suspended and cannot receive
                  assistance requests.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================
            STATISTICS
        ================================================== */}

        <div className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-500">Total Requests</p>

            <p className="mt-2 text-3xl font-bold text-white">
              {stats.totalRequests}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-500">Completed</p>

            <p className="mt-2 text-3xl font-bold text-white">
              {stats.completedRequests}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-500">Active Requests</p>

            <p className="mt-2 text-3xl font-bold text-white">
              {stats.pendingRequests}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-500">Earnings</p>

            <p className="mt-2 text-3xl font-bold text-white">
              ${stats.earnings}
            </p>

            <p className="mt-1 text-xs text-slate-600">
              Earnings system coming soon
            </p>
          </div>
        </div>

        {/* ==================================================
            DRIVER + VEHICLE
        ================================================== */}

        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          {/* DRIVER INFORMATION */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Driver Information</h2>

                <p className="mt-1 text-sm text-slate-500">
                  Your driver profile details
                </p>
              </div>

              <Link
                to="/driver/profile"
                className="text-sm font-semibold text-teal-400 hover:text-teal-300"
              >
                Edit
              </Link>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <span className="text-sm text-slate-500">Name</span>

                <span className="font-medium text-white">
                  {driver.name || "Not provided"}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <span className="text-sm text-slate-500">Phone</span>

                <span className="font-medium text-white">
                  {driver.phone || "Not provided"}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <span className="text-sm text-slate-500">License Number</span>

                <span className="font-medium text-white">
                  {driver.licenseNumber || "Not provided"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Account Status</span>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusClass(
                    driver.status,
                  )}`}
                >
                  {driver.status || "unknown"}
                </span>
              </div>
            </div>
          </div>

          {/* VEHICLE */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold">Towing Vehicle</h2>

              <p className="mt-1 text-sm text-slate-500">
                Your registered roadside vehicle
              </p>
            </div>

            {driver.vehicle ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4 rounded-xl bg-slate-950 p-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-teal-500/10 text-3xl">
                    🚚
                  </div>

                  <div>
                    <h3 className="font-semibold text-white">
                      {driver.vehicle.make || "Vehicle"}{" "}
                      {driver.vehicle.model || ""}
                    </h3>

                    <p className="text-sm capitalize text-slate-500">
                      {driver.vehicleType || "Towing Vehicle"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                    <p className="text-xs text-slate-500">Year</p>

                    <p className="mt-1 font-semibold">
                      {driver.vehicle.year || "N/A"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                    <p className="text-xs text-slate-500">Color</p>

                    <p className="mt-1 font-semibold">
                      {driver.vehicle.color || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <p className="text-xs text-slate-500">License Plate</p>

                  <p className="mt-1 font-semibold">
                    {driver.vehicle.licensePlate || "N/A"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950 p-8 text-center">
                <div className="mb-3 text-4xl">🚚</div>

                <p className="text-slate-400">No vehicle information found.</p>
              </div>
            )}
          </div>
        </div>

        {/* ==================================================
            DRIVER CURRENT LOCATION
        ================================================== */}

        <div className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-bold">Current Location</h2>

              <p className="mt-1 text-sm text-slate-500">
                Your current driver location
              </p>
            </div>

            <Link
              to="/driver/location"
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-teal-500 hover:text-teal-400"
            >
              Update Location
            </Link>
          </div>

          <div className="mt-5 rounded-xl bg-slate-950 p-5">
            {driverLocation?.latitude != null &&
            driverLocation?.longitude != null ? (
              <div className="flex items-start gap-4">
                <div className="text-3xl">📍</div>

                <div>
                  <p className="font-semibold text-white">
                    {driverLocation.address || "Current Location"}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Latitude: {driverLocation.latitude}
                  </p>

                  <p className="text-sm text-slate-500">
                    Longitude: {driverLocation.longitude}
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center">
                <div className="mb-2 text-4xl">📍</div>

                <p className="text-slate-400">
                  Location has not been updated yet.
                </p>

                <Link
                  to="/driver/location"
                  className="mt-4 inline-block text-sm font-semibold text-teal-400 hover:text-teal-300"
                >
                  Update your location
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ==================================================
            CUSTOMER REQUESTS
        ================================================== */}

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-bold">
                Customer Assistance Requests
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                View customer problems, vehicles and live locations.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={getDriverRequests}
                disabled={requestsLoading || driver.status !== "approved"}
                className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 hover:border-teal-500 hover:text-teal-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {requestsLoading ? "Refreshing..." : "Refresh"}
              </button>

              <Link
                to="/driver/requests"
                className="rounded-lg bg-teal-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-teal-400"
              >
                View All
              </Link>
            </div>
          </div>

          {/* ERROR */}

          {requestError && (
            <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
              {requestError}
            </div>
          )}

          {/* NOT APPROVED */}

          {driver.status !== "approved" ? (
            <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950 p-10 text-center">
              <div className="mb-4 text-5xl">🔒</div>

              <h3 className="font-semibold text-white">Requests Unavailable</h3>

              <p className="mt-2 text-sm text-slate-500">
                Customer requests will become available after your driver
                account is approved by an administrator.
              </p>
            </div>
          ) : requestsLoading ? (
            <div className="py-10 text-center">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-teal-500"></div>

              <p className="text-slate-500">Loading customer requests...</p>
            </div>
          ) : activeRequests.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950 p-10 text-center">
              <div className="mb-4 text-5xl">🚗</div>

              <h3 className="font-semibold text-white">No Customer Requests</h3>

              <p className="mt-2 text-sm text-slate-500">
                New customer assistance requests will automatically appear here.
              </p>

              {driver.availability !== "available" && (
                <p className="mt-3 text-sm font-semibold text-yellow-400">
                  Set your availability to Available to receive new requests.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              {activeRequests.map((request) => {
                const isPending =
                  request.status === "pending" && !request.driver;

                const isAssignedToDriver =
                  request.driver &&
                  (request.driver._id === driver._id ||
                    request.driver === driver._id);

                return (
                  <div
                    key={request._id}
                    className={`rounded-xl border p-5 ${
                      isPending
                        ? "border-teal-500/30 bg-teal-500/5"
                        : "border-slate-800 bg-slate-950"
                    }`}
                  >
                    {/* REQUEST HEADER */}

                    <div className="flex flex-col justify-between gap-4 md:flex-row">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="font-bold text-white">
                            {request.service?.name || "Roadside Assistance"}
                          </h3>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getRequestStatusClass(
                              request.status,
                            )}`}
                          >
                            {(request.status || "pending").replace(/_/g, " ")}
                          </span>

                          {isPending && (
                            <span className="rounded-full bg-teal-500/10 px-3 py-1 text-xs font-semibold text-teal-400">
                              NEW REQUEST
                            </span>
                          )}
                        </div>

                        <p className="mt-2 text-sm text-slate-400">
                          Customer:{" "}
                          {request.user?.name ||
                            request.customer?.name ||
                            "Unknown Customer"}
                        </p>

                        {request.user?.phone && (
                          <p className="mt-1 text-sm text-slate-500">
                            📞 {request.user.phone}
                          </p>
                        )}
                      </div>

                      <p className="text-xs text-slate-500">
                        {request.createdAt
                          ? new Date(request.createdAt).toLocaleString()
                          : ""}
                      </p>
                    </div>

                    {/* CUSTOMER VEHICLE */}

                    {request.vehicle && (
                      <div className="mt-4 rounded-lg border border-slate-800 bg-slate-900 p-4">
                        <p className="text-xs text-slate-500">
                          Customer Vehicle
                        </p>

                        <p className="mt-1 font-semibold text-white">
                          {request.vehicle.make || ""}{" "}
                          {request.vehicle.model || ""}
                        </p>

                        <p className="text-sm text-slate-500">
                          {request.vehicle.color || "Unknown Color"} •{" "}
                          {request.vehicle.licensePlate || "Unknown Plate"}
                        </p>
                      </div>
                    )}

                    {/* CUSTOMER LOCATION */}

                    {request.location && (
                      <div className="mt-4 rounded-lg border border-teal-500/20 bg-slate-900 p-4">
                        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-teal-400">
                              Customer Location
                            </p>

                            <p className="mt-2 text-sm text-white">
                              📍{" "}
                              {request.location.address || "Location provided"}
                            </p>

                            {request.location.latitude != null &&
                              request.location.longitude != null && (
                                <p className="mt-1 text-xs text-slate-500">
                                  Latitude: {request.location.latitude} |
                                  Longitude: {request.location.longitude}
                                </p>
                              )}
                          </div>

                          <button
                            onClick={() => openCustomerLocation(request)}
                            disabled={
                              request.location?.latitude == null ||
                              request.location?.longitude == null
                            }
                            className="rounded-lg border border-teal-500/40 px-4 py-2 text-sm font-semibold text-teal-400 hover:bg-teal-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            📍 Open Map
                          </button>
                        </div>
                      </div>
                    )}

                    {/* PROBLEM DESCRIPTION */}

                    {request.description && (
                      <div className="mt-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Problem Description
                        </p>

                        <p className="mt-2 rounded-lg bg-slate-900 p-4 text-sm text-slate-300">
                          {request.description}
                        </p>
                      </div>
                    )}

                    {/* ==================================================
                        ACTIONS
                    ================================================== */}

                    <div className="mt-5 flex flex-wrap gap-3">
                      {/* ACCEPT */}

                      {isPending && (
                        <button
                          onClick={() => acceptRequest(request._id)}
                          disabled={
                            acceptingRequest === request._id ||
                            driver.availability !== "available"
                          }
                          className="rounded-lg bg-teal-500 px-5 py-2.5 text-sm font-bold text-slate-950 hover:bg-teal-400 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {acceptingRequest === request._id
                            ? "Accepting..."
                            : driver.availability !== "available"
                              ? "Set Available First"
                              : "✓ Accept Request"}
                        </button>
                      )}

                      {/* REJECT */}

                      {isPending && (
                        <button
                          onClick={() => rejectRequest(request._id)}
                          disabled={rejectingRequest === request._id}
                          className="rounded-lg border border-red-500/40 px-5 py-2.5 text-sm font-bold text-red-400 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {rejectingRequest === request._id
                            ? "Rejecting..."
                            : "✕ Reject Request"}
                        </button>
                      )}

                      {/* START TRIP */}

                      {(request.status === "driver_assigned" ||
                        request.status === "accepted") &&
                        isAssignedToDriver && (
                          <button
                            onClick={() =>
                              updateRequestStatus(request._id, "on_the_way")
                            }
                            disabled={updatingRequest === request._id}
                            className="rounded-lg bg-yellow-500 px-5 py-2.5 text-sm font-bold text-slate-950 hover:bg-yellow-400 disabled:opacity-50"
                          >
                            {updatingRequest === request._id
                              ? "Updating..."
                              : "🚚 Start Trip"}
                          </button>
                        )}

                      {/* MARK ARRIVED */}

                      {request.status === "on_the_way" &&
                        isAssignedToDriver && (
                          <button
                            onClick={() =>
                              updateRequestStatus(request._id, "arrived")
                            }
                            disabled={updatingRequest === request._id}
                            className="rounded-lg bg-green-500 px-5 py-2.5 text-sm font-bold text-slate-950 hover:bg-green-400 disabled:opacity-50"
                          >
                            {updatingRequest === request._id
                              ? "Updating..."
                              : "📍 Mark Arrived"}
                          </button>
                        )}

                      {/* COMPLETE */}

                      {request.status === "arrived" && isAssignedToDriver && (
                        <button
                          onClick={() =>
                            updateRequestStatus(request._id, "completed")
                          }
                          disabled={updatingRequest === request._id}
                          className="rounded-lg bg-blue-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-400 disabled:opacity-50"
                        >
                          {updatingRequest === request._id
                            ? "Completing..."
                            : "✓ Complete Request"}
                        </button>
                      )}

                      {/* VIEW DETAILS */}

                      <Link
                        to={`/request/${request._id}`}
                        className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-300 hover:border-teal-500 hover:text-teal-400"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ==================================================
            COMPLETED REQUESTS
        ================================================== */}

        {completedRequests.length > 0 && (
          <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-5">
              <h2 className="text-xl font-bold">Recently Completed</h2>

              <p className="mt-1 text-sm text-slate-500">
                Your recently completed jobs
              </p>
            </div>

            <div className="space-y-3">
              {completedRequests.slice(0, 5).map((request) => (
                <div
                  key={request._id}
                  className="flex flex-col justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950 p-4 md:flex-row md:items-center"
                >
                  <div>
                    <p className="font-semibold text-white">
                      {request.service?.name || "Roadside Assistance"}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Customer: {request.user?.name || "Unknown"}
                    </p>

                    {request.completedAt && (
                      <p className="mt-1 text-xs text-slate-600">
                        Completed:{" "}
                        {new Date(request.completedAt).toLocaleString()}
                      </p>
                    )}
                  </div>

                  <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-400">
                    Completed
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ==================================================
          DRIVER LOCATION TRACKING
      ================================================== */}

      {driver.status === "approved" && <DriverLocationTracking />}
    </div>
  );
};

export default DriverDashboard;
