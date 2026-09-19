import React from "react";
import { Link } from "react-router-dom";

const ServiceCard = ({ service }) => {
  return (
    <div className="group rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl transition duration-300 hover:-translate-y-1 hover:border-teal-500/50 hover:shadow-teal-500/5">
      {/* Service Icon */}
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-500/10 text-4xl">
        {service.icon || "🚗"}
      </div>

      {/* Service Name */}
      <h2 className="text-xl font-bold text-white">{service.name}</h2>

      {/* Service Description */}
      <p className="mt-3 min-h-[48px] text-sm leading-6 text-slate-400">
        {service.description}
      </p>

      {/* Price and Estimated Time */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        {/* Price */}
        <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
          <p className="text-xs text-slate-500">Starting Price</p>

          <p className="mt-1 font-semibold text-teal-400">
            ${service.basePrice}
          </p>
        </div>

        {/* Estimated Time */}
        <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
          <p className="text-xs text-slate-500">Estimated Time</p>

          <p className="mt-1 text-sm font-semibold text-white">
            {service.estimatedTime || "Available Soon"}
          </p>
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-6 flex gap-3">
        {/* View Details */}
        <Link
          to={`/services/${service._id}`}
          className="flex-1 rounded-lg border border-slate-700 px-4 py-3 text-center text-sm font-semibold text-slate-300 transition hover:border-teal-500 hover:text-teal-400"
        >
          View Details
        </Link>

        {/* Request Help */}
        <Link
          to={`/request-assistance/${service._id}`}
          className="flex-1 rounded-lg bg-teal-500 px-4 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-teal-400"
        >
          Request Help
        </Link>
      </div>
    </div>
  );
};

export default ServiceCard;
