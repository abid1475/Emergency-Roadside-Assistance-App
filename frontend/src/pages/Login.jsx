import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==========================================
  // HANDLE INPUT CHANGE
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // ==========================================
  // HANDLE LOGIN
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    try {
      setLoading(true);

      const response = await axios.post(
        "https://emergency-roadside-assistance-app-backend.onrender.com/api/v1/auth/login",
        formData,
      );

      console.log("Login Response:", response.data);

      // ==========================================
      // GET TOKEN
      // ==========================================

      const token = response.data.token;

      // Save token
      localStorage.setItem("token", token);

      // ==========================================
      // GET USER
      // ==========================================

      const user = response.data.user;

      // Save user
      localStorage.setItem("user", JSON.stringify(user));

      console.log("Logged in User:", user);
      console.log("User Role:", user.role);

      setSuccess("Login successful!");

      // ==========================================
      // REDIRECT BASED ON ROLE
      // ==========================================

      setTimeout(() => {
        if (user.role === "admin") {
          navigate("/admin");
        } else if (user.role === "driver") {
          navigate("/driver/dashboard");
        } else {
          navigate("/profile");
        }
      }, 800);
    } catch (error) {
      console.error("Login Error:", error);

      if (error.response) {
        setError(error.response.data.message || "Invalid email or password");
      } else {
        setError("Unable to connect to the server");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-10">
      {/* Login Card */}

      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
        {/* Header */}

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white">Welcome Back</h1>

          <p className="mt-2 text-sm text-slate-400">
            Login to your Emergency Roadside Assistance account
          </p>
        </div>

        {/* Error */}

        {error && (
          <div className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Success */}

        {success && (
          <div className="mb-5 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-center text-sm text-green-400">
            {success}
          </div>
        )}

        {/* Login Form */}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Email Address
            </label>

            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          {/* Password */}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Password
            </label>

            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          {/* Login Button */}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-teal-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-teal-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Register Link */}

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-400">
            Don't have an account?{" "}
            <Link
              to="/"
              className="font-semibold text-teal-400 transition hover:text-teal-300 hover:underline"
            >
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
