import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import ServiceCard from "../components/ServiceCard";

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Get services from backend
  const getServices = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get("http://localhost:3000/api/v1/services");

      console.log("Services Response:", response.data);

      if (response.data.success) {
        setServices(response.data.services);
      } else {
        setError("Unable to load roadside services");
      }
    } catch (error) {
      console.error("Get Services Error:", error);

      setError(
        error.response?.data?.message || "Unable to load roadside services",
      );
    } finally {
      setLoading(false);
    }
  };

  // Load services when page opens
  useEffect(() => {
    getServices();
  }, []);

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-teal-500"></div>

          <p className="text-slate-400">Loading roadside services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10">
      {/* Main Container */}
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-10 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-teal-400">
            Emergency Roadside Assistance
          </p>

          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            Roadside Services
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-slate-400">
            Select the roadside service you need and get help quickly from our
            assistance team.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-auto mb-8 max-w-2xl rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-center">
            <p className="text-sm text-red-400">{error}</p>

            <button
              onClick={getServices}
              className="mt-3 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-400"
            >
              Try Again
            </button>
          </div>
        )}

        {/* No Services */}
        {!error && services.length === 0 && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
            <div className="mb-4 text-5xl">🚗</div>

            <h2 className="text-xl font-semibold text-white">
              No Services Available
            </h2>

            <p className="mt-2 text-slate-400">
              There are currently no roadside services available.
            </p>
          </div>
        )}

        {/* Services Grid */}
        {!error && services.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>
        )}

        {/* Back Button */}
        <div className="mt-10 text-center">
          <Link
            to="/profile"
            className="text-sm text-slate-400 transition hover:text-teal-400"
          >
            ← Back to Profile
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Services;
