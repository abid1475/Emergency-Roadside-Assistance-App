import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";

const DriverRequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const token = localStorage.getItem("token");

  // Get request details
  const getRequestDetails = async () => {
    try {
      setLoading(true);
      setError("");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get(
        `https://emergency-roadside-assistance-app-backend.onrender.com/api/v1/assistance-requests/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log("Driver Request Details:", response.data);

      if (response.data.success) {
        setRequest(response.data.request);
      }
    } catch (error) {
      console.error("Get Driver Request Error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      setError(
        error.response?.data?.message || "Unable to load request details",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getRequestDetails();
  }, [id]);

  // Update request status
  const updateStatus = async (status) => {
    try {
      setActionLoading(true);

      const response = await axios.put(
        `https://emergency-roadside-assistance-app-backend.onrender.com/api/v1/assistance-requests/${id}/status`,
        {
          status,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log("Status Update Response:", response.data);

      if (response.data.success) {
        setRequest(response.data.request);
      }
    } catch (error) {
      console.error("Update Status Error:", error);

      alert(error.response?.data?.message || "Unable to update request status");
    } finally {
      setActionLoading(false);
    }
  };

  // Status badge
  const getStatusStyle = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";

      case "driver_assigned":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";

      case "accepted":
        return "bg-teal-500/10 text-teal-400 border-teal-500/30";

      case "on_the_way":
        return "bg-purple-500/10 text-purple-400 border-purple-500/30";

      case "arrived":
        return "bg-orange-500/10 text-orange-400 border-orange-500/30";

      case "completed":
        return "bg-green-500/10 text-green-400 border-green-500/30";

      case "cancelled":
        return "bg-red-500/10 text-red-400 border-red-500/30";

      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/30";
    }
  };

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-teal-500"></div>

          <p className="text-slate-400">Loading request details...</p>
        </div>
      </div>
    );
  }

  // Error screen
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
        <div className="w-full max-w-md rounded-2xl border border-red-500/20 bg-slate-900 p-8 text-center">
          <div className="mb-4 text-5xl">⚠️</div>

          <h2 className="mb-3 text-xl font-bold text-red-400">
            Unable to Load Request
          </h2>

          <p className="mb-6 text-slate-400">{error}</p>

          <button
            onClick={() => navigate("/driver/dashboard")}
            className="rounded-lg bg-teal-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-teal-400"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!request) {
    return null;
  }

  const status = request.status;

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-teal-400">
              Driver Panel
            </p>

            <h1 className="mt-1 text-3xl font-bold text-white">
              Request Details
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Review the customer's roadside assistance request.
            </p>
          </div>

          <Link
            to="/driver/requests"
            className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-teal-500 hover:text-teal-400"
          >
            ← Back to Requests
          </Link>
        </div>

        {/* Request Status */}
        <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Request Status
              </p>

              <h2 className="mt-1 text-xl font-bold capitalize text-white">
                {status?.replace(/_/g, " ")}
              </h2>
            </div>

            <span
              className={`inline-flex w-fit rounded-full border px-4 py-2 text-sm font-semibold capitalize ${getStatusStyle(
                status,
              )}`}
            >
              {status?.replace(/_/g, " ")}
            </span>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Customer Information */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
            <h2 className="mb-5 text-lg font-bold text-white">
              👤 Customer Information
            </h2>

            <div className="space-y-4">
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Name
                </p>

                <p className="mt-1 font-medium text-slate-200">
                  {request.user?.name || "Not available"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Phone
                </p>

                <p className="mt-1 font-medium text-slate-200">
                  {request.user?.phone || "Not available"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Email
                </p>

                <p className="mt-1 break-all font-medium text-slate-200">
                  {request.user?.email || "Not available"}
                </p>
              </div>
            </div>
          </div>

          {/* Service Information */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
            <h2 className="mb-5 text-lg font-bold text-white">
              🚨 Service Information
            </h2>

            <div className="space-y-4">
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Service
                </p>

                <p className="mt-1 font-medium text-slate-200">
                  {request.service?.name || "Roadside Assistance"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Description
                </p>

                <p className="mt-1 leading-6 text-slate-300">
                  {request.description || "No description provided."}
                </p>
              </div>
            </div>
          </div>

          {/* Vehicle Information */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
            <h2 className="mb-5 text-lg font-bold text-white">
              🚗 Vehicle Information
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Make
                </p>

                <p className="mt-1 font-medium text-slate-200">
                  {request.vehicle?.make || "N/A"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Model
                </p>

                <p className="mt-1 font-medium text-slate-200">
                  {request.vehicle?.model || "N/A"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Year
                </p>

                <p className="mt-1 font-medium text-slate-200">
                  {request.vehicle?.year || "N/A"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Color
                </p>

                <p className="mt-1 font-medium text-slate-200">
                  {request.vehicle?.color || "N/A"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 sm:col-span-2">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  License Plate
                </p>

                <p className="mt-1 font-medium text-slate-200">
                  {request.vehicle?.licensePlate || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
            <h2 className="mb-5 text-lg font-bold text-white">
              📍 Customer Location
            </h2>

            <div className="space-y-4">
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Address
                </p>

                <p className="mt-1 leading-6 text-slate-300">
                  {request.location?.address || "Address not provided"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Latitude
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-200">
                    {request.location?.latitude ?? "N/A"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Longitude
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-200">
                    {request.location?.longitude ?? "N/A"}
                  </p>
                </div>
              </div>

              {request.location?.latitude && request.location?.longitude && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${request.location.latitude},${request.location.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-lg bg-teal-500 px-5 py-3 text-center font-semibold text-slate-950 transition hover:bg-teal-400"
                >
                  📍 Open Location in Google Maps
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Driver Actions */}
        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
          <h2 className="mb-5 text-lg font-bold text-white">Driver Actions</h2>

          <div className="flex flex-wrap gap-3">
            {/* Accept */}
            {status === "driver_assigned" && (
              <button
                onClick={() => updateStatus("accepted")}
                disabled={actionLoading}
                className="rounded-lg bg-teal-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-teal-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {actionLoading ? "Updating..." : "✓ Accept Request"}
              </button>
            )}

            {/* Start Journey */}
            {status === "accepted" && (
              <button
                onClick={() => updateStatus("on_the_way")}
                disabled={actionLoading}
                className="rounded-lg bg-purple-500 px-6 py-3 font-semibold text-white transition hover:bg-purple-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {actionLoading ? "Updating..." : "🚗 Start Journey"}
              </button>
            )}

            {/* Arrived */}
            {status === "on_the_way" && (
              <button
                onClick={() => updateStatus("arrived")}
                disabled={actionLoading}
                className="rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {actionLoading ? "Updating..." : "📍 Mark Arrived"}
              </button>
            )}

            {/* Complete */}
            {status === "arrived" && (
              <button
                onClick={() => updateStatus("completed")}
                disabled={actionLoading}
                className="rounded-lg bg-green-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {actionLoading ? "Updating..." : "✓ Complete Request"}
              </button>
            )}

            {/* Completed */}
            {status === "completed" && (
              <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-6 py-3 font-semibold text-green-400">
                ✓ Request Completed
              </div>
            )}

            {/* Cancelled */}
            {status === "cancelled" && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-6 py-3 font-semibold text-red-400">
                ✕ Request Cancelled
              </div>
            )}
          </div>
        </div>

        {/* Request Date */}
        <div className="mt-6 text-center text-sm text-slate-500">
          Request created:{" "}
          {request.createdAt
            ? new Date(request.createdAt).toLocaleString()
            : "N/A"}
        </div>
      </div>
    </div>
  );
};

export default DriverRequestDetails;
