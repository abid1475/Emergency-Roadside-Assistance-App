import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const API_URL = "http://localhost:3000/api/v1/assistance-requests";

const DriverRequestCard = ({ request, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ==========================================
  // GET TOKEN
  // ==========================================

  const getToken = () => {
    return localStorage.getItem("token");
  };

  // ==========================================
  // GET AUTH HEADERS
  // ==========================================

  const getHeaders = () => {
    const token = getToken();

    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  // ==========================================
  // HANDLE AUTH ERROR
  // ==========================================

  const handleAuthError = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  // ==========================================
  // UPDATE REQUEST STATUS
  // ==========================================

  const updateRequestStatus = async (status) => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        handleAuthError();
        return;
      }

      const response = await axios.put(
        `${API_URL}/${request._id}/status`,
        {
          status,
        },
        {
          headers: getHeaders(),
        },
      );

      console.log("Status Update Response:", response.data);

      if (response.data.success) {
        if (onUpdate) {
          onUpdate(response.data.request);
        }
      } else {
        setError(response.data.message || "Unable to update request status.");
      }
    } catch (error) {
      console.error("Update Request Status Error:", error);

      if (error.response?.status === 401) {
        handleAuthError();
        return;
      }

      setError(
        error.response?.data?.message || "Unable to update request status.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // ACCEPT REQUEST
  // ==========================================

  const handleAccept = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        handleAuthError();
        return;
      }

      const response = await axios.put(
        `${API_URL}/${request._id}/accept`,
        {},
        {
          headers: getHeaders(),
        },
      );

      console.log("Accept Request Response:", response.data);

      if (response.data.success) {
        if (onUpdate) {
          onUpdate(response.data.request);
        }
      } else {
        setError(response.data.message || "Unable to accept this request.");
      }
    } catch (error) {
      console.error("Accept Request Error:", error);

      if (error.response?.status === 401) {
        handleAuthError();
        return;
      }

      setError(
        error.response?.data?.message || "Unable to accept this request.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // REJECT REQUEST
  // ==========================================

  const handleReject = async () => {
    const confirmReject = window.confirm(
      "Are you sure you want to reject this request?",
    );

    if (!confirmReject) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        handleAuthError();
        return;
      }

      const response = await axios.put(
        `${API_URL}/${request._id}/reject`,
        {},
        {
          headers: getHeaders(),
        },
      );

      console.log("Reject Request Response:", response.data);

      if (response.data.success) {
        if (onUpdate) {
          onUpdate(response.data.request);
        }
      } else {
        setError(response.data.message || "Unable to reject this request.");
      }
    } catch (error) {
      console.error("Reject Request Error:", error);

      if (error.response?.status === 401) {
        handleAuthError();
        return;
      }

      setError(
        error.response?.data?.message || "Unable to reject this request.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // REQUEST STATUS
  // ==========================================

  const requestStatus = request?.status || "pending";

  // ==========================================
  // CUSTOMER
  // ==========================================

  const customer = request?.user || request?.customer;

  // ==========================================
  // SERVICE
  // ==========================================

  const service = request?.service;

  // ==========================================
  // VEHICLE
  // ==========================================

  const vehicle = request?.vehicle;

  // ==========================================
  // LOCATION
  // ==========================================

  const location = request?.location;

  // ==========================================
  // STATUS CLASS
  // ==========================================

  const getStatusClass = () => {
    switch (requestStatus) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-400";

      case "driver_assigned":
        return "bg-purple-500/10 text-purple-400";

      case "accepted":
        return "bg-green-500/10 text-green-400";

      case "on_the_way":
        return "bg-cyan-500/10 text-cyan-400";

      case "arrived":
        return "bg-blue-500/10 text-blue-400";

      case "completed":
        return "bg-emerald-500/10 text-emerald-400";

      case "rejected":
        return "bg-red-500/10 text-red-400";

      case "cancelled":
        return "bg-red-500/10 text-red-400";

      default:
        return "bg-slate-700 text-slate-300";
    }
  };

  // ==========================================
  // STATUS TEXT
  // ==========================================

  const getStatusText = () => {
    return requestStatus.replaceAll("_", " ");
  };

  // ==========================================
  // GOOGLE MAPS URL
  // ==========================================

  const getGoogleMapsUrl = () => {
    if (location?.latitude == null || location?.longitude == null) {
      return null;
    }

    return `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="group rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl transition duration-300 hover:border-teal-500/40">
      {/* ==========================================
          HEADER
      ========================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          {/* Service Icon */}

          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 text-3xl">
            {service?.icon || "🚗"}
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-teal-400">
              Assistance Request
            </p>

            <h2 className="mt-1 text-xl font-bold text-white">
              {service?.name || "Roadside Assistance"}
            </h2>

            <Link
              to={`/driver/requests/${request?._id}`}
              className="mt-1 inline-block text-sm text-slate-400 transition hover:text-teal-400"
            >
              View Request →
            </Link>
          </div>
        </div>

        {/* Status */}

        <span
          className={`w-fit rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${getStatusClass()}`}
        >
          {getStatusText()}
        </span>
      </div>

      {/* ==========================================
          CUSTOMER INFORMATION
      ========================================== */}

      <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950 p-4">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Customer
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Customer Name */}

          <div>
            <p className="text-xs text-slate-500">Name</p>

            <p className="mt-1 font-medium text-slate-200">
              {customer?.name || "Not available"}
            </p>
          </div>

          {/* Customer Phone */}

          <div>
            <p className="text-xs text-slate-500">Phone</p>

            <p className="mt-1 font-medium text-slate-200">
              {customer?.phone || "Not available"}
            </p>
          </div>

          {/* Customer Email */}

          <div className="sm:col-span-2">
            <p className="text-xs text-slate-500">Email</p>

            <p className="mt-1 font-medium text-slate-200">
              {customer?.email || "Not available"}
            </p>
          </div>
        </div>
      </div>

      {/* ==========================================
          VEHICLE INFORMATION
      ========================================== */}

      <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-4">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Customer Vehicle
        </h3>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Make */}

          <div>
            <p className="text-xs text-slate-500">Make</p>

            <p className="mt-1 font-medium text-slate-200">
              {vehicle?.make || "Not available"}
            </p>
          </div>

          {/* Model */}

          <div>
            <p className="text-xs text-slate-500">Model</p>

            <p className="mt-1 font-medium text-slate-200">
              {vehicle?.model || "Not available"}
            </p>
          </div>

          {/* Year */}

          <div>
            <p className="text-xs text-slate-500">Year</p>

            <p className="mt-1 font-medium text-slate-200">
              {vehicle?.year || "Not available"}
            </p>
          </div>

          {/* Color */}

          <div>
            <p className="text-xs text-slate-500">Color</p>

            <p className="mt-1 font-medium text-slate-200">
              {vehicle?.color || "Not available"}
            </p>
          </div>

          {/* License Plate */}

          <div>
            <p className="text-xs text-slate-500">License Plate</p>

            <p className="mt-1 font-medium text-slate-200">
              {vehicle?.licensePlate || "Not available"}
            </p>
          </div>

          {/* Vehicle Type */}

          <div>
            <p className="text-xs text-slate-500">Vehicle Type</p>

            <p className="mt-1 font-medium capitalize text-slate-200">
              {vehicle?.vehicleType || "Not available"}
            </p>
          </div>
        </div>
      </div>

      {/* ==========================================
          REQUEST DESCRIPTION
      ========================================== */}

      {request?.description && (
        <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-4">
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Problem Description
          </h3>

          <p className="text-sm leading-6 text-slate-300">
            {request.description}
          </p>
        </div>
      )}

      {/* ==========================================
          CUSTOMER LOCATION
      ========================================== */}

      <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-4">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Customer Location
        </h3>

        <div className="flex items-start gap-3">
          <div className="text-2xl">📍</div>

          <div className="flex-1">
            <p className="text-sm font-medium text-slate-200">
              {location?.address || "Location not available"}
            </p>

            {location?.latitude != null && location?.longitude != null && (
              <>
                <p className="mt-1 text-xs text-slate-500">
                  Latitude: {location.latitude}
                  <br />
                  Longitude: {location.longitude}
                </p>

                <a
                  href={getGoogleMapsUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-sm font-semibold text-teal-400 hover:text-teal-300"
                >
                  📍 Open Location in Google Maps →
                </a>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ==========================================
          ERROR
      ========================================== */}

      {error && (
        <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* ==========================================
          PENDING
      ========================================== */}

      {requestStatus === "pending" && (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {/* Accept */}

          <button
            type="button"
            onClick={handleAccept}
            disabled={loading}
            className="flex-1 rounded-lg bg-teal-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-teal-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Processing..." : "✓ Accept Request"}
          </button>

          {/* Reject */}

          <button
            type="button"
            onClick={handleReject}
            disabled={loading}
            className="flex-1 rounded-lg border border-red-500/30 bg-red-500/10 px-5 py-3 font-semibold text-red-400 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Processing..." : "✕ Reject Request"}
          </button>
        </div>
      )}

      {/* ==========================================
          DRIVER ASSIGNED
      ========================================== */}

      {requestStatus === "driver_assigned" && (
        <div className="mt-6">
          <div className="mb-4 rounded-xl border border-purple-500/20 bg-purple-500/5 p-4">
            <p className="font-semibold text-purple-400">🚚 Request Assigned</p>

            <p className="mt-1 text-sm text-slate-400">
              This request has been assigned to you. Start travelling to the
              customer's location.
            </p>
          </div>

          <button
            type="button"
            onClick={() => updateRequestStatus("on_the_way")}
            disabled={loading}
            className="w-full rounded-lg bg-cyan-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Updating..." : "🚚 Start - On the Way"}
          </button>
        </div>
      )}

      {/* ==========================================
          ACCEPTED
      ========================================== */}

      {requestStatus === "accepted" && (
        <div className="mt-6">
          <div className="mb-4 rounded-xl border border-green-500/20 bg-green-500/5 p-4">
            <p className="font-semibold text-green-400">✓ Request Accepted</p>

            <p className="mt-1 text-sm text-slate-400">
              You accepted this assistance request. Start travelling to the
              customer's location.
            </p>
          </div>

          <button
            type="button"
            onClick={() => updateRequestStatus("on_the_way")}
            disabled={loading}
            className="w-full rounded-lg bg-cyan-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Updating..." : "🚚 Start - On the Way"}
          </button>
        </div>
      )}

      {/* ==========================================
          ON THE WAY
      ========================================== */}

      {requestStatus === "on_the_way" && (
        <div className="mt-6">
          <div className="mb-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4">
            <p className="font-semibold text-cyan-400">🚚 You are On the Way</p>

            <p className="mt-1 text-sm text-slate-400">
              You are travelling to the customer's location.
            </p>
          </div>

          <button
            type="button"
            onClick={() => updateRequestStatus("arrived")}
            disabled={loading}
            className="w-full rounded-lg bg-blue-500 px-5 py-3 font-semibold text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Updating..." : "📍 I Have Arrived"}
          </button>
        </div>
      )}

      {/* ==========================================
          ARRIVED
      ========================================== */}

      {requestStatus === "arrived" && (
        <div className="mt-6">
          <div className="mb-4 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
            <p className="font-semibold text-blue-400">📍 Driver Arrived</p>

            <p className="mt-1 text-sm text-slate-400">
              You have arrived at the customer's location. Complete the roadside
              assistance service.
            </p>
          </div>

          <button
            type="button"
            onClick={() => updateRequestStatus("completed")}
            disabled={loading}
            className="w-full rounded-lg bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Completing..." : "✓ Complete Request"}
          </button>
        </div>
      )}

      {/* ==========================================
          COMPLETED
      ========================================== */}

      {requestStatus === "completed" && (
        <div className="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <p className="font-semibold text-emerald-400">✓ Request Completed</p>

          <p className="mt-1 text-sm text-slate-400">
            This roadside assistance request has been successfully completed.
          </p>
        </div>
      )}

      {/* ==========================================
          REJECTED
      ========================================== */}

      {requestStatus === "rejected" && (
        <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
          <p className="font-semibold text-red-400">✕ Request Rejected</p>

          <p className="mt-1 text-sm text-slate-400">
            You rejected this assistance request.
          </p>
        </div>
      )}

      {/* ==========================================
          CANCELLED
      ========================================== */}

      {requestStatus === "cancelled" && (
        <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
          <p className="font-semibold text-red-400">✕ Request Cancelled</p>

          <p className="mt-1 text-sm text-slate-400">
            This assistance request has been cancelled.
          </p>
        </div>
      )}

      {/* ==========================================
          REQUEST DATE
      ========================================== */}

      {request?.createdAt && (
        <p className="mt-5 text-right text-xs text-slate-600">
          Requested {new Date(request.createdAt).toLocaleString()}
        </p>
      )}
    </div>
  );
};

export default DriverRequestCard;
