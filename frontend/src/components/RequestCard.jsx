import React from "react";
import { Link } from "react-router-dom";
import RequestStatus from "./RequestStatus";

const RequestCard = ({ request }) => {
  if (!request) {
    return null;
  }

  // Format date
  const formatDate = (date) => {
    if (!date) {
      return "N/A";
    }

    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get service information
  const serviceName = request.service?.name || "Roadside Assistance";

  const serviceIcon = request.service?.icon || "🚗";

  // Get vehicle information
  const vehicleName = request.vehicle
    ? `${request.vehicle.make || ""} ${request.vehicle.model || ""}`.trim()
    : "Vehicle";

  // Get location
  const location =
    request.location?.address ||
    request.location?.name ||
    "Location not available";

  return (
    <div className="group rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl transition duration-300 hover:-translate-y-1 hover:border-teal-500/50">
      {/* =========================
          Header
      ========================= */}

      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Service Icon */}
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 text-3xl">
            {serviceIcon}
          </div>

          {/* Service Name */}
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Service
            </p>

            <h2 className="mt-1 text-lg font-bold text-white">{serviceName}</h2>
          </div>
        </div>

        {/* Status */}
        <RequestStatus status={request.status} />
      </div>

      {/* =========================
          Request ID
      ========================= */}

      <div className="mt-5 rounded-lg border border-slate-800 bg-slate-950 p-3">
        <p className="text-xs text-slate-500">Request ID</p>

        <p className="mt-1 break-all text-xs font-medium text-slate-300">
          {request._id}
        </p>
      </div>

      {/* =========================
          Request Information
      ========================= */}

      <div className="mt-5 grid grid-cols-2 gap-3">
        {/* Vehicle */}
        <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
          <p className="text-xs text-slate-500">Vehicle</p>

          <p className="mt-1 text-sm font-semibold text-white">{vehicleName}</p>

          {request.vehicle?.licensePlate && (
            <p className="mt-1 text-xs text-slate-500">
              {request.vehicle.licensePlate}
            </p>
          )}
        </div>

        {/* Date */}
        <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
          <p className="text-xs text-slate-500">Request Date</p>

          <p className="mt-1 text-sm font-semibold text-white">
            {formatDate(request.createdAt)}
          </p>
        </div>
      </div>

      {/* =========================
          Location
      ========================= */}

      <div className="mt-3 rounded-lg border border-slate-800 bg-slate-950 p-3">
        <p className="text-xs text-slate-500">Location</p>

        <p className="mt-1 truncate text-sm font-semibold text-white">
          📍 {location}
        </p>
      </div>

      {/* =========================
          Price
      ========================= */}

      <div className="mt-3 rounded-lg border border-slate-800 bg-slate-950 p-3">
        <p className="text-xs text-slate-500">Price</p>

        <p className="mt-1 font-semibold text-teal-400">
          {request.totalPrice !== undefined
            ? `$${request.totalPrice}`
            : request.price !== undefined
              ? `$${request.price}`
              : request.service?.basePrice !== undefined
                ? `$${request.service.basePrice}`
                : "Pending"}
        </p>
      </div>

      {/* =========================
          Description
      ========================= */}

      {request.description && (
        <div className="mt-4">
          <p className="text-xs text-slate-500">Problem Description</p>

          <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-400">
            {request.description}
          </p>
        </div>
      )}

      {/* =========================
          Buttons
      ========================= */}

      <div className="mt-6 flex gap-3">
        {/* View Details */}

        <Link
          to={`/request-details/${request._id}`}
          className="flex-1 rounded-lg border border-slate-700 px-4 py-3 text-center text-sm font-semibold text-slate-300 transition hover:border-teal-500 hover:text-teal-400"
        >
          View Details
        </Link>

        {/* Track Request */}

        {!["completed", "cancelled"].includes(
          request.status?.toLowerCase(),
        ) && (
          <Link
            to={`/track-request/${request._id}`}
            className="flex-1 rounded-lg bg-teal-500 px-4 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-teal-400"
          >
            📍 Track
          </Link>
        )}
      </div>
    </div>
  );
};

export default RequestCard;
