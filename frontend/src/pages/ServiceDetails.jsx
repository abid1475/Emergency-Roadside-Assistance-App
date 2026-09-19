import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";

const ServiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Get service details
  const getServiceDetails = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `http://localhost:3000/api/v1/services/${id}`,
      );

      console.log("Service Details:", response.data);

      if (response.data.success) {
        setService(response.data.service);
      }
    } catch (error) {
      console.error("Get Service Details Error:", error);

      setError(
        error.response?.data?.message || "Unable to load service details",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getServiceDetails();
  }, [id]);

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-teal-500"></div>

          <p className="text-slate-400">Loading service...</p>
        </div>
      </div>
    );
  }

  // Error
  if (error || !service) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
          <div className="mb-4 text-5xl">⚠️</div>

          <h2 className="text-xl font-bold text-white">Service Not Found</h2>

          <p className="mt-2 text-sm text-red-400">
            {error || "The requested service does not exist."}
          </p>

          <Link
            to="/services"
            className="mt-6 inline-block rounded-lg bg-teal-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-teal-400"
          >
            Back to Services
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10">
      <div className="mx-auto max-w-4xl">
        {/* Back */}
        <Link
          to="/services"
          className="text-sm text-slate-400 transition hover:text-teal-400"
        >
          ← Back to Services
        </Link>

        {/* Service Card */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
          {/* Top Section */}
          <div className="border-b border-slate-800 p-8 text-center sm:p-12">
            {/* Icon */}
            <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-3xl bg-teal-500/10 text-6xl">
              {service.icon}
            </div>

            {/* Service Name */}
            <h1 className="mt-6 text-3xl font-bold text-white sm:text-4xl">
              {service.name}
            </h1>

            {/* Description */}
            <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-400">
              {service.description}
            </p>
          </div>

          {/* Service Information */}
          <div className="grid gap-4 p-6 sm:grid-cols-2 sm:p-8">
            {/* Price */}
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-500/10 text-2xl">
                  💰
                </div>

                <div>
                  <p className="text-sm text-slate-500">Starting Price</p>

                  <p className="mt-1 text-xl font-bold text-teal-400">
                    ${service.basePrice}
                  </p>
                </div>
              </div>
            </div>

            {/* Estimated Time */}
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-500/10 text-2xl">
                  ⏱️
                </div>

                <div>
                  <p className="text-sm text-slate-500">Estimated Time</p>

                  <p className="mt-1 text-xl font-bold text-white">
                    {service.estimatedTime}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Active Status */}
          <div className="px-6 sm:px-8">
            <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-5">
              <div>
                <p className="font-semibold text-white">Service Availability</p>

                <p className="mt-1 text-sm text-slate-500">
                  Current service status
                </p>
              </div>

              {service.isActive ? (
                <span className="rounded-full bg-green-500/10 px-4 py-2 text-sm font-semibold text-green-400">
                  Available
                </span>
              ) : (
                <span className="rounded-full bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-400">
                  Currently Unavailable
                </span>
              )}
            </div>
          </div>

          {/* Action */}
          <div className="p-6 sm:p-8">
            {service.isActive ? (
              <Link
                to={`/request-assistance/${service._id}`}
                className="block w-full rounded-xl bg-teal-500 px-6 py-4 text-center font-bold text-slate-950 transition hover:bg-teal-400"
              >
                Request This Service
              </Link>
            ) : (
              <button
                disabled
                className="w-full cursor-not-allowed rounded-xl bg-slate-700 px-6 py-4 font-bold text-slate-400"
              >
                Service Currently Unavailable
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetails;
