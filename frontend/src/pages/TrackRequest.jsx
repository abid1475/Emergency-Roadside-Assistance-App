import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";

const ASSISTANCE_API = "https://emergency-roadside-assistance-app-backend.onrender.com/api/v1/assistance-requests";

const TrackRequest = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // ======================================================
  // AUTH HEADERS
  // ======================================================

  const getHeaders = useCallback(() => {
    const token = localStorage.getItem("token");

    return {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };
  }, []);

  // ======================================================
  // HANDLE AUTH ERROR
  // ======================================================

  const handleAuthError = useCallback(
    (error) => {
      if (error.response?.status === 401) {
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
  // GET REQUEST DETAILS
  // ======================================================

  const getRequestDetails = useCallback(
    async (showLoader = false) => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        if (!id) {
          setError("Invalid assistance request ID.");
          setLoading(false);
          return;
        }

        if (showLoader) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        setError("");

        const response = await axios.get(
          `${ASSISTANCE_API}/${id}`,
          getHeaders(),
        );

        console.log("Tracking Request:", response.data);

        if (response.data.success) {
          setRequest(response.data.request);
        } else {
          setError(
            response.data.message || "Unable to load tracking information.",
          );
        }
      } catch (error) {
        console.error("Tracking Error:", error);

        if (handleAuthError(error)) {
          return;
        }

        setError(
          error.response?.data?.message ||
            "Unable to load tracking information.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [id, navigate, getHeaders, handleAuthError],
  );

  // ======================================================
  // INITIAL LOAD
  // ======================================================

  useEffect(() => {
    getRequestDetails(true);
  }, [getRequestDetails]);

  // ======================================================
  // AUTO REFRESH
  // ======================================================

  useEffect(() => {
    if (!request) {
      return;
    }

    const activeStatuses = [
      "pending",
      "accepted",
      "driver_assigned",
      "on_the_way",
      "arrived",
    ];

    if (!activeStatuses.includes(request.status)) {
      return;
    }

    const interval = setInterval(() => {
      getRequestDetails(false);
    }, 10000);

    return () => clearInterval(interval);
  }, [request, getRequestDetails]);

  // ======================================================
  // STATUS INFORMATION
  // ======================================================

  const getStatusInfo = (status) => {
    switch (status) {
      case "pending":
        return {
          icon: "🟡",
          title: "Request Pending",
          description:
            "We are looking for an available driver to accept your request.",
          color: "yellow",
        };

      case "accepted":
        return {
          icon: "🔵",
          title: "Request Accepted",
          description:
            "A driver has accepted your roadside assistance request.",
          color: "blue",
        };

      case "driver_assigned":
        return {
          icon: "👨‍🔧",
          title: "Driver Assigned",
          description: "A driver has been assigned to your assistance request.",
          color: "purple",
        };

      case "on_the_way":
        return {
          icon: "🚗",
          title: "Driver Is On The Way",
          description: "Your driver is currently travelling to your location.",
          color: "yellow",
        };

      case "arrived":
        return {
          icon: "📍",
          title: "Driver Has Arrived",
          description: "Your driver has arrived at your location.",
          color: "green",
        };

      case "completed":
        return {
          icon: "✅",
          title: "Request Completed",
          description:
            "Your roadside assistance request has been completed successfully.",
          color: "green",
        };

      case "cancelled":
        return {
          icon: "❌",
          title: "Request Cancelled",
          description: "This roadside assistance request has been cancelled.",
          color: "red",
        };

      default:
        return {
          icon: "⚪",
          title: "Unknown Status",
          description: "The request status is currently unavailable.",
          color: "slate",
        };
    }
  };

  // ======================================================
  // FORMAT STATUS
  // ======================================================

  const formatStatus = (status) => {
    if (!status) {
      return "Unknown";
    }

    return status
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // ======================================================
  // FORMAT DATE
  // ======================================================

  const formatDate = (date) => {
    if (!date) {
      return "Not available";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not available";
    }

    return parsedDate.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ======================================================
  // FORMAT COORDINATE
  // ======================================================

  const formatCoordinate = (value) => {
    if (value === null || value === undefined || value === "") {
      return "Unavailable";
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
      return "Unavailable";
    }

    return number.toFixed(6);
  };

  // ======================================================
  // GET DRIVER LOCATION
  // ======================================================
  // Supports different possible backend structures:
  //
  // request.driverLocation
  // request.driver.location
  // request.driver.currentLocation
  // request.driver.location.latitude/longitude
  //
  // This makes the frontend more flexible.

  const getDriverLocation = () => {
    if (request?.driverLocation) {
      return request.driverLocation;
    }

    if (request?.driver?.currentLocation) {
      return request.driver.currentLocation;
    }

    if (request?.driver?.location) {
      return request.driver.location;
    }

    return null;
  };

  // ======================================================
  // DRIVER VEHICLE
  // ======================================================

  const getDriverVehicle = () => {
    const vehicle = request?.driver?.vehicle;

    if (!vehicle) {
      return null;
    }

    if (typeof vehicle === "string") {
      return vehicle;
    }

    return `${vehicle.make || ""} ${vehicle.model || ""}`.trim();
  };

  // ======================================================
  // LOADING SCREEN
  // ======================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-teal-500"></div>

          <p className="text-slate-400">Loading tracking information...</p>
        </div>
      </div>
    );
  }

  // ======================================================
  // ERROR SCREEN
  // ======================================================

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-10">
        <div className="mx-auto max-w-xl">
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center">
            <div className="mb-4 text-5xl">⚠️</div>

            <h2 className="text-2xl font-bold text-white">
              Tracking Unavailable
            </h2>

            <p className="mt-3 text-red-400">{error}</p>

            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                onClick={() => getRequestDetails(true)}
                className="rounded-lg bg-teal-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-teal-400"
              >
                Try Again
              </button>

              <Link
                to="/my-requests"
                className="rounded-lg border border-slate-700 px-5 py-3 font-semibold text-slate-300 transition hover:border-teal-500 hover:text-teal-400"
              >
                My Requests
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ======================================================
  // NO REQUEST
  // ======================================================

  if (!request) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
          <div className="mb-4 text-5xl">🚗</div>

          <h2 className="text-2xl font-bold text-white">Request Not Found</h2>

          <p className="mt-3 text-slate-400">
            We could not find this assistance request.
          </p>

          <Link
            to="/my-requests"
            className="mt-6 inline-block rounded-lg bg-teal-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-teal-400"
          >
            Back to My Requests
          </Link>
        </div>
      </div>
    );
  }

  // ======================================================
  // DATA
  // ======================================================

  const status = getStatusInfo(request.status);

  const customerLatitude = request.location?.latitude;
  const customerLongitude = request.location?.longitude;

  const driverLocation = getDriverLocation();

  const driverLatitude = driverLocation?.latitude;
  const driverLongitude = driverLocation?.longitude;

  const hasCustomerLocation =
    customerLatitude !== null &&
    customerLatitude !== undefined &&
    customerLongitude !== null &&
    customerLongitude !== undefined;

  const hasDriverLocation =
    driverLatitude !== null &&
    driverLatitude !== undefined &&
    driverLongitude !== null &&
    driverLongitude !== undefined;

  const driverVehicle = getDriverVehicle();

  const isActiveRequest = [
    "pending",
    "accepted",
    "driver_assigned",
    "on_the_way",
    "arrived",
  ].includes(request.status);

  // ======================================================
  // TIMELINE STEP
  // ======================================================

  const TimelineItem = ({ active, completed, icon, title, description }) => {
    return (
      <div className="flex gap-4">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
            completed
              ? "bg-teal-500 text-slate-950"
              : active
                ? "border-2 border-teal-500 bg-teal-500/10 text-teal-400"
                : "border border-slate-700 bg-slate-950 text-slate-600"
          }`}
        >
          {completed ? "✓" : icon}
        </div>

        <div className="pb-2">
          <p
            className={`font-semibold ${
              active || completed ? "text-white" : "text-slate-600"
            }`}
          >
            {title}
          </p>

          {description && (
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          )}
        </div>
      </div>
    );
  };

  // ======================================================
  // RETURN
  // ======================================================

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        {/* ==========================================
            HEADER
        ========================================== */}

        <div className="mb-8">
          <Link
            to="/my-requests"
            className="text-sm text-slate-400 transition hover:text-teal-400"
          >
            ← Back to My Requests
          </Link>

          <div className="mt-5">
            <p className="text-sm font-semibold uppercase tracking-wider text-teal-400">
              Emergency Roadside Assistance
            </p>

            <div className="mt-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <h1 className="text-3xl font-bold text-white sm:text-4xl">
                  Track Your Request
                </h1>

                <p className="mt-2 break-all text-sm text-slate-500">
                  Request ID: {request._id}
                </p>
              </div>

              <button
                onClick={() => getRequestDetails(false)}
                disabled={refreshing}
                className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-teal-500 hover:text-teal-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {refreshing ? "Refreshing..." : "↻ Refresh"}
              </button>
            </div>
          </div>
        </div>

        {/* ==========================================
            CURRENT STATUS
        ========================================== */}

        <div className="mb-6 rounded-2xl border border-teal-500/20 bg-slate-900 p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-teal-500/10 text-3xl">
                {status.icon}
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white">
                  {status.title}
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  {status.description}
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-slate-950 px-4 py-3 text-center">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Last Updated
              </p>

              <p className="mt-1 text-sm font-semibold text-white">
                {formatDate(request.updatedAt)}
              </p>
            </div>
          </div>
        </div>

        {/* ==========================================
            STATUS BADGE
        ========================================== */}

        <div className="mb-6 flex flex-wrap items-center gap-3">
          <span className="text-sm text-slate-500">Current status:</span>

          <span className="rounded-full bg-teal-500/10 px-4 py-2 text-sm font-semibold capitalize text-teal-400">
            {formatStatus(request.status)}
          </span>
        </div>

        {/* ==========================================
            LIVE LOCATION
        ========================================== */}

        <div className="mb-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
          <div className="flex flex-col justify-between gap-3 border-b border-slate-800 p-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-bold text-white">📍 Live Location</h2>

              <p className="mt-1 text-sm text-slate-400">
                Your location and driver's current location
              </p>
            </div>

            {isActiveRequest && (
              <span className="flex items-center gap-2 text-xs text-green-400">
                <span className="h-2 w-2 animate-pulse rounded-full bg-green-500"></span>
                Live tracking
              </span>
            )}
          </div>

          {/* MAP PLACEHOLDER */}

          <div className="relative flex h-[400px] items-center justify-center overflow-hidden bg-slate-950">
            {/* Grid */}

            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "linear-gradient(#475569 1px, transparent 1px), linear-gradient(90deg, #475569 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            ></div>

            {/* Customer */}

            {hasCustomerLocation && (
              <div className="absolute left-[25%] top-[50%] z-10 -translate-x-1/2 -translate-y-1/2">
                <div className="flex flex-col items-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500 text-2xl shadow-lg shadow-red-500/30">
                    📍
                  </div>

                  <div className="mt-2 rounded-lg bg-slate-900 px-3 py-2 text-center shadow-lg">
                    <p className="text-xs font-bold text-white">
                      Your Location
                    </p>

                    <p className="text-xs text-slate-500">
                      {formatCoordinate(customerLatitude)},{" "}
                      {formatCoordinate(customerLongitude)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Driver */}

            {hasDriverLocation && (
              <div className="absolute right-[25%] top-[50%] z-10 -translate-y-1/2">
                <div className="flex flex-col items-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-500 text-2xl shadow-lg shadow-teal-500/30">
                    🚗
                  </div>

                  <div className="mt-2 rounded-lg bg-slate-900 px-3 py-2 text-center shadow-lg">
                    <p className="text-xs font-bold text-white">Driver</p>

                    <p className="text-xs text-slate-500">
                      {formatCoordinate(driverLatitude)},{" "}
                      {formatCoordinate(driverLongitude)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* No driver location */}

            {!hasDriverLocation && (
              <div className="relative z-10 max-w-sm rounded-xl border border-slate-700 bg-slate-900 p-6 text-center">
                <div className="mb-3 text-4xl">🚗</div>

                <h3 className="font-bold text-white">
                  {request.driver
                    ? "Waiting for Driver Location"
                    : "Waiting for Driver"}
                </h3>

                <p className="mt-2 text-sm text-slate-400">
                  {request.driver
                    ? "Your driver has been assigned, but their live location has not been updated yet."
                    : "Your driver's live location will appear here after a driver is assigned."}
                </p>
              </div>
            )}
          </div>

          {/* LOCATION INFORMATION */}

          <div className="grid gap-4 border-t border-slate-800 p-5 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Your Location
              </p>

              {hasCustomerLocation ? (
                <>
                  <p className="mt-2 text-sm text-white">
                    {request.location?.address || "Customer location"}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {formatCoordinate(customerLatitude)},{" "}
                    {formatCoordinate(customerLongitude)}
                  </p>
                </>
              ) : (
                <p className="mt-2 text-sm text-slate-500">
                  Location unavailable
                </p>
              )}
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Driver Location
              </p>

              {hasDriverLocation ? (
                <>
                  <p className="mt-2 text-sm text-teal-400">
                    Driver is sharing location
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {formatCoordinate(driverLatitude)},{" "}
                    {formatCoordinate(driverLongitude)}
                  </p>
                </>
              ) : (
                <p className="mt-2 text-sm text-slate-500">
                  Waiting for driver location
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ==========================================
            DRIVER INFORMATION
        ========================================== */}

        {request.driver && (
          <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-5 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-500/10 text-2xl">
                👨‍🔧
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-teal-400">
                  Your Driver
                </p>

                <h2 className="text-xl font-bold text-white">
                  {request.driver.name || "Assigned Driver"}
                </h2>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {/* PHONE */}

              {request.driver.phone && (
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <p className="text-xs text-slate-500">Phone</p>

                  <a
                    href={`tel:${request.driver.phone}`}
                    className="mt-2 inline-block font-semibold text-teal-400 transition hover:text-teal-300"
                  >
                    📞 {request.driver.phone}
                  </a>
                </div>
              )}

              {/* VEHICLE */}

              {driverVehicle && (
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <p className="text-xs text-slate-500">Driver Vehicle</p>

                  <p className="mt-2 font-semibold text-white">
                    🚚 {driverVehicle}
                  </p>
                </div>
              )}

              {/* VEHICLE TYPE */}

              {request.driver.vehicleType && (
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <p className="text-xs text-slate-500">Vehicle Type</p>

                  <p className="mt-2 font-semibold capitalize text-white">
                    {request.driver.vehicleType}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==========================================
            REQUEST INFORMATION
        ========================================== */}

        <div className="mb-6 grid gap-6 lg:grid-cols-2">
          {/* SERVICE */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Assistance Service
            </p>

            <h2 className="mt-2 text-xl font-bold text-white">
              {request.service?.name || "Roadside Assistance"}
            </h2>

            {request.service?.description && (
              <p className="mt-2 text-sm leading-6 text-slate-400">
                {request.service.description}
              </p>
            )}
          </div>

          {/* VEHICLE */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Customer Vehicle
            </p>

            <h2 className="mt-2 text-xl font-bold text-white">
              {request.vehicle
                ? `${request.vehicle.make || ""} ${
                    request.vehicle.model || ""
                  }`.trim()
                : "Vehicle"}
            </h2>

            {request.vehicle && (
              <div className="mt-2 space-y-1 text-sm text-slate-400">
                {request.vehicle.year && <p>Year: {request.vehicle.year}</p>}

                {request.vehicle.color && <p>Color: {request.vehicle.color}</p>}

                {request.vehicle.licensePlate && (
                  <p>License Plate: {request.vehicle.licensePlate}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ==========================================
            PROBLEM DESCRIPTION
        ========================================== */}

        {request.description && (
          <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Problem Description
            </p>

            <p className="mt-3 leading-7 text-slate-300">
              {request.description}
            </p>
          </div>
        )}

        {/* ==========================================
            REQUEST PROGRESS
        ========================================== */}

        <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="mb-6 text-xl font-bold text-white">
            Request Progress
          </h2>

          <div className="space-y-5">
            <TimelineItem
              completed={true}
              icon="1"
              title="Request Created"
              description={formatDate(request.createdAt)}
            />

            <TimelineItem
              completed={[
                "accepted",
                "driver_assigned",
                "on_the_way",
                "arrived",
                "completed",
              ].includes(request.status)}
              active={request.status === "pending"}
              icon="2"
              title="Driver Acceptance"
              description={
                request.acceptedAt
                  ? formatDate(request.acceptedAt)
                  : "Waiting for a driver to accept"
              }
            />

            <TimelineItem
              completed={[
                "driver_assigned",
                "on_the_way",
                "arrived",
                "completed",
              ].includes(request.status)}
              active={request.status === "accepted"}
              icon="3"
              title="Driver Assigned"
              description={
                request.driver
                  ? request.driver.name || "Driver assigned"
                  : "Waiting for driver assignment"
              }
            />

            <TimelineItem
              completed={["on_the_way", "arrived", "completed"].includes(
                request.status,
              )}
              active={request.status === "driver_assigned"}
              icon="4"
              title="Driver On The Way"
              description={
                request.status === "driver_assigned"
                  ? "Driver is ready to start the trip"
                  : "Driver travelling to your location"
              }
            />

            <TimelineItem
              completed={["arrived", "completed"].includes(request.status)}
              active={request.status === "on_the_way"}
              icon="5"
              title="Driver Arrived"
              description={
                request.arrivedAt
                  ? formatDate(request.arrivedAt)
                  : "Driver has not arrived yet"
              }
            />

            <TimelineItem
              completed={request.status === "completed"}
              active={request.status === "arrived"}
              icon="6"
              title="Request Completed"
              description={
                request.completedAt
                  ? formatDate(request.completedAt)
                  : "Assistance has not been completed yet"
              }
            />
          </div>
        </div>

        {/* ==========================================
            REQUEST DATES
        ========================================== */}

        <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="mb-5 text-xl font-bold text-white">
            Request Information
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl bg-slate-950 p-4">
              <p className="text-xs text-slate-500">Created</p>

              <p className="mt-2 text-sm font-semibold text-white">
                {formatDate(request.createdAt)}
              </p>
            </div>

            <div className="rounded-xl bg-slate-950 p-4">
              <p className="text-xs text-slate-500">Last Updated</p>

              <p className="mt-2 text-sm font-semibold text-white">
                {formatDate(request.updatedAt)}
              </p>
            </div>

            <div className="rounded-xl bg-slate-950 p-4">
              <p className="text-xs text-slate-500">Status</p>

              <p className="mt-2 text-sm font-semibold capitalize text-teal-400">
                {formatStatus(request.status)}
              </p>
            </div>
          </div>
        </div>

        {/* ==========================================
            BUTTONS
        ========================================== */}

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            to={`/request/${request._id}`}
            className="flex-1 rounded-lg border border-slate-700 px-5 py-3 text-center font-semibold text-slate-300 transition hover:border-teal-500 hover:text-teal-400"
          >
            View Request Details
          </Link>

          <Link
            to="/my-requests"
            className="flex-1 rounded-lg bg-teal-500 px-5 py-3 text-center font-semibold text-slate-950 transition hover:bg-teal-400"
          >
            My Requests
          </Link>
        </div>

        {/* ==========================================
            AUTO REFRESH
        ========================================== */}

        {isActiveRequest && (
          <p className="mt-6 text-center text-xs text-slate-600">
            🔄 Tracking information automatically refreshes every 10 seconds.
          </p>
        )}

        {!isActiveRequest && (
          <p className="mt-6 text-center text-xs text-slate-600">
            Tracking has stopped because this request is{" "}
            {request.status === "completed" ? "completed" : "cancelled"}.
          </p>
        )}
      </div>
    </div>
  );
};

export default TrackRequest;
