import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import RequestCard from "../components/RequestCard";

const MyRequests = () => {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Get My Assistance Requests

  const getMyRequests = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      // No token
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get(
        "http://localhost:3000/api/v1/assistance-requests/my-requests",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log("My Requests:", response.data);

      if (response.data.success) {
        setRequests(response.data.requests || []);
      } else {
        setError(
          response.data.message || "Unable to load your assistance requests.",
        );
      }
    } catch (error) {
      console.error("Get My Requests Error:", error);

      // Token expired or invalid
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
        return;
      }

      setError(
        error.response?.data?.message ||
          "Unable to load your assistance requests.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Load requests when page opens
  useEffect(() => {
    getMyRequests();
  }, []);

  // Loading Screen

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-teal-500"></div>

          <p className="text-slate-400">Loading your requests...</p>
        </div>
      </div>
    );
  }

  // Main Page

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10">
      <div className="mx-auto max-w-7xl">
        {/* Header */}

        <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-teal-400">
              Emergency Roadside Assistance
            </p>

            <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
              My Assistance Requests
            </h1>

            <p className="mt-2 text-slate-400">
              View and track all your roadside assistance requests.
            </p>
          </div>

          {/* New Request Button */}

          <Link
            to="/services"
            className="rounded-lg bg-teal-500 px-5 py-3 text-center font-semibold text-slate-950 transition hover:bg-teal-400"
          >
            + Request Help
          </Link>
        </div>

        {/* Error Message */}

        {error && (
          <div className="mx-auto mb-8 max-w-2xl rounded-xl border border-red-500/30 bg-red-500/10 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-red-400">{error}</p>

              <button
                onClick={getMyRequests}
                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-400"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* No Requests */}

        {!error && requests.length === 0 && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
            <div className="mb-5 text-6xl">🚗</div>

            <h2 className="text-2xl font-bold text-white">
              No Assistance Requests
            </h2>

            <p className="mx-auto mt-3 max-w-md text-slate-400">
              You haven't requested roadside assistance yet. When you need help,
              your requests will appear here.
            </p>

            <Link
              to="/services"
              className="mt-6 inline-block rounded-lg bg-teal-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-teal-400"
            >
              View Roadside Services
            </Link>
          </div>
        )}

        {/* Requests */}

        {!error && requests.length > 0 && (
          <div className="grid gap-6 lg:grid-cols-2">
            {requests.map((request) => (
              <RequestCard key={request._id} request={request} />
            ))}
          </div>
        )}

        {/* Bottom Navigation */}

        <div className="mt-10 flex flex-wrap justify-center gap-5 text-sm">
          <Link
            to="/profile"
            className="text-slate-400 transition hover:text-teal-400"
          >
            ← Back to Profile
          </Link>

          <Link
            to="/vehicles"
            className="text-slate-400 transition hover:text-teal-400"
          >
            My Vehicles
          </Link>

          <Link
            to="/services"
            className="text-slate-400 transition hover:text-teal-400"
          >
            Roadside Services
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MyRequests;
