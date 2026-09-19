import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [driver, setDriver] = useState(null);

  const [loading, setLoading] = useState(true);
  const [driverLoading, setDriverLoading] = useState(true);

  const [error, setError] = useState("");

  // ==========================================
  // GET USER PROFILE
  // ==========================================
  useEffect(() => {
    const getProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        // No token = user is not logged in
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.get(
          "http://localhost:3000/api/v1/user/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        console.log("Profile Response:", response.data);

        if (response.data.success) {
          setUser(response.data.user);
        }
      } catch (error) {
        console.error("Profile Error:", error);

        // Token is invalid or expired
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");

          navigate("/login");
          return;
        }

        setError(error.response?.data?.message || "Unable to load profile");
      } finally {
        setLoading(false);
      }
    };

    getProfile();
  }, [navigate]);

  // ==========================================
  // CHECK DRIVER PROFILE
  // ==========================================
  useEffect(() => {
    const checkDriverProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          return;
        }

        const response = await axios.get(
          "http://localhost:3000/api/v1/drivers/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        console.log("Driver Profile Response:", response.data);

        if (response.data.success) {
          setDriver(response.data.driver);
        }
      } catch (error) {
        console.log(
          "Driver profile check:",
          error.response?.data?.message || "No driver profile found",
        );

        /*
          If user doesn't have a driver profile,
          we simply keep driver as null.

          This is NOT treated as an error because
          normal customers don't have driver profiles.
        */

        setDriver(null);
      } finally {
        setDriverLoading(false);
      }
    };

    checkDriverProfile();
  }, []);

  // ==========================================
  // LOGOUT
  // ==========================================
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  // ==========================================
  // LOADING
  // ==========================================
  if (loading || driverLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-teal-500"></div>

          <p className="text-slate-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
        <div className="w-full max-w-md rounded-2xl border border-red-500/20 bg-slate-900 p-8 text-center">
          <div className="mb-4 text-5xl">⚠️</div>

          <h2 className="mb-3 text-xl font-bold text-red-400">Error</h2>

          <p className="mb-6 text-slate-400">{error}</p>

          <button
            onClick={() => navigate("/login")}
            className="rounded-lg bg-teal-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-teal-400"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10">
      {/* ==========================================
          HEADER
      ========================================== */}
      <div className="mx-auto mb-8 flex max-w-4xl items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Profile</h1>

          <p className="mt-1 text-sm text-slate-400">
            Manage your account and roadside assistance services
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="rounded-lg border border-red-500/30 bg-red-500/10 px-5 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-500/20"
        >
          Logout
        </button>
      </div>

      <div className="mx-auto max-w-4xl">
        {/* ==========================================
            QUICK ACTIONS
        ========================================== */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* My Vehicles */}
          <Link
            to="/vehicles"
            className="group rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:-translate-y-1 hover:border-teal-500/50"
          >
            <div className="mb-3 text-3xl">🚗</div>

            <h3 className="font-semibold text-white">My Vehicles</h3>

            <p className="mt-1 text-xs text-slate-500">Manage your vehicles</p>
          </Link>

          {/* My Requests */}
          <Link
            to="/my-requests"
            className="group rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:-translate-y-1 hover:border-teal-500/50"
          >
            <div className="mb-3 text-3xl">📋</div>

            <h3 className="font-semibold text-white">My Requests</h3>

            <p className="mt-1 text-xs text-slate-500">
              View assistance requests
            </p>
          </Link>

          {/* Roadside Services */}
          <Link
            to="/services"
            className="group rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:-translate-y-1 hover:border-teal-500/50"
          >
            <div className="mb-3 text-3xl">🛠️</div>

            <h3 className="font-semibold text-white">Services</h3>

            <p className="mt-1 text-xs text-slate-500">
              Find roadside services
            </p>
          </Link>

          {/* Driver Section */}
          {driver ? (
            <Link
              to="/driver/dashboard"
              className="group rounded-2xl border border-teal-500/30 bg-teal-500/10 p-5 transition hover:-translate-y-1 hover:border-teal-500"
            >
              <div className="mb-3 text-3xl">🚚</div>

              <h3 className="font-semibold text-teal-400">Driver Dashboard</h3>

              <p className="mt-1 text-xs text-slate-400">
                Manage your driver account
              </p>
            </Link>
          ) : (
            <Link
              to="/driver/profile"
              className="group rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:-translate-y-1 hover:border-teal-500/50"
            >
              <div className="mb-3 text-3xl">🚚</div>

              <h3 className="font-semibold text-white">Become a Driver</h3>

              <p className="mt-1 text-xs text-slate-500">
                Create your driver profile
              </p>
            </Link>
          )}
        </div>

        {/* ==========================================
            PROFILE CARD
        ========================================== */}
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
          {/* Profile Header */}
          <div className="border-b border-slate-800 bg-slate-800/40 px-6 py-8">
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              {/* Avatar */}
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-teal-500 text-3xl font-bold text-slate-950">
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>

              {/* User Name */}
              <div className="text-center sm:text-left">
                <h2 className="text-2xl font-bold text-white">{user.name}</h2>

                <p className="mt-1 text-slate-400">{user.email}</p>

                <span className="mt-3 inline-block rounded-full bg-teal-500/10 px-3 py-1 text-xs font-semibold capitalize text-teal-400">
                  {user.role || "Customer"}
                </span>
              </div>
            </div>
          </div>

          {/* ==========================================
              USER INFORMATION
          ========================================== */}
          <div className="p-6">
            <h3 className="mb-5 text-lg font-semibold text-white">
              Account Information
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Name */}
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                  Full Name
                </p>

                <p className="text-base font-medium text-slate-200">
                  {user.name || "Not provided"}
                </p>
              </div>

              {/* Email */}
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                  Email
                </p>

                <p className="break-all text-base font-medium text-slate-200">
                  {user.email || "Not provided"}
                </p>
              </div>

              {/* Phone */}
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                  Phone
                </p>

                <p className="text-base font-medium text-slate-200">
                  {user.phone || "Not provided"}
                </p>
              </div>

              {/* Role */}
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                  Account Type
                </p>

                <p className="text-base font-medium capitalize text-slate-200">
                  {user.role || "Customer"}
                </p>
              </div>

              {/* Online Status */}
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 sm:col-span-2">
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                  Online Status
                </p>

                <div className="flex items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      user.isOnline ? "bg-green-500" : "bg-slate-500"
                    }`}
                  ></span>

                  <p className="text-base font-medium text-slate-200">
                    {user.isOnline ? "Online" : "Offline"}
                  </p>
                </div>
              </div>
            </div>

            {/* ==========================================
                DRIVER SECTION
            ========================================== */}
            <div className="mt-8 border-t border-slate-800 pt-8">
              <h3 className="mb-5 text-lg font-semibold text-white">
                Driver Services
              </h3>

              {driver ? (
                <div>
                  {/* Driver Exists */}
                  <div className="rounded-2xl border border-teal-500/30 bg-teal-500/5 p-5">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-teal-500/10 text-3xl">
                          🚚
                        </div>

                        <div>
                          <h4 className="font-semibold text-white">
                            Driver Profile
                          </h4>

                          <p className="mt-1 text-sm text-slate-400">
                            {driver.vehicle
                              ? `${driver.vehicle.make} ${driver.vehicle.model}`
                              : "Driver vehicle"}
                          </p>

                          <span
                            className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                              driver.status === "approved"
                                ? "bg-green-500/10 text-green-400"
                                : driver.status === "pending"
                                  ? "bg-yellow-500/10 text-yellow-400"
                                  : driver.status === "suspended"
                                    ? "bg-red-500/10 text-red-400"
                                    : "bg-slate-500/10 text-slate-400"
                            }`}
                          >
                            {driver.status}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Link
                          to="/driver/dashboard"
                          className="rounded-lg bg-teal-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-teal-400"
                        >
                          Visit Driver Dashboard
                        </Link>

                        <Link
                          to="/driver/profile"
                          className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-teal-500 hover:text-teal-400"
                        >
                          Profile
                        </Link>
                      </div>
                    </div>

                    {/* Pending message */}
                    {driver.status === "pending" && (
                      <div className="mt-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">
                        <p className="text-sm text-yellow-400">
                          ⏳ Your driver profile is waiting for admin approval.
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          You may not receive assistance requests until your
                          driver account is approved.
                        </p>
                      </div>
                    )}

                    {/* Approved message */}
                    {driver.status === "approved" && (
                      <div className="mt-4 rounded-xl border border-green-500/20 bg-green-500/5 p-4">
                        <p className="text-sm text-green-400">
                          ✅ Your driver account is approved.
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          You can now manage your availability and assistance
                          requests.
                        </p>
                      </div>
                    )}

                    {/* Suspended message */}
                    {driver.status === "suspended" && (
                      <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                        <p className="text-sm text-red-400">
                          🚫 Your driver account is suspended.
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Please contact the administrator for more information.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-800 text-3xl">
                        🚚
                      </div>

                      <div>
                        <h4 className="font-semibold text-white">
                          Become a Roadside Driver
                        </h4>

                        <p className="mt-1 max-w-lg text-sm text-slate-500">
                          Join our roadside assistance team and help customers
                          with towing and emergency roadside services.
                        </p>
                      </div>
                    </div>

                    <Link
                      to="/driver/profile"
                      className="whitespace-nowrap rounded-lg bg-teal-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-teal-400"
                    >
                      Create Driver Profile
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* ==========================================
                BOTTOM LINKS
            ========================================== */}
            <div className="mt-8 flex flex-wrap gap-3 border-t border-slate-800 pt-6">
              <Link
                to="/"
                className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-teal-500 hover:text-teal-400"
              >
                ← Back to Home
              </Link>

              <Link
                to="/services"
                className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-teal-500 hover:text-teal-400"
              >
                🛠️ Roadside Services
              </Link>

              <Link
                to="/requests"
                className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-teal-500 hover:text-teal-400"
              >
                📋 My Requests
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
