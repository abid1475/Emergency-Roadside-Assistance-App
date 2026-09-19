import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";

import RequestStatus from "../components/RequestStatus";
import LocationMap from "../components/LocationMap";

const RequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showCancelBox, setShowCancelBox] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  // ==========================================
  // Get Request Details
  // ==========================================

  const getRequestDetails = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      // Check login
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

      console.log("Request Details:", response.data);

      if (response.data.success) {
        setRequest(response.data.request);
      } else {
        setError(response.data.message || "Unable to load request details.");
      }
    } catch (error) {
      console.error("Get Request Details Error:", error);

      // Unauthorized
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
        return;
      }

      setError(
        error.response?.data?.message || "Unable to load request details.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Load request
  useEffect(() => {
    getRequestDetails();
  }, [id]);

  // ==========================================
  // Format Date
  // ==========================================

  const formatDate = (date) => {
    if (!date) {
      return "Not available";
    }

    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ==========================================
  // Request Status
  // ==========================================

  const activeStatuses = [
    "pending",
    "accepted",
    "driver_assigned",
    "on_the_way",
    "arrived",
  ];

  const canTrack = request && activeStatuses.includes(request.status);

  const canCancel =
    request && !["completed", "cancelled"].includes(request.status);

  // ==========================================
  // Cancel Request
  // ==========================================

  const handleCancelRequest = async () => {
    try {
      setCancelling(true);

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.put(
        `https://emergency-roadside-assistance-app-backend.onrender.com/api/v1/assistance-requests/${id}/cancel`,
        {
          cancellationReason:
            cancellationReason || "Customer no longer needs assistance.",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log("Cancel Response:", response.data);

      if (response.data.success) {
        setRequest(response.data.request);

        setShowCancelBox(false);
        setCancellationReason("");
      }
    } catch (error) {
      console.error("Cancel Request Error:", error);

      alert(error.response?.data?.message || "Unable to cancel request.");
    } finally {
      setCancelling(false);
    }
  };

  // ==========================================
  // Loading
  // ==========================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-teal-500"></div>

          <p className="text-slate-400">Loading request details...</p>
        </div>
      </div>
    );
  }

  // ==========================================
  // Error
  // ==========================================

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-10">
        <div className="mx-auto max-w-xl">
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center">
            <div className="mb-4 text-5xl">⚠️</div>

            <h2 className="text-2xl font-bold text-white">
              Unable to Load Request
            </h2>

            <p className="mt-3 text-red-400">{error}</p>

            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={getRequestDetails}
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

  // No request
  if (!request) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="mb-4 text-5xl">🔍</div>

          <h2 className="text-xl font-bold text-white">Request Not Found</h2>

          <Link
            to="/my-requests"
            className="mt-5 inline-block text-teal-400 hover:text-teal-300"
          >
            ← Back to My Requests
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10">
      <div className="mx-auto max-w-6xl">
        {/* ==========================================
            Header
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

            <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
              Request Details
            </h1>

            <p className="mt-2 break-all text-sm text-slate-500">
              Request ID: {request._id}
            </p>
          </div>
        </div>

        {/* ==========================================
            Status
        ========================================== */}

        <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-2 text-xs uppercase tracking-wide text-slate-500">
                Current Status
              </p>

              <RequestStatus status={request.status} />
            </div>

            {canTrack && (
              <Link
                to={`/track-request/${request._id}`}
                className="rounded-lg bg-teal-500 px-5 py-3 text-center font-semibold text-slate-950 transition hover:bg-teal-400"
              >
                📍 Track Request
              </Link>
            )}
          </div>
        </div>

        {/* ==========================================
            Main Grid
        ========================================== */}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* ==========================================
              Service Information
          ========================================== */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-5 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-teal-500/10 text-3xl">
                {request.service?.icon || "🚗"}
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Service
                </p>

                <h2 className="text-xl font-bold text-white">
                  {request.service?.name || "Roadside Assistance"}
                </h2>
              </div>
            </div>

            {request.service?.description && (
              <p className="mb-5 text-sm leading-6 text-slate-400">
                {request.service.description}
              </p>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                <p className="text-xs text-slate-500">Base Price</p>

                <p className="mt-1 font-semibold text-teal-400">
                  {request.service?.basePrice !== undefined
                    ? `$${request.service.basePrice}`
                    : "N/A"}
                </p>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                <p className="text-xs text-slate-500">Estimated Time</p>

                <p className="mt-1 font-semibold text-white">
                  {request.service?.estimatedTime || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* ==========================================
              Vehicle Information
          ========================================== */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-5 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-500/10 text-3xl">
                🚗
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Vehicle
                </p>

                <h2 className="text-xl font-bold text-white">
                  {request.vehicle
                    ? `${request.vehicle.make} ${request.vehicle.model}`
                    : "Vehicle"}
                </h2>
              </div>
            </div>

            {request.vehicle ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Make</p>

                  <p className="mt-1 font-semibold text-white">
                    {request.vehicle.make}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">Model</p>

                  <p className="mt-1 font-semibold text-white">
                    {request.vehicle.model}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">Year</p>

                  <p className="mt-1 font-semibold text-white">
                    {request.vehicle.year}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">Color</p>

                  <p className="mt-1 font-semibold text-white">
                    {request.vehicle.color}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">License Plate</p>

                  <p className="mt-1 font-semibold text-white">
                    {request.vehicle.licensePlate}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">Type</p>

                  <p className="mt-1 font-semibold text-white">
                    {request.vehicle.vehicleType || "N/A"}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400">
                Vehicle information is not available.
              </p>
            )}
          </div>
        </div>

        {/* ==========================================
            Location Map
        ========================================== */}

        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="mb-5">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Assistance Location
            </p>

            <h2 className="mt-1 text-xl font-bold text-white">
              📍 Your Location
            </h2>
          </div>

          {request.location?.latitude && request.location?.longitude ? (
            <>
              <LocationMap
                latitude={request.location.latitude}
                longitude={request.location.longitude}
                popupText="Customer Location"
                height="400px"
              />

              {request.location.address && (
                <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950 p-4">
                  <p className="text-xs text-slate-500">Address</p>

                  <p className="mt-1 text-sm text-slate-300">
                    {request.location.address}
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="flex h-64 items-center justify-center rounded-xl border border-slate-800 bg-slate-950">
              <div className="text-center">
                <div className="mb-3 text-4xl">📍</div>

                <p className="text-sm text-slate-400">
                  Location information is not available.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ==========================================
            Problem Description
        ========================================== */}

        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 text-2xl">
              📝
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Problem
              </p>

              <h2 className="text-xl font-bold text-white">Description</h2>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
            <p className="text-sm leading-7 text-slate-300">
              {request.description || "No problem description provided."}
            </p>
          </div>
        </div>

        {/* ==========================================
            Driver Information
        ========================================== */}

        {request.driver && (
          <div className="mt-6 rounded-2xl border border-teal-500/20 bg-teal-500/5 p-6">
            <div className="mb-5 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-500/10 text-2xl">
                👨‍🔧
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-teal-400">
                  Assigned Driver
                </p>

                <h2 className="text-xl font-bold text-white">
                  {request.driver.name || "Assigned Driver"}
                </h2>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {request.driver.phone && (
                <div>
                  <p className="text-xs text-slate-500">Phone</p>

                  <a
                    href={`tel:${request.driver.phone}`}
                    className="mt-1 inline-block font-semibold text-teal-400 hover:text-teal-300"
                  >
                    📞 {request.driver.phone}
                  </a>
                </div>
              )}

              {request.driver.email && (
                <div>
                  <p className="text-xs text-slate-500">Email</p>

                  <p className="mt-1 font-semibold text-white">
                    {request.driver.email}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==========================================
            Request Information
        ========================================== */}

        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="mb-5 text-xl font-bold text-white">
            Request Information
          </h2>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <p className="text-xs text-slate-500">Request Created</p>

              <p className="mt-1 text-sm font-semibold text-white">
                {formatDate(request.createdAt)}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">Current Status</p>

              <div className="mt-2">
                <RequestStatus status={request.status} />
              </div>
            </div>

            {request.acceptedAt && (
              <div>
                <p className="text-xs text-slate-500">Accepted At</p>

                <p className="mt-1 text-sm font-semibold text-white">
                  {formatDate(request.acceptedAt)}
                </p>
              </div>
            )}

            {request.arrivedAt && (
              <div>
                <p className="text-xs text-slate-500">Driver Arrived</p>

                <p className="mt-1 text-sm font-semibold text-white">
                  {formatDate(request.arrivedAt)}
                </p>
              </div>
            )}

            {request.completedAt && (
              <div>
                <p className="text-xs text-slate-500">Completed At</p>

                <p className="mt-1 text-sm font-semibold text-white">
                  {formatDate(request.completedAt)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ==========================================
            Cancellation Information
        ========================================== */}

        {request.status === "cancelled" && request.cancellationReason && (
          <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
            <h2 className="text-lg font-bold text-red-400">
              Cancellation Reason
            </h2>

            <p className="mt-2 text-sm text-slate-300">
              {request.cancellationReason}
            </p>

            {request.cancelledAt && (
              <p className="mt-3 text-xs text-slate-500">
                Cancelled: {formatDate(request.cancelledAt)}
              </p>
            )}
          </div>
        )}

        {/* ==========================================
            Actions
        ========================================== */}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {canTrack && (
            <Link
              to={`/track-request/${request._id}`}
              className="flex-1 rounded-lg bg-teal-500 px-5 py-3 text-center font-semibold text-slate-950 transition hover:bg-teal-400"
            >
              📍 Track Request
            </Link>
          )}

          <Link
            to="/my-requests"
            className="flex-1 rounded-lg border border-slate-700 px-5 py-3 text-center font-semibold text-slate-300 transition hover:border-teal-500 hover:text-teal-400"
          >
            ← My Requests
          </Link>

          {canCancel && (
            <button
              onClick={() => setShowCancelBox(true)}
              className="flex-1 rounded-lg border border-red-500/30 px-5 py-3 font-semibold text-red-400 transition hover:bg-red-500/10"
            >
              Cancel Request
            </button>
          )}
        </div>

        {/* ==========================================
            Cancel Modal
        ========================================== */}

        {showCancelBox && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
            <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
              <h2 className="text-xl font-bold text-white">
                Cancel Assistance Request
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                Are you sure you want to cancel this assistance request?
              </p>

              {/* Reason */}

              <label className="mt-5 block text-sm font-medium text-slate-300">
                Cancellation Reason
              </label>

              <textarea
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                rows="4"
                placeholder="Why do you want to cancel?"
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-red-500"
              />

              {/* Modal Buttons */}

              <div className="mt-5 flex gap-3">
                <button
                  onClick={() => {
                    setShowCancelBox(false);
                    setCancellationReason("");
                  }}
                  disabled={cancelling}
                  className="flex-1 rounded-lg border border-slate-700 px-4 py-3 font-semibold text-slate-300 transition hover:border-slate-600"
                >
                  Keep Request
                </button>

                <button
                  onClick={handleCancelRequest}
                  disabled={cancelling}
                  className="flex-1 rounded-lg bg-red-500 px-4 py-3 font-semibold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {cancelling ? "Cancelling..." : "Yes, Cancel"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestDetails;
