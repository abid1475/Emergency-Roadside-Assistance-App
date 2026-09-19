import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const token = localStorage.getItem("token");

  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch (error) {
    user = null;
  }

  const role = user?.role;

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setMenuOpen(false);
    navigate("/login");
  };

  // Close mobile menu
  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-700/60 bg-slate-950 shadow-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* ================================
            LOGO
        ================================= */}
        <Link
          to="/"
          onClick={closeMenu}
          className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-white transition hover:opacity-90"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-xl shadow-lg shadow-teal-900/30">
            🚗
          </span>

          <span>
            Road<span className="text-teal-400">Assist</span>
          </span>
        </Link>

        {/* ================================
            MOBILE MENU BUTTON
        ================================= */}
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="rounded-lg p-2 text-2xl text-slate-300 transition hover:bg-slate-800 hover:text-white md:hidden"
          aria-label="Toggle navigation menu"
        >
          {menuOpen ? "✕" : "☰"}
        </button>

        {/* ================================
            DESKTOP NAVIGATION
        ================================= */}
        <div className="hidden items-center gap-1 md:flex">
          {/* CUSTOMER NAVIGATION */}
          {token && role === "customer" && (
            <>
              <Link
                to="/profile"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
              >
                Profile
              </Link>

              <Link
                to="/vehicles"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
              >
                My Vehicles
              </Link>

              <Link
                to="/services"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
              >
                Services
              </Link>

              <Link
                to="/my-requests"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
              >
                My Requests
              </Link>

              <Link
                to="/services"
                className="ml-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-red-900/20 transition hover:bg-red-700 hover:shadow-red-900/40"
              >
                🚨 Emergency
              </Link>
            </>
          )}

          {/* DRIVER NAVIGATION */}
          {token && role === "driver" && (
            <>
              <Link
                to="/driver/dashboard"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
              >
                Dashboard
              </Link>

              <Link
                to="/driver/profile"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
              >
                My Profile
              </Link>

              <Link
                to="/driver/dashboard"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
              >
                Requests
              </Link>
            </>
          )}

          {/* ADMIN NAVIGATION */}
          {token && role === "admin" && (
            <>
              <Link
                to="/admin"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
              >
                Dashboard
              </Link>

              <Link
                to="/admin"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
              >
                Drivers
              </Link>

              <Link
                to="/admin"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
              >
                Requests
              </Link>
            </>
          )}

          {/* NOT LOGGED IN */}
          {!token && (
            <>
              <Link
                to="/login"
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="ml-1 rounded-lg bg-teal-600 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-teal-900/30 transition hover:bg-teal-700"
              >
                Register
              </Link>
            </>
          )}

          {/* ================================
              USER SECTION
          ================================= */}
          {token && user && (
            <div className="ml-3 flex items-center gap-3 border-l border-slate-700 pl-4">
              {/* User */}
              <div className="flex items-center gap-2">
                {/* Avatar */}
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-600 text-sm font-bold text-white">
                  {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
                </div>

                {/* User Information */}
                <div className="hidden flex-col leading-tight lg:flex">
                  <span className="max-w-28 truncate text-sm font-semibold text-white">
                    {user?.fullName || "User"}
                  </span>

                  <span className="text-xs capitalize text-slate-400">
                    {role || "user"}
                  </span>
                </div>
              </div>

              {/* Logout */}
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-300 transition hover:border-red-600 hover:bg-red-600 hover:text-white"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ================================
          MOBILE NAVIGATION
      ================================= */}
      {menuOpen && (
        <div className="border-t border-slate-800 bg-slate-950 px-4 pb-5 pt-3 shadow-xl md:hidden">
          <div className="flex flex-col gap-1">
            {/* CUSTOMER MOBILE */}
            {token && role === "customer" && (
              <>
                <Link
                  to="/profile"
                  onClick={closeMenu}
                  className="rounded-lg px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
                >
                  👤 Profile
                </Link>

                <Link
                  to="/vehicles"
                  onClick={closeMenu}
                  className="rounded-lg px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
                >
                  🚗 My Vehicles
                </Link>

                <Link
                  to="/services"
                  onClick={closeMenu}
                  className="rounded-lg px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
                >
                  🔧 Services
                </Link>

                <Link
                  to="/my-requests"
                  onClick={closeMenu}
                  className="rounded-lg px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
                >
                  📋 My Requests
                </Link>

                <Link
                  to="/services"
                  onClick={closeMenu}
                  className="mt-2 rounded-lg bg-red-600 px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-red-700"
                >
                  🚨 Emergency Assistance
                </Link>
              </>
            )}

            {/* DRIVER MOBILE */}
            {token && role === "driver" && (
              <>
                <Link
                  to="/driver/dashboard"
                  onClick={closeMenu}
                  className="rounded-lg px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
                >
                  📊 Dashboard
                </Link>

                <Link
                  to="/driver/profile"
                  onClick={closeMenu}
                  className="rounded-lg px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
                >
                  👤 My Profile
                </Link>

                <Link
                  to="/driver/dashboard"
                  onClick={closeMenu}
                  className="rounded-lg px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
                >
                  📋 Requests
                </Link>
              </>
            )}

            {/* ADMIN MOBILE */}
            {token && role === "admin" && (
              <>
                <Link
                  to="/admin"
                  onClick={closeMenu}
                  className="rounded-lg px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
                >
                  📊 Dashboard
                </Link>

                <Link
                  to="/admin"
                  onClick={closeMenu}
                  className="rounded-lg px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
                >
                  🚚 Drivers
                </Link>

                <Link
                  to="/admin"
                  onClick={closeMenu}
                  className="rounded-lg px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
                >
                  📋 Requests
                </Link>
              </>
            )}

            {/* NOT LOGGED IN MOBILE */}
            {!token && (
              <>
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="rounded-lg px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
                >
                  🔐 Login
                </Link>

                <Link
                  to="/register"
                  onClick={closeMenu}
                  className="mt-1 rounded-lg bg-teal-600 px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-teal-700"
                >
                  Register
                </Link>
              </>
            )}

            {/* MOBILE USER SECTION */}
            {token && user && (
              <div className="mt-3 border-t border-slate-800 pt-4">
                <div className="mb-3 flex items-center gap-3 px-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-600 font-bold text-white">
                    {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-white">
                      {user?.fullName || "User"}
                    </p>

                    <p className="text-xs capitalize text-slate-400">
                      {role || "user"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full rounded-lg border border-red-600/50 px-4 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-600 hover:text-white"
                >
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
